import { NextResponse } from "next/server";
import { supabaseServerAction } from "@/lib/supabaseServer";
import { gradeAnswer } from "@/lib/course/questions.service";
import { getTemplatesByTopic } from "@/lib/course/templateRegistry";

// 診断で扱う分野→topicIdの割当（後で増やせる）
const AREA_TOPICS_HS_IA: Record<string, string[]> = {
  algebra: [
    "algebra_expand_basic",
    "algebra_factor_basic",
    "algebra_linear_eq_basic",
    "algebra_ineq_basic",
  ],
  logic: ["set_operations_basic", "prop_proposition_basic"],
  quadratic: [
    "quad_solve_basic",
    "quad_discriminant_basic",
    "quad_roots_relations_basic",
    "quad_graph_basic",
    "quad_maxmin_basic",
  ],
  trigonometry: ["trig_ratio_basic", "trig_special_angles_basic"],
  geometry: ["geo_measure_right_triangle_basic", "geo_sine_cosine_law_basic"],
  data: ["data_summary_basic", "data_variance_sd_basic"],
  combinatorics: ["combi_basic", "combi_conditions_basic"],
  probability: ["prob_basic", "prob_complement_basic", "prob_combi_basic"],
  integer: [
    "int_divisor_multiple_basic",
    "int_remainder_basic",
    "int_prime_factor_basic",
    "int_divisibility_tests_basic",
    "int_gcd_lcm_applications_basic",
    "int_mod_arithmetic_intro",
  ],
};

// 分野ごとの問題数（合計10）
const AREA_COUNTS_HS_IA: Record<string, number> = {
  algebra: 1,
  logic: 1,
  quadratic: 2,
  trigonometry: 1,
  geometry: 1,
  data: 1,
  combinatorics: 1,
  probability: 1,
  integer: 1,
};

const AREA_TOPICS_HS_IIB: Record<string, string[]> = {
  exp_log: ["exp_log_basic", "exp_log_equations_basic", "exp_log_change_base_basic"],
  trigonometry: ["trig_identities_basic", "trig_addition_basic", "trig_double_angle_basic"],
  calculus: ["calc_derivative_basic", "calc_integral_basic", "calc_integral_quadratic_basic"],
  polynomial: ["poly_remainder_basic", "poly_factor_k_basic", "poly_coeff_from_roots_basic"],
  identity_inequality: ["identity_eval_basic", "inequality_amgm_basic"],
  sequence: ["seq_arithmetic_basic", "seq_geometric_basic", "seq_sum_basic"],
};

const AREA_TOPICS_HS_IIC: Record<string, string[]> = {
  vector: ["vector_operations_basic", "vector_inner_basic", "vector_length_basic"],
  complex: ["complex_basic", "complex_modulus_basic", "complex_argument_degree_basic"],
  conic: ["conic_circle_basic", "conic_parabola_basic", "conic_ellipse_basic"],
};

const AREA_TOPICS_HS_III: Record<string, string[]> = {
  limit: ["calc_limit_basic"],
  continuity: ["calc_continuity_basic"],
  derivative: ["calc_derivative_advanced_basic"],
  integral: ["calc_integral_advanced_basic"],
  area: ["calc_curve_area_basic"],
  parametric: ["calc_parametric_basic"],
};

const COURSE_AREA_TOPICS: Record<string, Record<string, string[]>> = {
  hs_ia: AREA_TOPICS_HS_IA,
  hs_iib: AREA_TOPICS_HS_IIB,
  hs_iic: AREA_TOPICS_HS_IIC,
  hs_iii: AREA_TOPICS_HS_III,
};

const COURSE_AREA_COUNTS: Record<string, Record<string, number>> = {
  hs_ia: AREA_COUNTS_HS_IA,
  hs_iib: {
    exp_log: 2,
    trigonometry: 2,
    calculus: 2,
    polynomial: 2,
    identity_inequality: 1,
    sequence: 1,
  },
  hs_iic: {
    vector: 4,
    complex: 3,
    conic: 3,
  },
  hs_iii: {
    limit: 2,
    continuity: 2,
    derivative: 2,
    integral: 2,
    area: 1,
    parametric: 1,
  },
};

