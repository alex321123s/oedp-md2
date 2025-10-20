import { Response } from 'express';
import { AppDataSource } from '../config/database';
import { Comment, CommentType } from '../entities/Comment.entity';
import { Reaction, ReactionType, ReactionEntityType } from '../entities/Reaction.entity';
import { User } from '../entities/User.entity';
import { AuthRequest } from '../middleware/auth.middleware';
import { AppError } from '../middleware/errorHandler';
import { logger } from '../utils/logger';

export class CommentController {
  private commentRepository = AppDataSource.getRepository(Comment);
  private reactionRepository = AppDataSource.getRepository(Reaction);

  async create(req: AuthRequest, res: Response): Promise<void> {
    if (!req.user) {
      throw new AppError(401, 'Nicht authentifiziert');
    }

    const { entityType, entityId, content, parentId } = req.body;

    if (!content || content.trim().length < 3) {
      throw new AppError(400, 'Kommentar muss mindestens 3 Zeichen lang sein');
    }

    if (!Object.values(CommentType).includes(entityType)) {
      throw new AppError(400, 'Ungültiger Entitätstyp');
    }

    const comment = this.commentRepository.create({
      entityType,
      entityId,
      authorId: req.user.id,
      content: content.trim(),
      parentId: parentId || null,
    });

    await this.commentRepository.save(comment);

    // Load author info
    const savedComment = await this.commentRepository.findOne({
      where: { id: comment.id },
      relations: ['author'],
    });

    logger.info(`Comment created: ${comment.id} by user: ${req.user.id}`);

    res.status(201).json({
      success: true,
      message: 'Kommentar wurde erstellt',
      data: { comment: savedComment },
    });
  }

  async getByEntity(req: AuthRequest, res: Response): Promise<void> {
    const { entityType, entityId } = req.params;

    if (!Object.values(CommentType).includes(entityType as CommentType)) {
      throw new AppError(400, 'Ungültiger Entitätstyp');
    }

    const comments = await this.commentRepository.find({
      where: {
        entityType: entityType as CommentType,
        entityId,
        isDeleted: false,
      },
      relations: ['author'],
      order: { createdAt: 'DESC' },
    });

    // Get user reactions if authenticated
    let userReactions: Map<string, ReactionType> = new Map();
    if (req.user) {
      const reactions = await this.reactionRepository.find({
        where: {
          userId: req.user.id,
          entityType: ReactionEntityType.COMMENT,
        },
      });
      reactions.forEach(r => userReactions.set(r.entityId, r.reactionType));
    }

    // Add user reaction info to comments
    const commentsWithReactions = comments.map(comment => ({
      ...comment,
      userReaction: userReactions.get(comment.id) || null,
    }));

    res.json({
      success: true,
      data: {
        comments: commentsWithReactions,
        total: comments.length,
      },
    });
  }

  async update(req: AuthRequest, res: Response): Promise<void> {
    if (!req.user) {
      throw new AppError(401, 'Nicht authentifiziert');
    }

    const { id } = req.params;
    const { content } = req.body;

    if (!content || content.trim().length < 3) {
      throw new AppError(400, 'Kommentar muss mindestens 3 Zeichen lang sein');
    }

    const comment = await this.commentRepository.findOne({
      where: { id },
    });

    if (!comment) {
      throw new AppError(404, 'Kommentar nicht gefunden');
    }

    if (comment.authorId !== req.user.id) {
      throw new AppError(403, 'Sie können nur Ihre eigenen Kommentare bearbeiten');
    }

    comment.content = content.trim();
    comment.isEdited = true;
    await this.commentRepository.save(comment);

    const updatedComment = await this.commentRepository.findOne({
      where: { id },
      relations: ['author'],
    });

    logger.info(`Comment updated: ${id} by user: ${req.user.id}`);

    res.json({
      success: true,
      message: 'Kommentar wurde aktualisiert',
      data: { comment: updatedComment },
    });
  }

