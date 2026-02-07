const fs = require("fs");

const topicsText = fs.readFileSync("src/lib/course/topics.ts", "utf8");
const topicBlocks = topicsText.split("},").map((chunk) => `${chunk}}`);

const topics = [];
for (const block of topicBlocks) {
  const idMatch = block.match(/id:\s*['"]([^'"]+)['"]/);
  const unitMatch = block.match(/unit:\s*['"]([^'"]+)['"]/);
  if (idMatch) {
    topics.push({ id: idMatch[1], unit: unitMatch ? unitMatch[1] : "unknown" });
  }
}

const ids = new Set(topics.map((t) => t.id));
const graph = JSON.parse(fs.readFileSync("data/course/graph.json", "utf8"));
const edges = graph.edges || [];

const bad = edges.filter((e) => !ids.has(e.from) || !ids.has(e.to));
const selfLoops = edges.filter((e) => e.from === e.to);

const incoming = new Map();
const outgoing = new Map();
topics.forEach((t) => {
  incoming.set(t.id, 0);
  outgoing.set(t.id, 0);
});
edges.forEach((e) => {
  incoming.set(e.to, (incoming.get(e.to) || 0) + 1);
  outgoing.set(e.from, (outgoing.get(e.from) || 0) + 1);
});

const indeg0 = topics.filter((t) => (incoming.get(t.id) || 0) === 0);
const outdeg0 = topics.filter((t) => (outgoing.get(t.id) || 0) === 0);

const adj = new Map();
edges.forEach((e) => {
  if (!adj.has(e.from)) adj.set(e.from, []);
  adj.get(e.from).push(e.to);
});

const color = new Map();
topics.forEach((t) => color.set(t.id, 0));
const stack = [];
const cycles = [];

function dfs(node) {
  color.set(node, 1);
  stack.push(node);
  const next = adj.get(node) || [];
  for (const to of next) {
    const c = color.get(to) || 0;
    if (c === 0) dfs(to);
    else if (c === 1) {
      const idx = stack.indexOf(to);
      if (idx >= 0) cycles.push(stack.slice(idx));
    }
  }
  stack.pop();
  color.set(node, 2);
}

topics.forEach((t) => {
  if ((color.get(t.id) || 0) === 0) dfs(t.id);
});

const byUnit = new Map();
topics.forEach((t) => {
  const cur = byUnit.get(t.unit) || { indeg0: 0, outdeg0: 0, total: 0 };
  cur.total += 1;
  if ((incoming.get(t.id) || 0) === 0) cur.indeg0 += 1;
  if ((outgoing.get(t.id) || 0) === 0) cur.outdeg0 += 1;
  byUnit.set(t.unit, cur);
});

console.log(`edges: ${edges.length}`);
console.log(`bad edges: ${bad.length}`);
if (bad.length) console.log(bad.slice(0, 10));
console.log(`self loops: ${selfLoops.length}`);
console.log(`cycles: ${cycles.length}`);
if (cycles.length) console.log(cycles.slice(0, 3));
console.log(`indeg0: ${indeg0.length}`);
console.log(`outdeg0: ${outdeg0.length}`);
console.log("by unit:");
for (const [unit, stat] of byUnit.entries()) {
  console.log(`${unit}: total=${stat.total} indeg0=${stat.indeg0} outdeg0=${stat.outdeg0}`);
}
