import { Request, Response } from 'express';
import { AppDataSource } from '../config/database';
import { Motion, MotionStatus } from '../entities/Motion.entity';
import { Signature } from '../entities/Signature.entity';
import { User } from '../entities/User.entity';
import { AuditLog, AuditAction } from '../entities/AuditLog.entity';
import { AuthRequest } from '../middleware/auth.middleware';
import { AppError } from '../middleware/errorHandler';
import { emailService } from '../utils/emailService';
import { PDFGenerator } from '../utils/pdfGenerator';
import { logger } from '../utils/logger';
import { FindOptionsWhere, Like, In } from 'typeorm';
import {
  createMotionSchema,
  updateMotionSchema,
  validateMotionSchema,
  scheduleMotionSchema,
  recordMotionOutcomeSchema,
  motionQuerySchema,
  CreateMotionInput,
  UpdateMotionInput,
  ValidateMotionInput,
  ScheduleMotionInput,
  RecordMotionOutcomeInput,
} from '../validators/motion.validator';

export class MotionController {
  private motionRepository = AppDataSource.getRepository(Motion);
  private signatureRepository = AppDataSource.getRepository(Signature);
  private auditLogRepository = AppDataSource.getRepository(AuditLog);

  async create(req: AuthRequest, res: Response): Promise<void> {
    if (!req.user) {
      throw new AppError(401, 'Nicht authentifiziert');
    }

    const validatedData = createMotionSchema.parse(req.body) as CreateMotionInput;

    // Create motion
    const motion = this.motionRepository.create({
      ...validatedData,
      creatorId: req.user.id,
      status: MotionStatus.DRAFT,
      signatureCount: 0,
      isPublic: false,
    });

    await this.motionRepository.save(motion);

    // Create audit log
    await this.auditLogRepository.save({
      action: AuditAction.MOTION_CREATED,
      userId: req.user.id,
      entityType: 'Motion',
      entityId: motion.id,
      ipAddress: req.ip,
      userAgent: req.get('user-agent'),
    });

    logger.info(`Motion created: ${motion.id} by user ${req.user.email}`);

    res.status(201).json({
      success: true,
      message: 'Antrag erfolgreich erstellt',
      data: { motion },
    });
  }

