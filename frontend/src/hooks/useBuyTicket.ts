import { useMutation, useQueryClient } from '@tanstack/react-query';
import { PaymentService, PaymentData } from '../services/paymentService';

interface BuyTicketData extends PaymentData {
  method: 'stripe' | 'paypal' | 'crypto';
  signature?: string; // Para pagos crypto
}

export function useBuyTicket() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: BuyTicketData) => {
      switch (data.method) {
        case 'stripe':
          return await PaymentService.createStripeSession(data);
        
        case 'paypal':
          return await PaymentService.createPayPalOrder(data);
        
        case 'crypto':
          if (!data.signature) {
            throw new Error('Signature requerida para pagos crypto');
          }
          return await PaymentService.processCryptoPayment({
            lotteryId: data.lotteryId,
            quantity: data.quantity,
            signature: data.signature,
          });
        
        default:
          throw new Error('Método de pago no soportado');
      }
    },
    onSuccess: () => {
      // Invalidar queries relacionadas
      queryClient.invalidateQueries({ queryKey: ['lottery'] });
      queryClient.invalidateQueries({ queryKey: ['user'] });
    },
  });
}