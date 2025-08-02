export interface Lottery {
  id: string;
  round: number;
  startTime: Date;
  endTime: Date;
  ticketPrice: number; // en USD
  totalPool: number;
  ticketsSold: number;
  maxTickets: number;
  status: 'active' | 'drawing' | 'completed';
  winnerId?: string;
  winnerTicket?: number;
  contractAddress: string;
}

export interface Ticket {
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

export interface User {
  id: string;
  email: string;
  name: string;
  walletAddress: string;
  custodialWallet: string;
  totalSpent: number;
  totalWon: number;
  ticketsPurchased: number;
  referralCode: string;
  referredBy?: string;
  vipLevel: 'basic' | 'silver' | 'gold' | 'platinum';
  createdAt: Date;
}

export interface Payment {
  id: string;
  userId: string;
  lotteryId: string;
  amount: number;
  currency: 'USD' | 'USDC' | 'SOL';
  method: 'stripe' | 'crypto' | 'transak';
  status: 'pending' | 'completed' | 'failed';
  stripePaymentId?: string;
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