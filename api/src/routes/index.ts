import { Router } from 'express';
import { tournamentsRouter } from './tournaments.routes';
import { userRoutes } from './users.routes';
import { teamRoutes } from './team.routes';
import { inscriptionRoutes } from './inscription.routes';
import { groupRoutes } from './group.routes';
import { matchRoutes } from './match.routes';
import { standignRoutes } from './standigns.routes';
import { roundRoutes } from './round.routes';
import { generateRoutes } from './generate.routes';
import { authRoutes } from './auth.routes';

export const router = Router();

router.use('/tournament', tournamentsRouter);
router.use('/user', userRoutes);
router.use('/team', teamRoutes);
router.use('/', inscriptionRoutes);
router.use('/', groupRoutes);
router.use('/', matchRoutes);
router.use('/', standignRoutes);
router.use('/', roundRoutes);
router.use('/', generateRoutes);
router.use('/', authRoutes);
