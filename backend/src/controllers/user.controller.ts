import { Request, Response } from 'express';
import { AppDataSource } from '../config/database';
import { User } from '../entities/User.entity';
import { AuthRequest } from '../middleware/auth.middleware';
import { AppError } from '../middleware/errorHandler';

export class UserController {
  private userRepository = AppDataSource.getRepository(User);

  async getAll(req: Request, res: Response): Promise<void> {
    const { page = 1, limit = 20, search } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const queryBuilder = this.userRepository.createQueryBuilder('user');

    if (search) {
      queryBuilder.where(
        'user.firstName ILIKE :search OR user.lastName ILIKE :search OR user.email ILIKE :search',
        { search: `%${search}%` }
      );
    }

    const [users, total] = await queryBuilder
      .skip(skip)
      .take(Number(limit))
      .orderBy('user.createdAt', 'DESC')
      .getManyAndCount();

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

  async getById(req: Request, res: Response): Promise<void> {
    const { id } = req.params;

    const user = await this.userRepository.findOne({ where: { id } });

    if (!user) {
      throw new AppError(404, 'Benutzer nicht gefunden');
    }

    res.json({
      success: true,
      data: { user: user.toJSON() },
    });
  }
}
