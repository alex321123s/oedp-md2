import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { AppDataSource } from '../config/database';
import { User } from '../entities/User.entity';

export interface AuthRequest extends Request {
  user?: User;
}

export const authenticate = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '') || req.cookies?.token;

    if (!token) {
      res.status(401).json({
        success: false,
        message: 'Authentifizierung erforderlich',
      });
      return;
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId: string };

    const userRepository = AppDataSource.getRepository(User);
    const user = await userRepository.findOne({ where: { id: decoded.userId } });

    if (!user || !user.isActive) {
      res.status(401).json({
        success: false,
        message: 'Ungültiges Token oder Benutzer nicht aktiv',
      });
      return;
    }

    req.user = user;
    next();
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      res.status(401).json({
        success: false,
        message: 'Ungültiges Token',
      });
      return;
    }

    res.status(500).json({
      success: false,
      message: 'Authentifizierungsfehler',
    });
  }
};

export const optionalAuth = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '') || req.cookies?.token;

    if (token) {
      const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId: string };
      const userRepository = AppDataSource.getRepository(User);
      const user = await userRepository.findOne({ where: { id: decoded.userId } });

      if (user && user.isActive) {
        req.user = user;
      }
    }

    next();
  } catch (error) {
    next();
  }
};
