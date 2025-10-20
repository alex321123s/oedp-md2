import { Response } from 'express';
import { AppDataSource } from '../config/database';
import { Survey, SurveyStatus, QuestionType } from '../entities/Survey.entity';
import { Vote } from '../entities/Vote.entity';
import { User } from '../entities/User.entity';
import { AuditLog, AuditAction } from '../entities/AuditLog.entity';
import { AuthRequest } from '../middleware/auth.middleware';
import { AppError } from '../middleware/errorHandler';
import { emailService } from '../utils/emailService';
import { logger } from '../utils/logger';
import {
  createSurveySchema,
  voteSchema,
  approveSurveySchema,
  surveyQuerySchema,
  CreateSurveyInput,
  VoteInput,
  ApproveSurveyInput,
  SurveyQueryInput,
} from '../validators/survey.validator';
import { In } from 'typeorm';

export class SurveyController {
  private surveyRepository = AppDataSource.getRepository(Survey);
  private voteRepository = AppDataSource.getRepository(Vote);
  private userRepository = AppDataSource.getRepository(User);
  private auditLogRepository = AppDataSource.getRepository(AuditLog);

  async create(req: AuthRequest, res: Response): Promise<void> {
    if (!req.user) {
      throw new AppError(401, 'Nicht authentifiziert');
    }

    const validatedData = createSurveySchema.parse(req.body) as CreateSurveyInput;

    // Verify all co-initiators exist and are active
    const coInitiators = await this.userRepository.find({
      where: {
        id: In(validatedData.coInitiatorIds),
        isActive: true,
      },
    });

    if (coInitiators.length !== validatedData.coInitiatorIds.length) {
      throw new AppError(400, 'Einige Mitunterzeichner wurden nicht gefunden oder sind nicht aktiv');
    }

    // Prepare options based on question type
    let options = validatedData.options || [];
    if (validatedData.questionType === 'yes_no') {
      options = ['Ja', 'Nein'];
    }

    // Create survey
    const survey = this.surveyRepository.create({
      title: validatedData.title,
      description: validatedData.description,
      questionType: validatedData.questionType as QuestionType,
      options: options,
      status: SurveyStatus.PENDING_APPROVAL,
      creatorId: req.user.id,
      coInitiatorIds: validatedData.coInitiatorIds.join(','),
      durationDays: validatedData.durationDays,
      isAnonymous: validatedData.isAnonymous,
      isBinding: validatedData.isBinding,
    });

    await this.surveyRepository.save(survey);

    // Create audit log
    await this.auditLogRepository.save({
      action: AuditAction.SURVEY_CREATED,
      userId: req.user.id,
      entityType: 'Survey',
      entityId: survey.id,
      ipAddress: req.ip,
      userAgent: req.get('user-agent'),
    });

    // Send notification to BGSt for approval
    // TODO: Implement email notification

    logger.info(`Survey created: ${survey.id} by user: ${req.user.id}`);

    res.status(201).json({
      success: true,
      message: 'Befragung wurde erstellt und wartet auf Genehmigung',
      data: { survey },
    });
  }

