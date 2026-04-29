import { Router } from 'express';
import * as userController from '../controllers/user.controller';

export const userRoutes = Router();

userRoutes.get('/getUsers', userController.findUsers);
userRoutes.get('/getUser/:id', userController.findUser);
userRoutes.post('/saveUser', userController.saveUser);
userRoutes.post('/updateUser', userController.updateUser);
userRoutes.post('/deleteUser', userController.deleteUser);
