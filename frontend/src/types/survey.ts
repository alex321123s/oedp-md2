export enum QuestionType {
  SINGLE_CHOICE = 'single_choice',
  MULTIPLE_CHOICE = 'multiple_choice',
  RANKED_CHOICE = 'ranked_choice',
  FREE_TEXT = 'free_text',
  YES_NO = 'yes_no',
}

export enum SurveyStatus {
  DRAFT = 'draft',
  PENDING_APPROVAL = 'pending_approval',
  APPROVED = 'approved',
  ACTIVE = 'active',
  COMPLETED = 'completed',
  REJECTED = 'rejected',
  CANCELLED = 'cancelled',
}

export interface Survey {
  id: string;
  title: string;
  description: string;
  questionType: QuestionType;
  options: string[];
  status: SurveyStatus;
  creatorId: string;
  creator?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  coInitiatorIds: string;
  durationDays: number;
  startDate?: string;
  endDate?: string;
  isAnonymous: boolean;
  isBinding: boolean;
  participantCount: number;
  results?: any;
  approvedAt?: string;
  approvedById?: string;
  approvalNotes?: string;
  resultsPublished: boolean;
  resultsPublishedAt?: string;
  createdAt: string;
  updatedAt: string;
  hasVoted?: boolean;
  userVote?: Vote;
}

export interface Vote {
  id: string;
  surveyId: string;
  voterId: string;
  voteValue: string | string[] | number | object;
  votedAt: string;
  survey?: Survey;
}

export const QUESTION_TYPE_LABELS: Record<QuestionType, string> = {
  [QuestionType.SINGLE_CHOICE]: 'Einzelauswahl',
  [QuestionType.MULTIPLE_CHOICE]: 'Mehrfachauswahl',
  [QuestionType.RANKED_CHOICE]: 'Rangfolge',
  [QuestionType.FREE_TEXT]: 'Freitext',
  [QuestionType.YES_NO]: 'Ja/Nein',
};

export const SURVEY_STATUS_LABELS: Record<SurveyStatus, string> = {
  [SurveyStatus.DRAFT]: 'Entwurf',
  [SurveyStatus.PENDING_APPROVAL]: 'Wartet auf Genehmigung',
  [SurveyStatus.APPROVED]: 'Genehmigt',
  [SurveyStatus.ACTIVE]: 'Aktiv',
  [SurveyStatus.COMPLETED]: 'Abgeschlossen',
  [SurveyStatus.REJECTED]: 'Abgelehnt',
  [SurveyStatus.CANCELLED]: 'Abgebrochen',
};

export const SURVEY_STATUS_COLORS: Record<SurveyStatus, string> = {
  [SurveyStatus.DRAFT]: 'bg-gray-100 text-gray-800',
  [SurveyStatus.PENDING_APPROVAL]: 'bg-yellow-100 text-yellow-800',
  [SurveyStatus.APPROVED]: 'bg-blue-100 text-blue-800',
  [SurveyStatus.ACTIVE]: 'bg-green-100 text-green-800',
  [SurveyStatus.COMPLETED]: 'bg-purple-100 text-purple-800',
  [SurveyStatus.REJECTED]: 'bg-red-100 text-red-800',
  [SurveyStatus.CANCELLED]: 'bg-gray-100 text-gray-800',
};
