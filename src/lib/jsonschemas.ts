// src/lib/jsonschemas.ts
import { z } from "zod";
import { zodToJsonSchema } from "zod-to-json-schema";
import { ProblemSchema, TutorialSchema } from "@/lib/zod-schemas";

// ---- 既存の正規化/厳格化ツール（Problem/Tutorial用） ----
type JS = Record<string, any>;

function normalizeRoot(js: JS, name: string): JS {
  if (js.$ref && js.definitions) {
    const m = String(js.$ref).match(/^#\/definitions\/(.+)$/);
    if (m && js.definitions[m[1]]) js = js.definitions[m[1]];
  }
  if (js.definitions && js.definitions[name] && !js.type && !js.properties) {
    js = js.definitions[name];
  }
  if (!js.type && (js.anyOf || js.oneOf)) {
    const cand = (js.anyOf || js.oneOf).find((s: any) => s && s.type === "object");
    if (cand) js = cand;
  }
  if (!js.type && js.properties) js.type = "object";
  if (js.type !== "object") {
    throw new Error(`[jsonschemas] ${name} root is not an object schema`);
  }
  return js;
}

function enforceObjectStrict(schema: any): any {
  if (!schema || typeof schema !== "object") return schema;

  if (schema.type === "object") {
    if (typeof schema.additionalProperties === "undefined") {
      schema.additionalProperties = false;
    }
    if (schema.properties) {
      for (const key of Object.keys(schema.properties)) {
        schema.properties[key] = enforceObjectStrict(schema.properties[key]);
      }
    }
  }
  if (Array.isArray(schema.anyOf)) {
    schema.anyOf = schema.anyOf.map(enforceObjectStrict);
  }
  if (Array.isArray(schema.oneOf)) {
    schema.oneOf = schema.oneOf.map(enforceObjectStrict);
  }
  if (schema.items) {
    schema.items = enforceObjectStrict(schema.items);
  }

  return schema;
}

function toObjectSchema(zodSchema: z.ZodTypeAny, name: string): JS {
  let js = zodToJsonSchema(zodSchema, {
    name,
    target: "jsonSchema7",
    $refStrategy: "none",
  }) as JS;

  js = normalizeRoot(js, name);
  js = enforceObjectStrict(js);

  // Problem/Tutorial は required 自動生成でOK（Zodが必須管理）
  return js;
}

// ---- ここだけ“手書き”で固定（OpenAIのstrict要件に確実に合せる） ----
export const CritiqueJSONSchema = {
  type: "object",
  additionalProperties: false,
  properties: {
    issues: { type: "array", items: { type: "string" } },
    severity: { type: "string", enum: ["minor", "major"] },
    patch: {
      anyOf: [
        { type: "null" },
        { type: "object", additionalProperties: true } // ← 任意/自由形（実質使わない）
      ]
    }
  },
  required: ["issues", "severity"]    // ← patch は必須にしない
} as const;


// こちらは既存の自動変換を使用
export const ProblemJSONSchema   = toObjectSchema(ProblemSchema,  "Problem");
export const TutorialJSONSchema  = toObjectSchema(TutorialSchema, "Tutorial");
