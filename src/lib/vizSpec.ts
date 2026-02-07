// src/lib/vizSpec.ts
import { z } from "zod";

export const VizNumber = z.number().finite().refine(n => Number.isFinite(n), "must be finite");
export const VizCoord = z.tuple([VizNumber, VizNumber]);

const ObjectBase = z.object({
  id: z.string().min(1).optional(),
  label: z.string().max(32).optional(),
  style: z.string().max(64).optional(), // "dashed","emph" など（レンダラ側で解釈）
});

export const VizObject = z.discriminatedUnion("type", [
  z.object({
    type: z.literal("grid"),
  }).merge(ObjectBase),

  z.object({
    type: z.literal("axes"),
  }).merge(ObjectBase),

  z.object({
    type: z.literal("point"),
    coords: z
      .union([
        VizCoord, // 具体座標 [x,y]
        z.array(z.union([z.string(), z.number()])).length(2), // 記号参照や式（"h","k" など）※MVPでは未解釈
      ])
      .optional(),
    // ★ 追加：式ベースで座標を定める（例：P=(x0, f(x0))）
    coordsExpr: z
      .object({
        fx: z.string().min(1), // y = f(x) の f
        atX: VizNumber,        // x0
      })
      .optional(),
    draggable: z.boolean().optional(),
  }).merge(ObjectBase),

  z.object({
    type: z.literal("line"),
    // "x = h" / "y = 2*x+1" / through: ["A","B"]
    expr: z.string().min(1).optional(),
    through: z.array(z.string()).length(2).optional(),
  }).merge(ObjectBase),

  z.object({
    type: z.literal("segment"),
    ends: z.array(z.string()).length(2), // point id の配列
  }).merge(ObjectBase),

  z.object({
    type: z.literal("circle"),
    center: z.string(), // point id
    radius: z.union([z.number(), z.string()]), // 数値 or 簡単な式
  }).merge(ObjectBase),

  z.object({
    type: z.literal("vector"),
    from: z.string(), // point id
    to: z.string(),   // point id
  }).merge(ObjectBase),

  z.object({
    type: z.literal("text"),
    at: z.string().optional(), // anchor point id
    pos: VizCoord.optional(),   // 直接座標
    text: z.string().min(1),
  }).merge(ObjectBase),

  z.object({
    type: z.literal("curve"),
    // y = f(x) 形式の安全サブセット（詳細はランタイム側の parser に依存）
    fx: z.string().min(1),
    xRange: z.tuple([VizNumber, VizNumber]).optional(),
  }).merge(ObjectBase),

  // ポリゴン（Riemann長方形など）
  z.object({
    type: z.literal("polygon"),
    points: z.array(VizCoord).min(3),
    fillColor: z.string().optional(),
    fillOpacity: z.number().min(0).max(1).optional(),
  }).merge(ObjectBase),

  z.object({
    type: z.literal("implicit"),
    // F(x,y)=0 の安全サブセット（将来拡張）
    F: z.string().min(1),
    bbox: z.tuple([VizNumber, VizNumber, VizNumber, VizNumber]).optional(),
  }).merge(ObjectBase),

  z.object({
    type: z.literal("region"),
    // 半平面など（例: "2x-3y<=5"）
    ineq: z.string().min(1),
  }).merge(ObjectBase),
]);

export const VizStep = z.object({
  reveal: z.array(z.string()).optional(),      // 表示する id 群
  highlight: z.array(z.string()).optional(),   // 強調する id 群
  animate: z.array(z.object({
    target: z.string(),
    key: z.string(),          // 例: "x" | "y" | param key
    to: VizNumber,
    ms: z.number().int().min(0).max(20000).default(600),
  })).optional(),
  note: z.string().optional(),
});

export const VizSpecSchema = z.object({
  preset: z.string().min(1),
  params: z.record(z.union([z.string(), z.number(), z.boolean(), z.array(z.number())])).default({}),
  objects: z.array(VizObject).optional(),
  steps: z.array(VizStep).max(12).optional(),
  notes: z.array(z.object({
    text: z.string().min(1),
    anchor: z.string().optional(),
  })).optional(),
  seed: z.number().int().optional(),
  bbox: z.tuple([VizNumber, VizNumber, VizNumber, VizNumber]).optional(), // [x1,y1,x2,y2]
});

export type VizSpec = z.infer<typeof VizSpecSchema>;

export function clampNum(n: number, lo=-1e6, hi=1e6) {
  return Math.max(lo, Math.min(hi, n));
}
