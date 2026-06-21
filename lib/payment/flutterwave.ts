// Flutterwave Payment Utilities

export interface PaymentConfig {
  amount: number;
  email: string;
  name: string;
  phone?: string;
  tx_ref?: string;
  redirect_url?: string;
  meta?: Record<string, any>;
}

export interface PaymentResponse {
  success: boolean;
  link?: string;
  tx_ref?: string;
  error?: string;
}

export async function initializePayment(config: PaymentConfig): Promise<PaymentResponse> {
  try {
    const response = await fetch('/api/payment', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(config),
    });

    const data = await response.json();
    return data;
  } catch (error: any) {
    return {
      success: false,
      error: error.message || 'Payment initialization failed',
    };
  }
}

export function generateTxRef(prefix: string = 'bw'): string {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

// Subscription pricing
export const SUBSCRIPTION_PRICES: Record<string, { monthly: number; annual: number }> = {
  blue_plus: { monthly: 4.99, annual: 47.90 },
  creator_pro: { monthly: 12.99, annual: 124.60 },
  business: { monthly: 29.99, annual: 287.90 },
};

// BlueStars packages
export const BLUESTARS_PACKAGES = [
  { stars: 200, price: 1.99, bonus: 0 },
  { stars: 600, price: 4.99, bonus: 20 },
  { stars: 1500, price: 9.99, bonus: 100 },
  { stars: 3500, price: 19.99, bonus: 300 },
  { stars: 8000, price: 39.99, bonus: 800 },
];
