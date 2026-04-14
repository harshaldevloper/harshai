'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';

declare global {
  interface Window {
    Paddle?: {
      Initialize: (config: { token: string; eventListener?: (event: any) => void }) => void;
      Checkout: {
        open: (config: { items: Array<{ priceId: string; quantity?: number }>; customer?: { email?: string } }) => void;
      };
    };
  }
}

export default function PricingPage() {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');
  const [paddleLoaded, setPaddleLoaded] = useState(false);

  useEffect(() => {
    // Load Paddle script
    const script = document.createElement('script');
    script.src = 'https://cdn.paddle.com/paddle/v2/paddle.js';
    script.async = true;
    script.onload = () => {
      if (window.Paddle && process.env.NEXT_PUBLIC_PADDLE_CLIENT_TOKEN) {
        window.Paddle.Initialize({
          token: process.env.NEXT_PUBLIC_PADDLE_CLIENT_TOKEN,
          eventListener: (event) => {
            console.log('Paddle event:', event);
          }
        });
        setPaddleLoaded(true);
      }
    };
    document.head.appendChild(script);

    return () => {
      document.head.removeChild(script);
    };
  }, []);

  const handleCheckout = (priceId: string) => {
    if (window.Paddle) {
      window.Paddle.Checkout.open({
        items: [{ priceId, quantity: 1 }]
      });
    }
  };

  const plans = [
    {
      name: 'Free',
      price: 0,
      description: 'Perfect for trying out HarshAI',
      features: [
        '3 Active Workflows',
        '5 Integrations',
        'Test Mode Access',
        'Community Support',
      ],
      priceId: null,
      cta: 'Get Started Free',
      href: '/sign-up',
      popular: false,
    },
    {
      name: 'Pro',
      price: billingCycle === 'monthly' ? 29 : 290,
      period: billingCycle === 'monthly' ? '/month' : '/year',
      description: 'For creators & entrepreneurs',
      features: [
        'Unlimited Workflows',
        'All 52+ Integrations',
        'Test Mode + Live Mode',
        'Priority Support',
        'API Access',
      ],
      priceId: billingCycle === 'monthly'
        ? 'pri_01knpmbn7tbd3ebm1k2pyphm1c'
        : 'pri_01knpjnpp3rr9bk9w9ek5yy8p',
      cta: 'Start 14-Day Free Trial',
      href: '#',
      popular: true,
    },
    {
      name: 'Enterprise',
      price: billingCycle === 'monthly' ? 99 : 990,
      period: billingCycle === 'monthly' ? '/month' : '/year',
      description: 'For teams & agencies',
      features: [
        'Everything in Pro',
        'Team Collaboration',
        'Custom Integrations',
        'Dedicated Support',
        'SLA Guarantee',
        'White Label Option',
      ],
      priceId: billingCycle === 'monthly'
        ? 'pri_01knpnynr1cmfrm5pmvbca3kgk'
        : 'pri_01knpnynr1cmfrm5pmvbca3kgk',
      cta: 'Start Enterprise Trial',
      href: '#',
      popular: false,
    },
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 backdrop-blur-xl bg-white/80 border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <Link href="/" className="flex items-center gap-2">
            <img src="/harshai-logo.png" alt="HarshAI" className="w-10 h-10" />
            <span className="text-xl font-medium text-gray-900">HarshAI</span>
          </Link>
          <div className="hidden md:flex gap-6">
            <Link href="/" className="text-gray-600 hover:text-gray-900 transition-colors">Home</Link>
            <Link href="/about" className="text-gray-600 hover:text-gray-900 transition-colors">About</Link>
            <Link href="/pricing" className="text-gray-900 font-medium">Pricing</Link>
            <Link href="/contact" className="text-gray-600 hover:text-gray-900 transition-colors">Contact</Link>
          </div>
          <Link href="/sign-up" className="bg-gray-900 hover:bg-gray-800 text-white px-4 py-2 rounded-lg transition-all">
            Get Started
          </Link>
        </div>
      </nav>

      {/* Content */}
      <section className="px-6 py-20">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-medium text-gray-900 mb-6">
            Simple, transparent pricing
          </h1>
          <p className="text-xl text-gray-600 mb-12">
            Start free, upgrade when you need more power
          </p>

          {/* Billing Toggle */}
          <div className="flex items-center justify-center gap-4 mb-16">
            <span className={`text-sm ${billingCycle === 'monthly' ? 'text-gray-900 font-medium' : 'text-gray-600'}`}>
              Monthly
            </span>
            <button
              onClick={() => setBillingCycle(billingCycle === 'monthly' ? 'yearly' : 'monthly')}
              className="w-14 h-8 bg-gray-200 rounded-full relative transition-colors"
            >
              <div
                className={`absolute top-1 w-6 h-6 bg-white rounded-full shadow transition-transform ${
                  billingCycle === 'yearly' ? 'translate-x-7' : 'translate-x-1'
                }`}
              />
            </button>
            <span className={`text-sm ${billingCycle === 'yearly' ? 'text-gray-900 font-medium' : 'text-gray-600'}`}>
              Yearly <span className="text-green-600">(Save 17%)</span>
            </span>
          </div>

          {/* Pricing Cards */}
          <div className="grid md:grid-cols-3 gap-8 mb-16">
            {plans.map((plan) => (
              <div
                key={plan.name}
                className={`relative rounded-2xl p-8 border ${
                  plan.popular
                    ? 'border-blue-600 bg-white'
                    : 'border-gray-200 bg-gray-50'
                } transition-all`}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <span className="bg-blue-600 px-3 py-1 rounded-full text-xs font-medium text-white">
                      Most Popular
                    </span>
                  </div>
                )}

                <h3 className="text-2xl font-medium text-gray-900 mb-2">{plan.name}</h3>
                <p className="text-gray-600 mb-6">{plan.description}</p>

                <div className="mb-8">
                  <span className="text-4xl font-medium text-gray-900">
                    ${plan.price}
                  </span>
                  {plan.period && (
                    <span className="text-gray-600">{plan.period}</span>
                  )}
                </div>

                <ul className="space-y-3 mb-8 text-left">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="text-gray-700 flex items-start gap-2">
                      <svg className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      {feature}
                    </li>
                  ))}
                </ul>

                {plan.priceId && paddleLoaded ? (
                  <button
                    onClick={() => handleCheckout(plan.priceId!)}
                    className={`block w-full py-3.5 rounded-xl font-medium text-center transition-all ${
                      plan.popular
                        ? 'bg-blue-600 hover:bg-blue-700 text-white'
                        : 'bg-gray-900 hover:bg-gray-800 text-white'
                    }`}
                  >
                    {plan.cta}
                  </button>
                ) : (
                  <Link
                    href={plan.href}
                    className={`block w-full py-3.5 rounded-xl font-medium text-center transition-all ${
                      plan.popular
                        ? 'bg-blue-600 hover:bg-blue-700 text-white'
                        : 'bg-gray-900 hover:bg-gray-800 text-white'
                    }`}
                  >
                    {plan.cta}
                  </Link>
                )}
              </div>
            ))}
          </div>

          {/* FAQ Section */}
          <div className="text-left max-w-4xl mx-auto">
            <h2 className="text-2xl font-medium text-gray-900 mb-8 text-center">
              Frequently Asked Questions
            </h2>

            <div className="space-y-4">
              <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Can I test before buying?
                </h3>
                <p className="text-gray-600">
                  Yes! All 52+ integrations have Test Mode - you can build and test workflows without any API keys or payment.
                  Plus, all paid plans include a 14-day free trial - no credit card required to start!
                </p>
              </div>

              <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  What payment methods do you accept?
                </h3>
                <p className="text-gray-600">
                  We accept all major credit cards, PayPal, and more via our secure payment processor Paddle.
                </p>
              </div>

              <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Can I cancel anytime?
                </h3>
                <p className="text-gray-600">
                  Absolutely! Cancel your subscription anytime from your dashboard. No questions asked.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
