import { ALL_TEMPLATES } from "../src/lib/course/templateRegistry";
import { TOPICS } from "../src/lib/course/topics";

type Sample = {
  templateId: string;
  topicId: string;
  title: string;
  statement: string;
  hits: string[];
  missing: string[];
  flags: string[];
};

const EXPECTED_KEYWORDS: Array<{ key: string; patterns: RegExp[] }> = [
  { key: "integral", patterns: [/積分/, /\\int/, /定積分/, /不定積分/] },
  { key: "derivative", patterns: [/微分/, /導関数/, /\\frac\{d/, /\\dfrac\{d/, /\\prime/, /f'/] },
  { key: "limit", patterns: [/極限/, /lim/, /\\to/] },
  { key: "continuity", patterns: [/連続/] },
  { key: "parametric", patterns: [/媒介/] },
  { key: "area", patterns: [/面積/] },
  { key: "trig", patterns: [/三角/, /sin/, /cos/, /tan/] },
  { key: "exp_log", patterns: [/対数/, /log/, /ln/, /指数/, /\^\{/, /[0-9a-zA-Z]\^[0-9a-zA-Z]/] },
  { key: "sequence", patterns: [/数列/, /一般項/, /初項/, /公差/, /公比/] },
  { key: "probability", patterns: [/確率/, /期待値/, /分散/, /試行/, /成功/, /失敗/] },
  { key: "combinatorics", patterns: [/場合の数/, /組合せ/, /組み合わせ/, /順列/, /通り/, /nC/, /nP/] },
  { key: "vector", patterns: [/ベクトル/, /\\vec/] },
  { key: "complex", patterns: [/複素/, /i/] },
  { key: "conic", patterns: [/円/, /楕円/, /放物線/, /双曲線/, /二次曲線/] },
  { key: "stats", patterns: [/標準偏差/, /分散/, /標本/, /平均/, /信頼区間/] },
];

const TOPIC_HINTS: Array<{ match: RegExp; keys: string[] }> = [
  { match: /integral/, keys: ["integral"] },
  { match: /area/, keys: ["area"] },
  { match: /derivative/, keys: ["derivative"] },
  { match: /limit/, keys: ["limit"] },
  { match: /continuity/, keys: ["continuity"] },
  { match: /parametric/, keys: ["parametric"] },
  { match: /trig/, keys: ["trig"] },
  { match: /exp_log/, keys: ["exp_log"] },
  { match: /seq_|sequence/, keys: ["sequence"] },
  { match: /prob_/, keys: ["probability"] },
  { match: /combi/, keys: ["combinatorics"] },
  { match: /vector/, keys: ["vector"] },
  { match: /complex/, keys: ["complex"] },
  { match: /conic/, keys: ["conic"] },
  { match: /stats_/, keys: ["stats"] },
];

function normalizeStatement(raw: string): string {
  return raw.replace(/\s+/g, " ").trim();
}

function detectHits(statement: string): string[] {
  const hits: string[] = [];
  for (const { key, patterns } of EXPECTED_KEYWORDS) {
    if (patterns.some((p) => p.test(statement))) hits.push(key);
  }
  return hits;
}

function expectedKeysForTopic(topicId: string): string[] {
  const keys: string[] = [];
  for (const hint of TOPIC_HINTS) {
    if (hint.match.test(topicId)) {
      hint.keys.forEach((k) => {
        if (!keys.includes(k)) keys.push(k);
      });
    }
  }
  return keys;
}

function buildSample(topicId: string, n: number): Sample[] {
  const templates = ALL_TEMPLATES.filter((t) => t.meta.topicId === topicId);
  const samples: Sample[] = [];
  for (const t of templates.slice(0, n)) {
    let statement = "";
    try {
      statement = String(t.generate().statement ?? "");
    } catch {
      statement = "(generate failed)";
    }
    const normalized = normalizeStatement(statement);
    const hits = detectHits(normalized);
    const expected = expectedKeysForTopic(topicId);
    const missing = expected.filter((k) => !hits.includes(k));
    const flags: string[] = [];
    if (expected.length && missing.length) flags.push(`missing:${missing.join(",")}`);
    if (hits.includes("integral") && !topicId.includes("integral") && !topicId.includes("area")) {
      flags.push("integral_outside");
    }
    if (hits.includes("derivative") && !topicId.includes("derivative")) {
      flags.push("derivative_outside");
    }
    samples.push({
      templateId: t.meta.id,
      topicId,
      title: t.meta.title,
      statement: normalized.slice(0, 160),
      hits,
      missing,
      flags,
    });
  }
  return samples;
}

const topicIndex = new Map(TOPICS.map((t) => [t.id, t]));
const topicIds = TOPICS.map((t) => t.id);
const SAMPLE_COUNT = 3;

const report: string[] = [];
report.push(`# Topic Audit (samples: ${SAMPLE_COUNT})`);
report.push("");

for (const topicId of topicIds) {
  const topic = topicIndex.get(topicId);
  const samples = buildSample(topicId, SAMPLE_COUNT);
  report.push(`## ${topic?.title ?? topicId} (${topicId})`);
  if (!samples.length) {
    report.push("- No templates found.");
    report.push("");
    continue;
  }
  for (const s of samples) {
    const flagText = s.flags.length ? ` ⚠ ${s.flags.join(" / ")}` : "";
    report.push(`- ${s.templateId}${flagText}`);
    report.push(`  - title: ${s.title}`);
    report.push(`  - hits: ${s.hits.join(", ") || "none"}`);
    report.push(`  - statement: ${s.statement}`);
  }
  report.push("");
}

console.log(report.join("\n"));
