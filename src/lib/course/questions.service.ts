// src/lib/course/questions.service.ts
import type { TopicId } from "./topics";
import type { GradeResult, QuestionGenerated, QuestionParams } from "./types";
import { getTemplateById, getTemplatesByTopic } from "./templateRegistry";

type NextQuestionOptions = {
  excludeTemplateIds?: string[];
  excludeSignatures?: string[];
  excludeTopicIds?: string[];
  courseId?: string;
};

function baseTemplateId(templateId: string): string {
  let base = templateId;
  base = base.replace(/_v\d+$/, "");
  base = base.replace(/_\d+$/, "");
  base = base.replace(/_variant(?=_basic|_advanced|$)/, "");
  base = base.replace(/_basic\d+$/, "_basic");
  base = base.replace(/_advanced\d+$/, "_advanced");
  return base;
}

function normalizeStatement(statement: string): string {
  return String(statement)
    .replace(/\$\$/g, "$")
    .replace(/\\left/g, "")
    .replace(/\\right/g, "")
    .replace(/\\,[a-z]*/g, "")
    .replace(/\\;[a-z]*/g, "")
    .replace(/\\!/g, "")
    .replace(/\\cdot/g, "*")
    .replace(/\\times/g, "*")
    .replace(/\\dfrac/g, "\\frac")
    .replace(/\\tfrac/g, "\\frac")
    .replace(/\\displaystyle/g, "")
    .replace(/\\text\{[^}]*\}/g, "")
    .replace(/[0-9]+/g, "#")
    .replace(/\s+/g, " ")
    .replace(/\(\s+/g, "(")
    .replace(/\s+\)/g, ")")
    .replace(/\{\s+/g, "{")
    .replace(/\s+\}/g, "}")
    .replace(/[#]+/g, "#")
    .trim();
}

function computeSignature(statement: string): string {
  return normalizeStatement(statement);
}

function sanitizeStatement(statement: string): string {
  let s = String(statement);
  s = s.replace(/\+\s*-/g, "- ");
  s = s.replace(/-\s*-/g, "+ ");
  s = s.replace(/(^|[^0-9])1x/g, "$1x");
  s = s.replace(/(^|[^0-9])1y/g, "$1y");
  s = s.replace(/(^|[^0-9])1x\^2/g, "$1x^2");
  s = s.replace(/(^|[^0-9])1x\^3/g, "$1x^3");
  s = s.replace(/(^|[^0-9])0x(\^2|\^3)?/g, "");
  s = s.replace(/(^|[^0-9])0y(\^2|\^3)?/g, "");
  s = s.replace(/\s{2,}/g, " ");
  return s.trim();
}

export function generateNextQuestionForTopic(topicId: string, options?: NextQuestionOptions): QuestionGenerated {
  const candidates = getTemplatesByTopic(topicId);
  if (!candidates.length) throw new Error(`No templates for topic ${topicId}`);

  const exclude = new Set(options?.excludeTemplateIds ?? []);
  const excludeFamilies = new Set(Array.from(exclude).map((id) => baseTemplateId(id)));
  const excludeSignatures = new Set(options?.excludeSignatures ?? []);
  const excludeTags = new Set<string>();
  Array.from(exclude).forEach((id) => {
    const t = getTemplateById(id);
    t?.meta.tags?.forEach((tag) => excludeTags.add(tag));
  });

  let pool = candidates.filter(
    (t) => !exclude.has(t.meta.id) && !excludeFamilies.has(baseTemplateId(t.meta.id))
  );
  if (!pool.length) {
    pool = candidates.filter((t) => !exclude.has(t.meta.id));
  }
  if (excludeTags.size) {
    const tagFiltered = pool.filter((t) => !(t.meta.tags ?? []).some((tag) => excludeTags.has(tag)));
    if (tagFiltered.length) pool = tagFiltered;
  }
  if (!pool.length) pool = candidates;

  if (options?.courseId?.startsWith("ct_")) {
    const ctPool = pool.filter((t) => (t.meta.tags ?? []).includes("ct"));
    if (ctPool.length) pool = ctPool;
  }

  const shuffled = [...pool];
  for (let i = shuffled.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }

  let picked = shuffled[0];
  let q = picked.generate();
  q = { ...q, statement: sanitizeStatement(q.statement) };
  let signature = computeSignature(q.statement);

  if (excludeSignatures.size) {
    for (const candidate of shuffled) {
      const next = candidate.generate();
      const cleaned = sanitizeStatement(next.statement);
      const normalized = { ...next, statement: cleaned };
      const sig = computeSignature(normalized.statement);
      if (!excludeSignatures.has(sig)) {
        picked = candidate;
        q = normalized;
        signature = sig;
        break;
      }
    }
  }

  if (!getTemplateById(q.templateId)) {
    throw new Error(
      `Generated templateId not registered: ${q.templateId} (topic ${topicId}, meta.id ${picked.meta.id})`
    );
  }
  if (q.templateId !== picked.meta.id) {
    throw new Error(
      `Generated templateId mismatch: ${q.templateId} (topic ${topicId}, meta.id ${picked.meta.id})`
    );
  }

  // topicId は URL 由来を強制（事故防止）
  return {
    ...q,
    signature,
    topicId: topicId as TopicId,
  };
}

export function generateNextQuestionFromPool(
  topicIds: string[],
  options?: NextQuestionOptions
): QuestionGenerated {
  if (!topicIds.length) throw new Error("No topics in pool");
  const excludeTopics = new Set(options?.excludeTopicIds ?? []);
  const pool = topicIds.filter((id) => !excludeTopics.has(id));
  const list = pool.length ? pool : topicIds;
  const pick = list[Math.floor(Math.random() * list.length)];
  return generateNextQuestionForTopic(pick, options);
}

export function gradeAnswer(templateId: string, params: QuestionParams, userAnswer: string): GradeResult {
  const t = getTemplateById(templateId);
  if (!t) throw new Error(`Unknown template: ${templateId}`);
  return t.grade(params, userAnswer);
}

export function explainProblem(templateId: string, params: QuestionParams): string | null {
  const t = getTemplateById(templateId);
  if (!t) return null;
  return t.explain ? (t.explain(params) ?? null) : null;
}
