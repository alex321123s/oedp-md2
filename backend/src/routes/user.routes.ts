import { Router } from 'express';
import { UserController } from '../controllers/user.controller';
import { authenticate } from '../middleware/auth.middleware';
import { asyncHandler } from '../middleware/errorHandler';

const router = Router();
const userController = new UserController();

router.get('/', authenticate, asyncHandler(userController.getAll.bind(userController)));
router.get('/:id', authenticate, asyncHandler(userController.getById.bind(userController)));

export default router;
