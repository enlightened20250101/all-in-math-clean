import fs from 'fs';
import path from 'path';
import { TOPICS, type UnitId } from '../src/lib/course/topics';

type CatalogTopic = { id: string; viewCode?: string; section?: string };

type Catalog = {
  courseId: string;
  title: string;
  topics: CatalogTopic[];
  units?: UnitId[];
};

type IndexItem = {
  courseId: string;
  title: string;
  units: UnitId[];
  baseCourseId?: string;
  section?: string;
};

const BASE_COURSES = ['hs_ia', 'hs_iib', 'hs_iic', 'hs_iii'] as const;
const GOALS = [55, 65, 80] as const;

const SECTION_LABELS: Record<string, string> = {
  algebra: '代数',
  logic: '論理',
  proof: '証明',
  integer: '整数',
  combinatorics: '場合の数',
  probability: '確率',
  data: 'データ・統計',
  quadratic: '二次関数',
  trigonometry: '三角関数',
  geometry: '幾何',
  geometry_hs: '図形',
  exp_log: '指数・対数',
  polynomial: '多項式',
  identity_inequality: '恒等式・不等式',
  coordinate: '座標',
  calculus: '微積',
  sequence: '数列',
  statistics: '統計',
  vector: 'ベクトル',
  complex: '複素数',
  conic: '円錐曲線',
  set: '集合',
  proposition: '命題',
  induction: '数学的帰納法',
};

const topicInfo = new Map(TOPICS.map((t) => [t.id, t]));

const readJson = <T>(p: string): T => JSON.parse(fs.readFileSync(p, 'utf8')) as T;

const uniq = <T>(items: T[]): T[] => Array.from(new Set(items));

const catalogsDir = path.join(process.cwd(), 'data/course/catalogs');
const plansDir = path.join(process.cwd(), 'data/course/plans');

function sectionLabel(section: string) {
  return SECTION_LABELS[section] ?? section;
}

function computeUnits(topics: CatalogTopic[]): UnitId[] {
  const units = topics
    .map((t) => topicInfo.get(t.id as TopicId)?.unit)
    .filter(Boolean) as UnitId[];
  return uniq(units);
}

function writeCatalog(catalog: Catalog) {
  const units = catalog.units ?? computeUnits(catalog.topics);
  const payload = { ...catalog, units };
  const p = path.join(catalogsDir, `${catalog.courseId}.json`);
  fs.writeFileSync(p, JSON.stringify(payload, null, 2) + '\n', 'utf8');
}

function generateUnitCatalogs() {
  for (const baseCourseId of BASE_COURSES) {
    const basePath = path.join(catalogsDir, `${baseCourseId}.json`);
    const base = readJson<Catalog>(basePath);
    const bySection = new Map<string, CatalogTopic[]>();
    for (const topic of base.topics) {
      const info = topicInfo.get(topic.id);
      const section = info?.section ?? 'misc';
      const arr = bySection.get(section) ?? [];
      arr.push(topic);
      bySection.set(section, arr);
    }

    for (const [section, topics] of bySection.entries()) {
      const courseId = `${baseCourseId}_${section}`;
      const title = `${base.title}：${sectionLabel(section)}`;
      writeCatalog({ courseId, title, topics, units: computeUnits(topics) });

      for (const goal of GOALS) {
        const planPath = path.join(plansDir, `${baseCourseId}_${goal}.json`);
        if (!fs.existsSync(planPath)) continue;
        const plan = readJson<{ courseId: string; goal: number; topicOrder: string[] }>(planPath);
        const allowed = new Set(topics.map((t) => t.id));
        const topicOrder = plan.topicOrder.filter((id) => allowed.has(id));
        const out = { courseId, goal, topicOrder };
        fs.writeFileSync(path.join(plansDir, `${courseId}_${goal}.json`), JSON.stringify(out, null, 2) + '\n', 'utf8');
      }
    }
  }
}

function generateIndex() {
  const files = fs.readdirSync(catalogsDir).filter((f) => f.endsWith('.json'));
  const items: IndexItem[] = [];
  for (const file of files) {
    const catalog = readJson<Catalog>(path.join(catalogsDir, file));
    const units = catalog.units?.length ? catalog.units : computeUnits(catalog.topics);
    let baseCourseId: string | undefined;
    let section: string | undefined;
    for (const baseId of BASE_COURSES) {
      if (catalog.courseId.startsWith(baseId + '_')) {
        baseCourseId = baseId;
        section = catalog.courseId.slice(baseId.length + 1);
        break;
      }
    }
    items.push({
      courseId: catalog.courseId,
      title: catalog.title,
      units,
      baseCourseId,
      section,
    });
  }

  items.sort((a, b) => a.title.localeCompare(b.title, 'ja'));
  fs.writeFileSync(path.join(catalogsDir, 'index.json'), JSON.stringify({ courses: items }, null, 2) + '\n', 'utf8');
}

generateUnitCatalogs();
generateIndex();
