import { Request, Response } from 'express';
import Stripe from 'stripe';
import fetch from 'node-fetch';
import { logger } from '../utils/logger';
import { LotteryService } from '../services/LotteryService';
import { supabase } from '../config/supabase';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2023-10-16',
});

interface PayPalOrder {
  id: string;
  status: string;
  links?: Array<{ rel: string; href: string }>;
}

interface PayPalCapture {
  status: string;
  purchase_units: Array<{
    payments: {
      captures: Array<{
        id: string;
        custom_id: string;
        amount: { value: string };
      }>;
    };
  }>;
}

interface PayPalTokenResponse {
  access_token: string;
}

export class PaymentController {
  // Crear sesión de pago con Stripe
  static async createStripeSession(req: Request, res: Response): Promise<void> {
    try {
      const { lotteryId, quantity = 1 } = req.body;
      const userId = (req as any).user.id;

      // Obtener información de la lotería
      const lottery = await LotteryService.getLotteryById(lotteryId);
      if (!lottery) {
        res.status(404).json({ success: false, error: 'Lotería no encontrada' });
        return;
      }

      // Verificar disponibilidad
      if (lottery.ticketsSold + quantity > lottery.maxTickets) {
        res.status(400).json({ success: false, error: 'No hay suficientes tickets disponibles' });
        return;
      }

      // Crear sesión de Stripe
      const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: [
          {
            price_data: {
              currency: 'usd',
              product_data: {
                name: `CryptoLotto Ticket - Round #${lottery.round}`,
                description: `Ticket para la lotería Round #${lottery.round}`,
                images: ['https://your-domain.com/lottery-ticket.png'],
              },
              unit_amount: Math.round(lottery.ticketPrice * 100),
            },
            quantity,
          },
        ],
        mode: 'payment',
        success_url: `${process.env.FRONTEND_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${process.env.FRONTEND_URL}/lottery`,
        metadata: {
          userId,
          lotteryId,
          quantity: quantity.toString(),
          type: 'lottery_ticket',
        },
        customer_email: (req as any).user.email,
      });

