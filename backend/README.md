# NIPS.live Backend Pro

Own backend for NIPS.live, designed to disconnect the frontend from AceData endpoints.

## Included
- JWT auth: `/auth/register`, `/auth/login`, `/auth/me`
- PostgreSQL + Prisma
- Admin bootstrap user
- Credit accounting
- OpenAI / Anthropic / Gemini chat
- OpenAI image generation endpoint
- Stripe Checkout + webhook credits
- Solana payment signature verification
- Placeholder endpoints for Midjourney, Suno, Kling, Sora, Veo, Luma, Pika, Hailuo, Pixverse, Flux, QRArt, Headshots, Nano Banana, Seedance, Seedream, WAN, Producer, SERP
- Docker + docker-compose
- Nginx example for `api.nips.live`

## Required setup
```bash
cp .env.example .env
nano .env
npm install
npm run build
```

## Docker
```bash
docker compose up -d --build
curl http://127.0.0.1:4000/health
```

## Frontend endpoint replacement
Use this in `src/constants/endpoint.ts`:
```ts
export const isTest = false;
export const BASE_URL_NIPS = 'https://api.nips.live';
export const BASE_URL_PLATFORM = BASE_URL_NIPS;
export const BASE_URL_HUB = 'https://nips.live';
export const BASE_URL_AUTH = BASE_URL_NIPS;
export const BASE_URL_API = BASE_URL_NIPS;
export const BASE_HOST_PLATFORM = new URL(BASE_URL_PLATFORM).host;
export const BASE_HOST_HUB = new URL(BASE_URL_HUB).host;
export const BASE_HOST_AUTH = new URL(BASE_URL_AUTH).host;
export const BASE_HOST_API = new URL(BASE_URL_API).host;
```

## Provider reality
Chat is real when you add `OPENAI_API_KEY`, `ANTHROPIC_API_KEY`, or `GEMINI_API_KEY`. OpenAI image is real when `OPENAI_API_KEY` is set. Other AI apps are live backend routes ready for provider adapter integration.
