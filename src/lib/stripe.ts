import Stripe from 'stripe';
import { z } from 'zod';

const EnvSchema = z.object({
  STRIPE_SECRET_KEY: z.string().min(1),
  STRIPE_PUBLISHABLE_KEY: z.string().min(1),
  STRIPE_WEBHOOK_SECRET: z.string().min(1).optional(),
});

export type StripeEnv = z.infer<typeof EnvSchema>;

export function validateStripeEnv(env: NodeJS.ProcessEnv = process.env): StripeEnv {
  return EnvSchema.parse(env);
}

let stripeInstance: Stripe | null = null;

export function getStripe(): Stripe {
  if (!stripeInstance) {
    const { STRIPE_SECRET_KEY } = validateStripeEnv();
    stripeInstance = new Stripe(STRIPE_SECRET_KEY, { apiVersion: '2023-10-16' });
  }
  return stripeInstance;
}
