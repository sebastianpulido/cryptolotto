const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export interface PaymentData {
  lotteryId: string;
  quantity: number;
}

export class PaymentService {
  // Stripe payment
  static async createStripeSession(data: PaymentData): Promise<{ sessionId: string; url: string }> {
    const response = await fetch(`${API_BASE_URL}/api/payment/stripe/create-session`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
      body: JSON.stringify(data),
    });

    const result = await response.json();
    if (!result.success) {
      throw new Error(result.error || 'Error creando sesión de pago');
    }

    return result.data;
  }

  // PayPal payment
  static async createPayPalOrder(data: PaymentData): Promise<{ orderId: string; approvalUrl: string }> {
    const response = await fetch(`${API_BASE_URL}/api/payment/paypal/create-order`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
      body: JSON.stringify(data),
    });

    const result = await response.json();
    if (!result.success) {
      throw new Error(result.error || 'Error creando orden de PayPal');
    }

    return result.data;
  }

  static async capturePayPalOrder(orderId: string): Promise<any> {
    const response = await fetch(`${API_BASE_URL}/api/payment/paypal/capture-order`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
      body: JSON.stringify({ orderId }),
    });

    const result = await response.json();
    if (!result.success) {
      throw new Error(result.error || 'Error capturando pago de PayPal');
    }

    return result.data;
  }

  // Crypto payment
  static async processCryptoPayment(data: PaymentData & { signature: string }): Promise<any> {
    const response = await fetch(`${API_BASE_URL}/api/payment/crypto`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
      body: JSON.stringify(data),
    });

    const result = await response.json();
    if (!result.success) {
      throw new Error(result.error || 'Error procesando pago crypto');
    }

    return result.data;
  }
}