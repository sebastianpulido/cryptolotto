import { Router } from 'express';
import { LotteryController } from '../controllers/LotteryController';
import { authMiddleware } from '../middleware/auth';

const router = Router();

router.get('/current', LotteryController.getCurrentLottery);
router.get('/stats', LotteryController.getStats);
router.get('/history', LotteryController.getHistory);
router.get('/:id', LotteryController.getLotteryById);
router.post('/:id/tickets', authMiddleware, LotteryController.buyTicket);

export { router as lotteryRoutes };