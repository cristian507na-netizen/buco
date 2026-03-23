import Stripe from 'stripe';

let _stripe: Stripe | null = null;

function getInstance(): Stripe | null {
  if (!process.env.STRIPE_SECRET_KEY) {
    if (process.env.NODE_ENV === 'production') {
      console.warn('STRIPE_SECRET_KEY is missing in production. Payments will fail.');
    }
    return null;
  }
  
  if (!_stripe) {
    _stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: '2024-12-18.acacia' as any,
      typescript: true,
    });
  }
  return _stripe;
}

// Lazy proxy — Stripe is only instantiated on first use (runtime), not at build time
export const stripe = new Proxy({} as Stripe, {
  get(_target, prop) {
    const instance = getInstance();
    if (!instance) {
      return () => { throw new Error(`Stripe operation failed: secret key is missing for prop: ${String(prop)}`) };
    }
    return (instance as any)[prop];
  },
});
