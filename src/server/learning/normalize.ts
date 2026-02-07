// src/server/learning/normalize.ts
import type { TutorTurnOutput } from '@/app/learn/aiTypes';

/** 軽めの TeX サニタイズ（生の文字ノイズの一次除去） */
export function sanitizeTex(s: string): string {
  if (!s) return s;
  return s
    .replace(/\r\n?/g, '\n')
    .replace(/\u0008egin\{/g, '\\begin{')       // "egin{" → "\begin{"
    .replace(/\f/g, '\\')                       // \f → \
    .replace(/\\\s*ext\{/g, '\\text{');         // "\ ext{" → "\text{"
}

/** $$/$ の“外側”のみ変換するためのユーティリティ */
function transformOutsideMath(s: string, transformer: (t: string) => string): string {
  if (!s) return s;
  const tokens: { text: string; isMath: boolean }[] = [];
  let i = 0, L = s.length;
  while (i < L) {
    if (s[i] === '$') {
      const dbl = s.slice(i, i + 2) === '$$';
      const end = s.indexOf(dbl ? '$$' : '$', i + (dbl ? 2 : 1));
      if (end !== -1) {
        tokens.push({ text: s.slice(i, end + (dbl ? 2 : 1)), isMath: true });
        i = end + (dbl ? 2 : 1); continue;
      }
    }
    const next = s.indexOf('$', i + 1);
    const j = next === -1 ? L : next;
    tokens.push({ text: s.slice(i, j), isMath: false });
    i = j;
  }
  return tokens.map(t => (t.isMath ? t.text : transformer(t.text))).join('');
}

/** 日本語の体裁を穏やかに整える（数式の外側のみ） */
export function normalizeJapaneseOutsideMath(s: string): string {
  return transformOutsideMath(s, (t) =>
    t.replace(/[ \t\u3000]{2,}/g, ' ')
     .replace(/^・/gm, '- ')
     .replace(/^\s*\u2022\s*/gm, '- ')
     .replace(/なお、/g, '')
     .replace(/まず、/g, '')
  );
}

// --- TeX 擬似記法の補正（$ の外側のみ触る） ---
const MACROS = ['lim','to','tan','sin','cos','log','ln','det','arcsin','arccos','arctan'];

function forceLatexMacrosOutsideMath(s: string): string {
  return transformOutsideMath(s, (t) => {
    // 1) \text のバックスラッシュ抜け
    t = t.replace(/(^|[^A-Za-z\\])ext\{/g, '$1\\text{');
    // 2) \frac の抜け・崩れ
    t = t.replace(/(^|[^\\])frac\{/g, '$1\\frac{').replace(/\\rac\{/g, '\\frac{');
    // 3) 代表的な関数・演算子に "\" を補う
    for (const m of MACROS) {
      const re = new RegExp(`(^|[^A-Za-z\\\\])${m}(?=\\b)`, 'g');
      t = t.replace(re, `$1\\\\${m}`);
    }
    // 4) 下付き中の " o " → \to （例: _{x o 0}）
    t = t.replace(/(_\{[^}]*?)\s+o\s+([^}]*\})/g, `$1\\\\to $2`);
    return t;
  });
}

/** 極限まわりの崩れを補正（$ の外側のみ触る） */
function fixLimitPatternsOutsideMath(s: string): string {
  return transformOutsideMath(s, (t) => {
    let u = t;
    // 1) "extlim" → "\lim"
    u = u.replace(/(^|[^\\])extlim\b/g, '$1\\lim');
    // 2) \lim xo0 / \lim x o 0 / \lim  x o ∞ → \lim_{x \to ...}
    u = u.replace(/\\lim\s+xo(0|∞)/g, (_,$1) => `\\lim_{x \\to ${$1 === '∞' ? '\\infty' : '0'}}`);
    u = u.replace(/\\lim\s+x\s*o\s*(0|∞)/g, (_,$1) => `\\lim_{x \\to ${$1 === '∞' ? '\\infty' : '0'}}`);
    //    _{x o 0} / _x o 0 → _{x \to 0}
    u = u.replace(/_\{\s*x\s*o\s*(0|∞)\s*\}/g, (_,$1) => `_{x \\to ${$1 === '∞' ? '\\infty' : '0'}}`);
    u = u.replace(/_x\s*o\s*(0|∞)\b/g,        (_,$1) => `_{x \\to ${$1 === '∞' ? '\\infty' : '0'}}`);
    // 3) 緩い一般形： "x o 0/∞" → "x \to 0/∞"
    u = u.replace(/\bx\s*o\s*(0|∞|infty)\b/g, (_,$1) =>
      `x \\to ${$1 === '∞' || $1 === 'infty' ? '\\infty' : '0'}`
    );
    return u;
  });
}

/** 「： / :」以降の“式らしい”部分を $...$ で包む（$未使用のときだけ） */
function wrapExprAfterColonIfNoMath(s: string): string {
  return transformOutsideMath(s, (t) => {
    if (/\$/.test(t) === true) return t;
    const idx = Math.max(t.lastIndexOf('：'), t.lastIndexOf(':'));
    if (idx < 0) return t;
    const head = t.slice(0, idx + 1);
    const expr = t.slice(idx + 1).trim();
    if (/\\(lim|frac|tan|sin|cos|log|ln|det|to|arcsin|arccos|arctan)\b/.test(expr)) {
      return `${head} $${expr}$`;
    }
    return t;
  });
}

// --- TeX enforcement helpers ---
const TEX_INLINE = /\$(?:[^$]|\$\$)*\$/g;      // 簡易
const BOXED_BLOCK = /\\boxed\{[^{}]*\}/g;      // 簡易
const MATH_TOKENS = /(?<![$\\])(=|≠|≈|≤|≥|±|\+|−|\-|×|\*|÷|\/|∑|∫|lim|→|⇒)(?![^$]*\$)/;

/** $ の“外側”に生の数式トークンが残っているか判定 */
export function findNonTexMath(s: string): boolean {
  const masked = s
    .replace(TEX_INLINE, (m) => ' '.repeat(m.length))
    .replace(BOXED_BLOCK, (m) => ' '.repeat(m.length));
  return MATH_TOKENS.test(masked);
}

/** 必要箇所の最低限ラップ（誤検出を避けるため簡易に） */
export function enforceTex(out: any) {
  const wrap = (t?: string) => {
    if (!t) return t;
    // $ の外側にある \boxed{...} を $...$ で包む
    const boxedWrapped = transformOutsideMath(t, txt =>
      txt.replace(BOXED_BLOCK, (m) => `$${m}$`)
    );
    // 明らかな等式/関数呼びだけ軽くラップ
    return boxedWrapped
      .replace(/(^|[^\$\w])([\-+]?\d+(?:\.\d+)?\s*(?:[+\-×÷*\/]|=|≈|≤|≥)\s*[\-+]?\d+(?:\.\d+)?)(?![^\$]*\$)/g,
               (_,$1,$2)=> `${$1}$${$2}$$`)
      .replace(/(^|\s)(sin|cos|tan|log|ln|arcsin|arccos|arctan)\s*\(([^)$]+)\)(?![^\$]*\$)/g,
               (_,$1,f,arg)=> `${$1}$$${f}(${arg})$$`);
  };
  const visit = (obj: any) => {
    if (!obj || typeof obj !== 'object') return;
    for (const k of Object.keys(obj)) {
      const v = obj[k];
      if (typeof v === 'string') obj[k] = wrap(v);
      else if (Array.isArray(v)) v.forEach(visit);
      else if (typeof v === 'object') visit(v);
    }
  };
  visit(out);
}

/* ---------------------------------------------
 * 全域：LLM 由来の TeX グリッチを補修（\t, \text{sin}, t\text{cos}, \text{lim} など）
 * ------------------------------------------- */
function fixTeXGlitchesAll(s: string): string {
  if (!s) return s;
  let t = s;

  // 0) ゼロ幅/不可視の除去（ZWSP, ZWNJ, ZWJ, BOM）
  t = t.replace(/[\u200B-\u200D\uFEFF]/g, '');

  // 1) 実タブ（制御文字）とリテラル \t の両方を除去
  t = t.replace(/\t+/g, '');   // 制御文字のタブ
  t = t.replace(/\\t+/g, '');  // リテラル "\t"

  // 2) \text{sin} → \sin 等の関数名修正
  t = t.replace(/\\text\{(sin|cos|tan|log|ln|lim|arcsin|arccos|arctan)\}/gi,
                (_m, fn) => `\\${String(fn).toLowerCase()}`);

  // 3) 余分な 't' がコマンド直前に混入（"t\text{sin}" や "t\sin" など）
  //    …直前がバックスラッシュ以外なら 't' を消す
  t = t.replace(
    /(^|[^\\])t\\(text\{(sin|cos|tan|log|ln|lim|arcsin|arccos|arctan)\}|sin|cos|tan|log|ln|lim|arcsin|arccos|arctan)\b/gi,
    (_m, p1, rest) => {
      if (/^text\{/.test(rest)) {
        const m = rest.match(/^text\{(\w+)\}$/i);
        return p1 + '\\' + (m ? m[1].toLowerCase() : rest);
      }
      return p1 + '\\' + rest.toLowerCase();
    }
  );

  return t;
}

/** JSON 全体に fixTeXGlitchesAll を適用 */
function deepFixTeXGlitches(out: any): any {
  const walk = (v:any):any =>
    typeof v === 'string' ? fixTeXGlitchesAll(v)
    : Array.isArray(v) ? v.map(walk)
    : v && typeof v === 'object' ? Object.fromEntries(Object.entries(v).map(([k,vv])=>[k,walk(vv)]))
    : v;
  return walk(out);
}

/* ---------------------------------------------
 * 共通：1フィールド分の整形（テキスト→message_md 同期もここで）
 * ------------------------------------------- */
function normalizeFieldText(md?: string): string | undefined {
  if (typeof md !== 'string') return md;
  let x = sanitizeTex(md);
  x = fixLimitPatternsOutsideMath(x);
  x = forceLatexMacrosOutsideMath(x);
  x = wrapExprAfterColonIfNoMath(x);
  x = normalizeJapaneseOutsideMath(x);
  return x;
}

/* ---------------------------------------------
 * TEACH 配列系の整形
 * ------------------------------------------- */
function normalizeTeachLike(out: any) {
  if (Array.isArray(out?.sections)) {
    out.sections = out.sections.map((sec: any) => ({
      ...sec,
      title: normalizeFieldText(sec?.title),
      body:  normalizeFieldText(sec?.body),
    }));
  }
  if (Array.isArray(out?.examples)) {
    out.examples = out.examples.map((ex: any) => ({
      ...ex,
      prompt:   normalizeFieldText(ex?.prompt),
      solution: normalizeFieldText(ex?.solution),
    }));
  }
  if (Array.isArray(out?.exercises)) {
    out.exercises = out.exercises.map((it: any) => ({
      ...it,
      prompt: normalizeFieldText(it?.prompt),
      answer: normalizeFieldText(it?.answer),
      hint: Array.isArray(it?.hint)
        ? it.hint.map((h: string)=> normalizeFieldText(h))
        : (typeof it?.hint === 'string' ? [normalizeFieldText(it.hint)] : []),
    }));
  }
  if (Array.isArray(out?.nextCandidates)) {
    out.nextCandidates = out.nextCandidates.map((nc: any) => ({
      ...nc,
      title: normalizeFieldText(nc?.title),
    }));
  }
}

/* ---------------------------------------------
 * Main normalizer
 * - 既存の TutorTurnOutput を返すが、message_md 同期にも対応
 * ------------------------------------------- */
export function normalizeTutorOutput(input: any, raw: any, links: any[]): TutorTurnOutput {
  const out: any = raw ?? {};

  // 1) フラットフィールドの整形（$の外側だけ触る系）
  if (out?.text)       out.text       = normalizeFieldText(out.text);
  if (out?.message)    out.message    = normalizeFieldText(out.message);
  if (out?.message_md) out.message_md = normalizeFieldText(out.message_md);
  if (out?.hint) {
    if (Array.isArray(out.hint)) out.hint = out.hint.map((h:string)=> normalizeFieldText(h));
    else if (typeof out.hint === 'string') out.hint = normalizeFieldText(out.hint);
  }
  if (out?.prompt)     out.prompt     = normalizeFieldText(out.prompt);
  if (out?.solution)   out.solution   = normalizeFieldText(out.solution);
  if (typeof out?.why === 'string') out.why = normalizeFieldText(out.why);

  // 2) items（exercise/example互換）
  if (Array.isArray(out?.items)) {
    out.items = out.items.map((it: any) => ({
      ...it,
      prompt: normalizeFieldText(it?.prompt),
      answer: normalizeFieldText(it?.answer),
    }));
  }

  // 3) teach 配列系
  normalizeTeachLike(out);

  // 4) レガシー互換：message_md が無い場合は text をコピー、text が無いなら message_md をコピー
  if (!out.message_md && typeof out.text === 'string') out.message_md = out.text;
  if (!out.text && typeof out.message_md === 'string') out.text = out.message_md;

  // 5) 参考リンク
  out.links = Array.isArray(links) ? links : [];

  // 6) まずはグリッチを全域で修正（\t, \text{sin} など）
  deepFixTeXGlitches(out);

  // 7) 非TeXの数式が残っていれば最低限ラップ
  if (findNonTexMath(JSON.stringify(out))) enforceTex(out);

  // 8) enforce 後に再度軽くグリッチ除去（念のため）
  deepFixTeXGlitches(out);

  return out as TutorTurnOutput;
}
