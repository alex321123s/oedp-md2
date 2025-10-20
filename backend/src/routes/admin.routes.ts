import { Router } from 'express';
import { AdminController } from '../controllers/admin.controller';
import { authenticate } from '../middleware/auth.middleware';
import { requireAdmin, requireStaff } from '../middleware/authorize.middleware';
import { asyncHandler } from '../middleware/errorHandler';

const router = Router();
const adminController = new AdminController();

// All admin routes require authentication
router.use(authenticate);

// Analytics (staff can view)
router.get('/analytics', requireStaff, asyncHandler(adminController.getAnalytics.bind(adminController)));
router.get('/audit-logs', requireStaff, asyncHandler(adminController.getAuditLogs.bind(adminController)));

// User management (admin only)
router.get('/users', requireAdmin, asyncHandler(adminController.getUsers.bind(adminController)));
router.put('/users/:id/role', requireAdmin, asyncHandler(adminController.updateUserRole.bind(adminController)));
router.patch('/users/:id/status', requireAdmin, asyncHandler(adminController.toggleUserStatus.bind(adminController)));

export default router;
