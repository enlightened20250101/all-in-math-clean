// src/server/learning/llm.ts
import OpenAI from "openai";

export const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! });

export async function callJSONWithSchema(opts: {
  model: string;
  system: string;
  user: string;
  jsonSchema: any;     // MUST be { type:"object", properties:{...}, required:[...] }
  schemaName: string;
  temperature?: number;
  maxTokens?: number;
}) {
  const s = opts.jsonSchema || {};
  if (s.type !== "object") {
    // 早期に気づけるようにガード
    throw new Error(`[callJSONWithSchema] ${opts.schemaName} schema root is not "object" (got: ${String(s.type)})`);
  }

  const res = await openai.responses.create({
    model: opts.model,
    temperature: opts.temperature ?? 0.2,
    max_output_tokens: opts.maxTokens ?? 2000,
    input: [
      { role: "system", content: opts.system + " Output strictly valid JSON. No markdown fences." },
      { role: "user", content: opts.user },
    ],
    text: {
      format: {
        type: "json_schema",
        name: opts.schemaName,
        schema: s,
        strict: true,
      },
    },
  });

  const txt =
    (res as any).output_text ??
    (res as any).output?.[0]?.content?.[0]?.text ??
    "";

  if (!txt) throw new Error("OpenAI returned empty output_text");
  return txt;
}
