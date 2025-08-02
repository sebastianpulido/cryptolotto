'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CreditCard, Wallet, Loader2 } from 'lucide-react';
import { loadStripe } from '@stripe/stripe-js';
import { PayPalScriptProvider, PayPalButtons } from '@paypal/react-paypal-js';
import { Lottery } from '../../../shared/types';
import { useBuyTicket } from '../hooks/useBuyTicket';
import { useLanguage } from '../hooks/useLanguage';
import toast from 'react-hot-toast';

interface BuyTicketModalProps {
  lottery: Lottery;
  onClose: () => void;
}

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || '');

export function BuyTicketModal({ lottery, onClose }: BuyTicketModalProps) {
  const [paymentMethod, setPaymentMethod] = useState<'stripe' | 'paypal' | 'crypto'>('stripe');
  const [isProcessing, setIsProcessing] = useState(false);
  const buyTicketMutation = useBuyTicket();
  const { t } = useLanguage();

  const handleStripePayment = async () => {
    try {
      setIsProcessing(true);
      const stripe = await stripePromise;
      if (!stripe) throw new Error('Stripe no disponible');

      const result = await buyTicketMutation.mutateAsync({
        method: 'stripe',
        lotteryId: lottery.id,
        quantity: 1
      });

      // Redirigir a Stripe Checkout
      const { error } = await stripe.redirectToCheckout({
        sessionId: result.sessionId
      });

      if (error) {
        throw new Error(error.message);
      }
    } catch (error) {
      toast.error(t('buyTicket.error'));
      // Error handling for payment processing
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCryptoPayment = async () => {
    try {
      setIsProcessing(true);
      
      // Aquí implementarías la lógica de conexión con wallet de Solana
      // Por ahora simularemos una signature
      const mockSignature = 'mock_signature_' + Date.now();
      
      await buyTicketMutation.mutateAsync({
        method: 'crypto',
        lotteryId: lottery.id,
        quantity: 1,
        signature: mockSignature
      });

      toast.success(t('buyTicket.success'));
      onClose();
    } catch (error) {
      toast.error(t('buyTicket.error'));
      // Error handling for crypto payment processing
    } finally {
      setIsProcessing(false);
    }
  };

  const paypalInitialOptions = {
    clientId: process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID || '',
    currency: 'USD',
    intent: 'capture',
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
              {t('buyTicket.title')}
            </h2>
            <p className="text-gray-600">
              Round #{lottery.round} • {t('buyTicket.price')}: $1 USD
            </p>
          </div>

          {/* Lottery Info */}
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-4 mb-6">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-gray-600">{t('lottery.currentPrize')}:</span>
              <span className="font-bold text-lg text-purple-600">
                ${lottery.totalPool.toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-gray-600">{t('lottery.ticketsSold')}:</span>
              <span className="font-semibold">
                {lottery.ticketsSold.toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">{t('buyTicket.yourNumber')}:</span>
              <span className="font-bold text-blue-600">
                #{lottery.ticketsSold + 1}
              </span>
            </div>
          </div>

          {/* Payment Method Selection */}
          <div className="mb-6">
            <h3 className="font-semibold text-gray-900 mb-3">
              {t('buyTicket.paymentMethod')}
            </h3>
            
            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={() => setPaymentMethod('stripe')}
                className={`p-3 rounded-lg border-2 transition-all ${
                  paymentMethod === 'stripe'
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <CreditCard className="w-5 h-5 mx-auto mb-1 text-blue-600" />
                <div className="text-xs font-medium">Stripe</div>
                <div className="text-xs text-gray-500">Visa, MC</div>
              </button>

              <button
                onClick={() => setPaymentMethod('paypal')}
                className={`p-3 rounded-lg border-2 transition-all ${
                  paymentMethod === 'paypal'
                    ? 'border-blue-600 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="w-5 h-5 mx-auto mb-1 bg-blue-600 rounded text-white text-xs flex items-center justify-center font-bold">
                  PP
                </div>
                <div className="text-xs font-medium">PayPal</div>
                <div className="text-xs text-gray-500">Seguro</div>
              </button>

              <button
                onClick={() => setPaymentMethod('crypto')}
                className={`p-3 rounded-lg border-2 transition-all ${
                  paymentMethod === 'crypto'
                    ? 'border-purple-500 bg-purple-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <Wallet className="w-5 h-5 mx-auto mb-1 text-purple-600" />
                <div className="text-xs font-medium">Crypto</div>
                <div className="text-xs text-gray-500">USDC, SOL</div>
              </button>
            </div>
          </div>

          {/* Payment Section */}
          <div className="mb-6">
            {paymentMethod === 'stripe' && (
              <button
                onClick={handleStripePayment}
                disabled={isProcessing}
                className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white font-bold py-4 rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    {t('buyTicket.processing')}
                  </>
                ) : (
                  `${t('buyTicket.buyWith')} Stripe - $1 USD`
                )}
              </button>
            )}

            {paymentMethod === 'paypal' && (
              <div className="space-y-3">
                <PayPalScriptProvider options={paypalInitialOptions}>
                  <PayPalButtons
                    style={{ layout: 'vertical' }}
                    createOrder={async () => {
                      const result = await buyTicketMutation.mutateAsync({
                        method: 'paypal',
                        lotteryId: lottery.id,
                        quantity: 1
                      });
                      return result.orderId;
                    }}
                    onApprove={async (data) => {
                      try {
                        // Capturar el pago
                        const response = await fetch('/api/payment/paypal/capture-order', {
                          method: 'POST',
                          headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${localStorage.getItem('token')}`,
                          },
                          body: JSON.stringify({ orderId: data.orderID }),
                        });

                        if (response.ok) {
                          toast.success(t('buyTicket.success'));
                          onClose();
                        } else {
                          throw new Error('Error capturando pago');
                        }
                      } catch (error) {
                        toast.error(t('buyTicket.error'));
                        // Error handling for PayPal payment capture
                      }
                    }}
                    onError={() => {
                      toast.error(t('buyTicket.error'));
                      // Error handling for PayPal payment errors
                    }}
                  />
                </PayPalScriptProvider>
              </div>
            )}

            {paymentMethod === 'crypto' && (
              <button
                onClick={handleCryptoPayment}
                disabled={isProcessing}
                className="w-full bg-gradient-to-r from-purple-600 to-purple-700 text-white font-bold py-4 rounded-lg hover:from-purple-700 hover:to-purple-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    {t('buyTicket.processing')}
                  </>
                ) : (
                  `${t('buyTicket.buyWith')} Crypto - $1 USD`
                )}
              </button>
            )}
          </div>

          {/* Security Note */}
          <p className="text-xs text-gray-500 text-center">
            🔒 {t('buyTicket.securePayment')} • {t('buyTicket.transparentDraw')}
          </p>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}