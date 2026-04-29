import { Router } from 'express';
import * as tournamentController from '../controllers/tournament.controller';

export const tournamentsRouter = Router();

tournamentsRouter.get('/', tournamentController.getTournaments);
tournamentsRouter.get('/:id', tournamentController.getTournament);
tournamentsRouter.post('/', tournamentController.createTournament);
tournamentsRouter.put('/:id', tournamentController.updateTournament);
tournamentsRouter.delete('/:id', tournamentController.deleteTournament);