const fs = require("fs");
const path = require("path");

const topicsText = fs.readFileSync("src/lib/course/topics.ts", "utf8");
const blocks = topicsText.split("},").map((chunk) => `${chunk}}`);

const topics = [];
for (const block of blocks) {
  const idMatch = block.match(/id:\s*['"]([^'"]+)['"]/);
  const unitMatch = block.match(/unit:\s*['"]([^'"]+)['"]/);
  const sectionMatch = block.match(/section:\s*['"]([^'"]+)['"]/);
  const titleMatch = block.match(/title:\s*['"]([^'"]+)['"]/);
  if (idMatch && unitMatch && titleMatch) {
    topics.push({
      id: idMatch[1],
      unit: unitMatch[1],
      section: sectionMatch ? sectionMatch[1] : "other",
      title: titleMatch[1],
    });
  }
}

const unitOrder = ["math1", "mathA", "math2", "mathB", "mathC", "math3"];
const unitLabels = {
  math1: "数学I",
  mathA: "数学A",
  math2: "数学II",
  mathB: "数学B",
  mathC: "数学C",
  math3: "数学III",
};

const sectionLabels = {
  algebra: "数と式",
  calculus: "微分積分",
  quadratic: "二次関数",
  trigonometry: "三角比",
  geometry: "図形と計量",
  data: "データの分析",
  logic: "集合と論理",
  integer: "整数の性質",
  combinatorics: "場合の数",
  probability: "確率",
  geometry_hs: "図形の性質",
  exp_log: "指数・対数",
  identity_inequality: "恒等式・不等式",
  polynomial: "多項式",
  sequence: "数列",
  statistics: "統計",
  coordinate: "座標",
  vector: "ベクトル",
  complex: "複素数",
  conic: "二次曲線",
  other: "その他",
};

const byUnit = new Map();
unitOrder.forEach((u) => byUnit.set(u, []));
for (const t of topics) {
  if (!byUnit.has(t.unit)) byUnit.set(t.unit, []);
  byUnit.get(t.unit).push(t);
}

const lines = [];
lines.push("# High School Math Curriculum (Common Range)");
lines.push("");
lines.push("This file is auto-generated from current TOPICS.");
lines.push("It represents the current in-repo curriculum baseline.");
lines.push("");

for (const unit of unitOrder) {
  const list = byUnit.get(unit) || [];
  if (!list.length) continue;
  lines.push(`## ${unitLabels[unit] || unit}`);
  const bySection = new Map();
  const sectionOrder = [];
  for (const t of list) {
    const s = t.section || "other";
    if (!bySection.has(s)) {
      bySection.set(s, []);
      sectionOrder.push(s);
    }
    bySection.get(s).push(t);
  }
  for (const s of sectionOrder) {
    const label = sectionLabels[s] || s;
    lines.push(`### ${label}`);
    for (const t of bySection.get(s)) {
      lines.push(`- ${t.title} (\`${t.id}\`)`);
    }
    lines.push("");
  }
  lines.push("");
}

const outDir = path.join("data", "course", "curriculum");
fs.mkdirSync(outDir, { recursive: true });
fs.writeFileSync(path.join(outDir, "common.md"), lines.join("\n"));
