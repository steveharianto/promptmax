# PromptMax

PromptMax is a **prompt optimization tool**.

It rewrites raw, human-written prompts into **clear, structured, executable prompts** suitable for expert use with large language models.

---

## What It Does

- Removes ambiguity and fluff
- Makes scope and constraints explicit
- Structures prompts for reliable execution
- Outputs the final optimized prompt only

It does **not** answer the prompt or add new intent.

---

## Tech Stack

- Next.js (App Router)
- Node.js runtime
- OpenRouter SDK
- Tailwind CSS

---

## Local Development

```bash
npm install
npm run dev
````

Create `.env.local`:

```env
OPENROUTER_API_KEY=sk-or-xxxxxxxx
```

If using free OpenRouter models, ensure your privacy settings allow free model usage:
[https://openrouter.ai/settings/privacy](https://openrouter.ai/settings/privacy)

---

## Deployment

Recommended: **Vercel**

1. Push repository to GitHub
2. Import project on Vercel
3. Set `OPENROUTER_API_KEY`
4. Deploy
