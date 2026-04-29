import * as generateModel from './../models/generate.model';
import * as matchModel from './../models/match.model';

export async function generate(tournamentId: number) {
    // ── 1. Cargar torneo ────────────────────────────────────────────────────────
    const tournament = await generateModel.findTournament(tournamentId);
    if (!tournament) {
        // const err = new Error('Torneo no encontrado');
        // err.statusCode = 404;
        // throw err;
        return false
    }

    if (tournament.status !== 'registration' && tournament.status !== 'draft') {
        // const err = new Error(`No se puede generar un torneo con status '${tournament.status}'. Debe estar en 'draft' o 'registration'`);
        // err.statusCode = 409;
        // throw err;
        return false
    }

    // Evitar regenerar si ya tiene rondas
    const existingRounds = await generateModel.countRounds(tournamentId);
    if (existingRounds > 0) {
        // const err = new Error('Este torneo ya tiene rondas generadas. Elimínalas antes de regenerar');
        // err.statusCode = 409;
        // throw err;
        return false
    }

    // ── 2. Cargar equipos inscritos ordenados por seed ──────────────────────────
    const teams = await generateModel.findTeams(tournamentId);
    if (teams.length < 2) {
        // const err = new Error('Se necesitan al menos 2 equipos inscritos para generar el torneo');
        // err.statusCode = 409;
        // throw err;
        return false
    }

    // ── 3. Generar bracket ──────────────────────────────────────────────────────
    const resultado = await generarBracket(tournamentId, teams);

    // ── 4. Cambiar status del torneo a in_progress ──────────────────────────────
    await generateModel.updateTournamentStatus(tournamentId, 'in_progress');

    return {
        tournament_id: Number(tournamentId),
        equipos: teams.length,
        ...resultado,
    };
}

// ─── GENERADOR DE BRACKET ────────────────────────────────────────────────────

async function generarBracket(tournamentId: number, teams: any) {
    const numEquipos = teams.length;
    let bracketSize = 2;
    while (bracketSize < numEquipos) bracketSize *= 2;

    const totalRondas = Math.log2(bracketSize);
    const nombresRondas = generarNombresRondas(totalRondas);

    // ── 1. Crear todas las rondas y guardar sus IDs ──
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

    // ── 2. Crear TODOS los partidos vacíos (esqueleto) ──
    // Guardamos los IDs en una matriz: matchesPorRonda[rondaIndex][partidoIndex]
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

    // ── 3. Conectar los partidos (Vínculos de jerarquía) ──
    // Recorremos desde la segunda ronda en adelante para asignar sus "padres"
    for (let r = 1; r < totalRondas; r++) {
        for (let p = 0; p < matchesPorRonda[r].length; p++) {
            const currentMatchId = matchesPorRonda[r][p];
            const prevMatchHomeId = matchesPorRonda[r - 1][p * 2];
            const prevMatchAwayId = matchesPorRonda[r - 1][p * 2 + 1];

            // Esta función debe actualizar prev_match_home_id y prev_match_away_id
            await generateModel.setMatchParents(currentMatchId, prevMatchHomeId, prevMatchAwayId);
        }
    }

    // ── 4. Colocar equipos iniciales y manejar BYEs ──
    const orden = obtenerOrdenSeeding(bracketSize);
    const slots = orden.map(seed => teams.find((t: any) => t.seed === seed) || null);
    const resultados = { partidosR1: [] as any, pasesDirectos: [] as any };

    for (let i = 0; i < bracketSize / 2; i++) {
        const home = slots[i * 2];
        const away = slots[i * 2 + 1];
        const matchIdR1 = matchesPorRonda[0][i];

        if (home && away) {
            // Actualizamos el partido de Ronda 1 que ya creamos en el paso 2
            await generateModel.setTeamsInMatch(matchIdR1, home.team_id, away.team_id);
            resultados.partidosR1.push({ match_id: matchIdR1, home: home.team_name, away: away.team_name });

        } else if (home || away) {
            // Es un BYE: El equipo salta directamente a la Ronda 2
            const team = home || away;
            await generateModel.registerBye(tournamentId, team.team_id);

            // Reutilizamos tu función para "sentar" al equipo en la R2
            // Como ya conectamos los padres en el paso 3, esta función lo encontrará
            await matchModel.updateNextRoundMatch(tournamentId, matchIdR1, team.team_id);

            resultados.pasesDirectos.push({ team: team.team_name, pasa_a: nombresRondas[1] || 'Siguiente Ronda' });
        }
    }

    return resultados;
}


