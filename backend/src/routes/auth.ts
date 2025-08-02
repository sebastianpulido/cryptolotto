import { Router } from 'express';
import { AuthController } from '../controllers/AuthController';

const router = Router();

router.post('/login', AuthController.login);
router.post('/register', AuthController.register);
router.post('/logout', AuthController.logout);
router.get('/me', AuthController.getProfile);
router.post('/google', AuthController.googleAuth);

export { router as authRoutes };