'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CreditCard, Wallet, Loader2 } from 'lucide-react';
import { loadStripe } from '@stripe/stripe-js';
import { Lottery } from '../../../shared/types';
import { useBuyTicket } from '../hooks/useBuyTicket';
import toast from 'react-hot-toast';

interface BuyTicketModalProps {
  lottery: Lottery;
  onClose: () => void;
}

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || 'pk_test_mock');

export function BuyTicketModal({ lottery, onClose }: BuyTicketModalProps) {
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'crypto'>('card');
  const buyTicketMutation = useBuyTicket();

  const handleBuyWithCard = async () => {
    try {
      const stripe = await stripePromise;
      if (!stripe) throw new Error('Stripe no disponible');

      buyTicketMutation.mutate({
        method: 'stripe',
        quantity: 1
      }, {
        onSuccess: () => {
          toast.success('¡Ticket comprado exitosamente!');
          onClose();
        },
        onError: () => {
          toast.error('Error procesando el pago');
        }
      });
    } catch (error) {
      toast.error('Error procesando el pago');
      console.error(error);
    }
  };

  const handleBuyWithCrypto = async () => {
    try {
      buyTicketMutation.mutate({
        method: 'crypto',
        quantity: 1
      }, {
        onSuccess: () => {
          toast.success('¡Ticket comprado exitosamente!');
          onClose();
        },
        onError: () => {
          toast.error('Error comprando ticket');
        }
      });
    } catch (error) {
      toast.error('Error comprando ticket');
      console.error(error);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          className="bg-white rounded-2xl max-w-md w-full p-6 relative"
        >
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
          >
            <X className="w-6 h-6" />
          </button>

          {/* Header */}
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Comprar Ticket
            </h2>
            <p className="text-gray-600">
              Round #{lottery.round} • Precio: $1 USD
            </p>
          </div>

          {/* Lottery Info */}
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-4 mb-6">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-gray-600">Premio Actual:</span>
              <span className="font-bold text-lg text-purple-600">
                ${lottery.totalPool.toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-gray-600">Tickets Vendidos:</span>
              <span className="font-semibold">
                {lottery.ticketsSold.toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Tu Número:</span>
              <span className="font-bold text-blue-600">
                #{lottery.ticketsSold + 1}
              </span>
            </div>
          </div>

          {/* Payment Method Selection */}
          <div className="mb-6">
            <h3 className="font-semibold text-gray-900 mb-3">
              Método de Pago
            </h3>
            
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setPaymentMethod('card')}
                className={`p-4 rounded-lg border-2 transition-all ${
                  paymentMethod === 'card'
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <CreditCard className="w-6 h-6 mx-auto mb-2 text-blue-600" />
                <div className="text-sm font-medium">Tarjeta</div>
                <div className="text-xs text-gray-500">Visa, Mastercard</div>
              </button>

              <button
                onClick={() => setPaymentMethod('crypto')}
                className={`p-4 rounded-lg border-2 transition-all ${
                  paymentMethod === 'crypto'
                    ? 'border-purple-500 bg-purple-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <Wallet className="w-6 h-6 mx-auto mb-2 text-purple-600" />
                <div className="text-sm font-medium">Crypto</div>
                <div className="text-xs text-gray-500">USDC, SOL</div>
              </button>
            </div>
          </div>

          {/* Buy Button */}
          <button
            onClick={paymentMethod === 'card' ? handleBuyWithCard : handleBuyWithCrypto}
            disabled={buyTicketMutation.isPending}
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold py-4 rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
          >
            {buyTicketMutation.isPending ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Procesando...
              </>
            ) : (
              `Comprar Ticket - $1 USD`
            )}
          </button>

          {/* Security Note */}
          <p className="text-xs text-gray-500 text-center mt-4">
            🔒 Pago 100% seguro • Sorteo transparente en blockchain
          </p>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}