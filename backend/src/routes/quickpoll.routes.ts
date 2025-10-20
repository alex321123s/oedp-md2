import { Router } from 'express';
import { QuickPollController } from '../controllers/quickpoll.controller';
import { authenticate } from '../middleware/auth.middleware';
import { asyncHandler } from '../middleware/errorHandler';

const router = Router();
const pollController = new QuickPollController();

// Get polls for a motion (public)
router.get('/motion/:motionId', asyncHandler(pollController.getByMotion.bind(pollController)));

// Get poll results (public)
router.get('/:id/results', asyncHandler(pollController.getResults.bind(pollController)));

// Create poll (authenticated)
router.post('/', authenticate, asyncHandler(pollController.create.bind(pollController)));

// Vote on poll (authenticated)
router.post('/:id/vote', authenticate, asyncHandler(pollController.vote.bind(pollController)));

// Toggle poll active status (authenticated)
router.patch('/:id/toggle', authenticate, asyncHandler(pollController.toggle.bind(pollController)));

export default router;
