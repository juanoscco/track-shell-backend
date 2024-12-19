import jwt from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';
import { JWT_SECRET } from '../../config/token';

export const authenticateToken = (req: Request, res: Response, next: NextFunction):any => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Extrae el token del encabezado

  if (!token) {
    return res.status(401).json({ message: 'Token missing or invalid.' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ message: 'Invalid or expired token.' });
    }
    (req as any).user = user; // Guarda la información del usuario en req
    next();
  });
};