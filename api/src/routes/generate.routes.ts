import { Router } from 'express';
import * as generateController from './../controllers/generate.controller'
import * as tournamentController from './../controllers/tournament.controller'

export const generateRoutes = Router();

generateRoutes.post('/tournaments/:tournamentId/generate', generateController.generate);
generateRoutes.get('/tournaments/:tournamentId/bracket', tournamentController.getBracket);

