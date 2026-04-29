import { pool } from '../db/connection';
import { RowDataPacket } from 'mysql2/promise';


export async function findByEmail(email: string) {
    const [rows] = await pool.query<RowDataPacket[]>(
        'SELECT id, name, email, password_hash, role, sport, active FROM users WHERE email = ?',
        [email]
    );
    return rows[0] || null;
}   