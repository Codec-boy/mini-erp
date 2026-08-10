import { Request, Response, NextFunction } from 'express';
import { verifyToken, JwtPayload } from '../utils/auth.util';
import { UnauthorizedError } from '../errors/custom.error';

declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}

export const authenticateToken = (req: Request, _res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next(new UnauthorizedError('Access denied. No authentication token provided.'));
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = verifyToken(token);
    req.user = decoded;
    next();
  } catch (err) {
    return next(new UnauthorizedError('Invalid or expired authentication token.'));
  }
};
