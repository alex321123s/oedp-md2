import { Response } from 'express';
import { AppDataSource } from '../config/database';
import { QuickPoll } from '../entities/QuickPoll.entity';
import { Motion } from '../entities/Motion.entity';
import { AuthRequest } from '../middleware/auth.middleware';
import { AppError } from '../middleware/errorHandler';
import { logger } from '../utils/logger';

interface PollVote {
  userId: string;
  option: string;
}

export class QuickPollController {
  private pollRepository = AppDataSource.getRepository(QuickPoll);
  private motionRepository = AppDataSource.getRepository(Motion);

  async create(req: AuthRequest, res: Response): Promise<void> {
    if (!req.user) {
      throw new AppError(401, 'Nicht authentifiziert');
    }

    const { motionId, question, options } = req.body;

    if (!question || question.trim().length < 5) {
      throw new AppError(400, 'Frage muss mindestens 5 Zeichen lang sein');
    }

    if (!options || options.length < 2) {
      throw new AppError(400, 'Mindestens 2 Optionen erforderlich');
    }

    // Verify motion exists
    const motion = await this.motionRepository.findOne({
      where: { id: motionId },
    });

    if (!motion) {
      throw new AppError(404, 'Antrag nicht gefunden');
    }

    // Only motion creator or admins can create polls
    if (motion.creatorId !== req.user.id && !['admin', 'bgst'].includes(req.user.role)) {
      throw new AppError(403, 'Keine Berechtigung');
    }

    const poll = this.pollRepository.create({
      motionId,
      question: question.trim(),
      options,
      creatorId: req.user.id,
      votes: {},
    });

    await this.pollRepository.save(poll);

    logger.info(`Quick poll created: ${poll.id} for motion: ${motionId}`);

    res.status(201).json({
      success: true,
      message: 'Schnellumfrage wurde erstellt',
      data: { poll },
    });
  }

  async getByMotion(req: AuthRequest, res: Response): Promise<void> {
    const { motionId } = req.params;

    const polls = await this.pollRepository.find({
      where: { motionId, isActive: true },
      relations: ['creator'],
      order: { createdAt: 'DESC' },
    });

    res.json({
      success: true,
      data: { polls },
    });
  }

  async vote(req: AuthRequest, res: Response): Promise<void> {
    if (!req.user) {
      throw new AppError(401, 'Nicht authentifiziert');
    }

    const { id } = req.params;
    const { option } = req.body;

    const poll = await this.pollRepository.findOne({
      where: { id },
    });

    if (!poll) {
      throw new AppError(404, 'Umfrage nicht gefunden');
    }

    if (!poll.isActive) {
      throw new AppError(400, 'Diese Umfrage ist nicht mehr aktiv');
    }

    if (!poll.options.includes(option)) {
      throw new AppError(400, 'Ungültige Option');
    }

    // Initialize votes object if needed
    if (!poll.votes) {
      poll.votes = {};
    }

    // Update vote count
    poll.votes[option] = (poll.votes[option] || 0) + 1;

    // Mark as changed for JSONB column
    poll.votes = { ...poll.votes };

    await this.pollRepository.save(poll);

    logger.info(`Vote cast on poll: ${id} by user: ${req.user.id}`);

    res.json({
      success: true,
      message: 'Stimme wurde abgegeben',
      data: { poll },
    });
  }

  async getResults(req: AuthRequest, res: Response): Promise<void> {
    const { id } = req.params;

    const poll = await this.pollRepository.findOne({
      where: { id },
      relations: ['creator'],
    });

    if (!poll) {
      throw new AppError(404, 'Umfrage nicht gefunden');
    }

    // Calculate total votes
    const totalVotes = Object.values(poll.votes || {}).reduce((sum: number, count) => sum + (count as number), 0);

    // Calculate percentages
    const results = poll.options.map(option => ({
      option,
      votes: poll.votes?.[option] || 0,
      percentage: totalVotes > 0 ? ((poll.votes?.[option] || 0) / totalVotes * 100).toFixed(1) : '0',
    }));

    res.json({
      success: true,
      data: {
        poll,
        results,
        totalVotes,
      },
    });
  }

  async toggle(req: AuthRequest, res: Response): Promise<void> {
    if (!req.user) {
      throw new AppError(401, 'Nicht authentifiziert');
    }

    const { id } = req.params;

    const poll = await this.pollRepository.findOne({
      where: { id },
      relations: ['motion'],
    });

    if (!poll) {
      throw new AppError(404, 'Umfrage nicht gefunden');
    }

    // Only creator or admin can toggle
    if (poll.creatorId !== req.user.id && !['admin', 'bgst'].includes(req.user.role)) {
      throw new AppError(403, 'Keine Berechtigung');
    }

    poll.isActive = !poll.isActive;
    await this.pollRepository.save(poll);

    logger.info(`Poll toggled: ${id} to ${poll.isActive} by user: ${req.user.id}`);

    res.json({
      success: true,
      message: poll.isActive ? 'Umfrage wurde aktiviert' : 'Umfrage wurde deaktiviert',
      data: { poll },
    });
  }
}
