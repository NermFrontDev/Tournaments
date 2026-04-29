import { Router } from 'express';
import * as matchController from './../controllers/match.controller'

export const matchRoutes = Router();

matchRoutes.get('/tournaments/:tournamentId/matches', matchController.getByTournament);
matchRoutes.get('/matches/:id', matchController.getById);
matchRoutes.post('/tournaments/:tournamentId/matches', matchController.create);
matchRoutes.put('/matches/:id/result', matchController.registerResult);
matchRoutes.put('/matches/:id/status', matchController.updateStatus);