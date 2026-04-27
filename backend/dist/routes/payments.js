import { Router } from 'express';
import { z } from 'zod';
import express from 'express';
import { prisma } from '../db.js';
import { env } from '../env.js';
import { authRequired } from '../middleware/auth.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { grantCredits } from '../services/credits.js';
import { requireStripe, stripe } from '../services/stripe.js';
import { verifySolPayment } from '../services/solana.js';
import { LAMPORTS_PER_SOL } from '@solana/web3.js';
export const paymentsRouter = Router();
const packs = { starter: { name: 'Starter Credit Pack', amountCents: 990, credits: 100 }, pro: { name: 'Pro Credit Pack', amountCents: 2900, credits: 500 }, enterprise: { name: 'Enterprise Credit Pack', amountCents: 9900, credits: 2500 } };
paymentsRouter.post('/stripe/checkout', authRequired, asyncHandler(async (req, res) => { const { pack } = z.object({ pack: z.enum(['starter', 'pro', 'enterprise']) }).parse(req.body); const p = packs[pack]; const s = requireStripe(); const payment = await prisma.payment.create({ data: { userId: req.user.id, provider: 'STRIPE', status: 'PENDING', amountCents: p.amountCents, currency: 'usd', credits: p.credits, description: p.name } }); const session = await s.checkout.sessions.create({ mode: 'payment', success_url: env.stripeSuccessUrl, cancel_url: env.stripeCancelUrl, client_reference_id: payment.id, customer_email: req.user.email, line_items: [{ quantity: 1, price_data: { currency: 'usd', unit_amount: p.amountCents, product_data: { name: p.name } } }], metadata: { paymentId: payment.id, credits: String(p.credits), userId: req.user.id } }); await prisma.payment.update({ where: { id: payment.id }, data: { externalId: session.id } }); res.json({ url: session.url, paymentId: payment.id }); }));
paymentsRouter.post('/solana/verify', authRequired, asyncHandler(async (req, res) => { const data = z.object({ signature: z.string().min(20), sol: z.number().positive(), credits: z.number().int().positive() }).parse(req.body); const verified = await verifySolPayment(data.signature, Math.round(data.sol * LAMPORTS_PER_SOL)); const payment = await prisma.payment.create({ data: { userId: req.user.id, provider: 'SOLANA', status: 'PAID', amountCents: 0, currency: 'SOL', credits: data.credits, solanaSignature: data.signature, solanaReceiver: verified.receiver, raw: verified } }); await grantCredits(req.user.id, data.credits); res.json({ ok: true, paymentId: payment.id, credits: data.credits, verified }); }));
paymentsRouter.post('/stripe/webhook', express.raw({ type: 'application/json' }), asyncHandler(async (req, res) => { if (!stripe || !env.stripeWebhookSecret)
    return res.status(503).send('Stripe not configured'); const sig = req.headers['stripe-signature']; const event = stripe.webhooks.constructEvent(req.body, sig, env.stripeWebhookSecret); if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    const paymentId = session.metadata?.paymentId || session.client_reference_id;
    if (paymentId) {
        const payment = await prisma.payment.update({ where: { id: paymentId }, data: { status: 'PAID', raw: session } });
        if (payment.userId && payment.credits > 0)
            await grantCredits(payment.userId, payment.credits);
    }
} res.json({ received: true }); }));
