import { Request, Response, NextFunction } from 'express';
import { RequestHandler } from 'express';
import * as userService from '../services/user.service';
import { User } from '../types/Users.interface';

export const findUsers: RequestHandler = async (req, res, next) => {
    try {
        const data = await userService.findUsers();
        res.json({ status: 'ok', data });
    } catch (error) {
        next(error);
    }
};

export const findUser: RequestHandler = async (req, res, next) => {
    try {
        const userId = parseInt(req.params.id as string, 10);
        const data = await userService.findUser(userId);
        res.json({ status: 'ok', data });
    } catch (error) {
        next(error);
    }
};

export const saveUser: RequestHandler = async (req, res, next) => {
    try {
        const userData = req.body as User;
        const data = await userService.saveUser(userData);
        res.json({ status: 'ok', data });
    } catch (error) {
        next(error);
    }
};

export const updateUser: RequestHandler = async (req, res, next) => {
    try {
        const userData = req.body as User;
        const data = await userService.updateUser(userData);
        res.json({ status: 'ok', data });
    } catch (error) {
        next(error);
    }
};

export const deleteUser: RequestHandler = async (req, res, next) => {
    try {
        const userId = parseInt(req.params.id as string, 10);
        const data = await userService.deleteUser(userId);
        res.json({ status: 'ok', data });
    } catch (error) {
        next(error);
    }
};