// async function generarBracket(tournamentId: number, teams: any) {
//     const numEquipos = teams.length;
//     let bracketSize = 2;
//     while (bracketSize < numEquipos) bracketSize *= 2;

//     const totalRondas = Math.log2(bracketSize);
//     const nombresRondas = generarNombresRondas(totalRondas);

//     // 1. Crear las rondas (Igual que antes)
//     const rondas = [];
//     for (let i = 0; i < totalRondas; i++) {
//         const roundId = await generateModel.insertRound(tournamentId, {
//             name: nombresRondas[i],
//             round_order: i + 1,
//             type: 'bracket',
//             status: i === 0 ? 'in_progress' : 'pending',
//         });
//         rondas.push({ id: roundId, name: nombresRondas[i], order: i + 1 });
//     }

//     // 2. Crear los partidos de Semifinales (Ronda 2) por adelantado
//     const r2Matches = [];
//     const numPartidosR2 = bracketSize / 4;
//     for (let i = 0; i < numPartidosR2; i++) {
//         const mId = await generateModel.insertMatch(tournamentId, {
//             round_id: rondas[1].id,
//             status: 'scheduled'
//         });
//         r2Matches.push(mId);
//     }

//     // 3. MAPEO MÁGICO: Colocar equipos en sus "slots" según su nivel (Seed)
//     const orden = obtenerOrdenSeeding(bracketSize);
//     // Esto genera: [1, 8, 4, 5, 2, 7, 3, 6] para un bracket de 8

//     const slots = orden.map(seed => teams.find((t: any) => t.seed === seed) || null);

//     const resultados = { partidosR1: [] as any, pasesDirectos: [] as any };

//     // 4. Crear la Ronda 1 (Cuartos)
//     for (let i = 0; i < bracketSize / 2; i++) {
//         const home = slots[i * 2];     // Equipo 1 de la pareja
//         const away = slots[i * 2 + 1]; // Equipo 2 de la pareja

//         const r2MatchId = r2Matches[Math.floor(i / 2)];
//         const esLadoHomeEnR2 = i % 2 === 0;

//         if (home && away) {
//             // PARTIDO REAL
//             const matchId = await generateModel.insertMatch(tournamentId, {
//                 round_id: rondas[0].id,
//                 home_team_id: home.team_id,
//                 away_team_id: away.team_id,
//             });
//             // Conectamos este partido con su "hijo" en Semifinales
//             await generateModel.linkPrevMatch(r2MatchId, matchId, esLadoHomeEnR2);

//             resultados.partidosR1.push({ match_id: matchId, home: home.team_name, away: away.team_name });

//         } else if (home || away) {
//             // ES UN PASE DIRECTO (BYE)
//             const team = home || away;
//             await generateModel.registerBye(tournamentId, team.team_id);

//             // ¡AQUÍ ESTÁ EL TRUCO!: Lo mandamos directo a la Semifinal que le toca
//             await generateModel.updateMatchTeam(r2MatchId, team.team_id, esLadoHomeEnR2);

//             resultados.pasesDirectos.push({ team: team.team_name, pasa_a: rondas[1].name });
//         }
//     }

//     return resultados;
// }