function areaCountsFor(courseId: string, areaTopics: Record<string, string[]>): Record<string, number> {
  return COURSE_AREA_COUNTS[courseId] ?? Object.fromEntries(Object.keys(areaTopics).map((k) => [k, 1]));
}

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const supabase = await await supabaseServerAction();
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) {
    return NextResponse.json({ ok: false, error: "Auth required" }, { status: 401 });
  }

  const url = new URL(req.url);
  const courseId = url.searchParams.get("courseId") ?? "hs_ia";
  const debug = url.searchParams.get("debug") === "1";

  const areaTopics = COURSE_AREA_TOPICS[courseId] ?? AREA_TOPICS_HS_IA;
  const areaCounts = areaCountsFor(courseId, areaTopics);

  // 1) テンプレから問題生成（サーバ側でcorrectも計算してsessionに保存）
  const sessionQuestions: any[] = [];
  const clientQuestions: any[] = [];

  const usedTemplateIds = new Set<string>();
  const warnedTopics = new Set<string>();
  const debugInfo: Array<{
    area: string;
    topicId: string;
    templateId: string;
    difficulty: number;
    primaryTag: string | null;
  }> = [];

  let prevPrimaryTag: string | null = null;
  const prevTopicByArea: Record<string, string | null> = {};
  const topicCountsByArea: Record<string, Record<string, number>> = {};

  const pickTopicForArea = (area: string, topics: string[]) => {
    topicCountsByArea[area] = topicCountsByArea[area] ?? {};
    const counts = topicCountsByArea[area];
    topics.forEach((t) => {
      counts[t] = counts[t] ?? 0;
    });
    const minCount = Math.min(...topics.map((t) => counts[t] ?? 0));
    const leastUsed = topics.filter((t) => (counts[t] ?? 0) === minCount);
    const prevTopic = prevTopicByArea[area];
    const pool = leastUsed.filter((t) => t !== prevTopic);
    return (pool.length ? pool : leastUsed)[Math.floor(Math.random() * (pool.length ? pool : leastUsed).length)];
  };

  const pickTemplateForTopic = (topicId: string, prevTag: string | null) => {
    const all = getTemplatesByTopic(topicId);
    const easy = all.filter((t) => t.meta.difficulty === 1);
    const candidates = easy.length ? easy : all;
    if (!easy.length && !warnedTopics.has(topicId)) {
      console.warn(`[diagnostic] no difficulty=1 templates for ${topicId}, falling back to all difficulties`);
      warnedTopics.add(topicId);
    }
    const tagged = prevTag ? candidates.filter((t) => (t.meta.tags?.[0] ?? null) !== prevTag) : candidates;
    return tagged.length ? tagged : candidates;
  };

  const ensureRegisteredTemplate = (template: any, generated: any, topicId: string) => {
    if (generated.templateId !== template.meta.id) {
      throw new Error(
        `Generated templateId mismatch: ${generated.templateId} (topic ${topicId}, meta.id ${template.meta.id})`
      );
    }
  };

  for (const area of Object.keys(areaCounts)) {
    const n = areaCounts[area];
    const topics = areaTopics[area] ?? [];
    if (!topics.length) continue;

    for (let i = 0; i < n; i++) {
      // 同じtemplateIdが診断セッション内で被らないように引き直す
      const MAX_TRIES = 12;

      let q: any = null;
      let pickedTopicId = "";
      let pickedTemplate: any = null;
      let pickedPrimaryTag: string | null = null;
      let tries = 0;

      while (tries < MAX_TRIES) {
        tries += 1;
        pickedTopicId = pickTopicForArea(area, topics);
        const pool = pickTemplateForTopic(pickedTopicId, prevPrimaryTag);
        pickedTemplate = pool[Math.floor(Math.random() * pool.length)] ?? null;
        if (!pickedTemplate) continue;
        pickedPrimaryTag = pickedTemplate.meta.tags?.[0] ?? null;
        const candidate = pickedTemplate.generate();
        ensureRegisteredTemplate(pickedTemplate, candidate, pickedTopicId);

        if (!usedTemplateIds.has(candidate.templateId)) {
          q = candidate;
          break;
        }
      }

      // 候補が少なくてどうしても被る場合は、最後に生成したものを許可（無限ループ回避）
      if (!q) {
        pickedTopicId = pickTopicForArea(area, topics);
        const pool = pickTemplateForTopic(pickedTopicId, prevPrimaryTag);
        pickedTemplate = pool[Math.floor(Math.random() * pool.length)] ?? null;
        if (!pickedTemplate) {
          pickedTopicId = pick(topics);
          const fallbackPool = getTemplatesByTopic(pickedTopicId);
          pickedTemplate = fallbackPool[Math.floor(Math.random() * fallbackPool.length)] ?? null;
        }
        q = pickedTemplate ? pickedTemplate.generate() : null;
        if (pickedTemplate && q) {
          ensureRegisteredTemplate(pickedTemplate, q, pickedTopicId);
        }
        pickedPrimaryTag = pickedTemplate?.meta.tags?.[0] ?? null;
      }

      if (!q) continue;

      usedTemplateIds.add(q.templateId);
      prevPrimaryTag = pickedPrimaryTag ?? null;
      prevTopicByArea[area] = pickedTopicId;
      topicCountsByArea[area][pickedTopicId] = (topicCountsByArea[area][pickedTopicId] ?? 0) + 1;

      // 正答をサーバ側で確定（gradeAnswerのcorrectAnswerを利用）
      const g = gradeAnswer(q.templateId, q.params, "__DUMMY__");
      const correctAnswer = g.correctAnswer;

      sessionQuestions.push({
        id: `${area}_${i}_${Date.now()}_${Math.random()}`,
        area,
        topicId: pickedTopicId,
        templateId: q.templateId,
        params: q.params,
        statement: q.statement,
        answerKind: q.answerKind,
        choices: q.choices ?? null,
        correctAnswer,
      });

      clientQuestions.push({
        id: sessionQuestions[sessionQuestions.length - 1].id,
        area,
        statement: q.statement,
        answerKind: q.answerKind,
        choices: q.choices ?? null,
      });

      if (debug) {
        debugInfo.push({
          area,
          topicId: pickedTopicId,
          templateId: q.templateId,
          difficulty: pickedTemplate?.meta.difficulty ?? 0,
          primaryTag: pickedPrimaryTag ?? null,
        });
      }
    }
  }

  // 2) sessionをDBに保存（correctAnswerを含む）
  const { data: session, error: insErr } = await supabase
    .from("course_diagnostic_sessions")
    .insert({
      user_id: user.id,
      course_id: courseId,
      questions_json: sessionQuestions,
    })
    .select("id")
    .single();

  if (insErr || !session) {
    return NextResponse.json({ ok: false, error: insErr?.message ?? "Failed to create session" }, { status: 500 });
  }

  const response: any = {
    ok: true,
    sessionId: session.id,
    questions: clientQuestions,
  };

  if (debug) {
    response.debugInfo = debugInfo;
  }

  return NextResponse.json(response);
}
