export enum CommentType {
  MOTION = 'motion',
  SURVEY = 'survey',
}

export enum ReactionType {
  LIKE = 'like',
  DISLIKE = 'dislike',
}

export interface Comment {
  id: string;
  entityType: CommentType;
  entityId: string;
  authorId: string;
  author: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  content: string;
  parentId: string | null;
  likesCount: number;
  dislikesCount: number;
  isEdited: boolean;
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
  userReaction?: ReactionType | null;
}

export interface QuickPoll {
  id: string;
  motionId: string;
  question: string;
  options: string[];
  votes: Record<string, number>;
  creatorId: string;
  creator?: {
    id: string;
    firstName: string;
    lastName: string;
  };
  isActive: boolean;
  allowMultipleVotes: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface PollResult {
  option: string;
  votes: number;
  percentage: string;
}
