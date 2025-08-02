import { Request, Response } from 'express';
import { supabase } from '../config/supabase';
import { logger } from '../utils/logger';

export class UserController {
  static async getProfile(req: Request, res: Response) {
    try {
      const userId = (req as any).user.id;
      
      const { data: user, error } = await supabase
        .from('users')
        .select('id, email, name, created_at, role')
        .eq('id', userId)
        .single();

      if (error) throw error;

      res.json({ success: true, data: user });
    } catch (error) {
      logger.error('Error obteniendo perfil:', error);
      res.status(500).json({ success: false, error: 'Error interno del servidor' });
    }
  }

  static async updateProfile(req: Request, res: Response) {
    try {
      const userId = (req as any).user.id;
      const { name } = req.body;

      const { data: user, error } = await supabase
        .from('users')
        .update({ name })
        .eq('id', userId)
        .select('id, email, name, created_at, role')
        .single();

      if (error) throw error;

      res.json({ success: true, data: user });
    } catch (error) {
      logger.error('Error actualizando perfil:', error);
      res.status(500).json({ success: false, error: 'Error interno del servidor' });
    }
  }

  static async getUserTickets(req: Request, res: Response) {
    try {
      const userId = (req as any).user.id;

      const { data: tickets, error } = await supabase
        .from('tickets')
        .select(`
          id,
          ticket_number,
          price,
          purchase_time,
          is_winner,
          lotteries (
            id,
            round,
            status,
            end_time,
            winner_ticket
          )
        `)
        .eq('user_id', userId)
        .order('purchase_time', { ascending: false });

      if (error) throw error;

      res.json({ success: true, data: tickets });
    } catch (error) {
      logger.error('Error obteniendo tickets del usuario:', error);
      res.status(500).json({ success: false, error: 'Error interno del servidor' });
    }
  }

  static async getReferrals(req: Request, res: Response) {
    try {
      const userId = (req as any).user.id;

      // Por ahora retornamos un array vacío
      // TODO: Implementar sistema de referidos
      res.json({ success: true, data: [] });
    } catch (error) {
      logger.error('Error obteniendo referidos:', error);
      res.status(500).json({ success: false, error: 'Error interno del servidor' });
    }
  }
}