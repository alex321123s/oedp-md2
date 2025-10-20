import { Router } from 'express';
import { CommentController } from '../controllers/comment.controller';
import { authenticate } from '../middleware/auth.middleware';
import { asyncHandler } from '../middleware/errorHandler';

const router = Router();
const commentController = new CommentController();

// Get comments for an entity (public)
router.get('/:entityType/:entityId', asyncHandler(commentController.getByEntity.bind(commentController)));

// Create comment (authenticated)
router.post('/', authenticate, asyncHandler(commentController.create.bind(commentController)));

// Update comment (authenticated)
router.put('/:id', authenticate, asyncHandler(commentController.update.bind(commentController)));

// Delete comment (authenticated)
router.delete('/:id', authenticate, asyncHandler(commentController.delete.bind(commentController)));

// Reactions
router.get('/reactions/:entityType/:entityId', asyncHandler(commentController.getReactions.bind(commentController)));
router.post('/reactions/:entityType/:entityId', authenticate, asyncHandler(commentController.addReaction.bind(commentController)));

export default router;
