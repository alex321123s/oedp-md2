import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller';
import { authenticate } from '../middleware/auth.middleware';
import { asyncHandler } from '../middleware/errorHandler';
import { authLimiter } from '../middleware/rateLimiter';

const router = Router();
const authController = new AuthController();

// Public routes
router.post('/register', asyncHandler(authController.register.bind(authController)));
router.post('/login', authLimiter, asyncHandler(authController.login.bind(authController)));
router.get('/verify-email/:token', asyncHandler(authController.verifyEmail.bind(authController)));
router.post('/resend-verification', asyncHandler(authController.resendVerification.bind(authController)));

// Protected routes
router.post('/logout', authenticate, asyncHandler(authController.logout.bind(authController)));
router.get('/me', authenticate, asyncHandler(authController.getMe.bind(authController)));
router.put('/change-password', authenticate, asyncHandler(authController.changePassword.bind(authController)));
router.put('/profile', authenticate, asyncHandler(authController.updateProfile.bind(authController)));

export default router;
