import * as inscriptionService from '../services/inscription.service';
import { catchAsync, AppError } from '../middlewares/errorHandler';

export const getByTournament = catchAsync(async (req, res) => {
    const tournamentId = parseInt(req.params.tournamentId as string, 10);
    const data = await inscriptionService.getByTournament(tournamentId);
    return {
        code: 200,
        data: data
    };
});

export const inscribe = catchAsync(async (req, res) => {
    const { team_id, seed } = req.body;
    const tournamentId = parseInt(req.params.tournamentId as string, 10);
    if (!team_id) {
        throw new AppError(400, 'El campo team_id es obligatorio');
    }
    const data = await inscriptionService.inscribe(tournamentId, team_id, seed);
    return {
        code: 201,
        data: data
    };
});

export const update = catchAsync(async (req, res) => {
    const { tournamentId, teamId } = req.params;

    const result = await inscriptionService.update(parseInt(tournamentId as string, 10), parseInt(teamId as string, 10), req.body);
    return {
        code: 200,
        data: result
    };
});

export const remove = catchAsync(async (req, res) => {
    const { tournamentId, teamId } = req.params;
    const deleted = await inscriptionService.remove(parseInt(tournamentId as string, 10), parseInt(teamId as string, 10));
    return {
        code: 200,
        data: deleted
    };
});
