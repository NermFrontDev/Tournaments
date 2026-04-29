
import * as tournamentsModel from '../models/tournaments.model';
import { Tournament } from '../types/Tournaments.interface';

export async function findTournaments(sportId: number) {
    return await tournamentsModel.findTournaments(sportId);
}

export async function findTournament(id: number) {
    return await tournamentsModel.findTournament(id);
}

export async function createTournament(data: Tournament) {
    const id = await tournamentsModel.createTournament(data);
    return await tournamentsModel.findTournament(id);
}

export async function updateTournament(id: number, data: any) {
    const exists = await tournamentsModel.findTournament(id);
    if (!exists) return null;

    const allowed = ['name', 'description', 'format', 'status', 'max_teams', 'start_date', 'end_date', 'location'] as string[];
    const fields = {} as any;
    for (const key of allowed) {
        if (data[key] !== undefined) fields[key] = data[key];
    }

    if (Object.keys(fields).length === 0) return exists;

    await tournamentsModel.updateTournament(id, fields);
    return tournamentsModel.findTournament(id);
}

export async function deleteTournament(id: number) {
    const exists = await tournamentsModel.findTournament(id);
    if (!exists) return null;
    await tournamentsModel.deleteTournament(id);
    return true;
}

export async function getBracket(tournamentId: number) {
    // ── 1. Verificar que el torneo existe ───────────────────────────────────────
    const tournament = await tournamentsModel.findTournament(tournamentId);
    if (!tournament) return null;

    // ── 2. Cargar rondas ordenadas ──────────────────────────────────────────────
    const rondas = await tournamentsModel.findRounds(tournamentId);

    // ── 3. Cargar todos los partidos del torneo de una sola query ───────────────
    const partidos = await tournamentsModel.findMatches(tournamentId);

    // ── 4. Cargar equipos con BYE (inscritos sin partido en ronda 1) ─────────────
    const byeTeams = await tournamentsModel.findByeTeams(tournamentId);

    // ── 5. Agrupar partidos por round_id para acceso rápido ────────────────────
    const partidosPorRonda = {} as any;
    for (const partido of partidos) {
        if (!partidosPorRonda[partido.round_id]) {
            partidosPorRonda[partido.round_id] = [];
        }
        partidosPorRonda[partido.round_id].push(partido);
    }

    // ── 6. Armar la primera ronda con sus pases directos (BYEs) ────────────────
    const primeraRondaId = rondas.length > 0 ? rondas[0].id : null;
    const equiposEnRonda1 = new Set(
        (partidosPorRonda[primeraRondaId] || []).flatMap((p: any) => [p.home_team_id, p.away_team_id])
    );

    // Los equipos con BYE son los inscritos que NO tienen partido en ronda 1
    const pasesDirectos = byeTeams.filter((t: any) => !equiposEnRonda1.has(t.team_id));

    // ── 7. Construir el bracket ronda por ronda ─────────────────────────────────
    const bracket = rondas.map((ronda: any, index: any) => {
        const matchesDeRonda = (partidosPorRonda[ronda.id] || []).map((p: any) => ({
            match_id: p.id,
            status: p.status,
            scheduled_at: p.scheduled_at,
            home: {
                team_id: p.home_team_id,
                name: p.home_team,
                short_name: p.home_short,
                score: p.score_home,
            },
            away: {
                team_id: p.away_team_id,
                name: p.away_team,
                short_name: p.away_short,
                score: p.score_away,
            },
            winner_team_id: p.winner_team_id,
            sport_stats: p.sport_stats ? JSON.parse(p.sport_stats) : null,
        }));

        return {
            round_id: ronda.id,
            name: ronda.name,
            round_order: ronda.round_order,
            status: ronda.status,
            // Los pases directos solo aparecen en la primera ronda
            pases_directos: index === 0
                ? pasesDirectos.map((t: any) => ({
                    team_id: t.team_id,
                    name: t.team_name,
                    short_name: t.short_name,
                }))
                : [],
            matches: matchesDeRonda,
        };
    });

    return {
        tournament_id: Number(tournamentId),
        tournament_name: tournament.name,
        sport: tournament.sport_slug,
        status: tournament.status,
        bracket,
    };
}