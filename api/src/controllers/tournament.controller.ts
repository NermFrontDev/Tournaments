import * as tournamentService from '../services/tournaments.service';
import { catchAsync, AppError } from '../middlewares/errorHandler';
import { Tournament } from '../types/Tournaments.interface';

export const getTournaments = catchAsync(async (req, res) => {

    const sportId = parseInt(req.query.sportId as string, 10);
    const data = await tournamentService.findTournaments(sportId);
    return {
        code: 200,
        data: data
    };
});

export const getTournament = catchAsync(async (req, res) => {
    const id = parseInt(req.params.id as string, 10);
    const data = await tournamentService.findTournament(id);
    return {
        code: 200,
        data: data
    };
});

export const createTournament = catchAsync(async (req, res) => {
    const { sport_id, name, description, format, max_teams, start_date, end_date, location } = req.body as Tournament;
    if (!sport_id || !name || !format) {
        throw new AppError(400, 'sport_id, name y format son obligatorios');
    }
    const data = await tournamentService.createTournament({ sport_id, name, description, format, max_teams, start_date, end_date, location });
    return {
        code: 201,
        data: data
    };
});

export const updateTournament = catchAsync(async (req, res) => {
    const id = parseInt(req.params.id as string, 10);
    const updated = await tournamentService.updateTournament(id, req.body);
    return {
        code: 200,
        data: updated
    };
});

export const deleteTournament = catchAsync(async (req, res) => {
    const id = parseInt(req.params.id as string, 10);
    const deleted = await tournamentService.deleteTournament(id);
    return {
        code: 200,
        data: deleted
    };
});

export const getBracket = catchAsync(async (req, res) => {
    const id = parseInt(req.params.tournamentId as string, 10)
    const bracket = await tournamentService.getBracket(id);
    if (!bracket) {
        return res.status(404).json({ error: 'Torneo no encontrado' });
    }
    res.json(bracket);
});