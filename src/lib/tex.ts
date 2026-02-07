// src/lib/tex.ts
/**
 * LaTeX を安全側に正規化（数式内/外の前処理）。
 * - \ ext{ → \text{, \ rac → \frac 等の字間崩れ補正
 * - \(..\)/\[..\] を $..$ / $$ .. $$ に寄せる（KaTeX安定）
 * - $ の奇数個問題 → 先頭の $ を全角 $ に退避
 * - 数式外のみ \n 実改行・全角→半角・行末空白除去
 */
 export function sanitizeTex(s: string) {
  if (!s) return s;

  // 1) 代表的な崩れ（グローバル補正）
  let t = s
    .replace(/\r\n?/g, '\n')
    .replace(/\u0008egin\{/g, '\\begin{') // egin → \begin
    .replace(/\f/g, '\\')                  // \f → \
    // \ r a c / \ e x t を先に戻す
    .replace(/\\\s*r\s*a\s*c/gi, '\\frac')
    .replace(/\\\s*e\s*x\s*t/gi, '\\text')
    .replace(/\\\s*ext\{/g, '\\text{')
    // \ text → \text に圧縮
    .replace(/\\\s*text\b/g, '\\text');

  // 制御語＋{ の間の空白を除去（\mathbb {N} → \mathbb{N}, \mathrm {d} → \mathrm{d}）
  t = t.replace(/\\([A-Za-z]{2,})\s+(?=\{)/g, '\\$1');

  // \(..\) / \[..\] → $..$ / $$ .. $$
  // () は内側 trim、[] は両端に 1 空白
  t = t.replace(/\\\(([\s\S]*?)\\\)/g, (_, g1) => `$${g1.trim()}$`);
  t = t.replace(/\\\[(\s*[\s\S]*?\s*)\\\]/g, (_, g1) => `$$ ${g1.trim()} $$`);

  // 数式外でも \frac 引数を { } 化（緩やかに）
  t = t.replace(/\\frac\s+([0-9])\s*([0-9])(\b|[^0-9])/g, '\\frac{$1}{$2}$3')
       .replace(/\\frac\s+([^\s{}$+\-*/=()]+)\s+([^\s{}$+\-*/=()]+)\b/g, '\\frac{$1}{$2}')
       .replace(/\\frac\{\s*([^{}]*?)\s*\}\s+([^\s{}$+\-*/=()]+)/g, '\\frac{$1}{$2}')
       .replace(/\\frac\s+([^\s{}$+\-*/=()]+)\s*\{\s*([^{}]*?)\s*\}/g, '\\frac{$1}{$2}');

  // \text の内側トリム／単語を {} で包む
  t = t.replace(/\\text\{\s*([^{}]*?)\s*\}/g, '\\text{$1}')
       .replace(/\\text\s+([^\s{}$]+)/g, '\\text{$1}');

  // --- 2) 数式外/内を分割 ---
  const chunks: { text: string; math: boolean }[] = [];
  let i = 0;
  const L = t.length;
  while (i < L) {
    if (t[i] === '$') {
      const dbl = t.slice(i, i + 2) === '$$';
      const j = t.indexOf(dbl ? '$$' : '$', i + (dbl ? 2 : 1));
      if (j !== -1) { chunks.push({ text: t.slice(i, j + (dbl ? 2 : 1)), math: true }); i = j + (dbl ? 2 : 1); continue; }
    }
    const j = t.indexOf('$', i + 1);
    const end = j === -1 ? L : j;
    chunks.push({ text: t.slice(i, end), math: false }); i = end;
  }

  // 制御語の字間圧縮（\ t e x t → \text 等）
  const fixCommandGaps = (m: string) => m
    .replace(/\\(?:\s*[A-Za-z]){2,}/g, seg => '\\' + seg.replace(/\\|\s+/g, ''))
    .replace(/\\rac\b/g, '\\frac')
    .replace(/\\cdot\b/g, '\\cdot')
    .replace(/\\times\b/g, '\\times');

  // \frac 引数の復元（数式内）
  const normalizeFracArgs = (m: string) => m
    .replace(/\\frac\s+([0-9])\s*([0-9])(\b|[^0-9])/g, '\\frac{$1}{$2}$3')
    .replace(/\\frac\s+([^\s{}$+\-*/=()]+)\s+([^\s{}$+\-*/=()]+)\b/g, '\\frac{$1}{$2}')
    .replace(/\\frac\{\s*([^{}]*?)\s*\}\s+([^\s{}$+\-*/=()]+)/g, '\\frac{$1}{$2}')
    .replace(/\\frac\s+([^\s{}$+\-*/=()]+)\s*\{\s*([^{}]*?)\s*\}/g, '\\frac{$1}{$2}');

  const fixed = chunks.map(({ text, math }) => {
    if (!math) {
      // 数式外：\n 実改行・全角→半角・行末スペース除去
      return text.replace(/\\n/g, '\n').replace(/\u3000/g, ' ').replace(/[ \t]+\n/g, '\n');
    }

    // --- 数式内の補正 ---
    let m = text;

    // ① コマンド字間圧縮・既知 typo
    m = fixCommandGaps(m);

    // ①-1 角度・三角形の後ろが直結している場合はスペースを戻す
    m = m.replace(/\\angle(?=[A-Za-z])/g, '\\angle ')
         .replace(/\\triangle(?=[A-Za-z])/g, '\\triangle ');

    // ①-2 度数の Unicode 記号は TeX に寄せる
    m = m.replace(/∘/g, '^\\circ');

    // ① の直後に追記（念押しの再結合）
    m = m.replace(/\\\s*i\s*n\s*t\b/gi, '\\int')
     .replace(/\\\s*i\s*n\s*f\s*t\s*y/gi, '\\infty');

    // ② \frac 引数 { } 復元
    m = normalizeFracArgs(m);

    // ② の直後に:  _ と ^ の余分な空白を除去（\sum _ {i=1} ^ n → \sum_{i=1}^n）
    m = m.replace(/\s*_\s*/g, '_').replace(/\s*\^\s*/g, '^');

    // ③ まず \ , / \ ; を正規の \, / \; に（汎用ルールより前に！）
    m = m.replace(/\\\s*,/g, '\\,').replace(/\\\s*;/g, '\\;');

    // ③ の後に: \left . / \right | の「制御語+一文字」の間の空白を除去
    m = m.replace(/\\left\s+([.\|\(\)\{\}\[\]])/g, '\\left$1')   // \left ( → \left(
     .replace(/\\right\s*\|/g, '\\right|')                   // \right | → \right|
     .replace(/\\right\s*\./g, '\\right.')                   // \right . → \right.
     .replace(/\\right\s*([)\]\}])/g, '\\right $1');         // \right) → \right )

    // \left{ ... \}\right\} → \left{ ... \right\} （\right\} の直前だけ安全に削除）
    m = m.replace(/\\\}\s*\\right\}/g, '\\right\\}')
      .replace(/\}\s*\\right\}/g,    '\\right\\}');

    
    // 制御語＋{ の再結合（念押し）：\fra c{ → \frac{, \tex t{ → \text{, \mathbb {N} → \mathbb{N}）
    m = m.replace(/\\([A-Za-z]{2,})\s+([A-Za-z])(?=\s*\{)/g, '\\$1$2')
     .replace(/\\([A-Za-z]{2,})\s+(?=\{)/g, '\\$1');

    // ④ 関数・演算子の“変数くっつき”だけ空白を入れる（関係子は除外）
    m = m.replace(
      /\\(sin|cos|tan|cot|sec|csc|arcsin|arccos|arctan|log|ln|exp|lim|int|max|min|arg|det|dim|gcd|ker|Pr|cdot|times|sqrt|binom|hat|bar|vec|mathcal|mathbf|mathrm|mathbb|mathfrak|mathsf|mathtt|langle|rangle|lVert|rVert|lfloor|rfloor|lceil|rceil)(?=[A-Za-z0-9\\])/g,
      '\\$1 '
    );    

    // カンマの前の素の空白を削除（\, は温存）
    m = m.replace(/(?<!\\)\s+,/g, ',');
    // 閉じ区切りの直後のカンマにはスペースを戻す（\rfloor, → \rfloor ,）
    m = m.replace(/\\(rfloor|rceil|rangle),/g, '\\$1 ,');
    // カンマ直後がバックスラッシュならスペースを挿入（,\forall → ,\ \forall）
    m = m.replace(/,(?=\\(?!\s))/g, ',\\ ');

    // 単文字の制御語（\x, \y など）を素の文字に（前が空白/カンマ等に限定）
    m = m.replace(/(^|[,\s])\\\s*([A-Za-z])\b/g, '$1$2');


    // ⑤ 関係子は left/right には触れず、必要時のみ空白を追加（\in は infty を避ける）
    m = m.replace(/\\le(?!ft)(?=[A-Za-z0-9])/g, '\\le ')
     .replace(/\\ge(?=[A-Za-z0-9])/g, '\\ge ')
     .replace(/\\neq(?=[A-Za-z0-9])/g, '\\neq ')
     .replace(/\\in(?![ft])(?=[A-Za-z0-9\\])/g, '\\in ')
     .replace(/\\notin(?=[A-Za-z0-9\\])/g, '\\notin ')
     .replace(/\\(subseteq|supseteq|forall|exists)(?=[A-Za-z0-9\\])/g, '\\$1 ');

    // ⑤-1 集合/論理演算子の直結を防ぐ（\cupB, \RightarrowQ, \midx など）
    m = m.replace(
      /\\(cup|cap|setminus|Rightarrow|Leftarrow|Leftrightarrow|mid|to|neg)(?=[A-Za-z0-9\\])/g,
      '\\$1 '
    );

    // ⑥' 句読点の直後に '\a' が残っている場合は「バックスラッシュを保持」して空白を挿入（',\a' → ',\ a'）
    m = m.replace(/([,;])\\([A-Za-z])\b/g, '$1\\ $2');

    // ⑥'' \left / \right に二重バックスラッシュが残っていたら 1 個に正規化（"\\right" → "\right"）
    m = m.replace(/\\\\(left|right)/g, '\\$1');

    // 英字の前にだけ現れる重複バックスラッシュは単一に（\\forall → \forall）
    m = m.replace(/\\\\([A-Za-z])/g, '\\$1');
    

    // ⑦ \, / \; の直後が「\ <空白> 文字」なら通常の空白へ（\,\ y → \, y）
    m = m.replace(/\\,\\\s*([^\s\\])/g, '\\, $1')
         .replace(/\\;\\\s*([^\s\\])/g, '\\; $1');

    // ⑦ の前後どちらでもOK：\, の直後が英数字なら 1 スペース
    m = m.replace(/\\,(?=[A-Za-z0-9])/g, '\\, ');
    
    // ⑦ 群（\, / \;の処理）の前後のどこかに追記
    m = m.replace(/\\mathrm\s*d(?=\s*[A-Za-z])/g, '\\mathrm d ');

    // \binom nk → \binom n k（2つの単文字なら間にスペースを入れる）
    m = m.replace(/\\binom\s+([A-Za-z])([A-Za-z])\b/g, '\\binom $1 $2');

    // ⑧ 余計な閉じ括弧が \right の直前にある場合を除去（… ) \right ) → … \right )
    m = m.replace(/\)\s*\\right/g, '\\right')
         .replace(/\]\s*\\right/g, '\\right');

    // ⑨ 既存コマンドの空白揺れを正規化
    m = m.replace(/\\\s*frac/g, '\\frac')
         .replace(/\\\s*cdot/g, '\\cdot')
         .replace(/\\\s*times/g, '\\times');

    // ⑩ \, や \; が \  , のように分断されていたら復元
    m = m.replace(/\\\s*[,;]/g, x => x.replace(/\s+/g, ''));

    // ⑪ \text の後が単語 → \text{単語}、および内側トリム
    m = m.replace(/\\text\s+([^\s{}$]+)/g, '\\text{$1}')
         .replace(/\\text\{\s*([^{}]*?)\s*\}/g, '\\text{$1}');

    // ⑫ 最終：\left / \right の二重バックスラッシュを単一に正規化
    m = m.replace(/\\\\(left|right)/g, '\\$1');

    // 最終ガード：\left{ ... \}\right\}（\ の有無、\ の後の空白、\right と \} の間の空白も許容）
    m = m.replace(/(?:\\\s*)?\}\s*\\right\s*\\\s*\}/g, '\\right\\}');

    // ※ 単一 $…$ の内側スペースは保持（$ a … b $ を維持）
    return m;
  }).join('');

  let beaut = fixed
  .replace(/\\begin\{align\}(\S)/g, '\\begin{align} $1')
  .replace(/(\S)\\end\{align\}/g, '$1 \\end{align}')
  // ★ 追加：align 環境の中だけ、"\\<非空白>" を "\\ <非空白>" に
  .replace(/(\\begin\{align\}[\s\S]*?\\end\{align\})/g, (seg) =>
    seg.replace(/\\\\(?!\s|\\)/g, '\\\\ ')
  );

  // beaut の最終ガード（全体にもう一度）
  beaut = beaut.replace(/(?:\\\s*)?\}\s*\\right\s*\\\s*\}/g, '\\right\\}');

  const dollars = (beaut.match(/\$/g) || []).length;
  if (dollars % 2 !== 0) return beaut.replace('$', '\uFF04');
  return beaut.replace(/[ \t]+$/, '');
}

