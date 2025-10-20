import { z } from 'zod';

export const createSurveySchema = z.object({
  title: z.string().min(10, 'Titel muss mindestens 10 Zeichen lang sein').max(255),
  description: z.string().min(20, 'Beschreibung muss mindestens 20 Zeichen lang sein'),
  questionType: z.enum(['single_choice', 'multiple_choice', 'ranked_choice', 'free_text', 'yes_no']),
  options: z.array(z.string()).min(2, 'Mindestens 2 Optionen erforderlich').optional(),
  durationDays: z.number().min(2).max(14).default(7),
  coInitiatorIds: z.array(z.string().uuid()).min(19, 'Mindestens 19 weitere Mitglieder (20 insgesamt) erforderlich'),
  isAnonymous: z.boolean().default(true),
  isBinding: z.boolean().default(false),
});

export const voteSchema = z.object({
  voteValue: z.union([
    z.string(),
    z.array(z.string()),
    z.number(),
    z.object({}).passthrough(),
  ]),
});

export const approveSurveySchema = z.object({
  isApproved: z.boolean(),
  approvalNotes: z.string().optional(),
});

export const surveyQuerySchema = z.object({
  status: z.enum(['draft', 'pending_approval', 'approved', 'active', 'completed', 'rejected', 'cancelled']).optional(),
  page: z.string().optional().default('1'),
  limit: z.string().optional().default('20'),
  sortBy: z.string().optional(),
  sortOrder: z.enum(['ASC', 'DESC']).optional().default('DESC'),
});

export type CreateSurveyInput = z.infer<typeof createSurveySchema>;
export type VoteInput = z.infer<typeof voteSchema>;
export type ApproveSurveyInput = z.infer<typeof approveSurveySchema>;
export type SurveyQueryInput = z.infer<typeof surveyQuerySchema>;
