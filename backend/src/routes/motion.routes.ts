import { Router } from 'express';
import { MotionController } from '../controllers/motion.controller';
import { authenticate, optionalAuth } from '../middleware/auth.middleware';
import { requireBGSt, requireBAntrK } from '../middleware/authorize.middleware';
import { asyncHandler } from '../middleware/errorHandler';
import { signatureLimiter } from '../middleware/rateLimiter';

const router = Router();
const motionController = new MotionController();

// Public routes
router.get('/', optionalAuth, asyncHandler(motionController.getAll.bind(motionController)));
router.get('/:id', optionalAuth, asyncHandler(motionController.getById.bind(motionController)));
router.get('/:id/pdf', asyncHandler(motionController.exportPDF.bind(motionController)));

// Authenticated routes
router.post('/', authenticate, asyncHandler(motionController.create.bind(motionController)));
router.put('/:id', authenticate, asyncHandler(motionController.update.bind(motionController)));
router.post('/:id/publish', authenticate, asyncHandler(motionController.publishForSignatures.bind(motionController)));
router.post('/:id/sign', authenticate, signatureLimiter, asyncHandler(motionController.sign.bind(motionController)));
router.delete('/:id/sign', authenticate, asyncHandler(motionController.removeSignature.bind(motionController)));

// User-specific
router.get('/my/motions', authenticate, asyncHandler(motionController.getMyMotions.bind(motionController)));
router.get('/my/signatures', authenticate, asyncHandler(motionController.getMySignatures.bind(motionController)));

// BGSt routes
router.post('/:id/validate', authenticate, requireBGSt, asyncHandler(motionController.validate.bind(motionController)));

// BAntrK routes
router.post('/:id/schedule', authenticate, requireBAntrK, asyncHandler(motionController.schedule.bind(motionController)));
router.post('/:id/outcome', authenticate, requireBAntrK, asyncHandler(motionController.recordOutcome.bind(motionController)));

export default router;
