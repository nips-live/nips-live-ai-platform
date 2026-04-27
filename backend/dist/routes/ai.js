import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../db.js';
import { authOptional, authRequired } from '../middleware/auth.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { chatComplete, createOpenAIImage, placeholderService } from '../services/ai.js';
import { spendCredit } from '../services/credits.js';
export const aiRouter = Router();
const chatSchema = z.object({ message: z.string().min(1), model: z.string().optional(), provider: z.enum(['openai', 'anthropic', 'gemini']).optional() });
aiRouter.post('/chat/completions', authRequired, asyncHandler(async (req, res) => { const data = chatSchema.parse(req.body); await spendCredit(req.user?.id, 1); const record = await prisma.aiRequest.create({ data: { userId: req.user?.id, service: 'chat', model: data.model, prompt: data.message, status: 'RUNNING' } }); try {
    const result = await chatComplete(data.provider || 'openai', data.model, data.message);
    await prisma.aiRequest.update({ where: { id: record.id }, data: { status: 'COMPLETED', result } });
    res.json({ id: record.id, ...result });
}
catch (e) {
    await prisma.aiRequest.update({ where: { id: record.id }, data: { status: 'FAILED', error: e.message } });
    throw e;
} }));
aiRouter.post('/openai/images', authRequired, asyncHandler(async (req, res) => { const data = z.object({ prompt: z.string().min(1), size: z.string().optional() }).parse(req.body); await spendCredit(req.user?.id, 5); res.json(await createOpenAIImage(data.prompt, data.size)); }));
const services = ['openai', 'flux', 'midjourney', 'suno', 'kling', 'sora', 'veo', 'luma', 'pika', 'hailuo', 'pixverse', 'qrart', 'headshots', 'nano-banana', 'seedance', 'seedream', 'wan', 'producer', 'serp'];
for (const service of services) {
    aiRouter.all(`/${service}/*`, authOptional, asyncHandler(async (req, res) => { const result = await placeholderService(service, req.body); const record = await prisma.aiRequest.create({ data: { userId: req.user?.id, service, status: 'PLACEHOLDER', prompt: typeof req.body?.prompt === 'string' ? req.body.prompt : undefined, result: result } }); res.status(202).json({ id: record.id, ...result }); }));
}
