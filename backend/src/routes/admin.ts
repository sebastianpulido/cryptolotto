import { Router } from 'express';
import { AdminController } from '../controllers/AdminController';
import { authMiddleware } from '../middleware/auth';
import { adminMiddleware } from '../middleware/admin';

const router = Router();

router.use(authMiddleware);
router.use(adminMiddleware);

router.get('/dashboard', AdminController.getDashboard);
router.post('/lottery/create', AdminController.createLottery);
router.post('/lottery/:id/draw', AdminController.drawLottery);
router.get('/users', AdminController.getUsers);
router.get('/payments', AdminController.getPayments);

export { router as adminRoutes };
