import { Request, Response } from 'express';
import Stripe from 'stripe';
import { logger } from '../utils/logger';
import { LotteryService } from '../services/LotteryService';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2024-06-20',
});

export class PaymentController {
  // Crear sesión de pago con Stripe
  static async createStripeSession(req: Request, res: Response) {
    try {
      const { lotteryId, quantity = 1 } = req.body;
      const userId = (req as any).user.id;

      // Obtener información de la lotería
      const lottery = await LotteryService.getLotteryById(lotteryId);
      if (!lottery) {
        return res.status(404).json({ success: false, error: 'Lotería no encontrada' });
      }

      // Verificar disponibilidad
      if (lottery.ticketsSold + quantity > lottery.maxTickets) {
        return res.status(400).json({ success: false, error: 'No hay suficientes tickets disponibles' });
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
                images: ['https://your-domain.com/lottery-ticket.png'], // Añadir imagen del ticket
              },
              unit_amount: Math.round(lottery.ticketPrice * 100), // Stripe usa centavos
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
  static async stripeWebhook(req: Request, res: Response) {
    const sig = req.headers['stripe-signature'] as string;
    const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET || '';

    let event: Stripe.Event;

    try {
      event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
    } catch (error) {
      logger.error('Error verificando webhook de Stripe:', error);
      return res.status(400).send(`Webhook Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
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
  private static async handleSuccessfulPayment(session: Stripe.Checkout.Session) {
    const { userId, lotteryId, quantity } = session.metadata!;
    
    try {
      // Crear tickets en la base de datos
      for (let i = 0; i < parseInt(quantity); i++) {
        await LotteryService.buyTicket(userId, lotteryId, 'stripe', {
          stripeSessionId: session.id,
          stripePaymentIntentId: session.payment_intent as string,
          amount: session.amount_total! / 100, // Convertir de centavos a dólares
        });
      }

      logger.info(`Tickets creados exitosamente para usuario ${userId}, sesión ${session.id}`);
    } catch (error) {
      logger.error('Error creando tickets después del pago:', error);
      // Aquí podrías implementar lógica de reembolso automático
    }
  }

  // Crear orden de PayPal
  static async createPayPalOrder(req: Request, res: Response) {
    try {
      const { lotteryId, quantity = 1 } = req.body;
      const userId = (req as any).user.id;

      // Obtener información de la lotería
      const lottery = await LotteryService.getLotteryById(lotteryId);
      if (!lottery) {
        return res.status(404).json({ success: false, error: 'Lotería no encontrada' });
      }

      // Verificar disponibilidad
      if (lottery.ticketsSold + quantity > lottery.maxTickets) {
        return res.status(400).json({ success: false, error: 'No hay suficientes tickets disponibles' });
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
      });

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
  static async capturePayPalOrder(req: Request, res: Response) {
    try {
      const { orderId } = req.body;

      const capture = await PaymentController.capturePayPalOrderRequest(orderId);
      
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

  // Funciones auxiliares para PayPal API
  private static async getPayPalAccessToken(): Promise<string> {
    const auth = Buffer.from(
      `${process.env.PAYPAL_CLIENT_ID}:${process.env.PAYPAL_CLIENT_SECRET}`
    ).toString('base64');

    const response = await fetch(`${process.env.PAYPAL_BASE_URL}/v1/oauth2/token`, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: 'grant_type=client_credentials',
    });

    const data = await response.json();
    return data.access_token;
  }

  private static async createPayPalOrderRequest(orderData: any) {
    const accessToken = await PaymentController.getPayPalAccessToken();

    const response = await fetch(`${process.env.PAYPAL_BASE_URL}/v2/checkout/orders`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(orderData),
    });

    return await response.json();
  }

  private static async capturePayPalOrderRequest(orderId: string) {
    const accessToken = await PaymentController.getPayPalAccessToken();

    const response = await fetch(`${process.env.PAYPAL_BASE_URL}/v2/checkout/orders/${orderId}/capture`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    });

    return await response.json();
  }

  // Procesar pago con criptomonedas (Solana)
  static async processCryptoPayment(req: Request, res: Response) {
    try {
      const { lotteryId, signature, quantity = 1 } = req.body;
      const userId = (req as any).user.id;

      // Aquí implementarías la verificación de la transacción en Solana
      // Por ahora, simularemos que la transacción es válida
      
      const lottery = await LotteryService.getLotteryById(lotteryId);
      if (!lottery) {
        return res.status(404).json({ success: false, error: 'Lotería no encontrada' });
      }

      // Crear tickets
      for (let i = 0; i < quantity; i++) {
        await LotteryService.buyTicket(userId, lotteryId, 'crypto', {
          transactionSignature: signature,
          amount: lottery.ticketPrice,
        });
      }

      res.json({ success: true, message: 'Pago procesado exitosamente' });
    } catch (error) {
      logger.error('Error procesando pago crypto:', error);
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      res.status(500).json({ success: false, error: errorMessage });
    }
  }

  // Obtener historial de pagos
  static async getPaymentHistory(req: Request, res: Response) {
    try {
      const userId = (req as any).user.id;
      
      // Implementar lógica para obtener historial de pagos
      // Por ahora retornamos un array vacío
      
      res.json({ success: true, data: [] });
    } catch (error) {
      logger.error('Error obteniendo historial de pagos:', error);
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      res.status(500).json({ success: false, error: errorMessage });
    }
  }
}