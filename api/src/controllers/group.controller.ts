import * as groupService from '../services/group.service';
import { catchAsync, AppError } from '../middlewares/errorHandler';

export const getByTournament = catchAsync(async (req, res) => {
    const tournamentId = parseInt(req.params.tournamentId as string, 10);
    const groups = await groupService.getByTournament(tournamentId);
    return {
        code: 200,
        data: groups
    };
});

export const getById = catchAsync(async (req, res) => {
    const groupId = parseInt(req.params.groupId as string, 10);
    const group = await groupService.getById(groupId);
    return {
        code: 200,
        data: group
    };
});

export const create = catchAsync(async (req, res) => {
    const tournamentId = parseInt(req.params.tournamentId as string, 10);
    const { name } = req.body;
    if (!name) {
        throw new AppError(400, 'El campo name es obligatorio');
    }
    const group = await groupService.create(tournamentId, name);
    return {
        code: 201,
        data: group
    };
});

export const addTeam = catchAsync(async (req, res) => {
    const { team_id } = req.body;
    const tournamentId = parseInt(req.params.tournamentId as string, 10);
    const groupId = parseInt(req.params.groupId as string, 10);
    if (!team_id) {
        throw new AppError(400, 'El campo team_id es obligatorio');
    }
    const result = await groupService.addTeam(tournamentId, groupId, team_id);
    return {
        code: 201,
        data: result
    };
});

export const removeTeam = catchAsync(async (req, res) => {
    const teamId = parseInt(req.params.teamId as string, 10);
    const groupId = parseInt(req.params.groupId as string, 10);
    const deleted = await groupService.removeTeam(groupId, teamId);
    return {
        code: 201,
        data: deleted
    };
});

export const remove = catchAsync(async (req, res) => {
    const groupId = parseInt(req.params.groupId as string, 10);
    const deleted = await groupService.remove(groupId);
    return {
        code: 201,
        data: deleted
    };
});