# PromptMax

PromptMax is a prompt optimization tool.

It rewrites raw, human-written prompts into clear, structured, executable prompts suitable for expert use with large language models.

## What it does

- Removes ambiguity and fluff  
- Makes scope and constraints explicit  
- Structures prompts for reliable execution  
- Outputs the final optimized prompt only  

PromptMax does not answer the prompt or add new intent.

## Live

https://promptmaxx.vercel.app

## Tech stack

- Next.js (App Router)
- Node.js runtime
- OpenRouter SDK
- Tailwind CSS

## Local development

```bash
npm install
npm run dev
````

Create `.env.local`:

```env
OPENROUTER_API_KEY=sk-or-xxxxxxxx
```

If you use free OpenRouter models, ensure your privacy settings allow free model usage:
[https://openrouter.ai/settings/privacy](https://openrouter.ai/settings/privacy)

## Deployment

Recommended platform: Vercel

1. Push the repository to GitHub
2. Import the project on Vercel
3. Set `OPENROUTER_API_KEY`
4. Deploy
