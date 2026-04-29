import * as standingService from '../services/standing.service';
import { catchAsync, AppError } from '../middlewares/errorHandler';

export const getByTournament = catchAsync(async (req, res) => {
    const tournamentId = parseInt(req.params.tournamentId as string, 10);
    const standings = await standingService.getByTournament(tournamentId);
    return {
        code: 200,
        data: standings
    };
});

export const getByGroup = catchAsync(async (req, res) => {
    const tournamentId = parseInt(req.params.tournamentId as string, 10);
    const groupId = parseInt(req.params.groupId as string, 10);
    const standings = await standingService.getByGroup(tournamentId, groupId);
    return {
        code: 200,
        data: standings
    };
});
