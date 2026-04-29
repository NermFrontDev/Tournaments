import { Router } from 'express';
import * as groupController from './../controllers/group.controller'

export const groupRoutes = Router();

groupRoutes.get('/tournaments/:tournamentId/groups', groupController.getByTournament);
groupRoutes.get('/tournaments/:tournamentId/groups/:groupId', groupController.getById);
groupRoutes.post('/tournaments/:tournamentId/groups', groupController.create);
groupRoutes.post('/tournaments/:tournamentId/groups/:groupId/teams', groupController.addTeam);
groupRoutes.delete('/tournaments/:tournamentId/groups/:groupId/teams/:teamId', groupController.removeTeam);
groupRoutes.delete('/tournaments/:tournamentId/groups/:groupId', groupController.remove);