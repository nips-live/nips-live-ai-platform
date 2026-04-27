import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import bcrypt from 'bcryptjs';
import { env } from './env.js';
import { prisma } from './db.js';
import { HttpError } from './utils/http.js';
import { authRouter } from './routes/auth.js';
import { configRouter } from './routes/config.js';
import { aiRouter } from './routes/ai.js';
import { paymentsRouter } from './routes/payments.js';
import { adminRouter } from './routes/admin.js';
async function bootstrapAdmin() { if (!env.adminPassword)
    return; const existing = await prisma.user.findUnique({ where: { email: env.adminEmail.toLowerCase() } }); if (!existing)
    await prisma.user.create({ data: { email: env.adminEmail.toLowerCase(), name: 'NIPS Admin', role: 'ADMIN', credits: 100000, passwordHash: await bcrypt.hash(env.adminPassword, 12) } }); }
const app = express();
app.set('trust proxy', 1);
app.use(helmet({ crossOriginResourcePolicy: false }));
app.use(cors({ origin: (origin, cb) => !origin || env.corsOrigins.includes(origin) ? cb(null, true) : cb(new Error('CORS blocked')), credentials: true }));
app.use(compression());
app.use(morgan('combined'));
app.use(rateLimit({ windowMs: 60000, limit: 300 }));
app.use('/payments/stripe/webhook', paymentsRouter);
app.use(express.json({ limit: '25mb' }));
app.get('/health', (_req, res) => res.json({ ok: true, service: 'nips-live-backend-pro', time: new Date().toISOString() }));
app.use('/auth', authRouter);
app.use('/api/v1', configRouter);
app.use('/api/v1', aiRouter);
app.use('/payments', paymentsRouter);
app.use('/admin', adminRouter);
app.use('/', aiRouter);
app.use((_req, res) => res.status(404).json({ error: 'NIPS backend route not found' }));
app.use((err, _req, res, _next) => { const status = err instanceof HttpError ? err.status : err?.status || 500; const message = err?.issues ? 'Validation error' : err?.message || 'Internal server error'; res.status(status).json({ error: message, details: err?.issues }); });
bootstrapAdmin().then(() => app.listen(env.port, '0.0.0.0', () => console.log(`NIPS backend listening on ${env.port}`)));
