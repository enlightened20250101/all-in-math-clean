import { getTemplatesByTopic } from "../src/lib/course/templateRegistry";

const TOPICS = [
  "geo_ratio_theorems",
  "geo_circle_geometry",
  "geo_triangle_centers",
  "geo_circle_relations",
];

const HS_TAGS = new Set([
  "HS_A_RATIO_THEOREM",
  "HS_A_CIRCLE_GEOMETRY",
  "HS_A_TRIANGLE_CENTER",
  "HS_A_CIRCLE_RELATION",
]);

const FORBIDDEN_PATTERNS = [
  /内角の和/,
  /相似条件/,
  /相似/,
  /円周角.*中心角/,
  /中心角.*円周角/,
  /接線.*垂直/,
  /半径.*垂直/,
  /三平方/,
  /ピタゴラス/,
];

type Row = {
  templateId: string;
  topicId: string;
  tags: string[];
  statement: string;
};

function main() {
  const rows: Row[] = [];
  TOPICS.forEach((topicId) => {
    const templates = getTemplatesByTopic(topicId);
    templates.forEach((t) => {
      const stmt = t.generate().statement ?? "";
      rows.push({
        templateId: t.meta.id,
        topicId: t.meta.topicId,
        tags: t.meta.tags ?? [],
        statement: stmt,
      });
    });
  });

  const missingTag = rows.filter((r) => !r.tags.some((t) => HS_TAGS.has(t)));
  if (missingTag.length) {
    console.error("Missing HS_A_* tag:");
    missingTag.forEach((r) => console.error(`- ${r.topicId}:${r.templateId} tags=${r.tags.join(",")}`));
    process.exit(1);
  }

  const forbidden = rows.filter((r) => FORBIDDEN_PATTERNS.some((re) => re.test(r.statement)));
  if (forbidden.length) {
    console.error("Forbidden JHS-like patterns detected:");
    forbidden.forEach((r) => console.error(`- ${r.topicId}:${r.templateId} ${r.statement}`));
    process.exit(1);
  }

  console.log("HS geometry audit OK.");
}

main();
