import * as matchService from '../services/match.service';
import { catchAsync, AppError } from '../middlewares/errorHandler';

export const getByTournament = catchAsync(async (req, res) => {
    const { status, round_id } = req.query;
    const tournamentId = parseInt(req.params.tournamentId as string, 10);
    const matches = await matchService.getByTournament(tournamentId, { status, round_id });
    return {
        code: 200,
        data: matches
    };
});

export const getById = catchAsync(async (req, res) => {
    const matchId = parseInt(req.params.id as string, 10);
    const match = await matchService.getById(matchId);
    return {
        code: 200,
        data: match
    };
});

export const create = catchAsync(async (req, res) => {
    const { round_id, home_team_id, away_team_id, scheduled_at, venue } = req.body;
    const tournamentId = parseInt(req.params.tournamentId as string, 10);
    if (!round_id || !home_team_id || !away_team_id) {
        return {
            code: 200,
            data: false
        };
    }
    if (home_team_id === away_team_id) {
        return {
            code: 200,
            data: false
        };
    }
    const match = await matchService.create(tournamentId, { round_id, home_team_id, away_team_id, scheduled_at, venue });
    return {
        code: 201,
        data: match
    };
});

export const registerResult = catchAsync(async (req, res) => {
    const { score_home, score_away, sport_stats } = req.body;
    const matchId = parseInt(req.params.id as string, 10);
    if (score_home === undefined || score_away === undefined) {
        // return res.status(400).json({ error: 'score_home y score_away son obligatorios' });
        return {
            code: 200,
            data: false
        };
    }

    const match = await matchService.registerResult(matchId, { score_home, score_away, sport_stats });
    if (!match) {
        // return res.status(404).json({ error: 'Partido no encontrado' });
        return {
            code: 200,
            data: false
        };
    }
    return {
        code: 200,
        data: match
    };
});

export const updateStatus = catchAsync(async (req, res) => {
    const { status } = req.body;
    const matchId = parseInt(req.params.id as string, 10);
    if (!status) {
        // return res.status(400).json({ error: 'El campo status es obligatorio' });
        return {
            code: 200,
            data: false
        };
    }
    const match = await matchService.updateStatus(matchId, status);
    if (!match) {
        // return res.status(404).json({ error: 'Partido no encontrado' });
        return {
            code: 200,
            data: false
        };
    }
    return {
        code: 200,
        data: match
    };
});
