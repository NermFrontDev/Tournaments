import * as generateModel from './../models/generate.model';
import * as matchModel from './../models/match.model';

// ─── ENTRY POINT ─────────────────────────────────────────────────────────────

export async function generate(tournamentId: number) {
    const tournament = await generateModel.findTournament(tournamentId);
    if (!tournament) return false;

    if (tournament.status !== 'registration' && tournament.status !== 'draft') return false;

    const existingRounds = await generateModel.countRounds(tournamentId);
    if (existingRounds > 0) return false;

    const teams = await generateModel.findTeams(tournamentId);
    if (teams.length < 2) return false;

    let resultado: any;

    switch (tournament.format) {
        case 'bracket':
            resultado = await generarBracket(tournamentId, teams);
            break;
        case 'league':
            resultado = await generarLiga(tournamentId, teams);
            break;
        case 'groups_knockout':
            resultado = await generarGruposEliminatorias(tournamentId, teams, false);
            break;
        case 'mixed':
            resultado = await generarGruposEliminatorias(tournamentId, teams, true);
            break;
        default:
            return false;
    }

    await generateModel.updateTournamentStatus(tournamentId, 'in_progress');

    return {
        tournament_id: Number(tournamentId),
        formato: tournament.format,
        equipos: teams.length,
        ...resultado,
    };
}

// ─── FORMATO: BRACKET (eliminación directa) ───────────────────────────────────
// Tu implementación original — no se toca

async function generarBracket(tournamentId: number, teams: any[]) {
    const numEquipos = teams.length;
    let bracketSize = 2;
    while (bracketSize < numEquipos) bracketSize *= 2;

    const totalRondas = Math.log2(bracketSize);
    const nombresRondas = generarNombresRondas(totalRondas);

    const rondas = [];
    for (let i = 0; i < totalRondas; i++) {
        const roundId = await generateModel.insertRound(tournamentId, {
            name: nombresRondas[i],
            round_order: i + 1,
            type: 'bracket',
            status: i === 0 ? 'in_progress' : 'pending',
        });
        rondas.push({ id: roundId, order: i + 1 });
    }

    const matchesPorRonda: number[][] = [];
    for (let r = 0; r < totalRondas; r++) {
        const numPartidosEnEstaRonda = bracketSize / Math.pow(2, r + 1);
        const idsCreados: number[] = [];
        for (let p = 0; p < numPartidosEnEstaRonda; p++) {
            const matchId = await generateModel.insertMatch(tournamentId, {
                round_id: rondas[r].id,
                status: 'scheduled'
            });
            idsCreados.push(matchId);
        }
        matchesPorRonda.push(idsCreados);
    }

    for (let r = 1; r < totalRondas; r++) {
        for (let p = 0; p < matchesPorRonda[r].length; p++) {
            const currentMatchId = matchesPorRonda[r][p];
            const prevMatchHomeId = matchesPorRonda[r - 1][p * 2];
            const prevMatchAwayId = matchesPorRonda[r - 1][p * 2 + 1];
            await generateModel.setMatchParents(currentMatchId, prevMatchHomeId, prevMatchAwayId);
        }
    }

    const orden = obtenerOrdenSeeding(bracketSize);
    const slots = orden.map(seed => teams.find((t: any) => t.seed === seed) || null);
    const resultados = { partidosR1: [] as any[], pasesDirectos: [] as any[] };

    for (let i = 0; i < bracketSize / 2; i++) {
        const home = slots[i * 2];
        const away = slots[i * 2 + 1];
        const matchIdR1 = matchesPorRonda[0][i];

        if (home && away) {
            await generateModel.setTeamsInMatch(matchIdR1, home.team_id, away.team_id);
            resultados.partidosR1.push({ match_id: matchIdR1, home: home.team_name, away: away.team_name });
        } else if (home || away) {
            const team = home || away;
            await generateModel.registerBye(tournamentId, team.team_id);
            await matchModel.updateNextRoundMatch(tournamentId, matchIdR1, team.team_id);
            resultados.pasesDirectos.push({ team: team.team_name, pasa_a: nombresRondas[1] || 'Siguiente Ronda' });
        }
    }

    return resultados;
}

// ─── FORMATO: LIGA (todos contra todos) ──────────────────────────────────────
// Una sola ronda por jornada, todos los equipos se enfrentan entre sí.
// n equipos → n*(n-1)/2 partidos totales, distribuidos en (n-1) jornadas.
// Algoritmo round-robin con rotación.

