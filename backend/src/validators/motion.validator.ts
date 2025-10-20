import { z } from 'zod';
import { MotionType, MotionStatus } from '../entities/Motion.entity';

export const createMotionSchema = z.object({
  title: z
    .string()
    .min(10, 'Titel muss mindestens 10 Zeichen lang sein')
    .max(255, 'Titel darf maximal 255 Zeichen lang sein'),
  description: z
    .string()
    .min(20, 'Beschreibung muss mindestens 20 Zeichen lang sein')
    .max(1000, 'Beschreibung darf maximal 1000 Zeichen lang sein'),
  fullText: z
    .string()
    .min(50, 'Antragstext muss mindestens 50 Zeichen lang sein')
    .max(50000, 'Antragstext darf maximal 50000 Zeichen lang sein'),
  type: z.nativeEnum(MotionType, {
    errorMap: () => ({ message: 'Ungültiger Antragstyp' }),
  }),
  targetParagraph: z.string().optional(),
  targetSection: z.string().optional(),
  trustPersonId: z.string().uuid('Ungültige Vertrauensperson-ID').optional(),
  backupTrustPersonId: z.string().uuid('Ungültige Ersatzperson-ID').optional(),
  tags: z.array(z.string()).optional(),
});

export const updateMotionSchema = z.object({
  title: z.string().min(10).max(255).optional(),
  description: z.string().min(20).max(1000).optional(),
  fullText: z.string().min(50).max(50000).optional(),
  type: z.nativeEnum(MotionType).optional(),
  targetParagraph: z.string().optional(),
  targetSection: z.string().optional(),
  trustPersonId: z.string().uuid().optional(),
  backupTrustPersonId: z.string().uuid().optional(),
  tags: z.array(z.string()).optional(),
});

export const validateMotionSchema = z.object({
  isApproved: z.boolean(),
  validationNotes: z.string().optional(),
});

export const scheduleMotionSchema = z.object({
  bptAgendaItem: z.string().min(1, 'Tagesordnungspunkt ist erforderlich'),
  scheduledFor: z.string().datetime('Ungültiges Datum'),
  bptVenue: z.string().optional(),
});

export const recordMotionOutcomeSchema = z.object({
  status: z.enum([
    MotionStatus.ACCEPTED,
    MotionStatus.DECLINED,
    MotionStatus.WITHDRAWN,
  ] as const),
  votesFor: z.number().int().min(0).optional(),
  votesAgainst: z.number().int().min(0).optional(),
  votesAbstain: z.number().int().min(0).optional(),
  outcomeNotes: z.string().optional(),
});

export const motionQuerySchema = z.object({
  status: z.nativeEnum(MotionStatus).optional(),
  type: z.nativeEnum(MotionType).optional(),
  creatorId: z.string().uuid().optional(),
  isPublic: z.string().transform((val) => val === 'true').optional(),
  page: z.string().transform(Number).optional(),
  limit: z.string().transform(Number).optional(),
  sortBy: z.enum(['createdAt', 'updatedAt', 'signatureCount', 'title']).optional(),
  sortOrder: z.enum(['ASC', 'DESC']).optional(),
  search: z.string().optional(),
});

export type CreateMotionInput = z.infer<typeof createMotionSchema>;
export type UpdateMotionInput = z.infer<typeof updateMotionSchema>;
export type ValidateMotionInput = z.infer<typeof validateMotionSchema>;
export type ScheduleMotionInput = z.infer<typeof scheduleMotionSchema>;
export type RecordMotionOutcomeInput = z.infer<typeof recordMotionOutcomeSchema>;
export type MotionQueryInput = z.infer<typeof motionQuerySchema>;
