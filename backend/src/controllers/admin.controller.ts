import { Request, Response } from 'express';
import { AppDataSource } from '../config/database';
import { User, UserRole } from '../entities/User.entity';
import { Motion } from '../entities/Motion.entity';
import { Signature } from '../entities/Signature.entity';
import { AuditLog, AuditAction } from '../entities/AuditLog.entity';
import { AuthRequest } from '../middleware/auth.middleware';
import { AppError } from '../middleware/errorHandler';
import { MoreThan } from 'typeorm';

export class AdminController {
  private userRepository = AppDataSource.getRepository(User);
  private motionRepository = AppDataSource.getRepository(Motion);
  private signatureRepository = AppDataSource.getRepository(Signature);
  private auditLogRepository = AppDataSource.getRepository(AuditLog);

  async getAnalytics(_req: AuthRequest, res: Response): Promise<void> {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const [
      totalUsers,
      activeUsers,
      totalMotions,
      activeMotions,
      totalSignatures,
      recentUsers,
      recentMotions,
    ] = await Promise.all([
      this.userRepository.count(),
      this.userRepository.count({ where: { isActive: true } }),
      this.motionRepository.count(),
      this.motionRepository.count({ where: { createdAt: MoreThan(thirtyDaysAgo) } }),
      this.signatureRepository.count(),
      this.userRepository.count({ where: { createdAt: MoreThan(thirtyDaysAgo) } }),
      this.motionRepository.count({ where: { createdAt: MoreThan(thirtyDaysAgo) } }),
    ]);

    // Motions by status
    const motionsByStatus = await this.motionRepository
      .createQueryBuilder('motion')
      .select('motion.status', 'status')
      .addSelect('COUNT(*)', 'count')
      .groupBy('motion.status')
      .getRawMany();

    // Signatures by month
    const signaturesByMonth = await this.signatureRepository
      .createQueryBuilder('signature')
      .select("TO_CHAR(signature.signedAt, 'YYYY-MM')", 'month')
      .addSelect('COUNT(*)', 'count')
      .where('signature.signedAt >= :date', { date: thirtyDaysAgo })
      .groupBy('month')
      .orderBy('month', 'DESC')
      .getRawMany();

    res.json({
      success: true,
      data: {
        overview: {
          totalUsers,
          activeUsers,
          totalMotions,
          activeMotions,
          totalSignatures,
          recentUsers,
          recentMotions,
        },
        motionsByStatus,
        signaturesByMonth,
      },
    });
  }

  async getUsers(req: Request, res: Response): Promise<void> {
    const { page = 1, limit = 50 } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const [users, total] = await this.userRepository.findAndCount({
      skip,
      take: Number(limit),
      order: { createdAt: 'DESC' },
    });

    res.json({
      success: true,
      data: {
        users: users.map((u) => u.toJSON()),
        pagination: {
          total,
          page: Number(page),
          limit: Number(limit),
          totalPages: Math.ceil(total / Number(limit)),
        },
      },
    });
  }

  async updateUserRole(req: AuthRequest, res: Response): Promise<void> {
    const { id } = req.params;
    const { role } = req.body;

    if (!Object.values(UserRole).includes(role)) {
      throw new AppError(400, 'Ungültige Rolle');
    }

    const user = await this.userRepository.findOne({ where: { id } });

    if (!user) {
      throw new AppError(404, 'Benutzer nicht gefunden');
    }

    const oldRole = user.role;
    user.role = role;
    await this.userRepository.save(user);

    await this.auditLogRepository.save({
      action: AuditAction.ROLE_CHANGED,
      userId: req.user!.id,
      entityType: 'User',
      entityId: user.id,
      changes: { oldRole, newRole: role },
      ipAddress: req.ip,
      userAgent: req.get('user-agent'),
    });

    res.json({
      success: true,
      message: 'Benutzerrolle erfolgreich aktualisiert',
      data: { user: user.toJSON() },
    });
  }

  async toggleUserStatus(req: AuthRequest, res: Response): Promise<void> {
    const { id } = req.params;

    const user = await this.userRepository.findOne({ where: { id } });

    if (!user) {
      throw new AppError(404, 'Benutzer nicht gefunden');
    }

    user.isActive = !user.isActive;
    await this.userRepository.save(user);

    await this.auditLogRepository.save({
      action: AuditAction.USER_UPDATED,
      userId: req.user!.id,
      entityType: 'User',
      entityId: user.id,
      metadata: { action: user.isActive ? 'activated' : 'deactivated' },
      ipAddress: req.ip,
      userAgent: req.get('user-agent'),
    });

    res.json({
      success: true,
      message: `Benutzer erfolgreich ${user.isActive ? 'aktiviert' : 'deaktiviert'}`,
      data: { user: user.toJSON() },
    });
  }

  async getAuditLogs(req: Request, res: Response): Promise<void> {
    const { page = 1, limit = 100, userId, entityType, action } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const queryBuilder = this.auditLogRepository.createQueryBuilder('log').leftJoinAndSelect('log.user', 'user');

    if (userId) {
      queryBuilder.andWhere('log.userId = :userId', { userId });
    }

    if (entityType) {
      queryBuilder.andWhere('log.entityType = :entityType', { entityType });
    }

    if (action) {
      queryBuilder.andWhere('log.action = :action', { action });
    }

    const [logs, total] = await queryBuilder
      .skip(skip)
      .take(Number(limit))
      .orderBy('log.createdAt', 'DESC')
      .getManyAndCount();

    res.json({
      success: true,
      data: {
        logs,
        pagination: {
          total,
          page: Number(page),
          limit: Number(limit),
          totalPages: Math.ceil(total / Number(limit)),
        },
      },
    });
  }
}
