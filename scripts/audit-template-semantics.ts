import { ALL_TEMPLATES } from "../src/lib/course/templateRegistry";

type Finding = {
  id: string;
  issue: string;
  sample: string;
};

const SAMPLES = 3;
const MAX_SAMPLE_LEN = 140;

function trimSample(s: string) {
  const flat = s.replace(/\s+/g, " ").trim();
  return flat.length > MAX_SAMPLE_LEN ? `${flat.slice(0, MAX_SAMPLE_LEN)}…` : flat;
}

function extractMathSegments(text: string) {
  const segs: string[] = [];
  const re = /\$([^$]+)\$/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(text))) {
    segs.push(m[1]);
  }
  return segs;
}

function parseQuadratic(expr: string): { a: number; b: number; c: number } | null {
  // Only supports ax^2+bx+c with integer coefficients, no variables other than x.
  const cleaned = expr.replace(/\s+/g, "");
  if (/[^0-9x+\-^]/.test(cleaned)) return null;
  if (!cleaned.includes("x^2")) return null;
  // Split into terms by converting "-" to "+-"
  const normalized = cleaned.replace(/-/g, "+-");
  const parts = normalized.split("+").filter(Boolean);
  let a = 0;
  let b = 0;
  let c = 0;
  for (const part of parts) {
    if (part.includes("x^2")) {
      const coeff = part.replace("x^2", "");
      if (coeff === "" || coeff === "+") a += 1;
      else if (coeff === "-") a -= 1;
      else a += Number(coeff);
    } else if (part.includes("x")) {
      const coeff = part.replace("x", "");
      if (coeff === "" || coeff === "+") b += 1;
      else if (coeff === "-") b -= 1;
      else b += Number(coeff);
    } else {
      c += Number(part);
    }
  }
  if (![a, b, c].every((v) => Number.isFinite(v))) return null;
  return { a, b, c };
}

function evaluateQuadratic(q: { a: number; b: number; c: number }, x: number) {
  return q.a * x * x + q.b * x + q.c;
}

function findQuadraticInText(statement: string) {
  const segments = extractMathSegments(statement);
  for (const seg of segments) {
    const yMatch = seg.match(/y=([^=]+)$/);
    if (yMatch) {
      const expr = yMatch[1];
      const q = parseQuadratic(expr);
      if (q) return { expr, q };
    }
    const fMatch = seg.match(/f\\?\\(x\\)=([^=]+)$/);
    if (fMatch) {
      const expr = fMatch[1];
      const q = parseQuadratic(expr);
      if (q) return { expr, q };
    }
  }
  return null;
}

function hasSymbolicParam(expr: string) {
  return /[a-wyz]/i.test(expr.replace(/x/g, ""));
}

function findXYPairs(statement: string) {
  const pairs: Array<{ x: number; y: number }> = [];
  const xMatches = [...statement.matchAll(/x\s*=\s*([+-]?\d+)/g)];
  const yMatches = [...statement.matchAll(/y\s*=\s*([+-]?\d+)/g)];
  for (const xm of xMatches) {
    const xVal = Number(xm[1]);
    const xIndex = xm.index ?? 0;
    const yCandidate = yMatches.find((ym) => {
      const yIndex = ym.index ?? 0;
      return yIndex > xIndex && yIndex - xIndex < 40;
    });
    if (yCandidate) {
      const yVal = Number(yCandidate[1]);
      pairs.push({ x: xVal, y: yVal });
    }
  }
  return pairs;
}

function checkIntegralBounds(statement: string): string | null {
  const hasDef = statement.includes("定積分");
  const hasIndef = statement.includes("不定積分");
  const hasBound = /\\int_(\{[^}]+\}|[^\s^]+)\^(\{[^}]+\}|[^\s}]+)/.test(statement);
  if (hasDef && !hasBound) return "definite_integral_missing_bounds";
  if (hasIndef && hasBound) return "indefinite_integral_has_bounds";
  return null;
}

function checkZeroDenominator(statement: string): string | null {
  if (/\\frac\{[^}]+\}\{0\}/.test(statement)) return "zero_denominator";
  return null;
}

const findings: Finding[] = [];
let genErrors = 0;

for (const t of ALL_TEMPLATES) {
  for (let i = 0; i < SAMPLES; i += 1) {
    let q: any;
    try {
      q = t.generate();
    } catch (e: any) {
      genErrors += 1;
      findings.push({
        id: t.meta.id,
        issue: "generate_error",
        sample: String(e?.message ?? e),
      });
      break;
    }
    const statement = String(q?.statement ?? "");

    const intIssue = checkIntegralBounds(statement);
    if (intIssue) {
      findings.push({ id: t.meta.id, issue: intIssue, sample: trimSample(statement) });
      break;
    }

    const denomIssue = checkZeroDenominator(statement);
    if (denomIssue) {
      findings.push({ id: t.meta.id, issue: denomIssue, sample: trimSample(statement) });
      break;
    }

    const quad = findQuadraticInText(statement);
    if (quad && !hasSymbolicParam(quad.expr)) {
      const pairs = findXYPairs(statement);
      if (pairs.length) {
        const mismatches = pairs.filter((p) => evaluateQuadratic(quad.q, p.x) !== p.y);
        if (mismatches.length) {
          findings.push({
            id: t.meta.id,
            issue: "condition_mismatch",
            sample: trimSample(statement),
          });
          break;
        }
        findings.push({
          id: t.meta.id,
          issue: "redundant_condition",
          sample: trimSample(statement),
        });
        break;
      }
    }
  }
}

console.log(`templates: ${ALL_TEMPLATES.length}`);
console.log(`generate_errors: ${genErrors}`);
console.log(`findings: ${findings.length}`);
for (const f of findings.slice(0, 60)) {
  console.log(`${f.id}\t${f.issue}\t${f.sample}`);
}
