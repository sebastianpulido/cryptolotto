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

interface PaymentData {
  stripeSessionId?: string;
  paypalOrderId?: string;
  transactionSignature?: string;
  [key: string]: unknown;
}

interface LotteryStats {
  totalLotteries: number;
  totalTicketsSold: number;
  totalPrizePool: number;
  [key: string]: unknown;
}

// Mock data for development
const mockLottery: Lottery = {
  id: '1',
  round: 1,
  startTime: new Date('2024-01-01'),
  endTime: new Date('2024-12-31'),
  ticketPrice: 1,
  totalPool: 150,
  ticketsSold: 150,
  maxTickets: 10000,
  status: 'active',
  contractAddress: 'mock_contract_address'
};

const mockTickets: Ticket[] = [];
let ticketCounter = mockLottery.ticketsSold;

export class LotteryService {
  private static connection: Connection | null = null;

  // Initialize Solana connection only if RPC URL is provided
  static {
    try {
      const rpcUrl = process.env.SOLANA_RPC_URL;
      if (rpcUrl && (rpcUrl.startsWith('http://') || rpcUrl.startsWith('https://'))) {
        this.connection = new Connection(rpcUrl);
        logger.info('Solana connection initialized');
      } else {
        logger.warn('Solana RPC URL not configured or invalid, blockchain features disabled');
      }
    } catch (error) {
      logger.error('Failed to initialize Solana connection:', error);
    }
  }

  static async getCurrentLottery(): Promise<Lottery | null> {
    try {
      // Use mock data in development
      if (process.env.NODE_ENV === 'development') {
        console.log('🎲 LotteryService - Returning mock lottery for development');
        return mockLottery;
      }

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
      // Use mock data in development
      if (process.env.NODE_ENV === 'development') {
        console.log('🎲 LotteryService - Getting lottery by ID:', id);
        if (id === '1' || id === mockLottery.id) {
          return mockLottery;
        }
        return null;
      }

      const { data, error } = await supabase.from('lotteries').select('*').eq('id', id).single();

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
      // Use mock data in development
      if (process.env.NODE_ENV === 'development') {
        console.log('🎲 LotteryService - Creating new mock lottery');
        const newLottery = { ...mockLottery };
        newLottery.round += 1;
        newLottery.id = String(parseInt(newLottery.id) + 1);
        return newLottery;
      }

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
        status: 'active',
      };

      // Crear en Supabase
      const { data, error } = await supabase.from('lotteries').insert(lottery).select().single();

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
    paymentData?: PaymentData
  ): Promise<Ticket> {
    try {
      // Use mock data in development
      if (process.env.NODE_ENV === 'development') {
        console.log('🎲 LotteryService - Creating mock ticket for user:', userId);
        
        const lottery = await this.getLotteryById(lotteryId);
        if (!lottery) throw new Error('Lotería no encontrada');

        // Verificar que la lotería no esté llena
        if (lottery.ticketsSold >= lottery.maxTickets) {
          throw new Error('Lotería llena');
        }

        ticketCounter++;
        const ticket: Ticket = {
          id: `ticket_${ticketCounter}`,
          lotteryId,
          userId,
          ticketNumber: ticketCounter,
          purchaseTime: new Date(),
          price: lottery.ticketPrice,
          paymentMethod,
          transactionHash: paymentData?.transactionSignature || `mock_tx_${Date.now()}`,
          isWinner: false,
          paymentData: paymentData ? JSON.stringify(paymentData) : undefined,
        };

        mockTickets.push(ticket);
        
        // Update mock lottery
        mockLottery.ticketsSold = ticketCounter;
        mockLottery.totalPool += lottery.ticketPrice;

        console.log('🎫 Mock ticket created:', ticket);
        return ticket;
      }

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
        transactionHash:
          paymentData?.stripeSessionId ||
          paymentData?.paypalOrderId ||
          paymentData?.transactionSignature ||
          '',
        paymentData: paymentData ? JSON.stringify(paymentData) : undefined,
      };

      const { data, error } = await supabase.from('tickets').insert(ticket).select().single();

      if (error) throw error;

      // Actualizar contador de tickets vendidos
      await supabase
        .from('lotteries')
        .update({
          tickets_sold: lottery.ticketsSold + 1,
          total_pool: lottery.totalPool + lottery.ticketPrice,
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

      // Use mock data in development
      if (process.env.NODE_ENV === 'development') {
        console.log('🎲 LotteryService - Mock lottery draw, winner ticket:', winnerTicket);
        mockLottery.status = 'completed';
        mockLottery.winnerTicket = winnerTicket;
        return;
      }

      // Actualizar lotería
      await supabase
        .from('lotteries')
        .update({
          status: 'completed',
          winnerTicket,
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
      if (process.env.NODE_ENV === 'development') {
        console.log('🎲 LotteryService - Processing pending payments (mock)');
        return;
      }

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

  static async getLotteryStats(): Promise<LotteryStats> {
    try {
      if (process.env.NODE_ENV === 'development') {
        return {
          totalLotteries: 1,
          totalTicketsSold: mockLottery.ticketsSold,
          totalPrizePool: mockLottery.totalPool
        };
      }

      const { data: stats } = await supabase.rpc('get_lottery_stats');
      return stats || { totalLotteries: 0, totalTicketsSold: 0, totalPrizePool: 0 };
    } catch (error) {
      logger.error('Error obteniendo estadísticas:', error);
      throw error;
    }
  }
}
