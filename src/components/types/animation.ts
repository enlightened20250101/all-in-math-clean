// src/types/animation.ts
export type AlgebraStep =
  | { kind: 'equation'; latex: string; caption?: string }
  | { kind: 'hint'; text: string };

export type GeometryOp =
  | { op: 'point'; name: string; x: number; y: number }
  | { op: 'segment'; a: string; b: string }
  | { op: 'midpoint'; a: string; b: string; out: string }
  | { op: 'perpendicular'; seg: string; at: string; out: string }
  | { op: 'intersection'; a: string; b: string; out: string; index?: number }
  | { op: 'circle'; center: string; through: string; out: string };

export type AnimationSpec = {
  title: string;
  algebra?: AlgebraStep[];
  geometry?: GeometryOp[];
  narration?: string[];
};
