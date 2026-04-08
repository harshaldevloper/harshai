/**
 * POST /api/paddle/create-products
 * Create Paddle products for HarshAI pricing tiers
 */

import { NextResponse } from 'next/server';

export async function POST() {
  try {
    const PADDLE_API_KEY = process.env.PADDLE_API_KEY;
    
    if (!PADDLE_API_KEY) {
      return NextResponse.json({
        error: 'PADDLE_API_KEY not configured',
        instructions: {
          step1: 'Add PADDLE_API_KEY to your .env.local file',
          step2: 'Get API key from: https://vendors.paddle.com/settings/api',
          step3: 'Restart your development server',
        },
      }, { status: 500 });
    }

    // Define HarshAI products
    const products = [
      {
        name: 'HarshAI Pro',
        description: 'Unlimited workflows, all 52+ integrations, API access',
        billing_cycle: 'month',
        currency_code: 'USD',
        unit_price: {
          amount: '2900', // $29.00 in cents
        },
      },
      {
        name: 'HarshAI Pro (Yearly)',
        description: 'Unlimited workflows, all 52+ integrations, API access - Yearly billing',
        billing_cycle: 'year',
        currency_code: 'USD',
        unit_price: {
          amount: '29000', // $290.00 in cents (save 17%)
        },
      },
      {
        name: 'HarshAI Enterprise',
        description: 'Team features, custom integrations, dedicated support',
        billing_cycle: 'month',
        currency_code: 'USD',
        unit_price: {
          amount: '9900', // $99.00 in cents
        },
      },
    ];

    // Create products via Paddle API
    const createdProducts = [];
    
    for (const product of products) {
      const response = await fetch('https://api.paddle.com/products', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${PADDLE_API_KEY}`,
          'Content-Type': 'application/json',
          'Paddle-Version': '1',
        },
        body: JSON.stringify({
          name: product.name,
          description: product.description,
          billing_cycle: product.billing_cycle,
          currency_code: product.currency_code,
          unit_price: product.unit_price,
          status: 'active',
        }),
      });

      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(`Paddle API error: ${JSON.stringify(result)}`);
      }

      createdProducts.push({
        id: result.data.id,
        name: result.data.name,
        price: result.data.unit_price.amount,
        checkoutUrl: result.data.url,
      });
    }

    return NextResponse.json({
      success: true,
      message: 'Products created successfully',
      products: createdProducts,
      nextSteps: {
        step1: 'Copy the product IDs to .env.local',
        step2: 'Update pricing page with checkout URLs',
        step3: 'Test checkout flow',
      },
    });

  } catch (error: any) {
    console.error('[Paddle] Error:', error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}
