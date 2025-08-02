export interface Lottery {
  id: string;
  name: string;
  ticketPrice: number; // en USD
  maxTickets: number;
  currentTickets: number;
  drawDate: Date;
  status: 'active' | 'drawing' | 'completed';
  prizePool: number;
  winner?: string;
  createdAt: Date;
}

export interface Ticket {
  id: string;
  lotteryId: string;
  userId: string;
  ticketNumber: number;
  purchaseDate: Date;
  transactionHash: string;
  price: number;
  status: 'active' | 'winner' | 'expired';
}

export interface User {
  id: string;
  email: string;
  walletAddress: string;
  displayName?: string;
  avatar?: string;
  totalTickets: number;
  totalWinnings: number;
  referralCode: string;
  referredBy?: string;
  vipLevel: 'basic' | 'silver' | 'gold' | 'platinum';
  createdAt: Date;
}

export interface PaymentMethod {
  type: 'card' | 'crypto';
  provider: 'stripe' | 'transak' | 'moonpay' | 'wallet';
  details: any;
}

export interface Transaction {
  id: string;
  userId: string;
  type: 'ticket_purchase' | 'prize_payout' | 'refund';
  amount: number;
  currency: 'USD' | 'USDC' | 'SOL';
  status: 'pending' | 'completed' | 'failed';
  paymentMethod: PaymentMethod;
  transactionHash?: string;
  createdAt: Date;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface LotteryStats {
  totalLotteries: number;
  totalTicketsSold: number;
  totalPrizesPaid: number;
  activeUsers: number;
  averageTicketsPerLottery: number;
}
