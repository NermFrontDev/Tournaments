import { Router } from 'express';
import * as authController from './../controllers/auth.controller'

export const authRoutes = Router();

authRoutes.post('/auth/login', authController.login);
authRoutes.get('/auth/me', authController.me);
