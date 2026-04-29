import * as generateService from '../services/generate.service';
import { catchAsync, AppError } from '../middlewares/errorHandler';

export const generate = catchAsync(async (req, res) => {
    const tournamentId = parseInt(req.params.tournamentId as string, 10);
    const groups = await generateService.generate(tournamentId);
    return {
        code: 200,
        data: groups
    };
});
