import * as teamService from '../services/team.service';
import { catchAsync, AppError } from '../middlewares/errorHandler';


export const getAll = catchAsync(async (req, res) => {
    const data = await teamService.getAll();
    return {
        code: 200,
        data: data
    };
});

export const getById = catchAsync(async (req, res) => {
    const id = parseInt(req.params.id as string, 10);
    const data = await teamService.getById(id);
    return {
        code: 200,
        data: data
    };
});

export const create = catchAsync(async (req, res) => {
    const { name, short_name, logo_url, contact_email, contact_phone, coach } = req.body;
    if (!name) {
        throw new AppError(400, 'name es obligatorio');
    }
    const newTeam = await teamService.create({ name, short_name, logo_url, contact_email, contact_phone, coach });
    return {
        code: 201,
        data: newTeam
    };
});

export const update = catchAsync(async (req, res) => {
    const id = parseInt(req.params.id as string, 10);
    const updated = await teamService.update(id, req.body);
    return updated
});

export const remove = catchAsync(async (req, res) => {
    const id = parseInt(req.params.id as string, 10);
    const deleted = await teamService.remove(id);
    return deleted
});