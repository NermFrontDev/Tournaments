import { pool } from '../db/connection';
import { ResultSetHeader, RowDataPacket } from 'mysql2/promise';
import { User } from '../types/Users.interface';

export const findUsers = async (): Promise<User[]> => {
    const [rows] = await pool.query<any>('SELECT * FROM users');
    return rows;
};

export const findUser = async (id: number): Promise<User> => {
    const [rows] = await pool.query<RowDataPacket[]>('SELECT * FROM users WHERE id = ?', [id]);
    if (rows.length === 0) {
        return {} as User;
    }

    return rows[0] as User;
}

export const saveUser = async (userData: User): Promise<boolean> => {
    const [result] = await pool.query<ResultSetHeader>(
        'INSERT INTO users (name, email, password_hash, role, active) VALUES (?, ?, ?, ?, ?)',
        [userData.name, userData.email, userData.password_hash, userData.role, true]
    );
    return result.affectedRows > 0
}

export const updateUser = async (userData: User): Promise<boolean> => {
    const [result] = await pool.query<ResultSetHeader>(
        'UPDATE users SET name = ?, email = ? WHERE id = ?',
        [userData.name, userData.email, userData.id]
    );
    return result.affectedRows > 0
}

export const deleteUser = async (userId: number): Promise<boolean> => {
    const [result] = await pool.query<ResultSetHeader>(
        'DELETE FROM users WHERE id = ?',
        [userId]
    );
    return result.affectedRows > 0
} 
