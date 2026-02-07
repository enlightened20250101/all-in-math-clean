// scripts/test-tex.ts
import { sanitizeTex } from '../src/lib/tex';

type Case = { name: string; in: string; out?: string; assert?: (got: string) => boolean };

function assertEq(name: string, input: string, expected: string) {
  const got = sanitizeTex(input);
  if (got !== expected) {
    console.error(`✗ ${name}\n  in : ${input}\n  got: ${got}\n  exp: ${expected}\n`);
    return false;
  }
  return true;
}

function assertOk(name: string, input: string, pred: (got: string) => boolean, tip?: string) {
  const got = sanitizeTex(input);
  const ok = pred(got);
  if (!ok) {
    console.error(`✗ ${name}\n  in : ${input}\n  got: ${got}\n  tip: ${tip ?? ''}\n`);
  }
  return ok;
}

// ============ 基本・決め打ちテスト（例示 + 退行防止） ============
const cases: Case[] = [
  // 1) 代表的な崩れの修復
  { name: 'frac_ext_basic', in: '\\ rac 12 + \\ ext{ abc }', out: '\\frac{1}{2} + \\text{abc}' },
  { name: 'frac_ext_spaced', in: '\\ r a c{1}{2} + \\ e x t{xyz}', out: '\\frac{1}{2} + \\text{xyz}' },

  // 2) \frac 引数復元（空白区切り・片側括弧）
  { name: 'frac_space_both', in: '$ a \\frac 1 2 b $', out: '$ a \\frac{1}{2} b $' },
  { name: 'frac_left_brace', in: '$ a \\frac{1} 2 b $', out: '$ a \\frac{1}{2} b $' },
  { name: 'frac_right_brace', in: '$ a \\frac 1 {2} b $', out: '$ a \\frac{1}{2} b $' },

  // 3) 制御語境界（int/log/sin…）
  { name: 'control_boundary_ok', in: '$ \\\\int e^x \\, dx $'.replace('\\\\','\\'), out: '$ \\int e^x \\, dx $' },
  { name: 'control_boundary_glued', in: '$ \\\\inte^x \\, dx $'.replace('\\\\','\\'), out: '$ \\int e^x \\, dx $' },
  { name: 'short_funcs_glued', in: '$ \\\\logx + \\\\sinx + \\\\cosx $'.replace(/\\\\/g,'\\'), out: '$ \\log x + \\sin x + \\cos x $' },

  // 4) 区切り（\, \; の分断）
  { name: 'thinspace_split', in: '$ a \\\\ , b $'.replace('\\\\','\\'), out: '$ a \\, b $' },
  { name: 'medspace_split',  in: '$ a \\\\ ; b $'.replace('\\\\','\\'), out: '$ a \\; b $' },

  // 5) \text{} 内の余白
  { name: 'text_trim', in: '$ \\text{  abc  } $', out: '$ \\text{abc} $' },

  // 6) 行末・全角スペース・改行
  { name: 'outside_newline', in: '外の\\n改行と $ a \\frac 1 2 b $ の混在\u3000', out: '外の\n改行と $ a \\frac{1}{2} b $ の混在' },

  // 7) 奇数 $ → 全角$
  { name: 'odd_dollar', in: 'これ $ a+b ', out: 'これ \uFF04 a+b ' },

  // 8) left/right の字間崩れ
  { name: 'left_right_spaced', in: '$ \\\\ le f t( a + b ) \\\\ r i g h t ) $'.replace(/\\\\/g,'\\'), out: '$ \\left( a + b \\right ) $' },

  // 9) sqrt/binom の崩れ
  { name: 'sqrt_spaced', in: '$ \\\\ sq r t 4 $'.replace(/\\\\/g,'\\'), out: '$ \\sqrt 4 $' },
  { name: 'binom_spaced', in: '$ \\\\ bi n o m{n}{k} $'.replace(/\\\\/g,'\\'), out: '$ \\binom{n}{k} $' },

  // 10) display 切替（\( \) / \[ \] → $ / $$）
  { name: 'paren_to_dollar', in: '\\( a + b \\)', out: '$a + b$' },
  { name: 'bracket_to_dollar', in: '\\[ a + b \\]', out: '$$ a + b $$' },
];