  async list(req: AuthRequest, res: Response): Promise<void> {
    const query = surveyQuerySchema.parse(req.query) as SurveyQueryInput;
    
    const page = parseInt(query.page);
    const limit = parseInt(query.limit);
    const skip = (page - 1) * limit;

    const where: any = {};
    
    if (query.status) {
      where.status = query.status;
    }

    const [surveys, total] = await this.surveyRepository.findAndCount({
      where,
      relations: ['creator'],
      skip,
      take: limit,
      order: {
        [query.sortBy || 'createdAt']: query.sortOrder,
      },
    });

    res.json({
      success: true,
      data: {
        surveys,
        pagination: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
        },
      },
    });
  }

  async getById(req: AuthRequest, res: Response): Promise<void> {
    const { id } = req.params;

    const survey = await this.surveyRepository.findOne({
      where: { id },
      relations: ['creator'],
    });

    if (!survey) {
      throw new AppError(404, 'Befragung nicht gefunden');
    }

    // Get vote count
    const voteCount = await this.voteRepository.count({
      where: { surveyId: id },
    });

    // Check if user has voted
    let hasVoted = false;
    let userVote = null;
    
    if (req.user) {
      userVote = await this.voteRepository.findOne({
        where: {
          surveyId: id,
          voterId: req.user.id,
        },
      });
      hasVoted = !!userVote;
    }

    res.json({
      success: true,
      data: {
        survey: {
          ...survey,
          participantCount: voteCount,
          hasVoted,
          userVote: hasVoted ? userVote : null,
        },
      },
    });
  }

  async vote(req: AuthRequest, res: Response): Promise<void> {
    if (!req.user) {
      throw new AppError(401, 'Nicht authentifiziert');
    }

    const { id } = req.params;
    const validatedData = voteSchema.parse(req.body) as VoteInput;

    const survey = await this.surveyRepository.findOne({
      where: { id },
    });

    if (!survey) {
      throw new AppError(404, 'Befragung nicht gefunden');
    }

    if (survey.status !== SurveyStatus.ACTIVE) {
      throw new AppError(400, 'Diese Befragung ist nicht aktiv');
    }

    // Check if survey has ended
    if (survey.endDate && new Date() > survey.endDate) {
      throw new AppError(400, 'Diese Befragung ist bereits beendet');
    }

    // Check if user has already voted
    const existingVote = await this.voteRepository.findOne({
      where: {
        surveyId: id,
        voterId: req.user.id,
      },
    });

    if (existingVote) {
      throw new AppError(400, 'Sie haben bereits an dieser Befragung teilgenommen');
    }

    // Create vote
    const vote = this.voteRepository.create({
      surveyId: id,
      voterId: req.user.id,
      voteValue: validatedData.voteValue,
      ipAddress: req.ip,
      userAgent: req.get('user-agent'),
    });

    await this.voteRepository.save(vote);

    // Update participant count
    survey.participantCount = (survey.participantCount || 0) + 1;
    await this.surveyRepository.save(survey);

    // Create audit log
    await this.auditLogRepository.save({
      action: AuditAction.VOTE_CAST,
      userId: req.user.id,
      entityType: 'Survey',
      entityId: survey.id,
      ipAddress: req.ip,
      userAgent: req.get('user-agent'),
    });

    logger.info(`Vote cast for survey: ${id} by user: ${req.user.id}`);

    res.json({
      success: true,
      message: 'Ihre Stimme wurde erfolgreich abgegeben',
      data: {
        survey: {
          ...survey,
          participantCount: survey.participantCount,
        },
      },
    });
  }

  async getResults(req: AuthRequest, res: Response): Promise<void> {
    const { id } = req.params;

    const survey = await this.surveyRepository.findOne({
      where: { id },
      relations: ['creator'],
    });

    if (!survey) {
      throw new AppError(404, 'Befragung nicht gefunden');
    }

    // Check if user has voted or survey is completed
    let canViewResults = survey.status === SurveyStatus.COMPLETED || survey.resultsPublished;

    if (req.user && !canViewResults) {
      const userVote = await this.voteRepository.findOne({
        where: {
          surveyId: id,
          voterId: req.user.id,
        },
      });
      canViewResults = !!userVote;
    }

    if (!canViewResults) {
      throw new AppError(403, 'Sie müssen teilnehmen, um die Ergebnisse zu sehen');
    }

    // Calculate results
    const votes = await this.voteRepository.find({
      where: { surveyId: id },
    });

    const results = this.calculateResults(survey, votes);

    res.json({
      success: true,
      data: {
        survey,
        results,
        totalVotes: votes.length,
      },
    });
  }

  async approve(req: AuthRequest, res: Response): Promise<void> {
    if (!req.user || !['admin', 'bgst'].includes(req.user.role)) {
      throw new AppError(403, 'Keine Berechtigung');
    }

    const { id } = req.params;
    const validatedData = approveSurveySchema.parse(req.body) as ApproveSurveyInput;

    const survey = await this.surveyRepository.findOne({
      where: { id },
      relations: ['creator'],
    });

    if (!survey) {
      throw new AppError(404, 'Befragung nicht gefunden');
    }

    if (survey.status !== SurveyStatus.PENDING_APPROVAL) {
      throw new AppError(400, 'Befragung wartet nicht auf Genehmigung');
    }

    if (validatedData.isApproved) {
      survey.status = SurveyStatus.APPROVED;
      survey.approvedAt = new Date();
      survey.approvedById = req.user.id;
      survey.approvalNotes = validatedData.approvalNotes;

      // Set start and end dates
      survey.startDate = new Date();
      survey.endDate = new Date(Date.now() + survey.durationDays * 24 * 60 * 60 * 1000);
      survey.status = SurveyStatus.ACTIVE;

      await this.surveyRepository.save(survey);

      // Send notification to creator
      await emailService.sendEmail({
        to: survey.creator.email,
        subject: 'Ihre Befragung wurde genehmigt',
        text: `Ihre Befragung "${survey.title}" wurde genehmigt und ist nun aktiv.`,
        html: `<p>Ihre Befragung "<strong>${survey.title}</strong>" wurde genehmigt und ist nun aktiv.</p>`,
      });

      logger.info(`Survey approved: ${id} by user: ${req.user.id}`);
      
      res.json({
        success: true,
        message: 'Befragung wurde genehmigt und gestartet',
        data: { survey },
      });
    } else {
      survey.status = SurveyStatus.REJECTED;
      survey.approvedById = req.user.id;
      survey.approvalNotes = validatedData.approvalNotes;

      await this.surveyRepository.save(survey);

      // Send notification to creator
      await emailService.sendEmail({
        to: survey.creator.email,
        subject: 'Ihre Befragung wurde abgelehnt',
        text: `Ihre Befragung "${survey.title}" wurde abgelehnt.${validatedData.approvalNotes ? `\n\nGrund: ${validatedData.approvalNotes}` : ''}`,
        html: `<p>Ihre Befragung "<strong>${survey.title}</strong>" wurde abgelehnt.</p>${validatedData.approvalNotes ? `<p><strong>Grund:</strong> ${validatedData.approvalNotes}</p>` : ''}`,
      });

      logger.info(`Survey rejected: ${id} by user: ${req.user.id}`);
      
      res.json({
        success: true,
        message: 'Befragung wurde abgelehnt',
        data: { survey },
      });
    }

    // Create audit log
    await this.auditLogRepository.save({
      action: validatedData.isApproved ? AuditAction.SURVEY_STARTED : 'survey.rejected' as AuditAction,
      userId: req.user.id,
      entityType: 'Survey',
      entityId: survey.id,
      ipAddress: req.ip,
      userAgent: req.get('user-agent'),
    });
  }

  async getMySurveys(req: AuthRequest, res: Response): Promise<void> {
    if (!req.user) {
      throw new AppError(401, 'Nicht authentifiziert');
    }

    const surveys = await this.surveyRepository.find({
      where: { creatorId: req.user.id },
      relations: ['creator'],
      order: { createdAt: 'DESC' },
    });

    res.json({
      success: true,
      data: { surveys },
    });
  }

  async getMyVotes(req: AuthRequest, res: Response): Promise<void> {
    if (!req.user) {
      throw new AppError(401, 'Nicht authentifiziert');
    }

    const votes = await this.voteRepository.find({
      where: { voterId: req.user.id },
      relations: ['survey', 'survey.creator'],
      order: { votedAt: 'DESC' },
    });

    res.json({
      success: true,
      data: { votes },
    });
  }

  private calculateResults(survey: Survey, votes: Vote[]): any {
    const results: any = {
      options: {},
      totalVotes: votes.length,
    };

    if (survey.questionType === 'single_choice' || survey.questionType === 'yes_no') {
      // Count votes for each option
      votes.forEach(vote => {
        const value = vote.voteValue as string;
        results.options[value] = (results.options[value] || 0) + 1;
      });

      // Calculate percentages
      Object.keys(results.options).forEach(key => {
        results.options[key] = {
          count: results.options[key],
          percentage: ((results.options[key] / votes.length) * 100).toFixed(2),
        };
      });
    } else if (survey.questionType === 'multiple_choice') {
      // Count votes for each option (multiple selections)
      votes.forEach(vote => {
        const values = vote.voteValue as string[];
        values.forEach(value => {
          results.options[value] = (results.options[value] || 0) + 1;
        });
      });

      Object.keys(results.options).forEach(key => {
        results.options[key] = {
          count: results.options[key],
          percentage: ((results.options[key] / votes.length) * 100).toFixed(2),
        };
      });
    } else if (survey.questionType === 'free_text') {
      results.responses = votes.map(vote => ({
        response: vote.voteValue,
        votedAt: vote.votedAt,
      }));
    }

    return results;
  }
}