  async getAll(req: Request, res: Response): Promise<void> {
    const query = motionQuerySchema.parse(req.query);

    const where: FindOptionsWhere<Motion> = {};

    if (query.status) where.status = query.status;
    if (query.type) where.type = query.type;
    if (query.creatorId) where.creatorId = query.creatorId;
    if (query.isPublic !== undefined) where.isPublic = query.isPublic;
    if (query.search) {
      where.title = Like(`%${query.search}%`);
    }

    const page = query.page || 1;
    const limit = query.limit || 20;
    const skip = (page - 1) * limit;

    const [motions, total] = await this.motionRepository.findAndCount({
      where,
      skip,
      take: limit,
      order: {
        [query.sortBy || 'createdAt']: query.sortOrder || 'DESC',
      },
      relations: ['creator', 'trustPerson', 'backupTrustPerson'],
    });

    res.json({
      success: true,
      data: {
        motions,
        pagination: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
        },
      },
    });
  }

  async getById(req: Request, res: Response): Promise<void> {
    const { id } = req.params;

    const motion = await this.motionRepository.findOne({
      where: { id },
      relations: ['creator', 'trustPerson', 'backupTrustPerson', 'signatures', 'signatures.signer'],
    });

    if (!motion) {
      throw new AppError(404, 'Antrag nicht gefunden');
    }

    res.json({
      success: true,
      data: { motion },
    });
  }

  async update(req: AuthRequest, res: Response): Promise<void> {
    if (!req.user) {
      throw new AppError(401, 'Nicht authentifiziert');
    }

    const { id } = req.params;
    const validatedData = updateMotionSchema.parse(req.body) as UpdateMotionInput;

    const motion = await this.motionRepository.findOne({ where: { id } });

    if (!motion) {
      throw new AppError(404, 'Antrag nicht gefunden');
    }

    // Only creator can edit (unless admin)
    if (motion.creatorId !== req.user.id && !req.user.isAdmin) {
      throw new AppError(403, 'Keine Berechtigung zum Bearbeiten dieses Antrags');
    }

    // Can only edit drafts
    if (motion.status !== MotionStatus.DRAFT && !req.user.isAdmin) {
      throw new AppError(400, 'Nur Entwürfe können bearbeitet werden');
    }

    // Update motion
    Object.assign(motion, validatedData);
    await this.motionRepository.save(motion);

    // Create audit log
    await this.auditLogRepository.save({
      action: AuditAction.MOTION_UPDATED,
      userId: req.user.id,
      entityType: 'Motion',
      entityId: motion.id,
      changes: validatedData,
      ipAddress: req.ip,
      userAgent: req.get('user-agent'),
    });

    logger.info(`Motion updated: ${motion.id}`);

    res.json({
      success: true,
      message: 'Antrag erfolgreich aktualisiert',
      data: { motion },
    });
  }

  async publishForSignatures(req: AuthRequest, res: Response): Promise<void> {
    if (!req.user) {
      throw new AppError(401, 'Nicht authentifiziert');
    }

    const { id } = req.params;

    const motion = await this.motionRepository.findOne({ where: { id } });

    if (!motion) {
      throw new AppError(404, 'Antrag nicht gefunden');
    }

    if (motion.creatorId !== req.user.id && !req.user.isAdmin) {
      throw new AppError(403, 'Keine Berechtigung');
    }

    if (motion.status !== MotionStatus.DRAFT) {
      throw new AppError(400, 'Antrag ist nicht im Entwurfsstatus');
    }

    if (!motion.trustPersonId) {
      throw new AppError(400, 'Vertrauensperson muss festgelegt werden');
    }

    motion.status = MotionStatus.COLLECTING;
    motion.isPublic = true;
    await this.motionRepository.save(motion);

    logger.info(`Motion published for signatures: ${motion.id}`);

    res.json({
      success: true,
      message: 'Antrag zur Unterschriftensammlung veröffentlicht',
      data: { motion },
    });
  }

  async sign(req: AuthRequest, res: Response): Promise<void> {
    if (!req.user) {
      throw new AppError(401, 'Nicht authentifiziert');
    }

    const { id } = req.params;

    const motion = await this.motionRepository.findOne({
      where: { id },
      relations: ['creator', 'signatures'],
    });

    if (!motion) {
      throw new AppError(404, 'Antrag nicht gefunden');
    }

    if (motion.status !== MotionStatus.COLLECTING) {
      throw new AppError(400, 'Antrag sammelt derzeit keine Unterschriften');
    }

    // Check if user already signed
    const existingSignature = await this.signatureRepository.findOne({
      where: {
        motionId: motion.id,
        signerId: req.user.id,
      },
    });

    if (existingSignature) {
      throw new AppError(400, 'Sie haben diesen Antrag bereits unterschrieben');
    }

    // Create signature
    const signature = this.signatureRepository.create({
      motionId: motion.id,
      signerId: req.user.id,
      ipAddress: req.ip,
      userAgent: req.get('user-agent'),
      isValid: true,
    });

    await this.signatureRepository.save(signature);

    // Recalculate signature count from database (foolproof)
    const validSignatureCount = await this.signatureRepository.count({
      where: {
        motionId: motion.id,
        isValid: true,
      },
    });
    motion.signatureCount = validSignatureCount;
    await this.motionRepository.save(motion);

    // Create audit log
    await this.auditLogRepository.save({
      action: AuditAction.SIGNATURE_ADDED,
      userId: req.user.id,
      entityType: 'Motion',
      entityId: motion.id,
      metadata: { signatureId: signature.id },
      ipAddress: req.ip,
      userAgent: req.get('user-agent'),
    });

    // Send notification to motion creator
    await emailService.sendMotionSignedNotification(
      motion.creator.email,
      motion.title,
      motion.signatureCount
    );

    // Auto-submit if threshold reached
    if (motion.signatureCount >= motion.signatureThreshold && motion.trustPersonId) {
      motion.status = MotionStatus.SUBMITTED;
      motion.submittedAt = new Date();
      await this.motionRepository.save(motion);

      await this.auditLogRepository.save({
        action: AuditAction.MOTION_SUBMITTED,
        userId: req.user.id,
        entityType: 'Motion',
        entityId: motion.id,
        ipAddress: req.ip,
        userAgent: req.get('user-agent'),
      });
    }

    logger.info(`Signature added to motion ${motion.id} by user ${req.user.email}`);

    res.json({
      success: true,
      message: 'Unterschrift erfolgreich hinzugefügt',
      data: {
        motion,
        signature,
      },
    });
  }

  async removeSignature(req: AuthRequest, res: Response): Promise<void> {
    if (!req.user) {
      throw new AppError(401, 'Nicht authentifiziert');
    }

    const { id } = req.params;

    const motion = await this.motionRepository.findOne({ where: { id } });

    if (!motion) {
      throw new AppError(404, 'Antrag nicht gefunden');
    }

    if (motion.status !== MotionStatus.COLLECTING) {
      throw new AppError(400, 'Unterschrift kann nicht mehr entfernt werden');
    }

    const signature = await this.signatureRepository.findOne({
      where: {
        motionId: motion.id,
        signerId: req.user.id,
      },
    });

    if (!signature) {
      throw new AppError(404, 'Keine Unterschrift gefunden');
    }

    await this.signatureRepository.remove(signature);

    // Recalculate signature count from database (foolproof)
    const validSignatureCount = await this.signatureRepository.count({
      where: {
        motionId: motion.id,
        isValid: true,
      },
    });
    motion.signatureCount = validSignatureCount;
    await this.motionRepository.save(motion);

    await this.auditLogRepository.save({
      action: AuditAction.SIGNATURE_REMOVED,
      userId: req.user.id,
      entityType: 'Motion',
      entityId: motion.id,
      metadata: { signatureId: signature.id },
      ipAddress: req.ip,
      userAgent: req.get('user-agent'),
    });

    res.json({
      success: true,
      message: 'Unterschrift erfolgreich entfernt',
    });
  }

  async validate(req: AuthRequest, res: Response): Promise<void> {
    if (!req.user || !req.user.isBGSt) {
      throw new AppError(403, 'Nur BGSt kann Anträge validieren');
    }

    const { id } = req.params;
    const validatedData = validateMotionSchema.parse(req.body) as ValidateMotionInput;

    const motion = await this.motionRepository.findOne({
      where: { id },
      relations: ['creator'],
    });

    if (!motion) {
      throw new AppError(404, 'Antrag nicht gefunden');
    }

    if (motion.status !== MotionStatus.SUBMITTED) {
      throw new AppError(400, 'Antrag ist nicht zur Validierung eingereicht');
    }

    motion.validatedById = req.user.id;
    motion.validatedAt = new Date();
    motion.validationNotes = validatedData.validationNotes;
    motion.status = validatedData.isApproved ? MotionStatus.APPROVED : MotionStatus.REJECTED;

    await this.motionRepository.save(motion);

    await this.auditLogRepository.save({
      action: validatedData.isApproved
        ? AuditAction.MOTION_VALIDATED
        : AuditAction.MOTION_REJECTED,
      userId: req.user.id,
      entityType: 'Motion',
      entityId: motion.id,
      metadata: validatedData,
      ipAddress: req.ip,
      userAgent: req.get('user-agent'),
    });

    // Send notification
    await emailService.sendMotionValidatedNotification(
      motion.creator.email,
      motion.title,
      validatedData.isApproved
    );

    logger.info(`Motion ${validatedData.isApproved ? 'approved' : 'rejected'}: ${motion.id}`);

    res.json({
      success: true,
      message: `Antrag ${validatedData.isApproved ? 'genehmigt' : 'abgelehnt'}`,
      data: { motion },
    });
  }

  async schedule(req: AuthRequest, res: Response): Promise<void> {
    if (!req.user || !req.user.isBAntrK) {
      throw new AppError(403, 'Nur BAntrK kann Anträge einplanen');
    }

    const { id } = req.params;
    const validatedData = scheduleMotionSchema.parse(req.body) as ScheduleMotionInput;

    const motion = await this.motionRepository.findOne({ where: { id } });

    if (!motion) {
      throw new AppError(404, 'Antrag nicht gefunden');
    }

    if (motion.status !== MotionStatus.APPROVED) {
      throw new AppError(400, 'Nur genehmigte Anträge können eingeplant werden');
    }

    motion.bptAgendaItem = validatedData.bptAgendaItem;
    motion.scheduledFor = new Date(validatedData.scheduledFor);
    motion.bptVenue = validatedData.bptVenue;
    motion.status = MotionStatus.SCHEDULED;

    await this.motionRepository.save(motion);

    await this.auditLogRepository.save({
      action: AuditAction.MOTION_SCHEDULED,
      userId: req.user.id,
      entityType: 'Motion',
      entityId: motion.id,
      metadata: validatedData,
      ipAddress: req.ip,
      userAgent: req.get('user-agent'),
    });

    logger.info(`Motion scheduled: ${motion.id}`);

    res.json({
      success: true,
      message: 'Antrag erfolgreich eingeplant',
      data: { motion },
    });
  }

  async recordOutcome(req: AuthRequest, res: Response): Promise<void> {
    if (!req.user || !req.user.isBAntrK) {
      throw new AppError(403, 'Nur BAntrK kann Abstimmungsergebnisse eintragen');
    }

    const { id } = req.params;
    const validatedData = recordMotionOutcomeSchema.parse(req.body) as RecordMotionOutcomeInput;

    const motion = await this.motionRepository.findOne({ where: { id } });

    if (!motion) {
      throw new AppError(404, 'Antrag nicht gefunden');
    }

    motion.status = validatedData.status;
    motion.votedAt = new Date();
    motion.votesFor = validatedData.votesFor;
    motion.votesAgainst = validatedData.votesAgainst;
    motion.votesAbstain = validatedData.votesAbstain;
    motion.outcomeNotes = validatedData.outcomeNotes;

    await this.motionRepository.save(motion);

    await this.auditLogRepository.save({
      action: AuditAction.MOTION_UPDATED,
      userId: req.user.id,
      entityType: 'Motion',
      entityId: motion.id,
      metadata: { action: 'outcome_recorded', ...validatedData },
      ipAddress: req.ip,
      userAgent: req.get('user-agent'),
    });

    logger.info(`Motion outcome recorded: ${motion.id}`);

    res.json({
      success: true,
      message: 'Abstimmungsergebnis erfolgreich eingetragen',
      data: { motion },
    });
  }

  async exportPDF(req: Request, res: Response): Promise<void> {
    const { id } = req.params;

    const motion = await this.motionRepository.findOne({
      where: { id },
      relations: ['creator', 'trustPerson', 'backupTrustPerson', 'signatures', 'signatures.signer'],
    });

    if (!motion) {
      throw new AppError(404, 'Antrag nicht gefunden');
    }

    const pdfBuffer = await PDFGenerator.generateMotionPDF(motion, motion.signatures);

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="Mitgliederantrag_${motion.id}.pdf"`
    );
    res.send(pdfBuffer);

    logger.info(`PDF exported for motion: ${motion.id}`);
  }

  async getMyMotions(req: AuthRequest, res: Response): Promise<void> {
    if (!req.user) {
      throw new AppError(401, 'Nicht authentifiziert');
    }

    const motions = await this.motionRepository.find({
      where: { creatorId: req.user.id },
      order: { createdAt: 'DESC' },
      relations: ['trustPerson', 'backupTrustPerson'],
    });

    res.json({
      success: true,
      data: { motions },
    });
  }

  async getMySignatures(req: AuthRequest, res: Response): Promise<void> {
    if (!req.user) {
      throw new AppError(401, 'Nicht authentifiziert');
    }

    const signatures = await this.signatureRepository.find({
      where: { signerId: req.user.id },
      order: { signedAt: 'DESC' },
      relations: ['motion', 'motion.creator'],
    });

    res.json({
      success: true,
      data: { signatures },
    });
  }
}