async function generarLiga(tournamentId: number, teams: any[]) {
    const n = teams.length;

    // Si el número de equipos es impar, agregar un "equipo fantasma" para el algoritmo.
    // El partido contra el fantasma = descanso (bye) para el equipo real.
    const equipos = [...teams];
    if (equipos.length % 2 !== 0) equipos.push(null);

    const numJornadas  = equipos.length - 1;
    const mitad        = equipos.length / 2;
    const rondas: any[] = [];
    const partidos: any[] = [];

    for (let jornada = 0; jornada < numJornadas; jornada++) {
        // Crear la ronda de esta jornada
        const roundId = await generateModel.insertRound(tournamentId, {
            name       : `Jornada ${jornada + 1}`,
            round_order: jornada + 1,
            type       : 'group',
            group_id   : null,
            status     : jornada === 0 ? 'in_progress' : 'pending',
        });
        rondas.push({ id: roundId, name: `Jornada ${jornada + 1}` });

        // Generar los enfrentamientos de esta jornada
        for (let i = 0; i < mitad; i++) {
            const home = equipos[i];
            const away = equipos[equipos.length - 1 - i];

            // Ignorar si alguno es el equipo fantasma (descanso)
            if (!home || !away) continue;

            const matchId = await generateModel.insertMatch(tournamentId, {
                round_id     : roundId,
                home_team_id : home.team_id,
                away_team_id : away.team_id,
                status       : 'scheduled',
            });

            partidos.push({
                match_id  : matchId,
                jornada   : jornada + 1,
                home_team : home.team_name,
                away_team : away.team_name,
            });
        }

        // Rotar equipos: el primero queda fijo, los demás rotan en sentido horario
        equipos.splice(1, 0, equipos.pop()!);
    }

    // Inicializar standings para todos los equipos (sin grupo)
    for (const team of teams) {
        await generateModel.initStanding(tournamentId, null, team.team_id);
    }

    return {
        formato         : 'league',
        jornadas        : rondas.length,
        partidos_totales: partidos.length,
        rondas,
        partidos,
    };
}

// ─── FORMATO: GRUPOS + ELIMINATORIAS y MIXTO ─────────────────────────────────
// Fase 1: dividir equipos en grupos, cada grupo juega round-robin.
// Fase 2: los 2 primeros de cada grupo avanzan a bracket de eliminación directa.
// Mixto: igual pero con partido por el 3er lugar al final.

async function generarGruposEliminatorias(
    tournamentId : number,
    teams        : any[],
    conTercerLugar: boolean  // true = mixed, false = groups_knockout
) {
    const numEquipos = teams.length;

    // ── Calcular número de grupos ──────────────────────────────────────────
    // Regla: grupos de 3 a 5 equipos. Intentamos grupos de 4 primero.
    // Con 2 clasificados por grupo necesitamos número par de grupos para el bracket.
    const numGrupos = calcularNumGrupos(numEquipos);
    const letras    = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

    // ── Crear grupos y distribuir equipos (serpenteo) ────────────────────
    // Serpenteo: seed 1→grupo A, seed 2→grupo B, ..., seed N→grupo N,
    //            seed N+1→grupo N, seed N+2→grupo N-1 ...
    // Esto distribuye los equipos fuertes y débiles de forma balanceada.
    const gruposCreados: { id: number; name: string; teams: any[] }[] = [];

    for (let g = 0; g < numGrupos; g++) {
        const groupId = await generateModel.insertGroup(tournamentId, `Grupo ${letras[g]}`);
        gruposCreados.push({ id: groupId, name: `Grupo ${letras[g]}`, teams: [] });
    }

    // Distribución en serpenteo
    for (let i = 0; i < teams.length; i++) {
        const grupoIndex = serpenteo(i, numGrupos);
        gruposCreados[grupoIndex].teams.push(teams[i]);
        await generateModel.insertGroupTeam(gruposCreados[grupoIndex].id, teams[i].team_id, tournamentId);
    }

    // ── Crear jornadas y partidos de fase de grupos ───────────────────────
    // Cada grupo juega round-robin independiente.
    // Las jornadas de todos los grupos se intercalan por round_order.
    let roundOrder = 0;
    const rondasFaseGrupos: any[] = [];
    const partidosFaseGrupos: any[] = [];

    // Calcular cuántas jornadas tiene el grupo más grande
    const maxEquiposEnGrupo = Math.max(...gruposCreados.map(g => g.teams.length));
    const numJornadasPorGrupo = maxEquiposEnGrupo % 2 === 0
        ? maxEquiposEnGrupo - 1
        : maxEquiposEnGrupo;

    for (let jornada = 0; jornada < numJornadasPorGrupo; jornada++) {
        roundOrder++;

        for (const grupo of gruposCreados) {
            // Round-robin para este grupo en esta jornada
            const equiposGrupo = [...grupo.teams];
            if (equiposGrupo.length % 2 !== 0) equiposGrupo.push(null);

            const mitad = equiposGrupo.length / 2;

            const roundId = await generateModel.insertRound(tournamentId, {
                name       : `${grupo.name} — Jornada ${jornada + 1}`,
                round_order: roundOrder,
                type       : 'group',
                group_id   : grupo.id,
                status     : roundOrder === 1 ? 'in_progress' : 'pending',
            });
            rondasFaseGrupos.push({ id: roundId, name: `${grupo.name} — Jornada ${jornada + 1}`, grupo: grupo.name });

            for (let i = 0; i < mitad; i++) {
                const home = equiposGrupo[i];
                const away = equiposGrupo[equiposGrupo.length - 1 - i];
                if (!home || !away) continue;

                const matchId = await generateModel.insertMatch(tournamentId, {
                    round_id     : roundId,
                    home_team_id : home.team_id,
                    away_team_id : away.team_id,
                    status       : 'scheduled',
                });

                partidosFaseGrupos.push({
                    match_id  : matchId,
                    grupo     : grupo.name,
                    jornada   : jornada + 1,
                    home_team : home.team_name,
                    away_team : away.team_name,
                });
            }

            // Rotar equipos para la siguiente jornada
            equiposGrupo.splice(1, 0, equiposGrupo.pop()!);
            // Actualizar el orden de los equipos en el grupo para la siguiente iteración
            grupo.teams = equiposGrupo.filter(Boolean);
        }
    }

    // ── Inicializar standings por grupo ───────────────────────────────────
    for (const grupo of gruposCreados) {
        for (const team of grupo.teams) {
            await generateModel.initStanding(tournamentId, grupo.id, team.team_id);
        }
    }

    // ── Crear rondas de eliminatorias (pendientes) ────────────────────────
    // Los 2 primeros de cada grupo clasifican → total clasificados = numGrupos * 2
    // Ese número debe ser potencia de 2 para el bracket (lo garantiza calcularNumGrupos)
    const numClasificados = numGrupos * 2;
    const totalRondasBracket = Math.log2(numClasificados);
    const nombresRondas = generarNombresRondas(totalRondasBracket);

    // Si es mixed, agregar el partido por el 3er lugar
    if (conTercerLugar) nombresRondas.push('Tercer Lugar');

    const rondasBracket: any[] = [];
    for (let i = 0; i < nombresRondas.length; i++) {
        roundOrder++;
        const roundId = await generateModel.insertRound(tournamentId, {
            name       : nombresRondas[i],
            round_order: roundOrder,
            type       : 'bracket',
            group_id   : null,
            status     : 'pending',  // Se activan cuando termine la fase de grupos
        });
        rondasBracket.push({ id: roundId, name: nombresRondas[i] });
    }

    return {
        formato              : conTercerLugar ? 'mixed' : 'groups_knockout',
        grupos               : gruposCreados.map(g => ({ id: g.id, name: g.name, equipos: g.teams.length })),
        jornadas_por_grupo   : numJornadasPorGrupo,
        partidos_fase_grupos : partidosFaseGrupos.length,
        rondas_eliminatorias : rondasBracket.map(r => r.name),
        clasificados_por_grupo: 2,
        nota: `Al terminar la fase de grupos, los 2 primeros de cada grupo avanzan al bracket de eliminación directa`,
        con_tercer_lugar     : conTercerLugar,
    };
}

