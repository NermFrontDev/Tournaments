import { Request, Response, NextFunction } from 'express';

const jwt = require('jsonwebtoken');
const SECRET = process.env.JWT_SECRET;
interface CustomRequest extends Request {
    user?: any;
}
// Verifica que el request tenga un JWT válido
// Agrega req.user con los datos del token
function requireAuth(req: CustomRequest,
    res: Response,
    next: NextFunction) {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Acceso no autorizado. Token requerido' });
    }

    const token = authHeader.split(' ')[1];

    try {
        req.user = jwt.verify(token, SECRET);
        next();
    } catch (err) {
        return res.status(401).json({ error: 'Token inválido o expirado' });
    }
}

// Verifica que el usuario tenga uno de los roles permitidos
// Uso: requireRole('admin') o requireRole('admin', 'admin_sport')
function requireRole(...roles: any) {
    return (req: CustomRequest,
        res: Response,
        next: NextFunction) => {
        if (!req.user) {
            return res.status(401).json({ error: 'No autenticado' });
        }
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({ error: 'No tienes permiso para esta acción' });
        }
        next();
    };
}

// Verifica que el usuario tenga acceso al deporte de la ruta
// Un admin general (sport = null) siempre pasa
// Un admin_sport solo pasa si su deporte coincide con el parámetro
function requireSport(sport: any) {
    return (req: CustomRequest,
        res: Response,
        next: NextFunction) => {
        if (!req.user) {
            return res.status(401).json({ error: 'No autenticado' });
        }
        // Admin general tiene acceso a todo
        if (req.user.role === 'admin') return next();

        // Admin de deporte: verificar que su deporte coincida
        if (req.user.sport === sport) return next();

        return res.status(403).json({
            error: `No tienes acceso a la sección de ${sport}`
        });
    };
}

module.exports = { requireAuth, requireRole, requireSport };