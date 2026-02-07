import fg from "fast-glob";
import fs from "fs";
import path from "path";

type Issue = {
  file: string;
  templateId: string;
  kind: "statement" | "explain" | "file";
  message: string;
  excerpt: string;
  line: number;
};

const TEMPLATE_ROOT = "src/lib/course/templates";
const TEMPLATE_GLOB = `${TEMPLATE_ROOT}/**/*.ts`;
const EXTRA_FILES = [
  "src/lib/course/topicContent.ts",
];
const EXTRA_GLOBS = [
  "src/app/course/**/*.tsx",
];

const singleDollar = /(?<!\\)\$(?!\$|\{)/g;
const doubleDollar = /\$\$/g;

const badTexPatterns: { regex: RegExp; message: string }[] = [
  { regex: /\\triangle[A-Z]{2,3}/g, message: "use \\triangle ABC (space required)" },
  { regex: /\\angle[A-Z]/g, message: "use \\angle A (space required)" },
  { regex: /\\[A-Z]{2}\b/g, message: "use \\overline{AB} (no \\AB)" },
  { regex: /∘/g, message: "use ^\\circ (no unicode degree symbol)" },
  { regex: /\\text\{[^}]*\\(le|ge|equiv|pmod|Rightarrow|Leftarrow|Leftrightarrow|cup|cap|subset|subseteq|supset|supseteq|in|notin|mid|to)[^}]*\}/g, message: "avoid TeX commands inside \\text{...}" },
  { regex: /\\(cup|cap|notin|subset|subseteq|supset|supseteq|mid|to|Rightarrow|Leftarrow|Leftrightarrow)(?=[A-Za-z0-9])/g, message: "add a space after set/logic operator" },
  { regex: /\\in(?!t)(?=[A-Za-z0-9])/g, message: "add a space after set/logic operator" },
  { regex: /\\(le|ge|lt|gt)(?!ft)(?!q)(?=[A-Za-z0-9])/g, message: "add a space after inequality operator" },
];

function stripInterpolations(text: string) {
  return text.replace(/\$\{[^}]*\}/g, "");
}

function collapseWhitespace(text: string) {
  return text.replace(/\s+/g, " ").trim();
}

function lineNumberAt(text: string, index: number) {
  return text.slice(0, index).split("\n").length;
}

function excerptAt(text: string, index: number) {
  const start = Math.max(0, index - 40);
  const end = Math.min(text.length, index + 80);
  return collapseWhitespace(text.slice(start, end));
}

function checkDelimiters(text: string) {
  const issues: string[] = [];
  const normalized = stripInterpolations(text);
  const singles = normalized.match(singleDollar)?.length ?? 0;
  const doubles = normalized.match(doubleDollar)?.length ?? 0;
  if (singles % 2 !== 0) issues.push("unmatched $");
  if (doubles % 2 !== 0) issues.push("unmatched $$");
  return issues;
}

function collectIssues(content: string, file: string): Issue[] {
  const issues: Issue[] = [];
  const templateMatches = [...content.matchAll(/templateId:\s*"([^"]+)"/g)];

  for (let i = 0; i < templateMatches.length; i += 1) {
    const templateId = templateMatches[i][1];
    const start = templateMatches[i].index ?? 0;
    const end = templateMatches[i + 1]?.index ?? content.length;
    const block = content.slice(start, end);

    const statementMatches = [...block.matchAll(/statement:\s*`([\s\S]*?)`/g)];
    for (const match of statementMatches) {
      const text = match[1];
      const problems = checkDelimiters(text);
      if (problems.length) {
        issues.push({
          file,
          templateId,
          kind: "statement",
          message: problems.join(", "),
          excerpt: collapseWhitespace(text).slice(0, 160),
          line: lineNumberAt(content, start + (match.index ?? 0)),
        });
      }
      for (const { regex, message } of badTexPatterns) {
        for (const bad of text.matchAll(regex)) {
          const idx = (match.index ?? 0) + (bad.index ?? 0);
          issues.push({
            file,
            templateId,
            kind: "statement",
            message,
            excerpt: excerptAt(text, bad.index ?? 0),
            line: lineNumberAt(content, start + idx),
          });
        }
      }
    }

    const explainMatches = [...block.matchAll(/explain[\s\S]*?return\s*`([\s\S]*?)`/g)];
    for (const match of explainMatches) {
      const text = match[1];
      const problems = checkDelimiters(text);
      if (problems.length) {
        issues.push({
          file,
          templateId,
          kind: "explain",
          message: problems.join(", "),
          excerpt: collapseWhitespace(text).slice(0, 160),
          line: lineNumberAt(content, start + (match.index ?? 0)),
        });
      }
      for (const { regex, message } of badTexPatterns) {
        for (const bad of text.matchAll(regex)) {
          const idx = (match.index ?? 0) + (bad.index ?? 0);
          issues.push({
            file,
            templateId,
            kind: "explain",
            message,
            excerpt: excerptAt(text, bad.index ?? 0),
            line: lineNumberAt(content, start + idx),
          });
        }
      }
    }
  }

  return issues;
}

function collectFileIssues(content: string, file: string): Issue[] {
  const issues: Issue[] = [];
  for (const { regex, message } of badTexPatterns) {
    for (const match of content.matchAll(regex)) {
      const index = match.index ?? 0;
      issues.push({
        file,
        templateId: "N/A",
        kind: "file",
        message,
        excerpt: excerptAt(content, index),
        line: lineNumberAt(content, index),
      });
    }
  }
  return issues;
}

async function main() {
  const files = await fg(TEMPLATE_GLOB, { dot: false });
  const extraFiles = [
    ...EXTRA_FILES,
    ...(await fg(EXTRA_GLOBS, { dot: false })),
  ];
  const issues: Issue[] = [];

  for (const file of files) {
    const content = fs.readFileSync(file, "utf8");
    issues.push(...collectIssues(content, file));
  }
  for (const file of extraFiles) {
    const content = fs.readFileSync(file, "utf8");
    issues.push(...collectFileIssues(content, file));
  }

  if (!issues.length) {
    console.log("No TeX delimiter issues found.");
    return;
  }

  console.log("TeX delimiter issues:");
  for (const issue of issues) {
    const rel = path.relative(process.cwd(), issue.file);
    console.log(`- ${issue.templateId} (${rel}:${issue.line}) [${issue.kind}] ${issue.message}`);
    console.log(`  ${issue.excerpt}`);
  }

  process.exitCode = 1;
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
