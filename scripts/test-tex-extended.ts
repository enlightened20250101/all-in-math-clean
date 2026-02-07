// scripts/test-tex-extended.ts
// 目的: sanitizeTex をより広く検証（演算/記号/環境/日本語/ファズ/冪等性）
import { sanitizeTex } from '../src/lib/tex';

// ユーティリティ
function eq(name: string, input: string, expected: string) {
  const got = sanitizeTex(input);
  if (got !== expected) {
    console.error(`✗ ${name}\n  in : ${input}\n  got: ${got}\n  exp: ${expected}\n`);
    return false;
  }
  return true;
}
function ok(name: string, input: string, pred: (got: string) => boolean, tip?: string) {
  const got = sanitizeTex(input);
  const pass = pred(got);
  if (!pass) {
    console.error(`✗ ${name}\n  in : ${input}\n  got: ${got}\n  tip: ${tip ?? ''}\n`);
  }
  return pass;
}

// ======================================================
// 1) 決め打ちケース（追加）
// ======================================================
let pass = 0;
const hardCases: Array<[string, string, string]> = [
  // --- 関数系と境界 ---
  ['short_funcs_with_var', '$ \\sinx + \\cosx + \\tanx $', '$ \\sin x + \\cos x + \\tan x $'],
  ['log_ln_exp', '$ \\logx + \\lnx + \\expx $', '$ \\log x + \\ln x + \\exp x $'],
  ['lim_to_arrow', '$ \\lim_{x \\to 0} \\frac{\\sin x}{x} $', '$ \\lim_{x \\to 0} \\frac{\\sin x}{x} $'],

  // --- 関係・不等号 ---
  ['relations', '$ a \\ l e b,\\ a \\ g e b,\\ a \\ n e q b $'.replace(/\\ /g,'\\'),
                 '$ a \\le b,\\ a \\ge b,\\ a \\neq b $'],

  // --- ギリシャ文字の崩れ ---
  ['greek_split', '$ \\ a l p h a + \\ b e t a + \\ g a m m a $'.replace(/\\ /g,'\\'),
                  '$ \\alpha + \\beta + \\gamma $'],

  // --- mathbb/mathrm（字間崩れだけ補正; sanitizeTex は {} を付けないポリシー） ---
  ['mathbb_gap', '$ \\ m a t h b b{R} \\times \\ m a t h b b {N} $'.replace(/\\ /g,'\\'),
                 '$ \\mathbb{R} \\times \\mathbb{N} $'],
  ['mathrm_gap', '$ \\ m a t h r m {d}x $'.replace(/\\ /g,'\\'),
                 '$ \\mathrm{d}x $'],

  // --- 演算子と区切り ---
  ['operators', '$ a \\cdot b + a \\times b $', '$ a \\cdot b + a \\times b $'],
  ['spaced_commas', '$ f(x\\ ,\\ y\\ ;\\ z) $', '$ f(x\\, y\\; z) $'],

  // --- left/right と括弧の整合 ---
  ['left_right_good', '$ \\left( a + b \\right ) $', '$ \\left( a + b \\right ) $'],
  ['left_right_dirty', '$ \\ le f t\\{ a + b \\}\\ r i g h t\\} $'.replace(/\\ /g,'\\'),
   '$ \\left\\{ a + b \\right\\} $'],

  // --- sqrt / binom の崩れ（字間） ---
  ['sqrt_split', '$ \\ s q r t{1 + x^2} $'.replace(/\\ /g,'\\'), '$ \\sqrt{1 + x^2} $'],
  ['binom_split', '$ \\ b i n o m{n}{k} $'.replace(/\\ /g,'\\'), '$ \\binom{n}{k} $'],

  // --- 制御語+{ の分裂 ---
  ['tex_t_brace', '$ \\tex t{abc} $', '$ \\text{abc} $'],
  ['frac_c_brace', '$ \\fra c{1}{2} $', '$ \\frac{1}{2} $'],

  // --- 日本語混在 ---
  ['japanese_mix_inline', '次に $ \\ s i n x $ を計算する。'.replace(/\\ /g,'\\'),
   '次に $ \\sin x $ を計算する。'],
  ['japanese_newline', 'ここで\\n$ \\frac 1 2 $を用いる。', 'ここで\n$ \\frac{1}{2} $を用いる。'],

  // --- display 切替（\[ \] は内側にスペース） ---
  ['paren_to_dollar_trim', '\\(  a + b  \\)', '$a + b$'],
  ['bracket_to_dollar_space', '\\[  a + b  \\]', '$$ a + b $$'],

  // --- 環境（cases/pmatrix）: sanitizer は壊さないこと
  ['env_cases', String.raw`\begin{cases} x+1,& x\ge0\\ x-1,& x<0\end{cases}`, String.raw`\begin{cases} x+1,& x\ge0\\ x-1,& x<0\end{cases}`],
  ['env_pmatrix', String.raw`$\begin{pmatrix}1&2\\3&4\end{pmatrix}$`, String.raw`$\begin{pmatrix}1&2\\3&4\end{pmatrix}$`],

    // 1) operatorname・長い演算子
  ['opname_spaced', '$ \\ o p e r a t o r n a m e {argmin}_{x\\in X} f(x) $'.replace(/\\ /g,'\\'),
                     '$ \\operatorname{argmin}_{x\\in X} f(x) $'],
  ['mathrm_spec',   '$ \\ m a t h r m{Spec}(A) $'.replace(/\\ /g,'\\'), '$ \\mathrm{Spec}(A) $'],
  ['rank_op',       '$ \\ o p e r a t o r n a m e {rank} A $'.replace(/\\ /g,'\\'),
                     '$ \\operatorname{rank} A $'],

  // 2) 大きい演算子と上下限
  ['sum_limits',    '$ \\ s u m _ {i=1} ^ n i $'.replace(/\\ /g,'\\'), '$ \\sum_{i=1}^n i $'],
  ['lim_right',     '$ \\ l i m _{x \\ t o 0 ^ +} f(x) $'.replace(/\\ /g,'\\'),
                     '$ \\lim_{x \\to 0^+} f(x) $'],
  ['int_infty',     '$ \\ i n t _ 0 ^ {\\ i n f t y} e^{-x} \\, \\ m a t h r m{d}x $'.replace(/\\ /g,'\\'),
                     '$ \\int_0^{\\infty} e^{-x} \\, \\mathrm{d}x $'],

  // 3) 高度な括弧・ブラケット
  ['angles',        '$ \\ l a n g l e v , w \\ r a n g l e $'.replace(/\\ /g,'\\'),
                     '$ \\langle v, w \\rangle $'],
  ['norms',         '$ \\ l V e r t x \\ r V e r t $'.replace(/\\ /g,'\\'), '$ \\lVert x \\rVert $'],
  ['floor_ceil',    '$ \\ l f l o o r x \\ r f l o o r , \\ l c e i l x \\ r c e i l $'.replace(/\\ /g,'\\'),
                     '$ \\lfloor x \\rfloor , \\lceil x \\rceil $'],
  ['left_dot_right','$ \\ l e f t . \\frac{d}{dx} \\ r i g h t | _ {x=0} $'.replace(/\\ /g,'\\'),
                     '$ \\left. \\frac{d}{dx} \\right|_{x=0} $'],

  // 4) ルート・二項係数（引数回収）
  ['sqrt_arg',      '$ \\ s q r t n $'.replace(/\\ /g,'\\'), '$ \\sqrt n $'], // ← \sqrt[n] もあるので brace 化は今回はしない
  ['binom_args',    '$ \\ b i n o m n k $'.replace(/\\ /g,'\\'), '$ \\binom n k $'], // brace化したい場合は sanitizer 拡張で

  // 5) アクセント系
  ['hats_bars',     '$ \\ h a t x + \\ b a r x + \\ v e c x $'.replace(/\\ /g,'\\'),
                     '$ \\hat x + \\bar x + \\vec x $'],
  ['overline',      '$ \\ o v e r l i n e {\\mathcal H} $'.replace(/\\ /g,'\\'),
                     '$ \\overline{\\mathcal H} $'],

  // 6) 環境（名前崩れ）
  ['aligned_env',   String.raw`\begin{a l i g n} x&=y\\ y&=z \end{a l i g n}`.replace(/ /g,''),
                     String.raw`\begin{align} x&=y\\ y&=z \end{align}`],

  // 7) ベクトル・微分
  ['nabla_div',     '$ \\ n a b l a \\cdot \\ b o l d s y m b o l {F} $'.replace(/\\ /g,'\\'),
                     '$ \\nabla \\cdot \\boldsymbol{F} $'],
  ['dx_spacing',    '$ \\int f(x) \\ m a t h r m d x $'.replace(/\\ /g,'\\'),
                     '$ \\int f(x) \\mathrm d x $'],

  // 8) 集合・論理
  ['set_logic',     '$ A \\ s u b s e t e q B,\\ x \\ i n A,\\ x \\ n o t i n B,\\ \\ f o r a l l x,\\ \\ e x i s t s y $'.replace(/\\ /g,'\\'),
                     '$ A \\subseteq B,\\ x \\in A,\\ x \\notin B,\\ \\forall x,\\ \\exists y $'],

  // 9) ブラ・ケット（物理）
  ['braket',        '$ \\ l a n g l e \\psi \\mid \\phi \\ r a n g l e $'.replace(/\\ /g,'\\'),
                     '$ \\langle \\psi \\mid \\phi \\rangle $']
];