      res.json({ 
        success: true, 
        data: { 
          sessionId: session.id,
          url: session.url 
        } 
      });
    } catch (error) {
      logger.error('Error creando sesión de Stripe:', error);
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      res.status(500).json({ success: false, error: errorMessage });
    }
  }

  // Webhook de Stripe para confirmar pagos
  static async stripeWebhook(req: Request, res: Response): Promise<void> {
    const sig = req.headers['stripe-signature'] as string;
    const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET || '';

    let event: Stripe.Event;

    try {
      event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
    } catch (error) {
      logger.error('Error verificando webhook de Stripe:', error);
      res.status(400).send(`Webhook Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
      return;
    }

    try {
      switch (event.type) {
        case 'checkout.session.completed':
          const session = event.data.object as Stripe.Checkout.Session;
          await PaymentController.handleSuccessfulPayment(session);
          break;
        
        case 'payment_intent.payment_failed':
          const paymentIntent = event.data.object as Stripe.PaymentIntent;
          logger.error('Pago fallido:', paymentIntent.id);
          break;

        default:
          logger.info(`Evento no manejado: ${event.type}`);
      }

      res.json({ received: true });
    } catch (error) {
      logger.error('Error procesando webhook:', error);
      res.status(500).json({ error: 'Error procesando webhook' });
    }
  }

  // Procesar pago exitoso
  private static async handleSuccessfulPayment(session: Stripe.Checkout.Session): Promise<void> {
    const { userId, lotteryId, quantity } = session.metadata!;
    
    try {
      // Crear tickets en la base de datos
      for (let i = 0; i < parseInt(quantity); i++) {
        await LotteryService.buyTicket(userId, lotteryId, 'stripe', {
          stripeSessionId: session.id,
          stripePaymentIntentId: session.payment_intent as string,
          amount: session.amount_total! / 100,
        });
      }

      logger.info(`Tickets creados exitosamente para usuario ${userId}, sesión ${session.id}`);
    } catch (error) {
      logger.error('Error creando tickets después del pago:', error);
    }
  }

  // Crear orden de PayPal
  static async createPayPalOrder(req: Request, res: Response): Promise<void> {
    try {
      const { lotteryId, quantity = 1 } = req.body;
      const userId = (req as any).user.id;

      // Obtener información de la lotería
      const lottery = await LotteryService.getLotteryById(lotteryId);
      if (!lottery) {
        res.status(404).json({ success: false, error: 'Lotería no encontrada' });
        return;
      }

      // Verificar disponibilidad
      if (lottery.ticketsSold + quantity > lottery.maxTickets) {
        res.status(400).json({ success: false, error: 'No hay suficientes tickets disponibles' });
        return;
      }

      const totalAmount = (lottery.ticketPrice * quantity).toFixed(2);

      // Crear orden en PayPal
      const order = await PaymentController.createPayPalOrderRequest({
        intent: 'CAPTURE',
        purchase_units: [
          {
            amount: {
              currency_code: 'USD',
              value: totalAmount,
            },
            description: `CryptoLotto Tickets - Round #${lottery.round} (${quantity} tickets)`,
            custom_id: `${userId}_${lotteryId}_${quantity}`,
          },
        ],
        application_context: {
          return_url: `${process.env.FRONTEND_URL}/success`,
          cancel_url: `${process.env.FRONTEND_URL}/lottery`,
          brand_name: 'CryptoLotto',
          user_action: 'PAY_NOW',
        },
      }) as PayPalOrder;

      res.json({ 
        success: true, 
        data: { 
          orderId: order.id,
          approvalUrl: order.links?.find(link => link.rel === 'approve')?.href 
        } 
      });
    } catch (error) {
      logger.error('Error creando orden de PayPal:', error);
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      res.status(500).json({ success: false, error: errorMessage });
    }
  }

  // Capturar pago de PayPal
  static async capturePayPalOrder(req: Request, res: Response): Promise<void> {
    try {
      const { orderId } = req.body;

      const capture = await PaymentController.capturePayPalOrderRequest(orderId) as PayPalCapture;
      
      if (capture.status === 'COMPLETED') {
        // Extraer información del custom_id
        const customId = capture.purchase_units[0].payments.captures[0].custom_id;
        const [userId, lotteryId, quantity] = customId.split('_');

        // Crear tickets en la base de datos
        for (let i = 0; i < parseInt(quantity); i++) {
          await LotteryService.buyTicket(userId, lotteryId, 'paypal', {
            paypalOrderId: orderId,
            paypalCaptureId: capture.purchase_units[0].payments.captures[0].id,
            amount: parseFloat(capture.purchase_units[0].payments.captures[0].amount.value),
          });
        }

        res.json({ success: true, data: capture });
      } else {
        res.status(400).json({ success: false, error: 'Pago no completado' });
      }
    } catch (error) {
      logger.error('Error capturando orden de PayPal:', error);
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      res.status(500).json({ success: false, error: errorMessage });
    }
  }

  // Simular pago con criptomonedas
  static async cryptoPayment(req: Request, res: Response): Promise<void> {
    try {
      const { lotteryId, quantity = 1, transactionSignature } = req.body;
      const userId = (req as any).user.id;

      // Obtener información de la lotería
      const lottery = await LotteryService.getLotteryById(lotteryId);
      if (!lottery) {
        res.status(404).json({ success: false, error: 'Lotería no encontrada' });
        return;
      }

      // Verificar disponibilidad
      if (lottery.ticketsSold + quantity > lottery.maxTickets) {
        res.status(400).json({ success: false, error: 'No hay suficientes tickets disponibles' });
        return;
      }

      // Simular verificación de transacción en blockchain
      if (!transactionSignature || transactionSignature.length < 10) {
        res.status(400).json({ success: false, error: 'Firma de transacción inválida' });
        return;
      }

      // Crear tickets en la base de datos
      const tickets = [];
      for (let i = 0; i < quantity; i++) {
        const ticket = await LotteryService.buyTicket(userId, lotteryId, 'crypto', {
          transactionSignature,
          amount: lottery.ticketPrice,
          blockchain: 'solana',
        });
        tickets.push(ticket);
      }

      res.json({ success: true, data: tickets });
    } catch (error) {
      logger.error('Error procesando pago crypto:', error);
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      res.status(500).json({ success: false, error: errorMessage });
    }
  }

  // Alias para compatibilidad con rutas
  static processCryptoPayment = PaymentController.cryptoPayment;

  // Obtener historial de pagos
  static async getPaymentHistory(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user.id;

      const { data: tickets, error } = await supabase
        .from('tickets')
        .select(`
          id,
          price,
          payment_method,
          purchase_time,
          transaction_hash,
          lotteries (round, status)
        `)
        .eq('user_id', userId)
        .order('purchase_time', { ascending: false });

      if (error) throw error;

      res.json({ success: true, data: tickets });
    } catch (error) {
      logger.error('Error obteniendo historial de pagos:', error);
      res.status(500).json({ success: false, error: 'Error interno del servidor' });
    }
  }

  // Métodos auxiliares para PayPal
  private static async createPayPalOrderRequest(orderData: any): Promise<unknown> {
    const accessToken = await PaymentController.getPayPalAccessToken();
    
    const response = await fetch(`${process.env.PAYPAL_BASE_URL}/v2/checkout/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
      },
      body: JSON.stringify(orderData),
    });

    if (!response.ok) {
      throw new Error(`PayPal API error: ${response.statusText}`);
    }

    return await response.json();
  }

  private static async capturePayPalOrderRequest(orderId: string): Promise<unknown> {
    const accessToken = await PaymentController.getPayPalAccessToken();
    
    const response = await fetch(`${process.env.PAYPAL_BASE_URL}/v2/checkout/orders/${orderId}/capture`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      throw new Error(`PayPal API error: ${response.statusText}`);
    }

    return await response.json();
  }

  private static async getPayPalAccessToken(): Promise<string> {
    const auth = Buffer.from(`${process.env.PAYPAL_CLIENT_ID}:${process.env.PAYPAL_CLIENT_SECRET}`).toString('base64');
    
    const response = await fetch(`${process.env.PAYPAL_BASE_URL}/v1/oauth2/token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Basic ${auth}`,
      },
      body: 'grant_type=client_credentials',
    });

    if (!response.ok) {
      throw new Error(`PayPal auth error: ${response.statusText}`);
    }

    const data = await response.json() as PayPalTokenResponse;
    return data.access_token;
  }
}