import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import cron from 'node-cron';

import { authRoutes } from './routes/auth';
import { lotteryRoutes } from './routes/lottery';
import { paymentRoutes } from './routes/payment';
import { userRoutes } from './routes/user';
import { adminRoutes } from './routes/admin';
import { errorHandler } from './middleware/errorHandler';
import { logger } from './utils/logger';
import { LotteryService } from './services/LotteryService';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(helmet());
app.use(
  cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/lottery', lotteryRoutes);
app.use('/api/payment', paymentRoutes);
app.use('/api/user', userRoutes);
app.use('/api/admin', adminRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Error handling
app.use(errorHandler);

// Cron jobs
// Sorteo automático cada domingo a las 20:00 UTC
cron.schedule('0 20 * * 0', async () => {
  logger.info('Iniciando sorteo automático semanal');
  try {
    await LotteryService.drawCurrentLottery();
    await LotteryService.createNewLottery();
    logger.info('Sorteo completado y nueva lotería creada');
  } catch (error) {
    logger.error('Error en sorteo automático:', error);
  }
});

// Verificar pagos pendientes cada 5 minutos
cron.schedule('*/5 * * * *', async () => {
  try {
    await LotteryService.processPendingPayments();
  } catch (error) {
    logger.error('Error procesando pagos pendientes:', error);
  }
});

app.listen(PORT, () => {
  logger.info(`🚀 Servidor corriendo en puerto ${PORT}`);
  logger.info(`📊 Dashboard: http://localhost:${PORT}/health`);
});

export default app;
