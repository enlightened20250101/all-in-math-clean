import { promises as fs } from "fs";
import path from "path";

export type CurriculumView = {
  code: string;   // view_code
  title: string;  // title
};

type ViewsNdjsonRow = {
  code?: string;
  view_code?: string;
  title?: string;
  name?: string;
};

function ndjsonParse<T = any>(text: string): T[] {
  return text
    .split("\n")
    .map((l) => l.trim())
    .filter((l) => l.length > 0)
    .map((l) => JSON.parse(l));
}

export async function loadCurriculumViewsIndex(): Promise<CurriculumView[]> {
  const p = path.join(process.cwd(), "data/curriculum/JPN-2022-HS/views.ndjson");
  const raw = await fs.readFile(p, "utf8");
  const rows = ndjsonParse<ViewsNdjsonRow>(raw);

  const views: CurriculumView[] = rows
    .map((r) => ({
      code: (r.view_code ?? r.code ?? "").toString(),
      title: (r.title ?? r.name ?? "").toString(),
    }))
    .filter((v) => v.code.length > 0);

  // codeの昇順
  views.sort((a, b) => a.code.localeCompare(b.code));
  return views;
}
