import { Router } from 'express';
import * as teamController from './../controllers/team.controller'

export const teamRoutes = Router();

teamRoutes.get('/', teamController.getAll);
teamRoutes.get('/:id', teamController.getById);
teamRoutes.post('/', teamController.create);
teamRoutes.put('/:id', teamController.update);
teamRoutes.delete('/:id', teamController.remove);
