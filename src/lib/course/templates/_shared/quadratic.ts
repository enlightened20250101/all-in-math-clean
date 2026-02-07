// src/lib/course/templates/_shared/quadratic.ts
import { pick, randInt } from "./utils";

export function genQuadraticWithIntegerVertex() {
  const a = pick([1, 2, 3]);
  const p = pick([-5, -4, -3, -2, -1, 1, 2, 3, 4, 5]); // 頂点x
  const b = -2 * a * p;
  const c = randInt(-6, 6);
  return { a, b, c };
}

export function vertexX(a: number, b: number) {
  return -b / (2 * a);
}

export function vertexY(a: number, b: number, c: number) {
  const p = vertexX(a, b);
  return a * p * p + b * p + c;
}
