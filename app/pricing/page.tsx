'use client';

import Link from 'next/link';
import { useState } from 'react';

export default function PricingPage() {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');

  const plans = [
    {
      name: 'Free',
      price: 0,
      description: 'Perfect for trying out HarshAI',
      features: [
        '✅ 3 Active Workflows',
        '✅ 5 Integrations',
        '✅ Test Mode Access',
        '✅ Community Support',
        '❌ No API Access',
        '❌ No Team Features',
      ],
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
        '✅ Unlimited Workflows',
        '✅ All 52+ Integrations',
        '✅ Test Mode + Live Mode',
        '✅ Priority Support',
        '✅ API Access',
        '❌ No Team Features',
      ],
      cta: 'Start 14-Day Free Trial',
      href: billingCycle === 'monthly' 
        ? 'https://buy.paddle.com/checkout/pro_01knpm8mzc37nzxz2tvy83pt7a' 
        : 'https://buy.paddle.com/checkout/pro_01knpmcpe5jw8r288bmrw71nk6',
      popular: true,
    },
    {
      name: 'Enterprise',
      price: billingCycle === 'monthly' ? 99 : 990,
      period: billingCycle === 'monthly' ? '/month' : '/year',
      description: 'For teams & agencies',
      features: [
        '✅ Everything in Pro',
        '✅ Team Collaboration',
        '✅ Custom Integrations',
        '✅ Dedicated Support',
        '✅ SLA Guarantee',
        '✅ White Label Option',
      ],
      cta: 'Start Enterprise Trial',
      href: 'https://buy.paddle.com/checkout/pro_01knpnxnm8ky1md7xhd71m2qkw',
      popular: false,
    },
  ];

  return (
    <div className="min-h-screen bg-[#0a0a0f]">
      {/* Background Orbs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-indigo-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000" />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-72 h-72 bg-pink-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000" />
      </div>

      {/* Navigation */}
      <nav className="relative z-50 px-6 py-4 backdrop-blur-xl bg-black/80 border-b border-white/10">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <Link href="/" className="flex items-center gap-2">
            <img src="/harshai-logo.png" alt="HarshAI" className="w-12 h-12" />
            <span className="text-3xl font-black bg-gradient-to-r from-purple-400 via-pink-500 to-cyan-400 bg-clip-text text-transparent">
              HarshAI
            </span>
          </Link>
          <div className="hidden md:flex gap-6">
            <Link href="/" className="text-gray-300 hover:text-white transition-colors">Home</Link>
            <Link href="/about" className="text-gray-300 hover:text-white transition-colors">About</Link>
            <Link href="/pricing" className="text-white font-semibold">Pricing</Link>
            <Link href="/contact" className="text-gray-300 hover:text-white transition-colors">Contact</Link>
          </div>
        </div>
      </nav>

      {/* Content */}
      <section className="relative z-10 min-h-screen flex items-center px-6 pt-20">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-5xl md:text-7xl font-black mb-6 bg-gradient-to-r from-purple-400 via-pink-500 to-cyan-400 bg-clip-text text-transparent">
            Simple, Transparent Pricing
          </h1>
          <p className="text-xl md:text-2xl text-gray-300 mb-12">
            Start free, upgrade when you need more power
          </p>

          {/* Billing Toggle */}
          <div className="flex items-center justify-center gap-4 mb-16">
            <span className={`text-lg ${billingCycle === 'monthly' ? 'text-white' : 'text-gray-400'}`}>
              Monthly
            </span>
            <button
              onClick={() => setBillingCycle(billingCycle === 'monthly' ? 'yearly' : 'monthly')}
              className="w-16 h-8 bg-purple-600 rounded-full relative transition-colors"
            >
              <div
                className={`absolute top-1 w-6 h-6 bg-white rounded-full transition-transform ${
                  billingCycle === 'yearly' ? 'translate-x-9' : 'translate-x-1'
                }`}
              />
            </button>
            <span className={`text-lg ${billingCycle === 'yearly' ? 'text-white' : 'text-gray-400'}`}>
              Yearly <span className="text-green-400 text-sm">(Save 17%)</span>
            </span>
          </div>

          {/* Pricing Cards */}
          <div className="grid md:grid-cols-3 gap-8 mb-16">
            {plans.map((plan) => (
              <div
                key={plan.name}
                className={`relative rounded-3xl p-8 border ${
                  plan.popular
                    ? 'bg-purple-900/20 border-purple-500/50 scale-105'
                    : 'bg-white/5 border-white/10'
                } backdrop-blur-xl transition-all hover:border-purple-500/30`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <span className="bg-gradient-to-r from-purple-500 to-cyan-500 px-4 py-1 rounded-full text-sm font-bold">
                      Most Popular
                    </span>
                  </div>
                )}

                <h3 className="text-3xl font-black text-white mb-2">{plan.name}</h3>
                <p className="text-gray-400 mb-6">{plan.description}</p>

                <div className="mb-8">
                  <span className="text-5xl font-black bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">
                    ${plan.price}
                  </span>
                  {plan.period && (
                    <span className="text-gray-400 text-lg">{plan.period}</span>
                  )}
                </div>

                <ul className="space-y-4 mb-8 text-left">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="text-gray-300">
                      {feature}
                    </li>
                  ))}
                </ul>

                <Link
                  href={plan.href}
                  className={`block w-full py-4 rounded-full font-bold text-lg transition-all ${
                    plan.popular
                      ? 'bg-gradient-to-r from-purple-600 to-cyan-500 text-white hover:scale-105'
                      : 'bg-white/10 text-white hover:bg-white/20'
                  }`}
                >
                  {plan.cta}
                </Link>
              </div>
            ))}
          </div>

          {/* FAQ Section */}
          <div className="text-left max-w-4xl mx-auto">
            <h2 className="text-4xl font-black mb-8 bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent text-center">
              Frequently Asked Questions
            </h2>

            <div className="space-y-6">
              <div className="bg-white/5 rounded-2xl p-6 border border-white/10">
                <h3 className="text-xl font-bold text-white mb-2">
                  Can I test before buying?
                </h3>
                <p className="text-gray-400">
                  Yes! All 52+ integrations have Test Mode - you can build and test workflows without any API keys or payment.
                  Plus, all paid plans include a **14-day free trial** - no credit card required to start!
                </p>
              </div>

              <div className="bg-white/5 rounded-2xl p-6 border border-white/10">
                <h3 className="text-xl font-bold text-white mb-2">
                  What payment methods do you accept?
                </h3>
                <p className="text-gray-400">
                  We accept all major credit cards, PayPal, and more via our secure payment processor Paddle.
                </p>
              </div>

              <div className="bg-white/5 rounded-2xl p-6 border border-white/10">
                <h3 className="text-xl font-bold text-white mb-2">
                  Can I cancel anytime?
                </h3>
                <p className="text-gray-400">
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