function obtenerOrdenSeeding(n: any) {
    let seeds = [1];
    while (seeds.length < n) {
        let temp = [];
        let total = seeds.length * 2 + 1;
        for (let seed of seeds) {
            temp.push(seed);
            temp.push(total - seed);
        }
        seeds = temp;
    }
    return seeds;
}

function generarNombresRondas(total: number) {
    const nombres = [
        'Final',
        'Semifinales',
        'Cuartos de Final',
        'Octavos de Final',
        'Dieciseisavos de Final',
    ];
    const resultado = [];
    for (let i = 0; i < total; i++) {
        resultado.unshift(nombres[i] || `Ronda ${total - i}`);
    }
    return resultado;
}

// async function generarBracket(tournamentId: number, teams: any) {
//     const numEquipos = teams.length;

//     // Calcular la siguiente potencia de 2 y cuántos BYEs se necesitan
//     let bracketSize = 2;
//     while (bracketSize < numEquipos) bracketSize *= 2;
//     const numByes = bracketSize - numEquipos;

//     // Calcular cuántas rondas totales habrá
//     const totalRondas = Math.log2(bracketSize);
//     const nombresRondas = generarNombresRondas(totalRondas);

//     // ── Crear TODAS las rondas desde el inicio ──────────────────────────────────
//     // La primera queda in_progress, las siguientes pending
//     const rondas = [];
//     for (let i = 0; i < totalRondas; i++) {
//         const roundId = await generateModel.insertRound(tournamentId, {
//             name: nombresRondas[i],
//             round_order: i + 1,
//             type: 'bracket',
//             status: i === 0 ? 'in_progress' : 'pending',
//         });
//         rondas.push({ id: roundId, name: nombresRondas[i], round_order: i + 1 });
//     }

//     const roundId = rondas[0].id;

//     // ── Armar slots: los mejores seeds reciben BYE ──────────────────────────────
//     // teams ya viene ordenado por seed ASC (seed 1 = mejor)
//     // Los primeros numByes equipos reciben BYE
//     const slotsConBye = teams.slice(0, numByes);
//     const slotsConPartido = teams.slice(numByes);

//     // ── Crear partidos BYE como finished automáticamente ───────────────────────
//     const byesRegistrados = [];
//     for (const team of slotsConBye) {
//         await generateModel.registerBye(tournamentId, team.team_id);
//         byesRegistrados.push({
//             team: team.team_name,
//             team_id: team.team_id,
//             seed: team.seed,
//             pasa_a: rondas[1]?.name || 'Siguiente ronda',
//         });
//     }

//     // ── Crear partidos reales: mejor seed vs peor seed ──────────────────────────
//     const partidos = [];
//     const mitad = slotsConPartido.length / 2;

//     for (let i = 0; i < mitad; i++) {
//         const home = slotsConPartido[i];
//         const away = slotsConPartido[slotsConPartido.length - 1 - i];

//         const matchId = await generateModel.insertMatch(tournamentId, {
//             round_id: roundId,
//             home_team_id: home.team_id,
//             away_team_id: away.team_id,
//         });

//         partidos.push({
//             match_id: matchId,
//             ronda: rondas[0].name,
//             home_team: home.team_name,
//             away_team: away.team_name,
//         });
//     }

//     // ── Inicializar standings en 0 para todos ──────────────────────────────────
//     for (const team of teams) {
//         await generateModel.initStanding(tournamentId, null, team.team_id);
//     }

//     return {
//         bracket_size: bracketSize,
//         byes: numByes,
//         rondas_creadas: rondas.length,
//         partidos_creados: partidos.length + byesRegistrados.length,
//         rondas,
//         partidos,
//         pases_directos: byesRegistrados,
//         nota: numByes > 0
//             ? `${numByes} equipo(s) con BYE pasan directo a ${rondas[1]?.name || 'la siguiente ronda'}`
//             : 'Bracket perfecto — sin BYEs necesarios',
//     };
// }

// ─── Nombres de rondas según el total ───────────────────────────────────────


module.exports = { generate };