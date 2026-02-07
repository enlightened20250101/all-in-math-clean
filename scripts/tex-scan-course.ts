const { TOPIC_CONTENT } = require("../src/lib/course/topicContent");
const { generateNextQuestionForTopic, explainProblem } = require("../src/lib/course/questions.service");
const { sanitizeTex } = require("../src/lib/tex");

type Hit = {
  origin: string;
  message: string;
  match: string;
  raw: string;
  clean: string;
};

const TARGET_TOPICS = ["set_operations_basic", "prop_proposition_basic"];
const ITERATIONS = 200;

const gluedPatterns: { regex: RegExp; message: string }[] = [
  {
    regex: /\\(cup|cap|in|notin|subset|subseteq|supset|supseteq|mid|to|Rightarrow|Leftarrow|Leftrightarrow)(?=[A-Za-z0-9])/g,
    message: "glued set/logic operator",
  },
  { regex: /\\(le|ge|lt|gt)(?=[A-Za-z0-9])/g, message: "glued inequality operator" },
  { regex: /\\midx/g, message: "explicit \\midx glue" },
  { regex: /\\mid(?=[A-Za-z0-9])/g, message: "glued \\mid" },
  { regex: /\\Rightarrow(?=[A-Za-z0-9])/g, message: "glued \\Rightarrow" },
  { regex: /\\cup(?=[A-Za-z0-9])/g, message: "glued \\cup" },
];

function collectStrings(obj: unknown, prefix = ""): Array<{ key: string; value: string }> {
  if (!obj) return [];
  if (typeof obj === "string") return [{ key: prefix || "root", value: obj }];
  if (Array.isArray(obj)) {
    return obj.flatMap((item, idx) => collectStrings(item, `${prefix}[${idx}]`));
  }
  if (typeof obj === "object") {
    return Object.entries(obj).flatMap(([key, value]) =>
      collectStrings(value, prefix ? `${prefix}.${key}` : key)
    );
  }
  return [];
}

function findHits(origin: string, raw: string): Hit[] {
  const clean = sanitizeTex(raw);
  const hits: Hit[] = [];
  for (const { regex, message } of gluedPatterns) {
    for (const match of clean.matchAll(regex)) {
      hits.push({
        origin,
        message,
        match: match[0],
        raw,
        clean,
      });
    }
  }
  return hits;
}

function logHit(hit: Hit) {
  console.log(`[TEX_SCAN] ${hit.origin} ${hit.message} match=${hit.match}`);
  console.log(`[TEX_SCAN] raw=${JSON.stringify(hit.raw)}`);
  console.log(`[TEX_SCAN] clean=${JSON.stringify(hit.clean)}`);
}

function scanTopicContent(): Hit[] {
  const hits: Hit[] = [];
  for (const topicId of TARGET_TOPICS) {
    const content = TOPIC_CONTENT[topicId as keyof typeof TOPIC_CONTENT];
    if (!content) continue;
    const strings = collectStrings(content, `topicContent.${topicId}`);
    for (const entry of strings) {
      hits.push(...findHits(entry.key, entry.value));
    }
  }
  return hits;
}

function scanGeneratedQuestions(): Hit[] {
  const hits: Hit[] = [];
  for (const topicId of TARGET_TOPICS) {
    for (let i = 0; i < ITERATIONS; i += 1) {
      const q = generateNextQuestionForTopic(topicId);
      hits.push(...findHits(`question.${topicId}.${q.templateId}.statement`, q.statement ?? ""));
      for (const [idx, choice] of (q.choices ?? []).entries()) {
        hits.push(...findHits(`question.${topicId}.${q.templateId}.choice[${idx}]`, choice ?? ""));
      }
      const exp = explainProblem(q.templateId, q.params);
      if (exp) {
        hits.push(...findHits(`question.${topicId}.${q.templateId}.explain`, exp));
      }
    }
  }
  return hits;
}

function main() {
  const hits = [...scanTopicContent(), ...scanGeneratedQuestions()];
  if (!hits.length) {
    console.log("No glued-command TeX issues found.");
    return;
  }
  for (const hit of hits) logHit(hit);
  process.exitCode = 1;
}

main();
