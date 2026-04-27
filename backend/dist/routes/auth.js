import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { prisma } from '../db.js';
import { env } from '../env.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { signUser } from '../utils/token.js';
import { authRequired, requireRole } from '../middleware/auth.js';
import { createPlainToken, hashToken, minutesFromNow } from '../utils/authTokens.js';
import { sendActivationEmail, sendPasswordResetEmail } from '../services/email.js';
export const authRouter = Router();
const registerSchema = z.object({
    email: z.string().email(),
    password: z.string().min(8),
    name: z.string().min(1).max(80).optional()
});
const loginSchema = registerSchema.pick({ email: true, password: true });
const requestResetSchema = z.object({ email: z.string().email() });
const resetPasswordSchema = z.object({ token: z.string().min(20), password: z.string().min(8) });
const activateSchema = z.object({ token: z.string().min(20) });
const adminActivateSchema = z.object({ userId: z.string().optional(), email: z.string().email().optional() }).refine((v) => v.userId || v.email, {
    message: 'userId or email is required'
});
const publicUser = (user) => ({
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    status: user.status,
    credits: user.credits,
    avatarUrl: user.avatarUrl,
    emailVerifiedAt: user.emailVerifiedAt,
    lastLoginAt: user.lastLoginAt
});
const authPayload = (user) => ({
    token: signUser({ id: user.id, email: user.email, role: user.role }),
    user: publicUser(user)
});
function activationUrl(token) {
    return `${env.frontendUrl.replace(/\/$/, '')}/auth/activate?token=${encodeURIComponent(token)}`;
}
function resetUrl(token) {
    return `${env.frontendUrl.replace(/\/$/, '')}/auth/reset-password?token=${encodeURIComponent(token)}`;
}
authRouter.post('/register', asyncHandler(async (req, res) => {
    const data = registerSchema.parse(req.body);
    const email = data.email.toLowerCase();
    const exists = await prisma.user.findUnique({ where: { email } });
    if (exists)
        return res.status(409).json({ error: 'Email already registered' });
    const activationToken = createPlainToken();
    const requiresActivation = env.requireEmailActivation;
    const user = await prisma.user.create({
        data: {
            email,
            name: data.name,
            passwordHash: await bcrypt.hash(data.password, 12),
            credits: env.defaultFreeCredits,
            status: requiresActivation ? 'PENDING' : 'ACTIVE',
            emailVerifiedAt: requiresActivation ? null : new Date(),
            activationTokenHash: requiresActivation ? hashToken(activationToken) : null,
            activationTokenExpiresAt: requiresActivation ? minutesFromNow(env.activationTokenMinutes) : null
        }
    });
    if (requiresActivation) {
        const url = activationUrl(activationToken);
        const emailResult = await sendActivationEmail(email, url);
        return res.status(201).json({
            requiresActivation: true,
            emailSent: emailResult.sent,
            message: emailResult.sent
                ? 'Account created. Check your email to activate your account.'
                : 'Account created. Email is not configured, so use the activation URL returned here.',
            activationUrl: emailResult.sent ? undefined : url
        });
    }
    return res.status(201).json(authPayload(user));
}));
authRouter.post('/login', asyncHandler(async (req, res) => {
    const data = loginSchema.parse(req.body);
    const user = await prisma.user.findUnique({ where: { email: data.email.toLowerCase() } });
    if (!user || !(await bcrypt.compare(data.password, user.passwordHash))) {
        return res.status(401).json({ error: 'Invalid email or password' });
    }
    if (user.status === 'PENDING')
        return res.status(403).json({ error: 'Account not activated', code: 'ACCOUNT_PENDING' });
    if (user.status === 'SUSPENDED')
        return res.status(403).json({ error: 'Account suspended', code: 'ACCOUNT_SUSPENDED' });
    if (user.status === 'DISABLED')
        return res.status(403).json({ error: 'Account disabled', code: 'ACCOUNT_DISABLED' });
    const updated = await prisma.user.update({ where: { id: user.id }, data: { lastLoginAt: new Date() } });
    return res.json(authPayload(updated));
}));
authRouter.get('/me', authRequired, asyncHandler(async (req, res) => {
    const user = await prisma.user.findUnique({ where: { id: req.user.id } });
    return res.json({ user: user ? publicUser(user) : null });
}));
authRouter.post('/activate', asyncHandler(async (req, res) => {
    const data = activateSchema.parse(req.body);
    const tokenHash = hashToken(data.token);
    const user = await prisma.user.findFirst({ where: { activationTokenHash: tokenHash } });
    if (!user || !user.activationTokenExpiresAt || user.activationTokenExpiresAt < new Date()) {
        return res.status(400).json({ error: 'Activation link is invalid or expired' });
    }
    const updated = await prisma.user.update({
        where: { id: user.id },
        data: {
            status: 'ACTIVE',
            emailVerifiedAt: new Date(),
            activationTokenHash: null,
            activationTokenExpiresAt: null
        }
    });
    return res.json({ message: 'Account activated', ...authPayload(updated) });
}));
authRouter.get('/activate', asyncHandler(async (req, res) => {
    const token = req.query.token?.toString();
    if (!token)
        return res.status(400).json({ error: 'Activation token is required' });
    const tokenHash = hashToken(token);
    const user = await prisma.user.findFirst({ where: { activationTokenHash: tokenHash } });
    if (!user || !user.activationTokenExpiresAt || user.activationTokenExpiresAt < new Date()) {
        return res.status(400).json({ error: 'Activation link is invalid or expired' });
    }
    const updated = await prisma.user.update({
        where: { id: user.id },
        data: {
            status: 'ACTIVE',
            emailVerifiedAt: new Date(),
            activationTokenHash: null,
            activationTokenExpiresAt: null
        }
    });
    return res.json({ message: 'Account activated', ...authPayload(updated) });
}));
authRouter.post('/resend-activation', asyncHandler(async (req, res) => {
    const data = requestResetSchema.parse(req.body);
    const email = data.email.toLowerCase();
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || user.status !== 'PENDING') {
        return res.json({ message: 'If the account requires activation, a new activation email has been sent.' });
    }
    const token = createPlainToken();
    await prisma.user.update({
        where: { id: user.id },
        data: {
            activationTokenHash: hashToken(token),
            activationTokenExpiresAt: minutesFromNow(env.activationTokenMinutes)
        }
    });
    const url = activationUrl(token);
    const emailResult = await sendActivationEmail(email, url);
    return res.json({
        message: 'If the account requires activation, a new activation email has been sent.',
        emailSent: emailResult.sent,
        activationUrl: emailResult.sent ? undefined : url
    });
}));
authRouter.post('/request-password-reset', asyncHandler(async (req, res) => {
    const data = requestResetSchema.parse(req.body);
    const email = data.email.toLowerCase();
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user)
        return res.json({ message: 'If the account exists, a reset link has been sent.' });
    const token = createPlainToken();
    await prisma.user.update({
        where: { id: user.id },
        data: {
            resetPasswordTokenHash: hashToken(token),
            resetPasswordTokenExpiresAt: minutesFromNow(env.resetPasswordTokenMinutes)
        }
    });
    const url = resetUrl(token);
    const emailResult = await sendPasswordResetEmail(email, url);
    return res.json({
        message: 'If the account exists, a reset link has been sent.',
        emailSent: emailResult.sent,
        resetUrl: emailResult.sent ? undefined : url
    });
}));
authRouter.post('/reset-password', asyncHandler(async (req, res) => {
    const data = resetPasswordSchema.parse(req.body);
    const tokenHash = hashToken(data.token);
    const user = await prisma.user.findFirst({ where: { resetPasswordTokenHash: tokenHash } });
    if (!user || !user.resetPasswordTokenExpiresAt || user.resetPasswordTokenExpiresAt < new Date()) {
        return res.status(400).json({ error: 'Reset link is invalid or expired' });
    }
    await prisma.user.update({
        where: { id: user.id },
        data: {
            passwordHash: await bcrypt.hash(data.password, 12),
            resetPasswordTokenHash: null,
            resetPasswordTokenExpiresAt: null,
            status: user.status === 'PENDING' ? 'ACTIVE' : user.status,
            emailVerifiedAt: user.emailVerifiedAt || new Date()
        }
    });
    return res.json({ message: 'Password reset successful. You can now log in.' });
}));
authRouter.post('/admin/activate-user', authRequired, requireRole('ADMIN'), asyncHandler(async (req, res) => {
    const data = adminActivateSchema.parse(req.body);
    const where = data.userId ? { id: data.userId } : { email: data.email.toLowerCase() };
    const user = await prisma.user.update({
        where,
        data: {
            status: 'ACTIVE',
            emailVerifiedAt: new Date(),
            activationTokenHash: null,
            activationTokenExpiresAt: null
        }
    });
    return res.json({ message: 'User activated', user: publicUser(user) });
}));
authRouter.get('/admin/users', authRequired, requireRole('ADMIN'), asyncHandler(async (_req, res) => {
    const users = await prisma.user.findMany({
        orderBy: { createdAt: 'desc' },
        take: 200,
        select: {
            id: true,
            email: true,
            name: true,
            role: true,
            status: true,
            credits: true,
            emailVerifiedAt: true,
            lastLoginAt: true,
            createdAt: true
        }
    });
    return res.json({ items: users });
}));
