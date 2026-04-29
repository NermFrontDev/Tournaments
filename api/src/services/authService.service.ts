const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
import * as authModel from './../models/auth.model';
import { env } from '../config/environment';
import { catchAsync, AppError } from '../middlewares/errorHandler';


const SECRET = env.JWT_SECRET;
const EXPIRES = env.JWT_EXPIRES_IN || '8h';

export async function login(email: string, password: string) {
    // 1. Buscar usuario por email
    const user = await authModel.findByEmail(email);
    if (!user) {
        throw new AppError(400, 'credenciales incorrectas');
    }

    // 2. Verificar que la cuenta esté activa
    if (!user.active) {
        throw new AppError(400, 'credenciales incorrectas');
    }

    // 3. Comparar password con el hash
    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) {
        throw new AppError(400, 'credenciales incorrectas');
    }

    // 4. Generar JWT con la información del usuario
    const payload = {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        sport: user.sport,  // null = admin general
    };

    const token = jwt.sign(payload, SECRET, { expiresIn: EXPIRES });

    return {
        token,
        user: payload,
    };
}

export async function verifyToken(token: string) {
    try {
        return jwt.verify(token, SECRET);
    } catch (err) {
        return false
    }
}