// 実行（決め打ち）
for (const [name, input, expected] of hardCases) {
  if (eq(name, input, expected)) pass++;
}

// ======================================================
// 2) ソフトアサート（禁止パターン/不変条件）
// ======================================================
const softCases: Array<[string, string, (got: string) => boolean, string?]> = [
  ['no_fra_c', '$ \\fra c{1}{2} + \\tex t{abc} $', (g) => !/\\fra\s+c/i.test(g) && !/\\tex\s+t/i.test(g)],
  ['no_broken_frac_text', '$ \\frac 1 2 + \\text abc $', (g) => !/\\frac(?!\s*\{)/.test(g) && !/\\text(?!\s*\{)/.test(g)],
  ['odd_dollar_not_left', '奇数 $ a+b ', (g) => (g.match(/\$/g) || []).length % 2 === 0],
  // 単一 $…$ の内側スペースは保持（$ a … b $ → そのまま）
  ['keep_inner_spaces_inline', '$ a \\frac 1 2 b $', (g) => /^\$ a /.test(g) && / b \$?$/.test(g)],
];
for (const [name, input, pred, tip] of softCases) {
  if (ok(name, input, pred, tip)) pass++;
}

const totalDet = hardCases.length + softCases.length;

// ======================================================
// 3) ファズ: 制御語の字間崩れ、\frac 括弧崩れ、\text 崩れ、日本語混入
// ======================================================
const BAN_PATTERNS: RegExp[] = [
  /\\fra\s+c/i,        // \fra c
  /\\tex\s+t/i,        // \tex t
  /\\\s*r\s*a\s*c/i,   // \ r a c
  /\\\s*e\s*x\s*t/i,   // \ e x t
  /\\frac(?!\s*\{)/,   // \frac の直後に { が無い
  /\\text(?!\s*\{)/,   // \text の直後に { が無い
];

const BASES = [
  '$ a \\frac{1}{2} b $',
  '$ \\text{alpha} + \\log x + \\sin x $',
  '次に $ \\int e^x \\, dx $ を用いる。',
  '外の\\n改行と $ a \\frac 1 2 b $ の混在',
  '$ \\left( x^2 + 1 \\right ) $',
  '$ \\binom{n}{k} + \\sqrt{1+x^2} $'
];

function glitch(s: string): string {
  let out = s;

  // 制御語に字間を入れる候補
  const broke = ['frac', 'text', 'sin', 'cos', 'tan', 'log', 'ln', 'exp', 'int', 'lim', 'sqrt', 'binom'];
  for (const k of broke) {
    if (Math.random() < 0.4) {
      out = out.replace(new RegExp('\\\\' + k + '\\b'), '\\' + k.split('').join(' '));
    }
  }

  // \frac の括弧崩し
  if (Math.random() < 0.4) {
    out = out.replace(/\\frac\{([^{}]+)\}\{([^{}]+)\}/, (_m, a, b) => `\\frac ${a} ${b}`);
  }

  // \text 内の余白増やす
  if (Math.random() < 0.4) {
    out = out.replace(/\\text\{([^{}]+)\}/, (_m, a) => `\\text{  ${a}  }`);
  }

  // 日本語の全角スペース混入
  if (Math.random() < 0.3) out += '\u3000';

  return out;
}

function fuzz(n = 800) {
  let violations = 0;
  for (let i = 0; i < n; i++) {
    const base = BASES[i % BASES.length];
    const mutated = glitch(base);
    const got = sanitizeTex(mutated);
    for (const re of BAN_PATTERNS) {
      if (re.test(got)) { violations++; break; }
    }
    // 冪等性チェック: sanitize(sanitize(x)) === sanitize(x)
    const again = sanitizeTex(got);
    if (again !== got) {
      violations++;
      console.error('Idempotence violation:\n in :', mutated, '\n got:', got, '\n again:', again, '\n');
      break;
    }
  }
  return violations;
}

const vio = fuzz(1000);

// ======================================================
// 4) 集計
// ======================================================
console.log(`\n${pass}/${totalDet} extended deterministic cases passed`);
console.log(`fuzz: 1000 tried, violations: ${vio}`);
if (pass !== totalDet || vio > 0) process.exit(1);
