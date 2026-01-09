import { NextResponse } from "next/server";
import { OpenRouter } from "@openrouter/sdk";

export const runtime = "nodejs";

/**
 * OpenRouter client
 */
const openrouter = new OpenRouter({
  apiKey: process.env.OPENROUTER_API_KEY!,
});

/**
 * Hard-locked model (v1)
 */
const MODEL = "xiaomi/mimo-v2-flash:free";

function errorResponse(
  status: number,
  code: string,
  message: string,
  details?: unknown,
  requestId?: string
) {
  return NextResponse.json(
    {
      ok: false,
      error: {
        code,
        message,
        details,
        requestId,
      },
    },
    { status }
  );
}

export async function POST(req: Request) {
  const requestId = crypto.randomUUID();
  const start = Date.now();

  try {
    const contentType = req.headers.get("content-type") || "";
    if (!contentType.includes("application/json")) {
      return errorResponse(
        415,
        "UNSUPPORTED_CONTENT_TYPE",
        "Content-Type must be application/json",
        { received: contentType },
        requestId
      );
    }

    const body = await req.json();
    const { input } = body;

    if (!input || typeof input !== "string") {
      return errorResponse(
        422,
        "INVALID_INPUT",
        "Field `input` is required and must be a string",
        { receivedType: typeof input },
        requestId
      );
    }

    /* -------------------------
       Prompt construction
    --------------------------*/
    const systemPrompt = `
ROLE
You are an expert prompt compiler for advanced users.
You do NOT answer the task itself.
Your only job is to transform the input into a higher-quality prompt.

CORE OBJECTIVE
Rewrite <input_prompt> into an optimized prompt that:
- Is unambiguous
- Has explicit scope and constraints
- Separates goal, process, and output
- Is suitable for expert-level execution (engineering, research, or strategy)

NON-NEGOTIABLE RULES
- Do NOT solve the task described in the prompt
- Do NOT add new intent beyond what is implied
- Do NOT remove important constraints
- Do NOT add fluff, politeness, or explanations
- Do NOT mention that you are optimizing a prompt

OUTPUT STRUCTURE (STRICT)

---
ROLE:
[who the model should act as]

CONTEXT:
[essential background only, concise]

GOAL:
[clear, single primary objective]

PROCESS:
[how the model should think or approach the task]

CONSTRAINTS:
- [explicit inclusions]
- [explicit exclusions]
- [limits on scope, tone, depth, assumptions]

OUTPUT FORMAT:
[exact structure, formatting, or deliverable expectations]
---

OUTPUT ONLY THE OPTIMIZED PROMPT.
`.trim();

    const userPrompt = `
INPUT PROMPT:
${input}
`.trim();

    /* -------------------------
       OpenRouter call
    --------------------------*/
    let completion;
    try {
      completion = await openrouter.chat.send({
        model: MODEL,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
      });
    } catch (err: any) {
      console.error("[OpenRouter error]", requestId, err);
      return errorResponse(
        502,
        "UPSTREAM_MODEL_ERROR",
        "Failed to get response from language model",
        err?.message,
        requestId
      );
    }

    const output = completion?.choices?.[0]?.message?.content;

    if (!output || typeof output !== "string") {
      return errorResponse(
        502,
        "EMPTY_MODEL_RESPONSE",
        "Model returned empty or invalid output",
        completion,
        requestId
      );
    }

    return NextResponse.json({
      ok: true,
      requestId,
      model: MODEL,
      output: output.trim(),
      meta: {
        latencyMs: Date.now() - start,
      },
    });
  } catch (err: any) {
    console.error("[/api/optimize FATAL]", requestId, err);
    return errorResponse(
      500,
      "INTERNAL_SERVER_ERROR",
      "Unexpected server error",
      err?.stack ?? err?.message,
      requestId
    );
  }
}
