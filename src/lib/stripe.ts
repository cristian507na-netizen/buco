import Stripe from 'stripe';

let _stripe: Stripe | null = null;

function getInstance(): Stripe {
  if (!_stripe) {
    _stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
      apiVersion: '2024-12-18.acacia' as any,
      typescript: true,
    });
  }
  return _stripe;
}

// Lazy proxy — Stripe is only instantiated on first use (runtime), not at build time
export const stripe = new Proxy({} as Stripe, {
  get(_target, prop) {
    return (getInstance() as any)[prop];
  },
});
