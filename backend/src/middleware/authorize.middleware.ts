import { Response, NextFunction } from 'express';
import { AuthRequest } from './auth.middleware';
import { UserRole } from '../entities/User.entity';

export const authorize = (...roles: UserRole[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: 'Authentifizierung erforderlich',
      });
      return;
    }

    if (!roles.includes(req.user.role)) {
      res.status(403).json({
        success: false,
        message: 'Keine Berechtigung für diese Aktion',
        requiredRoles: roles,
        userRole: req.user.role,
      });
      return;
    }

    next();
  };
};

// Helper functions for common role checks
export const requireAdmin = authorize(UserRole.ADMIN);

export const requireBGSt = authorize(UserRole.BGST, UserRole.ADMIN);

export const requireBAntrK = authorize(UserRole.BANTRK, UserRole.ADMIN);

export const requireBuVo = authorize(UserRole.BUVO, UserRole.ADMIN);

export const requireStaff = authorize(
  UserRole.BGST,
  UserRole.BANTRK,
  UserRole.BUVO,
  UserRole.ADMIN
);