// 一部の「soft assert」：正確な out は決めにくいが禁止パターンを満たさないことを確認
const softCases: Case[] = [
  // \frac は常に { から始まる
  {
    name: 'frac_must_have_braces',
    in: '$ a \\frac 3 5 + \\frac{7}{ 10 } $',
    assert: (got) => !/\\frac(?!\s*\{)/.test(got),
  },
  // \text も常に { から始まる
  {
    name: 'text_must_have_braces',
    in: '$ \\ text abc $',
    assert: (got) => !/\\text(?!\s*\{)/.test(got),
  },
  // odd $ は残らない（\uFF04 に退避）
  {
    name: 'no_odd_dollar_after',
    in: '奇数 $ a+b ',
    assert: (got) => (got.match(/\$/g) || []).length % 2 === 0,
  },
  // 禁止パターンは出ない
  {
    name: 'no_broken_patterns',
    in: '$ \\fra c{1}{2} + \\tex t{abc} + \\ r a c{1}{2} + \\ e x t{z} $',
    assert: (got) =>
      !/\\fra\s+c/i.test(got) &&
      !/\\tex\s+t/i.test(got) &&
      !/\\\s*r\s*a\s*c/i.test(got) &&
      !/\\\s*e\s*x\s*t/i.test(got),
  },
];

// ============ ファズ（簡易） ============
// 壊し方をいくつか定義して、sanitize 後に禁止パターンが残っていないかを検査
const BAN_PATTERNS: RegExp[] = [
  /\\fra\s+c/i,        // \fra c
  /\\tex\s+t/i,        // \tex t
  /\\\s*r\s*a\s*c/i,   // \ r a c
  /\\\s*e\s*x\s*t/i,   // \ e x t
  /\\frac(?!\s*\{)/,   // \frac の直後に { が無い
  /\\text(?!\s*\{)/,   // \text の直後に { が無い
];

const FUZZ_BASES = [
  '$ a \\frac{1}{2} b $',
  '$ \\text{abc} + \\log x + \\sin x $',
  '$ \\int e^x \\, dx $',
  '外の\\n改行と $ a \\frac 1 2 b $ の混在',
];

function corruptOnce(str: string): string {
  let s = str;
  // いくつかの軽度な壊し方をランダム適用
  const ops = [
    // コマンド名に空白を挿入
    () => s = s.replace(/\\(frac|text|log|sin|cos|int)/, (_m, g1) => '\\' + g1.split('').join(' ')),
    // \frac の引数の括弧を外す
    () => s = s.replace(/\\frac\{([^{}]+)\}\{([^{}]+)\}/, '\\frac $1 $2'),
    // \text の中に余白
    () => s = s.replace(/\\text\{([^{}]+)\}/, (_m, g1) => `\\text{  ${g1}  }`),
    // 数式外に全角スペース
    () => s = s + '\u3000',
  ];
  ops.forEach(fn => { if (Math.random() < 0.5) fn(); });
  return s;
}

function fuzz(n = 1000) {
  let violations = 0;
  for (let i = 0; i < n; i++) {
    const base = FUZZ_BASES[i % FUZZ_BASES.length];
    const mutated = corruptOnce(base);
    const got = sanitizeTex(mutated);
    for (const re of BAN_PATTERNS) {
      if (re.test(got)) {
        violations++;
        // 1件だけログ
        console.error('Fuzz violation example:\n  in :', mutated, '\n  got:', got, '\n  re :', re, '\n');
        break;
      }
    }
  }
  return { total: n, violations };
}

// ============ 実行 ============
let pass = 0;
for (const c of cases) {
  const ok = c.out
    ? assertEq(c.name, c.in, c.out)
    : assertOk(c.name, c.in, c.assert!, c.name);
  if (ok) pass++;
}

for (const c of softCases) {
  const ok = assertOk(c.name, c.in, c.assert!);
  if (ok) pass++;
}

const total = cases.length + softCases.length;
const { total: fTotal, violations } = fuzz(500); // fuzz 件数は適宜増減

console.log(`\n${pass}/${total} deterministic cases passed`);
console.log(`fuzz: ${fTotal} tried, violations: ${violations}`);
if (pass !== total || violations > 0) process.exit(1);
