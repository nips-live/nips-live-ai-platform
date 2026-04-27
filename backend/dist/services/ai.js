import OpenAI from 'openai';
import Anthropic from '@anthropic-ai/sdk';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { env } from '../env.js';
import { HttpError } from '../utils/http.js';
const openai = env.openaiApiKey ? new OpenAI({ apiKey: env.openaiApiKey }) : null;
const anthropic = env.anthropicApiKey ? new Anthropic({ apiKey: env.anthropicApiKey }) : null;
const gemini = env.geminiApiKey ? new GoogleGenerativeAI(env.geminiApiKey) : null;
export async function chatComplete(provider, model, message) { if (provider === 'anthropic') {
    if (!anthropic)
        throw new HttpError(503, 'ANTHROPIC_API_KEY is not configured');
    const r = await anthropic.messages.create({ model: model || 'claude-3-5-sonnet-latest', max_tokens: 1024, messages: [{ role: 'user', content: message }] });
    return { provider, model: r.model, text: r.content.map((c) => c.text || '').join('\n') };
} if (provider === 'gemini') {
    if (!gemini)
        throw new HttpError(503, 'GEMINI_API_KEY is not configured');
    const m = gemini.getGenerativeModel({ model: model || 'gemini-1.5-pro' });
    const r = await m.generateContent(message);
    return { provider, model: model || 'gemini-1.5-pro', text: r.response.text() };
} if (!openai)
    throw new HttpError(503, 'OPENAI_API_KEY is not configured'); const r = await openai.chat.completions.create({ model: model || 'gpt-4o-mini', messages: [{ role: 'user', content: message }] }); return { provider: 'openai', model: r.model, text: r.choices[0]?.message?.content || '' }; }
export async function createOpenAIImage(prompt, size = '1024x1024') { if (!openai)
    throw new HttpError(503, 'OPENAI_API_KEY is not configured'); const r = await openai.images.generate({ model: 'gpt-image-1', prompt, size: size }); return { images: r.data }; }
export const placeholderService = async (service, body) => ({ service, status: 'READY_FOR_PROVIDER_KEY_OR_ADAPTER', message: `${service} endpoint is live on NIPS backend. Add provider adapter/key to enable generation.`, input: body });
