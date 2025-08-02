import { Connection, PublicKey, Keypair } from '@solana/web3.js';
// import { Program, AnchorProvider, Wallet } from '@coral-xyz/anchor';
import { supabase } from '../config/supabase';
import { logger } from '../utils/logger';

// Define types locally to avoid path issues
interface Lottery {
  id: string;
  round: number;
  startTime: Date;
  endTime: Date;
  ticketPrice: number;
  totalPool: number;
  ticketsSold: number;
  maxTickets: number;
  status: 'active' | 'drawing' | 'completed';
  winnerId?: string;
  winnerTicket?: number;
  contractAddress: string;
}

interface Ticket {
  id: string;
  lotteryId: string;
  userId: string;
  ticketNumber: number;
  purchaseTime: Date;
  transactionHash: string;
  price: number;
  isWinner: boolean;
  paymentMethod: string;
  paymentData?: string;
}

export class LotteryService {
  private static connection = new Connection(process.env.SOLANA_RPC_URL!);
  // private static program: Program<any>; // Tipo del programa Anchor - commented out until anchor is properly configured

  static async getCurrentLottery(): Promise<Lottery | null> {
    try {
      const { data, error } = await supabase
        .from('lotteries')
        .select('*')
        .eq('status', 'active')
        .single();

      if (error) {
        logger.error('Error obteniendo lotería actual:', error);
        return null;
      }

      return data;
    } catch (error) {
      logger.error('Error en getCurrentLottery:', error);
      return null;
    }
  }

  static async getLotteryById(id: string): Promise<Lottery | null> {
    try {
      const { data, error } = await supabase
        .from('lotteries')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        logger.error('Error obteniendo lotería por ID:', error);
        return null;
      }

      return data;
    } catch (error) {
      logger.error('Error en getLotteryById:', error);
      return null;
    }
  }

  static async createNewLottery(): Promise<Lottery> {
    try {
      // Obtener el último round
      const { data: lastLottery } = await supabase
        .from('lotteries')
        .select('round')
        .order('round', { ascending: false })
        .limit(1)
        .single();

      const newRound = (lastLottery?.round || 0) + 1;
      const startTime = new Date();
      const endTime = new Date();
      endTime.setDate(endTime.getDate() + 7); // Una semana

      const lottery: Partial<Lottery> = {
        round: newRound,
        startTime,
        endTime,
        ticketPrice: 1, // $1 USD
        totalPool: 0,
        ticketsSold: 0,
        maxTickets: 10000,
        status: 'active'
      };

      // Crear en Supabase
      const { data, error } = await supabase
        .from('lotteries')
        .insert(lottery)
        .select()
        .single();

      if (error) throw error;

      // TODO: Crear en blockchain
      // await this.createLotteryOnChain(data);

      logger.info(`Nueva lotería creada: Round ${newRound}`);
      return data;
    } catch (error) {
      logger.error('Error creando nueva lotería:', error);
      throw error;
    }
  }

  static async buyTicket(
    userId: string, 
    lotteryId: string, 
    paymentMethod: string, 
    paymentData?: any
  ): Promise<Ticket> {
    try {
      const lottery = await this.getCurrentLottery();
      if (!lottery) throw new Error('No hay lotería activa');
  
      // Verificar que la lotería no esté llena
      if (lottery.ticketsSold >= lottery.maxTickets) {
        throw new Error('Lotería llena');
      }
  
      // Crear ticket en base de datos
      const ticket: Partial<Ticket> = {
        lotteryId,
        userId,
        ticketNumber: lottery.ticketsSold + 1,
        purchaseTime: new Date(),
        price: lottery.ticketPrice,
        paymentMethod,
        transactionHash: paymentData?.stripeSessionId || paymentData?.paypalOrderId || paymentData?.transactionSignature,
        paymentData: paymentData ? JSON.stringify(paymentData) : undefined,
      };
  
      const { data, error } = await supabase
        .from('tickets')
        .insert(ticket)
        .select()
        .single();
  
      if (error) throw error;
  
      // Actualizar contador de tickets vendidos
      await supabase
        .from('lotteries')
        .update({ 
          tickets_sold: lottery.ticketsSold + 1,
          total_pool: lottery.totalPool + lottery.ticketPrice
        })
        .eq('id', lotteryId);
  
      return data;
    } catch (error) {
      logger.error('Error comprando ticket:', error);
      throw error;
    }
  }

  static async drawCurrentLottery(): Promise<void> {
    try {
      const lottery = await this.getCurrentLottery();
      if (!lottery) throw new Error('No hay lotería activa');

      if (lottery.ticketsSold === 0) {
        logger.info('No se vendieron tickets, cancelando sorteo');
        return;
      }

      // Generar número ganador
      const winnerTicket = Math.floor(Math.random() * lottery.ticketsSold) + 1;

      // Actualizar lotería
      await supabase
        .from('lotteries')
        .update({ 
          status: 'completed',
          winnerTicket
        })
        .eq('id', lottery.id);

      // Marcar ticket ganador
      await supabase
        .from('tickets')
        .update({ isWinner: true })
        .eq('lotteryId', lottery.id)
        .eq('ticketNumber', winnerTicket);

      // TODO: Ejecutar sorteo en blockchain
      // await this.drawWinnerOnChain(lottery);

      logger.info(`Sorteo completado: Ticket ganador ${winnerTicket}`);
    } catch (error) {
      logger.error('Error en sorteo:', error);
      throw error;
    }
  }

  static async processPendingPayments(): Promise<void> {
    try {
      const { data: pendingPayments } = await supabase
        .from('payments')
        .select('*')
        .eq('status', 'pending')
        .lt('createdAt', new Date(Date.now() - 10 * 60 * 1000)); // 10 minutos

      for (const payment of pendingPayments || []) {
        // Verificar estado del pago en Stripe/blockchain
        // Actualizar estado según corresponda
        logger.info(`Procesando pago pendiente: ${payment.id}`);
      }
    } catch (error) {
      logger.error('Error procesando pagos pendientes:', error);
    }
  }

  static async getLotteryStats(): Promise<any> {
    try {
      const { data: stats } = await supabase.rpc('get_lottery_stats');
      return stats;
    } catch (error) {
      logger.error('Error obteniendo estadísticas:', error);
      throw error;
    }
  }
}