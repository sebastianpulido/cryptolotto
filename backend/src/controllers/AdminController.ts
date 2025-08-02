import { Request, Response } from 'express';
import { supabase } from '../config/supabase';
import { logger } from '../utils/logger';
import { LotteryService } from '../services/LotteryService';

export class AdminController {
  static async getDashboard(req: Request, res: Response) {
    try {
      const stats = await LotteryService.getLotteryStats();
      res.json({ success: true, data: stats });
    } catch (error) {
      logger.error('Error obteniendo dashboard:', error);
      res.status(500).json({ success: false, error: 'Error interno del servidor' });
    }
  }

  static async createLottery(req: Request, res: Response) {
    try {
      const lottery = await LotteryService.createNewLottery();
      res.json({ success: true, data: lottery });
    } catch (error) {
      logger.error('Error creando lotería:', error);
      res.status(500).json({ success: false, error: 'Error interno del servidor' });
    }
  }

  static async drawLottery(req: Request, res: Response) {
    try {
      const { id } = req.params;
      await LotteryService.drawCurrentLottery();
      res.json({ success: true, message: 'Sorteo realizado exitosamente' });
    } catch (error) {
      logger.error('Error realizando sorteo:', error);
      res.status(500).json({ success: false, error: 'Error interno del servidor' });
    }
  }

  static async getUsers(req: Request, res: Response) {
    try {
      const { data: users, error } = await supabase
        .from('users')
        .select('id, email, name, created_at, role')
        .order('created_at', { ascending: false });

      if (error) throw error;

      res.json({ success: true, data: users });
    } catch (error) {
      logger.error('Error obteniendo usuarios:', error);
      res.status(500).json({ success: false, error: 'Error interno del servidor' });
    }
  }

  static async getPayments(req: Request, res: Response) {
    try {
      const { data: payments, error } = await supabase
        .from('tickets')
        .select(`
          id,
          price,
          payment_method,
          purchase_time,
          transaction_hash,
          users (email, name),
          lotteries (round)
        `)
        .order('purchase_time', { ascending: false });

      if (error) throw error;

      res.json({ success: true, data: payments });
    } catch (error) {
      logger.error('Error obteniendo pagos:', error);
      res.status(500).json({ success: false, error: 'Error interno del servidor' });
    }
  }
}