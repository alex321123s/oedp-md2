import { Router } from 'express';
import { SurveyController } from '../controllers/survey.controller';
import { authenticate } from '../middleware/auth.middleware';
import { asyncHandler } from '../middleware/errorHandler';

const router = Router();
const surveyController = new SurveyController();

// Public routes
router.get('/', asyncHandler(surveyController.list.bind(surveyController)));
router.get('/:id', asyncHandler(surveyController.getById.bind(surveyController)));
router.get('/:id/results', asyncHandler(surveyController.getResults.bind(surveyController)));

// Protected routes (authenticated users)
router.post('/', authenticate, asyncHandler(surveyController.create.bind(surveyController)));
router.post('/:id/vote', authenticate, asyncHandler(surveyController.vote.bind(surveyController)));
router.get('/my/surveys', authenticate, asyncHandler(surveyController.getMySurveys.bind(surveyController)));
router.get('/my/votes', authenticate, asyncHandler(surveyController.getMyVotes.bind(surveyController)));

// BGSt/Admin routes
router.post('/:id/approve', authenticate, asyncHandler(surveyController.approve.bind(surveyController)));

export default router;
