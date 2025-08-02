import { Request, Response } from 'express';
import { LotteryService } from '../services/LotteryService';
import { logger } from '../utils/logger';

export class LotteryController {
  static async getCurrentLottery(req: Request, res: Response) {
    try {
      const lottery = await LotteryService.getCurrentLottery();
      res.json({ success: true, data: lottery });
    } catch (error) {
      logger.error('Error obteniendo lotería actual:', error);
      res.status(500).json({ success: false, error: 'Error interno del servidor' });
    }
  }

  static async getStats(req: Request, res: Response) {
    try {
      const stats = await LotteryService.getLotteryStats();
      res.json({ success: true, data: stats });
    } catch (error) {
      logger.error('Error obteniendo estadísticas:', error);
      res.status(500).json({ success: false, error: 'Error interno del servidor' });
    }
  }

  static async buyTicket(req: Request, res: Response) {
    try {
      const { id: lotteryId } = req.params;
      const { paymentMethod } = req.body;
      const userId = (req as any).user.id;

      const ticket = await LotteryService.buyTicket(userId, lotteryId, paymentMethod);
      res.json({ success: true, data: ticket });
    } catch (error) {
      logger.error('Error comprando ticket:', error);
      res.status(400).json({ success: false, error: error.message });
    }
  }

  static async getHistory(req: Request, res: Response) {
    try {
      // Implementar lógica para obtener historial
      res.json({ success: true, data: [] });
    } catch (error) {
      logger.error('Error obteniendo historial:', error);
      res.status(500).json({ success: false, error: 'Error interno del servidor' });
    }
  }

  static async getLotteryById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      // Implementar lógica para obtener lotería por ID
      res.json({ success: true, data: null });
    } catch (error) {
      logger.error('Error obteniendo lotería:', error);
      res.status(500).json({ success: false, error: 'Error interno del servidor' });
    }
  }
}