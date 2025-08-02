import { useMutation, useQueryClient } from '@tanstack/react-query';

interface BuyTicketData {
  method: 'stripe' | 'crypto';
  quantity: number;
}

export function useBuyTicket() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: BuyTicketData) => {
      // Simular compra de ticket para desarrollo
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      console.log('Mock ticket purchase:', data);
      
      return {
        success: true,
        ticketId: 'mock-ticket-' + Date.now(),
        ticketNumber: Math.floor(Math.random() * 1000) + 1,
        quantity: data.quantity,
      };
    },
    onSuccess: () => {
      // Invalidar queries relacionadas
      queryClient.invalidateQueries({ queryKey: ['lottery'] });
      queryClient.invalidateQueries({ queryKey: ['user'] });
    },
  });
}