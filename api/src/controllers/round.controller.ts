import * as roundService from '../services/round.service';
import { catchAsync, AppError } from '../middlewares/errorHandler';

export const getByTournament = catchAsync(async (req, res) => {
    const tournamentId = parseInt(req.params.tournamentId as string, 10);
    const rounds = await roundService.getByTournament(tournamentId);
    return {
        code: 200,
        data: rounds
    };
});

export const getById = catchAsync(async (req, res) => {
    const roundId = parseInt(req.params.roundId as string, 10);
    const round = await roundService.getById(roundId);
    return {
        code: 200,
        data: round
    };
});

export const create = catchAsync(async (req, res) => {
    const { name, round_order, type, group_id } = req.body;
    if (!name || !round_order || !type) {
        throw new AppError(400, 'name, round_order y type son obligatorios');
    }
    const validTypes = ['group', 'bracket'];
    if (!validTypes.includes(type)) {
        throw new AppError(400, `type inválido. Valores permitidos: ${validTypes.join(', ')}`);
    }
    const tournamentId = parseInt(req.params.tournamentId as string, 10);
    const round = await roundService.create(tournamentId, { name, round_order, type, group_id });
    return {
        code: 201,
        data: round
    };
});

export const update = catchAsync(async (req, res) => {
    const roundId = parseInt(req.params.roundId as string, 10);
    const round = await roundService.update(roundId, req.body);
    return {
        code: 200,
        data: round
    };
});

export const remove = catchAsync(async (req, res) => {
    const roundId = parseInt(req.params.roundId as string, 10);
    const deleted = await roundService.remove(roundId);
    return {
        code: 200,
        data: deleted
    };
});