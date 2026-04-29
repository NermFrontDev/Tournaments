import { Router } from 'express';
import * as inscription from './../controllers/inscription.controller'

export const inscriptionRoutes = Router();

inscriptionRoutes.get('/tournaments/:tournamentId/teams', inscription.getByTournament);
inscriptionRoutes.post('/tournaments/:tournamentId/teams', inscription.inscribe);
inscriptionRoutes.put('/tournaments/:tournamentId/teams/:teamId', inscription.update);
inscriptionRoutes.delete('/tournaments/:tournamentId/teams/:teamId', inscription.remove);