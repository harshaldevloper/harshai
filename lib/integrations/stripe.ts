/**
 * Stripe Integration
 * Process payments, create charges, customers
 */

const STRIPE_API_URL = 'https://api.stripe.com/v1';

export interface StripeConfig {
  secretKey: string;
}

export interface StripeCharge {
  amount: number;
  currency: string;
  source: string;
  description?: string;
}

export interface StripeResponse {
  success: boolean;
  chargeId?: string;
  customerId?: string;
  error?: string;
}

export async function createCharge(charge: StripeCharge, config: StripeConfig): Promise<StripeResponse> {
  try {
    const response = await fetch(`${STRIPE_API_URL}/charges`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${config.secretKey}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        amount: charge.amount.toString(),
        currency: charge.currency,
        source: charge.source,
        description: charge.description || '',
      }),
    });

    const result = await response.json();
    if (!response.ok) {
      return { success: false, error: result.error?.message || 'Stripe error' };
    }
    return { success: true, chargeId: result.id };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function testStripeConnection(secretKey: string): Promise<{ success: boolean; message?: string; error?: string }> {
  try {
    const response = await fetch(`${STRIPE_API_URL}/account`, {
      headers: { 'Authorization': `Bearer ${secretKey}` },
    });
    if (!response.ok) return { success: false, error: 'Connection failed' };
    const account = await response.json();
    return { success: true, message: `Connected: ${account.email || account.id}` };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
