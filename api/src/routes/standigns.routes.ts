import { Router } from 'express';
import * as standingController from './../controllers/standing.controller'

export const standignRoutes = Router();

standignRoutes.get('/tournaments/:tournamentId/standings', standingController.getByTournament);
standignRoutes.get('/tournaments/:tournamentId/standings/groups/:groupId', standingController.getByGroup);
