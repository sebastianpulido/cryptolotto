import { useQuery } from '@tanstack/react-query';
import { Lottery, LotteryStats } from '../../../shared/types';

// Mock data para desarrollo
const mockLottery: Lottery = {
  id: '1',
  round: 1,
  startTime: new Date(),
  endTime: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 días
  ticketPrice: 1,
  totalPool: 1000,
  ticketsSold: 150,
  maxTickets: 1000,
  status: 'active',
  contractAddress: '0x123...',
};

const mockStats: LotteryStats = {
  totalLotteries: 5,
  totalTicketsSold: 750,
  totalPrizesPaid: 5000,
  activeUsers: 200,
  averageTicketsPerLottery: 150,
};

export function useLottery() {
  const currentLottery = useQuery({
    queryKey: ['lottery', 'current'],
    queryFn: async () => {
      // Retornar datos inmediatamente sin delay
      return mockLottery;
    },
    staleTime: 30 * 1000,
    initialData: mockLottery, // Proporcionar datos iniciales
  });

  const stats = useQuery({
    queryKey: ['lottery', 'stats'],
    queryFn: async () => {
      // Retornar datos inmediatamente sin delay
      return mockStats;
    },
    staleTime: 60 * 1000,
    initialData: mockStats, // Proporcionar datos iniciales
  });

  return {
    lottery: currentLottery.data,
    lotteryStats: stats.data,
    isLoading: currentLottery.isLoading || stats.isLoading,
    error: currentLottery.error || stats.error,
  };
}