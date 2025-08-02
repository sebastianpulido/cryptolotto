import { Router } from 'express';
import { PaymentController } from '../controllers/PaymentController';
import { authMiddleware } from '../middleware/auth';

const router = Router();

// Stripe routes
router.post('/stripe/create-session', authMiddleware, PaymentController.createStripeSession);
router.post('/stripe/webhook', PaymentController.stripeWebhook);

// PayPal routes
router.post('/paypal/create-order', authMiddleware, PaymentController.createPayPalOrder);
router.post('/paypal/capture-order', authMiddleware, PaymentController.capturePayPalOrder);

// Crypto payments
router.post('/crypto', authMiddleware, PaymentController.processCryptoPayment);

// Payment history
router.get('/history', authMiddleware, PaymentController.getPaymentHistory);

export { router as paymentRoutes };