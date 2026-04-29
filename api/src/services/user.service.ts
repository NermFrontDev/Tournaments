import * as userModel from '../models/user.model';
import { User } from '../types/Users.interface';

export const findUsers = async () => {
    return await userModel.findUsers()
};

export const findUser = async (userId: number) => {
    return await userModel.findUser(userId)
}

export const saveUser = async (userData: User) => {
    return await userModel.saveUser(userData)
}

export const updateUser = async (userData: User) => {
    return await userModel.updateUser(userData)
}

export const deleteUser = async (userId: number) => {
    return await userModel.deleteUser(userId)
}