import { ALL_TEMPLATES } from "../src/lib/course/templateRegistry";

const BAD_TOKENS = ["NaN", "undefined", "Infinity", "-Infinity"];
const BAD_PATTERNS: Array<{ name: string; re: RegExp }> = [
  { name: "1x", re: /(^|[^0-9])1x([^0-9]|$)/ },
  { name: "0x", re: /(^|[^0-9])0x([^0-9]|$)/ },
  { name: "++", re: /\+\s*\+/ },
  { name: "--", re: /-\s*-/ },
  { name: "+-", re: /\+\s*-/ },
  { name: "-+", re: /-\s*\+/ },
];

const SAMPLES = 8;

function checkStatement(stmt: string) {
  const issues: string[] = [];
  for (const token of BAD_TOKENS) {
    if (stmt.includes(token)) issues.push(`token:${token}`);
  }
  for (const p of BAD_PATTERNS) {
    if (p.re.test(stmt)) issues.push(`pattern:${p.name}`);
  }
  return issues;
}

const findings: Array<{ id: string; issue: string; sample: string }> = [];
let genErrors = 0;

for (const t of ALL_TEMPLATES) {
  for (let i = 0; i < SAMPLES; i++) {
    let q: any;
    try {
      q = t.generate();
    } catch (e: any) {
      genErrors += 1;
      findings.push({ id: t.meta.id, issue: "generate_error", sample: String(e?.message ?? e) });
      break;
    }
    const stmt = String(q?.statement ?? "");
    const issues = checkStatement(stmt);
    if (issues.length) {
      findings.push({ id: t.meta.id, issue: issues.join(","), sample: stmt.slice(0, 120) });
      break;
    }
  }
}

console.log(`templates: ${ALL_TEMPLATES.length}`);
console.log(`generate_errors: ${genErrors}`);
console.log(`issues: ${findings.length}`);
for (const f of findings.slice(0, 40)) {
  console.log(`${f.id}\t${f.issue}\t${f.sample}`);
}