/** 数式外だけ transformer を適用 */
export function transformOutsideMath(s: string, transformer: (t: string) => string) {
  if (!s) return s;
  const out: { text: string; math: boolean }[] = [];
  let i = 0;
  const L = s.length;
  while (i < L) {
    if (s[i] === '$') {
      const dbl = s.slice(i, i + 2) === '$$';
      const j = s.indexOf(dbl ? '$$' : '$', i + (dbl ? 2 : 1));
      if (j !== -1) { out.push({ text: s.slice(i, j + (dbl ? 2 : 1)), math: true }); i = j + (dbl ? 2 : 1); continue; }
    }
    const j = s.indexOf('$', i + 1);
    const end = j === -1 ? L : j;
    out.push({ text: s.slice(i, end), math: false }); i = end;
  }
  return out.map(seg => seg.math ? seg.text : transformer(seg.text)).join('');
}

/** 任意のオブジェクト中の全テキストフィールドへ sanitizeTex を再帰適用 */
export function deepSanitizeTex<T>(obj: T): T {
  if (obj == null) return obj;
  if (typeof obj === 'string') return sanitizeTex(obj) as any;
  if (Array.isArray(obj)) return obj.map(deepSanitizeTex) as any;
  if (typeof obj === 'object') {
    const out: any = {};
    for (const [k, v] of Object.entries(obj)) out[k] = deepSanitizeTex(v as any);
    return out;
  }
  return obj;
}