  async delete(req: AuthRequest, res: Response): Promise<void> {
    if (!req.user) {
      throw new AppError(401, 'Nicht authentifiziert');
    }

    const { id } = req.params;

    const comment = await this.commentRepository.findOne({
      where: { id },
    });

    if (!comment) {
      throw new AppError(404, 'Kommentar nicht gefunden');
    }

    // Allow authors and admins to delete
    if (comment.authorId !== req.user.id && !['admin', 'bgst'].includes(req.user.role)) {
      throw new AppError(403, 'Keine Berechtigung');
    }

    comment.isDeleted = true;
    comment.content = '[Gelöscht]';
    await this.commentRepository.save(comment);

    logger.info(`Comment deleted: ${id} by user: ${req.user.id}`);

    res.json({
      success: true,
      message: 'Kommentar wurde gelöscht',
    });
  }

  async addReaction(req: AuthRequest, res: Response): Promise<void> {
    if (!req.user) {
      throw new AppError(401, 'Nicht authentifiziert');
    }

    const { entityType, entityId } = req.params;
    const { reactionType } = req.body;

    if (!Object.values(ReactionEntityType).includes(entityType as ReactionEntityType)) {
      throw new AppError(400, 'Ungültiger Entitätstyp');
    }

    if (!Object.values(ReactionType).includes(reactionType)) {
      throw new AppError(400, 'Ungültiger Reaktionstyp');
    }

    // Check if user already reacted
    const existing = await this.reactionRepository.findOne({
      where: {
        userId: req.user.id,
        entityType: entityType as ReactionEntityType,
        entityId,
      },
    });

    if (existing) {
      // Update existing reaction
      if (existing.reactionType === reactionType) {
        // Remove reaction if same type
        await this.reactionRepository.remove(existing);
        await this.updateReactionCounts(entityType as ReactionEntityType, entityId);
        
        res.json({
          success: true,
          message: 'Reaktion wurde entfernt',
        });
        return;
      } else {
        // Change reaction type
        existing.reactionType = reactionType;
        await this.reactionRepository.save(existing);
      }
    } else {
      // Create new reaction
      const reaction = this.reactionRepository.create({
        userId: req.user.id,
        entityType: entityType as ReactionEntityType,
        entityId,
        reactionType,
      });
      await this.reactionRepository.save(reaction);
    }

    await this.updateReactionCounts(entityType as ReactionEntityType, entityId);

    logger.info(`Reaction added: ${reactionType} on ${entityType}:${entityId} by user: ${req.user.id}`);

    res.json({
      success: true,
      message: 'Reaktion wurde hinzugefügt',
    });
  }

  private async updateReactionCounts(entityType: ReactionEntityType, entityId: string): Promise<void> {
    const likes = await this.reactionRepository.count({
      where: {
        entityType,
        entityId,
        reactionType: ReactionType.LIKE,
      },
    });

    const dislikes = await this.reactionRepository.count({
      where: {
        entityType,
        entityId,
        reactionType: ReactionType.DISLIKE,
      },
    });

    if (entityType === ReactionEntityType.COMMENT) {
      await this.commentRepository.update(entityId, {
        likesCount: likes,
        dislikesCount: dislikes,
      });
    }
    // Can extend for Motion and Survey entities if needed
  }

  async getReactions(req: AuthRequest, res: Response): Promise<void> {
    const { entityType, entityId } = req.params;

    if (!Object.values(ReactionEntityType).includes(entityType as ReactionEntityType)) {
      throw new AppError(400, 'Ungültiger Entitätstyp');
    }

    const reactions = await this.reactionRepository.find({
      where: {
        entityType: entityType as ReactionEntityType,
        entityId,
      },
      relations: ['user'],
    });

    const likes = reactions.filter(r => r.reactionType === ReactionType.LIKE);
    const dislikes = reactions.filter(r => r.reactionType === ReactionType.DISLIKE);

    let userReaction = null;
    if (req.user) {
      const userR = reactions.find(r => r.userId === req.user!.id);
      userReaction = userR?.reactionType || null;
    }

    res.json({
      success: true,
      data: {
        likes: likes.length,
        dislikes: dislikes.length,
        userReaction,
        details: {
          likedBy: likes.map(l => ({
            id: l.user.id,
            name: `${l.user.firstName} ${l.user.lastName}`,
          })),
          dislikedBy: dislikes.map(d => ({
            id: d.user.id,
            name: `${d.user.firstName} ${d.user.lastName}`,
          })),
        },
      },
    });
  }
}
