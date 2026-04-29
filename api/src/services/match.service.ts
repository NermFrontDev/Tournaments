import * as matchModel from './../models/match.model';
import * as standingsModel from './../models/standing.model';

export async function getByTournament(tournamentId: number, filters: any) {
    return matchModel.findByTournament(tournamentId, filters);
}

export async function getById(id: number) {
    return matchModel.findById(id);
}

export async function create(tournamentId: number, data: any) {
    const id = await matchModel.insert(tournamentId, data);
    return matchModel.findById(id);
}

export async function registerResult(id: number, data: any) {
    const match: any = await matchModel.findById(id);
    if (!match) return null;

    if (match.status === 'finished') {
        // const err = new Error('Este partido ya tiene un resultado registrado');
        // err.statusCode = 409;
        // throw err;
        return false
    }

    // Determinar ganador
    const { score_home, score_away, sport_stats } = data;
    let winner_team_id = null;
    if (score_home > score_away) winner_team_id = match.home_team_id;
    if (score_away > score_home) winner_team_id = match.away_team_id;

    await matchModel.updateResult(id, { score_home, score_away, sport_stats, winner_team_id });

    // Actualizar tabla de posiciones automáticamente
    await standingsModel.recalculate(match.tournament_id, match.home_team_id, match.away_team_id, score_home, score_away, match.group_id, sport_stats);

    await matchModel.updateNextRoundMatch(match.tournament_id, id, winner_team_id)


    return matchModel.findById(id);
}

export async function updateStatus(id: number, status: string) {
    const validStatuses = ['scheduled', 'in_progress', 'finished', 'cancelled', 'postponed'];
    if (!validStatuses.includes(status)) {
        // const err = new Error(`Status inválido. Valores permitidos: ${validStatuses.join(', ')}`);
        // err.statusCode = 400;
        // throw err;
        return false
    }

    const match = await matchModel.findById(id);
    if (!match) return null;

    const extra = {} as any;
    if (status === 'in_progress') extra.started_at = new Date();
    if (status === 'finished') extra.finished_at = new Date();

    await matchModel.updateStatus(id, status, extra);
    return matchModel.findById(id);
}

