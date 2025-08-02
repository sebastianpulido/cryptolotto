import { Router } from 'express';
import { UserController } from '../controllers/UserController';
import { authMiddleware } from '../middleware/auth';

const router = Router();

router.get('/profile', authMiddleware, UserController.getProfile);
router.put('/profile', authMiddleware, UserController.updateProfile);
router.get('/tickets', authMiddleware, UserController.getUserTickets);
router.get('/referrals', authMiddleware, UserController.getReferrals);

export { router as userRoutes };
