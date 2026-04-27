import Stripe from 'stripe';
import { env } from '../env.js';
import { HttpError } from '../utils/http.js';
export const stripe = env.stripeSecretKey ? new Stripe(env.stripeSecretKey, { apiVersion: '2024-12-18.acacia' }) : null;
export function requireStripe() { if (!stripe)
    throw new HttpError(503, 'STRIPE_SECRET_KEY is not configured'); return stripe; }
