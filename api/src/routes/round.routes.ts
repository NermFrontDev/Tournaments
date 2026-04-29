import { Router } from 'express';
import * as roundController from './../controllers/round.controller'

export const roundRoutes = Router();

roundRoutes.get('/tournaments/:tournamentId/rounds', roundController.getByTournament);
roundRoutes.get('/tournaments/:tournamentId/rounds/:roundId', roundController.getById)
roundRoutes.post('/tournaments/:tournamentId/rounds', roundController.create)
roundRoutes.put('/tournaments/:tournamentId/rounds/:roundId', roundController.update)
roundRoutes.delete('/tournaments/:tournamentId/rounds/:roundId', roundController.remove)