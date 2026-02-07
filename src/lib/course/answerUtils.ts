export type RootsParseResult = { none: true } | { roots: number[] } | null;

export function parseRootsAnswer(value: string): RootsParseResult {
  const trimmed = value.trim();
  if (!trimmed) return null;
  const lower = trimmed.toLowerCase();
  if (lower === "none" || trimmed === "なし") {
    return { none: true };
  }
  const parts = trimmed.split(",").map((p) => p.trim()).filter(Boolean);
  if (parts.length !== 2) return null;
  const nums = parts.map((p) => Number(p));
  if (nums.some((n) => !Number.isInteger(n))) return null;
  return { roots: nums };
}

export function canonicalizeRootsInputs(rootA: string, rootB: string, noReal: boolean) {
  if (noReal) {
    return { value: "none", error: null as string | null };
  }
  const a = rootA.trim();
  const b = rootB.trim();
  if (!a || !b) {
    return { value: null as string | null, error: "解1と解2を入力してください。" };
  }
  const n1 = Number(a);
  const n2 = Number(b);
  if (!Number.isInteger(n1) || !Number.isInteger(n2)) {
    return { value: null as string | null, error: "整数で入力してください。" };
  }
  const sorted = [n1, n2].sort((x, y) => x - y);
  return { value: `${sorted[0]},${sorted[1]}`, error: null as string | null };
}