// ─── HELPERS ─────────────────────────────────────────────────────────────────

// Calcula el número de grupos para que los clasificados sean potencia de 2
// Con 2 clasificados por grupo, necesitamos que numGrupos sea potencia de 2
function calcularNumGrupos(numEquipos: number): number {
    // Intentamos la distribución más equilibrada posible
    // Grupos de 4 equipos idealmente, pero puede ser 3 o 5
    // numGrupos debe ser potencia de 2: 2, 4, 8...
    if (numEquipos <= 6)  return 2;  // 2 grupos de 3
    if (numEquipos <= 8)  return 2;  // 2 grupos de 4
    if (numEquipos <= 12) return 4;  // 4 grupos de 3
    if (numEquipos <= 16) return 4;  // 4 grupos de 4
    if (numEquipos <= 24) return 8;  // 8 grupos de 3
    return 8;
}

// Distribución en serpenteo para balancear grupos
// Ej. con 3 grupos: 0→0, 1→1, 2→2, 3→2, 4→1, 5→0, 6→0, 7→1...
function serpenteo(indiceEquipo: number, numGrupos: number): number {
    const ciclo    = indiceEquipo % (numGrupos * 2);
    const mitad    = numGrupos;
    if (ciclo < mitad) return ciclo;
    return (numGrupos * 2 - 1) - ciclo;
}

function obtenerOrdenSeeding(n: number): number[] {
    let seeds = [1];
    while (seeds.length < n) {
        let temp: number[] = [];
        let total = seeds.length * 2 + 1;
        for (let seed of seeds) {
            temp.push(seed);
            temp.push(total - seed);
        }
        seeds = temp;
    }
    return seeds;
}

function generarNombresRondas(total: number): string[] {
    const nombres = [
        'Final',
        'Semifinales',
        'Cuartos de Final',
        'Octavos de Final',
        'Dieciseisavos de Final',
    ];
    const resultado: string[] = [];
    for (let i = 0; i < total; i++) {
        resultado.unshift(nombres[i] || `Ronda ${total - i}`);
    }
    return resultado;
}

module.exports = { generate };