import { Router } from 'express';
import { PaymentController } from '../controllers/PaymentController';
import { authMiddleware } from '../middleware/auth';

const router = Router();

router.post('/stripe/create-session', authMiddleware, PaymentController.createStripeSession);
router.post('/stripe/webhook', PaymentController.stripeWebhook);
router.post('/crypto', authMiddleware, PaymentController.processCryptoPayment);
router.get('/history', authMiddleware, PaymentController.getPaymentHistory);

export { router as paymentRoutes };