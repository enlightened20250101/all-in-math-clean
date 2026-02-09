// src/lib/course/writeupProblems.ts
import type { TopicId } from "./topics";

export type WriteupProblem = {
  id: string;
  topicId?: TopicId;
  title: string;
  statement: string;
  rubric: string[];
  rubricKeywords?: string[][];
  rubricWeights?: number[];
  solution: string;
  level?: 1 | 2 | 3;
};

const DEFAULT_RUBRIC = [
  "方針の提示（何を使うか）",
  "主要式の立式",
  "結論の明示",
];

export const WRITEUP_PROBLEMS: WriteupProblem[] = [
  {
    id: "writeup_quad_vertex_1",
    topicId: "quad_graph_basic",
    title: "二次関数の頂点",
    statement: "二次関数 $y=ax^2+bx+c$ の頂点の座標を求めよ（$a\\neq 0$）。",
    rubric: [
      "平方完成を使う方針が書けている",
      "軸 $x=-\\frac{b}{2a}$ を導いている",
      "頂点 $( -\\frac{b}{2a}, -\\frac{b^2-4ac}{4a})$ を結論として示している",
    ],
    rubricKeywords: [[], ["x=-\\\\frac{b}{2a}", "frac", "2a"], ["( -\\\\frac{b}{2a}, -\\\\frac{b^2-4ac}{4a})", "頂点", "frac", "2a"]],
    solution:
      "平方完成して $y=a\\left(x+\\frac{b}{2a}\\right)^2-\\frac{b^2-4ac}{4a}$ より、頂点は $\\left(-\\frac{b}{2a},-\\frac{b^2-4ac}{4a}\\right)$。",
    level: 1,
  },
  {
    id: "writeup_quad_axis_1",
    topicId: "quad_graph_basic",
    title: "二次関数の軸",
    statement: "二次関数 $y=ax^2+bx+c$ の軸の求め方を説明せよ。",
    rubric: [
      "平方完成または頂点の $x$ 座標を使うと述べている",
      "軸が $x=-\\frac{b}{2a}$ と示している",
      "理由を簡潔に書けている",
    ],
    rubricKeywords: [["x", "平方完成または頂点の"], ["x=-\\\\frac{b}{2a}", "軸が", "frac", "2a"], []],
    solution:
      "平方完成で $y=a\\left(x+\\frac{b}{2a}\\right)^2+\\cdots$ と書けるので、軸は $x=-\\frac{b}{2a}$。",
    level: 1,
  },
  {
    id: "writeup_quad_inequality_1",
    topicId: "quad_inequality_basic",
    title: "二次不等式の解法",
    statement: "二次不等式 $ax^2+bx+c\\ge 0$ の解の範囲の求め方を説明せよ。",
    rubric: [
      "判別式で実数解の有無を確認する",
      "因数分解または軸とグラフの形で符号を判断する",
      "係数 $a$ の符号による場合分けが書けている",
    ],
    rubricKeywords: [[], ["因数分解または軸とグラフの形で符号を判断する"], ["a", "係数"]],
    solution:
      "判別式で実数解の有無を確認し、実数解があれば因数分解または放物線の形から符号を調べる。$a>0$ のとき外側、$a<0$ のとき内側が解になる。",
    level: 2,
  },
  {
    id: "writeup_trig_sine_cosine_law_1",
    topicId: "geo_sine_cosine_law_basic",
    title: "正弦定理・余弦定理の使い分け",
    statement: "三角形の辺・角を求めるとき、正弦定理と余弦定理の使い分けを説明せよ。",
    rubric: [
      "正弦定理は1辺と向かい合う角が分かると使える",
      "余弦定理は2辺とその間の角、または3辺が分かると使える",
      "目的の量（辺 or 角）に応じて選ぶ方針が書けている",
    ],
    rubricKeywords: [["正弦定理は1辺と向かい合う角が分かると使える"], ["余弦定理は2辺とその間の角", "または3辺が分かると使える"], ["目的の量", "or"]],
    solution:
      "正弦定理は1辺と向かい角が既知なら使える。余弦定理は2辺とその間の角、または3辺が既知なら使える。求めたい量に合わせて適用する。",
    level: 1,
  },
  {
    id: "writeup_comb_rule_1",
    topicId: "combi_basic",
    title: "和と積の法則",
    statement: "場合の数の計算で「和の法則」と「積の法則」を説明せよ。",
    rubric: [
      "和の法則は互いに重ならない場合の合計",
      "積の法則は順に選ぶ場合の積",
      "具体例または簡単な式で説明している",
    ],
    rubricKeywords: [[], [], []],
    solution:
      "和の法則は排反な場合の合計数を足す。積の法則は順番に選ぶ操作の総数を掛け合わせる。",
    level: 1,
  },
  {
    id: "writeup_probability_1",
    topicId: "prob_basic",
    title: "確率の基本",
    statement: "確率の基本式 $P=\\frac{\\text{有利な場合}}{\\text{起こりうる場合}}$ を説明し、注意点を述べよ。",
    rubric: [
      "起こりうる場合が同様に確からしいことに触れている",
      "有利な場合と全体の場合を対応させている",
      "具体例または簡単な補足がある",
    ],
    rubricKeywords: [[], [], ["具体例または簡単な補足がある"]],
    solution:
      "全ての結果が同様に確からしいとき、確率は「有利な場合の数 / 全体の数」で定義する。",
    level: 1,
  },
  {
    id: "writeup_probability_sample_1",
    topicId: "prob_basic",
    title: "確率の標本空間",
    statement: "標本空間と事象の関係を説明せよ。",
    rubric: [
      "標本空間が起こりうる全結果の集合であることを述べている",
      "事象が標本空間の部分集合であることを述べている",
      "確率の計算が集合として捉えられることに触れている",
    ],
    rubricKeywords: [[], [], []],
    solution:
      "標本空間は起こりうる全結果の集合で、事象はその部分集合。確率は部分集合の大きさの比として考える。",
    level: 1,
  },
    {
    id: "writeup_exp_log_1",
    topicId: "exp_log_basic",
    title: "指数・対数の関係",
    statement:
      "$\log_a b = c$ を満たすとき、$a$ と $b$ の関係を用いて $b$ を指数で表し、数値例 $a=2,\ c=3$ のときの $b$ を求めよ。途中式を簡潔に示せ。",
    rubric: [
      "対数の定義から $b=a^c$ を導いている",
      "数値例で $b=2^3=8$ を計算している",
      "途中式と結論が簡潔に書けている",
    ],
    rubricKeywords: [["b=a^c", "対数の定義から"], ["b=2^3=8", "数値例で"], []],
    solution:
      "$\log_a b=c$ なら対数の定義より $b=a^c$。例として $a=2, c=3$ なら $b=2^3=8$。",
    level: 1,
  },
    {
    id: "writeup_trig_identity_1",
    topicId: "trig_identities_basic",
    title: "三角恒等式の利用",
    statement:
      "$\sin^2\theta+\cos^2\theta=1$ を用いて、$\sin^2\theta$ を $\cos\theta$ だけの式に変形せよ。途中式を示せ。",
    rubric: [
      "$\sin^2\theta=1-\cos^2\theta$ と変形している",
      "恒等式を使った置換であることが分かる",
      "結論が簡潔に書けている",
    ],
    rubricKeywords: [["\\sin^2\\theta=1-\\cos^2\\theta", "sin", "theta", "cos"], [], []],
    solution:
      "$\sin^2\theta+\cos^2\theta=1$ より $\sin^2\theta=1-\cos^2\theta$。",
    level: 1,
  },
    {
    id: "writeup_vector_inner_1",
    topicId: "vector_inner_basic",
    title: "内積と直交",
    statement:
      "ベクトル $\vec{a}=(1,2)$, $\vec{b}=(2,-1)$ について内積を計算し、直交しているか判定せよ。途中式を示せ。",
    rubric: [
      "内積 $1\cdot2+2\cdot(-1)$ を計算している",
      "内積が0かどうかで直交判定している",
      "結論が簡潔に書けている",
    ],
    rubricKeywords: [["1\\cdot2+2\\cdot(-1)", "内積", "cdot2", "cdot"], ["内積が0かどうかで直交判定している"], []],
    solution:
      "$\vec{a}\cdot\vec{b}=1\cdot2+2\cdot(-1)=0$ より直交。",
    level: 1,
  },
  {
    id: "writeup_stats_mean_1",
    topicId: "stats_sample_mean_basic",
    title: "標本平均の意味",
    statement: "標本平均の意味と、母平均との関係を説明せよ。",
    rubric: [
      "標本平均はデータの平均であると述べている",
      "標本平均の期待値が母平均に等しいことに触れている",
      "標本サイズが増えると安定する旨を述べている",
    ],
    rubricKeywords: [["標本平均はデ"], [], []],
    solution:
      "標本平均は観測データの平均で、期待値は母平均に一致する。標本数が増えると平均のばらつきは小さくなる。",
    level: 1,
  },
  {
    id: "writeup_integral_meaning_1",
    topicId: "calc_integral_basic",
    title: "定積分の意味",
    statement: "定積分の意味を、面積との関係を含めて説明せよ。",
    rubric: [
      "区間での累積量として説明している",
      "面積（符号付き）との関係に触れている",
      "積分と微分の関係に触れていると良い",
    ],
    rubricKeywords: [[], ["面積", "符号付き"], []],
    solution:
      "定積分は区間での累積量を表し、関数が正なら面積に一致する。微分の逆操作としても理解できる。",
    level: 1,
  },
  {
    id: "writeup_sequence_sum_1",
    topicId: "seq_arithmetic_sum_basic",
    title: "等差数列の和の導出",
    statement: "等差数列 $a_1, a_2, \\dots, a_n$ の和の公式をどのように導くか説明せよ。",
    rubric: [
      "首項と末項を組にする考えを示している",
      "対になる和が等しいことを述べている",
      "最終式 $S_n=\\frac{n(a_1+a_n)}{2}$ を結論として示している",
    ],
    rubricKeywords: [[], [], ["S_n=\\\\frac{n(a_1+a_n)}{2}", "frac"]],
    solution:
      "逆順に並べて加えると各組が $a_1+a_n$ となるので $2S_n=n(a_1+a_n)$、よって $S_n=\\frac{n(a_1+a_n)}{2}$。",
    level: 2,
  },
  {
    id: "writeup_sequence_sum_2",
    topicId: "seq_arithmetic_sum_basic",
    title: "等差数列の和の利用",
    statement: "等差数列の和の公式が何に使えるか説明せよ。",
    rubric: [
      "多数の項の合計を効率的に計算できると述べている",
      "初項・末項・項数を使うことを述べている",
    ],
    rubricKeywords: [[], ["初項", "末項"]],
    solution:
      "項数が多い合計を一度に計算できる。初項・末項・項数を使って $S_n=\\frac{n(a_1+a_n)}{2}$ を用いる。",
    level: 1,
  },
  {
    id: "writeup_log_equation_1",
    topicId: "exp_log_equations_basic",
    title: "対数方程式の注意",
    statement: "対数方程式を解くときの注意点を説明せよ。",
    rubric: [
      "真数条件（$>0$）に触れている",
      "底の条件（$>0, \\neq 1$）に触れている",
      "解の候補を条件で確認することを述べている",
    ],
    rubricKeywords: [[">0"], [">0, \\\\neq 1", "neq"], []],
    solution:
      "対数は真数が正、底は正かつ1でない。方程式の解を得たら必ず条件に代入して確認する。",
    level: 2,
  },
  {
    id: "writeup_log_equation_2",
    topicId: "exp_log_equations_basic",
    title: "対数方程式の流れ",
    statement: "対数方程式を解くときの一般的な流れを説明せよ。",
    rubric: [
      "定義域の条件を先に確認することを述べている",
      "指数に直して解くと述べている",
      "解の確認を述べている",
    ],
    rubricKeywords: [[], [], []],
    solution:
      "まず真数条件を確認し、対数を指数に直して解く。得られた解が条件を満たすか確認する。",
    level: 2,
  },
  {
    id: "writeup_trig_period_1",
    topicId: "trig_period_basic",
    title: "周期とグラフ",
    statement: "三角関数の周期がグラフにどう影響するか説明せよ。",
    rubric: [
      "周期は同じ形が繰り返される間隔と説明している",
      "一般形 $y=\\sin(kx)$ などの周期が $2\\pi/k$ であると述べている",
      "グラフの圧縮・伸長に触れている",
    ],
    rubricKeywords: [[], ["y=\\\\sin(kx)", "2\\\\pi/k", "一般形", "sin"], ["グラフの圧縮"]],
    solution:
      "周期は同じ形が繰り返される間隔。$y=\\sin(kx)$ の周期は $2\\pi/k$ で、$k$ が大きいほど横に圧縮される。",
    level: 2,
  },
  {
    id: "writeup_trig_period_2",
    topicId: "trig_period_basic",
    title: "周期の読み取り",
    statement: "グラフから周期を読み取る方法を説明せよ。",
    rubric: [
      "同じ形が繰り返される区間を測ることを述べている",
      "ピーク間距離など具体的に述べている",
    ],
    rubricKeywords: [[], []],
    solution:
      "グラフの同じ形が繰り返される区間の長さを測る。例えば隣り合う最大値の間隔が周期。",
    level: 1,
  },
  {
    id: "writeup_stats_ci_1",
    topicId: "stats_confidence_interval_basic",
    title: "信頼区間の幅",
    statement: "信頼区間の幅が標準誤差や信頼係数とどう関係するか説明せよ。",
    rubric: [
      "幅が $z\\cdot\\mathrm{SE}$ に比例することを述べている",
      "標準誤差が $\\sigma/\\sqrt{n}$ に依存することを述べている",
      "信頼係数が大きいほど幅が広がると説明している",
    ],
    rubricKeywords: [["z\\\\cdot\\\\mathrm{SE}", "幅が", "cdot", "mathrm"], ["\\\\sigma/\\\\sqrt{n}", "標準誤差が", "sigma", "sqrt"], []],
    solution:
      "幅は $z\\cdot\\mathrm{SE}$ に比例し、$\\mathrm{SE}=\\sigma/\\sqrt{n}$。信頼係数が高いほど $z$ が大きく、幅が広がる。",
    level: 2,
  },
  {
    id: "writeup_stats_ci_2",
    topicId: "stats_confidence_interval_basic",
    title: "信頼区間の解釈",
    statement: "信頼区間の「95%」の意味を説明せよ。",
    rubric: [
      "同じ手続きを繰り返すと95%の区間が母平均を含むと述べている",
      "1回の区間が95%で正しいという意味ではないと述べている",
      "確率の解釈に触れている",
    ],
    rubricKeywords: [["同じ手続きを繰り返すと95"], ["1回の区間が95"], []],
    solution:
      "95%信頼区間とは、同じ方法で作った区間の95%が母平均を含むという意味で、1回の区間に95%の確率があるという意味ではない。",
    level: 2,
  },
  {
    id: "writeup_vector_projection_1",
    topicId: "vector_projection_basic",
    title: "射影の意味",
    statement: "ベクトルの射影の意味を説明せよ。",
    rubric: [
      "片方の方向成分を取り出すことを述べている",
      "内積を使った表式に触れている",
      "長さや符号付き距離として説明している",
    ],
    rubricKeywords: [[], [], []],
    solution:
      "射影はある方向に沿った成分を取り出す操作。$\\mathrm{proj}_{\\vec{b}}\\vec{a} = \\frac{\\vec{a}\\cdot\\vec{b}}{|\\vec{b}|^2}\\vec{b}$ のように内積で表せる。",
    level: 2,
  },
  {
    id: "writeup_vector_projection_2",
    topicId: "vector_projection_basic",
    title: "射影と長さ",
    statement: "射影の長さが内積で求まる理由を説明せよ。",
    rubric: [
      "内積が成分の大きさを表すと述べている",
      "$\\frac{\\vec{a}\\cdot\\vec{b}}{|\\vec{b}|}$ の形に触れている",
      "符号付き距離であることに触れている",
    ],
    rubricKeywords: [[], ["\\\\frac{\\\\vec{a}\\\\cdot\\\\vec{b}}{|\\\\vec{b}|}", "frac", "vec", "cdot"], []],
    solution:
      "内積は $|\\vec{a}||\\vec{b}|\\cos\\theta$ で、$\\vec{b}$ 方向の成分は $|\\vec{a}|\\cos\\theta$。よって長さは $\\frac{\\vec{a}\\cdot\\vec{b}}{|\\vec{b}|}$。",
    level: 2,
  },
  {
    id: "writeup_complex_modulus_1",
    topicId: "complex_modulus_basic",
    title: "複素数の絶対値",
    statement: "複素数 $z=a+bi$ の絶対値 $|z|$ の意味を説明せよ。",
    rubric: [
      "複素平面上の距離として説明している",
      "$|z|=\\sqrt{a^2+b^2}$ を示している",
      "原点からの距離であることを述べている",
    ],
    rubricKeywords: [[], ["|z|=\\\\sqrt{a^2+b^2}", "sqrt"], []],
    solution:
      "複素数 $a+bi$ を点 $(a,b)$ とみなすと、原点からの距離なので $|z|=\\sqrt{a^2+b^2}$。",
    level: 1,
  },
  {
    id: "writeup_complex_modulus_2",
    topicId: "complex_modulus_basic",
    title: "絶対値の性質",
    statement: "複素数の絶対値の性質を一つ述べ、簡単に説明せよ。",
    rubric: [
      "$|zw|=|z||w|$ などの性質を述べている",
      "性質の意味を短く説明している",
    ],
    rubricKeywords: [["|zw|=|z||w|", "zw"], []],
    solution:
      "例えば $|zw|=|z||w|$。複素数の大きさは積で掛け合わさるため、長さの性質が保たれる。",
    level: 2,
  },
  {
    id: "writeup_coord_distance_1",
    topicId: "coord_distance_point_line_basic",
    title: "点と直線の距離",
    statement: "点と直線の距離の公式の考え方を説明せよ。",
    rubric: [
      "点から直線への垂線距離であることを述べている",
      "一般形 $Ax+By+C=0$ を用いることを示している",
      "距離 $\\frac{|Ax_0+By_0+C|}{\\sqrt{A^2+B^2}}$ を結論として示している",
    ],
    rubricKeywords: [[], ["Ax+By+C=0", "一般形", "Ax", "By"], ["\\\\frac{|Ax_0+By_0+C|}{\\\\sqrt{A^2+B^2}}", "距離", "frac", "Ax"]],
    solution:
      "直線 $Ax+By+C=0$ と点 $(x_0,y_0)$ の距離は垂線距離で、法線ベクトルを使って $\\frac{|Ax_0+By_0+C|}{\\sqrt{A^2+B^2}}$ と表せる。",
    level: 2,
  },
  {
    id: "writeup_coord_distance_2",
    topicId: "coord_distance_point_line_basic",
    title: "距離公式の由来",
    statement: "点と直線の距離公式が「垂線距離」から出ることを説明せよ。",
    rubric: [
      "垂線を下ろす考え方を述べている",
      "法線ベクトルに沿った成分で距離を表すことに触れている",
      "式の形に言及している",
    ],
    rubricKeywords: [[], [], []],
    solution:
      "点から直線に垂線を下ろし、法線ベクトル方向の成分として距離を表すことで公式が導かれる。",
    level: 2,
  },
  {
    id: "writeup_poly_factor_1",
    topicId: "poly_factor_k_basic",
    title: "因数定理の説明",
    statement: "因数定理を説明し、$x-\\alpha$ が因数となる条件を述べよ。",
    rubric: [
      "$f(\\alpha)=0$ と $x-\\alpha$ が因数であることの同値を述べている",
      "多項式の因数判定に使えることを述べている",
      "簡潔な条件としてまとめている",
    ],
    rubricKeywords: [["f(\\\\alpha)=0", "x-\\\\alpha", "alpha"], [], []],
    solution:
      "多項式 $f(x)$ に対して $f(\\alpha)=0$ であることと $x-\\alpha$ が因数であることは同値。因数の判定に用いる。",
    level: 2,
  },
  {
    id: "writeup_binomial_middle_1",
    topicId: "binomial_middle_coeff_basic",
    title: "二項定理と中央項",
    statement: "$(x+y)^n$ の中央項の意味と求め方を説明せよ。",
    rubric: [
      "二項定理で一般項 $\\binom{n}{k}x^{n-k}y^k$ を示している",
      "中央項の $k$ の値を偶奇で分けて述べている",
      "係数が $\\binom{n}{n/2}$ などになることを示している",
    ],
    rubricKeywords: [["\\\\binom{n}{k}x^{n-k}y^k", "二項定理で一般項", "binom"], ["k", "中央項の"], ["\\\\binom{n}{n/2}", "係数が", "binom"]],
    solution:
      "二項定理より一般項は $\\binom{n}{k}x^{n-k}y^k$。$n$ が偶数なら $k=n/2$ が中央項、係数は $\\binom{n}{n/2}$。",
    level: 2,
  },
  {
    id: "writeup_binomial_middle_2",
    topicId: "binomial_middle_coeff_basic",
    title: "中央項の個数",
    statement: "中央項が1つか2つかの条件を説明せよ。",
    rubric: [
      "$n$ の偶奇で中央項の数が決まることを述べている",
      "偶数なら1つ、奇数なら2つと述べている",
    ],
    rubricKeywords: [["n"], ["偶数なら1つ"]],
    solution:
      "$n$ が偶数なら中央項は1つ、$n$ が奇数なら中央項は2つになる。",
    level: 1,
  },
  {
    id: "writeup_identity_coeff_1",
    topicId: "identity_coefficient_basic",
    title: "恒等式の係数比較",
    statement: "恒等式を用いた係数比較の考え方を説明せよ。",
    rubric: [
      "恒等式は全ての $x$ で成り立つことを述べている",
      "同次の項ごとに係数を比較することを述べている",
      "未知数を連立で解く流れが書けている",
    ],
    rubricKeywords: [["x"], [], []],
    solution:
      "恒等式は全ての $x$ で成り立つため、同じ次数の係数を比較できる。係数の連立方程式を解いて未知数を求める。",
    level: 2,
  },
  {
    id: "writeup_prob_complement_1",
    topicId: "prob_complement_basic",
    title: "余事象の使い方",
    statement: "余事象を用いるときの考え方と利点を説明せよ。",
    rubric: [
      "求めたい事象の反対を考えることを述べている",
      "$P(A)=1-P(A^c)$ を明記している",
      "直接数えにくいときに有効であることを述べている",
    ],
    rubricKeywords: [[], ["P(A)=1-P(A^c)", "を明記している"], []],
    solution:
      "余事象 $A^c$ を考えると $P(A)=1-P(A^c)$。直接数えにくい場合でも簡単な方を数えて求められる。",
    level: 1,
  },
  {
    id: "writeup_prob_complement_2",
    topicId: "prob_complement_basic",
    title: "余事象の利点",
    statement: "余事象を使うとどのように計算が楽になるか説明せよ。",
    rubric: [
      "直接数えにくい場合の代替になると述べている",
      "補集合の方が数えやすいことを述べている",
    ],
    rubricKeywords: [[], []],
    solution:
      "求めたい事象が複雑でも、補集合の方が数えやすい場合が多い。$P(A)=1-P(A^c)$ を使って計算を簡単にできる。",
    level: 1,
  },
  {
    id: "writeup_trig_addition_1",
    topicId: "trig_addition_basic",
    title: "加法定理の使いどころ",
    statement: "加法定理を用いる場面を説明し、具体例を挙げよ。",
    rubric: [
      "角の和や差が現れるときに使うことを述べている",
      "具体的な式変形（例：$\\sin(75^\\circ)$）を挙げている",
      "三角関数の計算を簡単にできることを述べている",
    ],
    rubricKeywords: [[], ["\\\\sin(75^\\\\circ)", "sin", "75", "circ"], []],
    solution:
      "角の和差があるときに使い、例えば $\\sin(75^\\circ)=\\sin(45^\\circ+30^\\circ)$ として計算できる。",
    level: 2,
  },
  {
    id: "writeup_trig_addition_2",
    topicId: "trig_addition_basic",
    title: "加法定理と角度変換",
    statement: "加法定理が角度変換に役立つ理由を説明せよ。",
    rubric: [
      "和差を積に変えることを述べている",
      "未知角を既知角に分解できることを述べている",
    ],
    rubricKeywords: [[], []],
    solution:
      "加法定理で和差の角を既知角の組に分解でき、値が計算しやすくなる。",
    level: 1,
  },
  {
    id: "writeup_linear_ineq_1",
    topicId: "algebra_ineq_basic",
    title: "一次不等式の解き方",
    statement: "一次不等式の解き方を説明し、等号の向きが変わる場面を述べよ。",
    rubric: [
      "移項や整理の手順を説明している",
      "両辺に負の数を掛けると不等号が反転することを述べている",
      "解集合の書き方に触れている",
    ],
    rubricKeywords: [[], [], []],
    solution:
      "不等式を移項して整理する。両辺に負の数を掛けると不等号が反転するので注意する。解は区間で表す。",
    level: 1,
  },
  {
    id: "writeup_linear_ineq_2",
    topicId: "algebra_ineq_basic",
    title: "解集合の表し方",
    statement: "一次不等式の解集合の表し方を説明せよ。",
    rubric: [
      "区間や不等式で表すと述べている",
      "数直線で表せることに触れている",
    ],
    rubricKeywords: [[], []],
    solution:
      "一次不等式の解集合は $x\\ge a$ のように不等式で書くか、区間表示で表す。数直線で示すこともできる。",
    level: 1,
  },
  {
    id: "writeup_set_1",
    topicId: "set_operations_basic",
    title: "集合の補集合と全体集合",
    statement: "補集合と全体集合の関係を説明し、簡単な例を挙げよ。",
    rubric: [
      "補集合は全体集合から集合を除いたものと述べている",
      "記号 $A^c$ や $U$ を用いている",
      "例で具体的に示している",
    ],
    rubricKeywords: [[], ["A^c", "U", "記号", "を用いている"], []],
    solution:
      "補集合 $A^c$ は全体集合 $U$ から $A$ を除いた集合。例：$U=\\{1,2,3,4\\}, A=\\{1,2\\}$ なら $A^c=\\{3,4\\}$。",
    level: 1,
  },
  {
    id: "writeup_set_2",
    topicId: "set_operations_basic",
    title: "集合演算の意味",
    statement: "和集合・共通部分の意味を説明せよ。",
    rubric: [
      "和集合はどちらかに含まれると述べている",
      "共通部分は両方に含まれると述べている",
      "記号 $A\\cup B, A\\cap B$ を示している",
    ],
    rubricKeywords: [[], [], ["A\\\\cup B, A\\\\cap B", "記号", "cup", "cap"]],
    solution:
      "和集合 $A\\cup B$ はどちらかに含まれる要素、共通部分 $A\\cap B$ は両方に含まれる要素の集合。",
    level: 1,
  },
  {
    id: "writeup_identity_1",
    topicId: "identity_eval_basic",
    title: "恒等式と方程式の違い",
    statement: "恒等式と方程式の違いを説明せよ。",
    rubric: [
      "恒等式は全ての $x$ で成り立つと述べている",
      "方程式は特定の解で成り立つと述べている",
      "係数比較など恒等式の使い方に触れていると良い",
    ],
    rubricKeywords: [["x"], [], []],
    solution:
      "恒等式は任意の $x$ で成り立つ等式、方程式は特定の $x$（解）で成り立つ等式。恒等式では係数比較ができる。",
    level: 1,
  },
  {
    id: "writeup_identity_2",
    topicId: "identity_eval_basic",
    title: "恒等式の利用",
    statement: "恒等式を利用する目的を説明せよ。",
    rubric: [
      "式変形や整理のために使うと述べている",
      "係数比較や恒等変形に触れている",
    ],
    rubricKeywords: [[], []],
    solution:
      "恒等式は式変形や整理のために使う。係数比較や恒等変形の根拠として利用できる。",
    level: 1,
  },
  {
    id: "writeup_inequality_amgm_1",
    topicId: "inequality_amgm_basic",
    title: "相加相乗平均の使い方",
    statement: "相加相乗平均の不等式を用いる場面を説明せよ。",
    rubric: [
      "非負の数に対して $\\frac{x+y}{2}\\ge\\sqrt{xy}$ を述べている",
      "最小/最大値問題に使えることを説明している",
      "等号成立条件に触れている",
    ],
    rubricKeywords: [["\\\\frac{x+y}{2}\\\\ge\\\\sqrt{xy}", "非負の数に対して", "frac", "ge"], ["最小"], []],
    solution:
      "非負の数に対し $\\frac{x+y}{2}\\ge\\sqrt{xy}$。和が一定のとき積の最大、積が一定のとき和の最小などで使う。等号は $x=y$。",
    level: 2,
  },
  {
    id: "writeup_inequality_amgm_2",
    topicId: "inequality_amgm_basic",
    title: "等号成立条件",
    statement: "相加相乗平均の等号成立条件を説明せよ。",
    rubric: [
      "等号は $x=y$ のときに成り立つと述べている",
      "非負条件に触れている",
    ],
    rubricKeywords: [["x=y", "等号は"], []],
    solution:
      "相加相乗平均の等号は $x=y$ で成り立つ。非負の数が前提。",
    level: 1,
  },
  {
    id: "writeup_trig_double_1",
    topicId: "trig_double_angle_basic",
    title: "倍角公式の役割",
    statement: "倍角公式を用いる理由と効果を説明せよ。",
    rubric: [
      "$\\sin 2x, \\cos 2x$ を $\\sin x, \\cos x$ に戻せることを述べている",
      "角の変形や積分・方程式で役立つと述べている",
      "公式を具体的に示している",
    ],
    rubricKeywords: [["\\\\sin 2x, \\\\cos 2x", "\\\\sin x, \\\\cos x", "sin", "2x"], ["角の変形や積分"], []],
    solution:
      "倍角公式で $\\sin2x=2\\sin x\\cos x, \\cos2x=\\cos^2x-\\sin^2x$ などに変形でき、方程式や積分で次数を下げられる。",
    level: 2,
  },
  {
    id: "writeup_exp_log_domain_1",
    topicId: "exp_log_domain_basic",
    title: "対数の定義域",
    statement: "対数の定義域（真数条件）について説明せよ。",
    rubric: [
      "真数は正であることを述べている",
      "底は正かつ1でないことに触れている",
      "条件を満たすように解を確認することを述べている",
    ],
    rubricKeywords: [[], [], []],
    solution:
      "対数は真数が正、底は正かつ1でない必要がある。方程式の解は必ず条件を満たすか確認する。",
    level: 1,
  },
  {
    id: "writeup_coord_parallel_1",
    topicId: "coord_line_parallel_perp_basic",
    title: "平行・垂直の条件",
    statement: "直線の平行・垂直条件を傾きの関係で説明せよ。",
    rubric: [
      "平行なら傾きが等しいと述べている",
      "垂直なら傾きの積が $-1$ と述べている",
      "傾きが存在しない場合の注意に触れていると良い",
    ],
    rubricKeywords: [[], ["-1", "垂直なら傾きの積が"], []],
    solution:
      "平行なら傾きが等しい。垂直なら傾きの積が $-1$。垂直線のように傾きが定義できない場合は図形的に判断する。",
    level: 1,
  },
  {
    id: "writeup_poly_remainder_1",
    topicId: "poly_remainder_basic",
    title: "余りの定理",
    statement: "余りの定理を説明し、使い方を述べよ。",
    rubric: [
      "$f(x)$ を $x-a$ で割った余りが $f(a)$ であることを述べている",
      "因数定理との関係に触れている",
      "具体的な利用場面を述べている",
    ],
    rubricKeywords: [["f(x)", "x-a", "f(a)", "で割った余りが"], [], []],
    solution:
      "多項式 $f(x)$ を $x-a$ で割った余りは $f(a)$。余りの計算や因数判定に使える。",
    level: 2,
  },
  {
    id: "writeup_seq_limit_1",
    topicId: "seq_geometric_limit_basic",
    title: "等比数列の無限和",
    statement: "等比数列の無限和が存在する条件と公式を説明せよ。",
    rubric: [
      "公比の絶対値が1未満である条件を述べている",
      "無限和 $\\frac{a}{1-r}$ を示している",
      "収束という概念に触れている",
    ],
    rubricKeywords: [[], ["\\\\frac{a}{1-r}", "無限和", "frac"], []],
    solution:
      "公比 $r$ の絶対値が1未満のとき無限和が収束し、和は $\\frac{a}{1-r}$ となる。",
    level: 2,
  },
  {
    id: "writeup_seq_recurrence_1",
    topicId: "seq_recurrence_basic",
    title: "漸化式の意味",
    statement: "漸化式とは何か、一般項を求める意義を説明せよ。",
    rubric: [
      "前の項から次の項を定める関係式であると述べている",
      "一般項があれば任意の項を直接求められると述べている",
      "簡単な例があると良い",
    ],
    rubricKeywords: [["一次線形", "特解"], ["初期条件", "定数"], ["一般項", "2^{n-1}"]],
    solution:
      "漸化式は前の項と次の項を結ぶ関係式。一般項が求まれば第$n$項を直接計算できる。",
    level: 1,
  },
  {
    id: "writeup_stats_se_1",
    topicId: "stats_standard_error_basic",
    title: "標準誤差の意味",
    statement: "標準誤差の意味と、標本数との関係を説明せよ。",
    rubric: [
      "標準誤差が標本平均のばらつきを表すと述べている",
      "$\\sigma/\\sqrt{n}$ に依存することを述べている",
      "標本数が増えると小さくなることに触れている",
    ],
    rubricKeywords: [[], ["\\\\sigma/\\\\sqrt{n}", "sigma", "sqrt"], []],
    solution:
      "標準誤差は標本平均のばらつきで、$\\sigma/\\sqrt{n}$ に比例する。標本数が増えるほど小さくなる。",
    level: 1,
  },
  {
    id: "writeup_stats_corr_1",
    topicId: "stats_correlation_basic",
    title: "相関係数の解釈",
    statement: "相関係数の値が示す意味を説明せよ。",
    rubric: [
      "-1から1の範囲であることを述べている",
      "符号が正負の相関を示すことを述べている",
      "絶対値が強さを表すことを述べている",
    ],
    rubricKeywords: [[], [], []],
    solution:
      "相関係数は $-1\\le r\\le 1$。符号は正負の相関、絶対値が1に近いほど相関が強い。",
    level: 1,
  },
  {
    id: "writeup_vector_parallel_1",
    topicId: "vector_parallel_basic",
    title: "ベクトルの平行条件",
    statement: "ベクトルが平行である条件を説明せよ。",
    rubric: [
      "一方が他方の実数倍であることを述べている",
      "成分比が等しいことに触れている",
      "ゼロベクトルの扱いに触れていると良い",
    ],
    rubricKeywords: [[], [], []],
    solution:
      "平行なら $\\vec{b}=k\\vec{a}$ と表せる。成分比が等しい。ゼロベクトルは全てと平行とみなすことが多い。",
    level: 1,
  },
  {
    id: "writeup_vector_inner_2",
    topicId: "vector_inner_basic",
    title: "内積と角度",
    statement: "内積と2ベクトルのなす角の関係を説明せよ。",
    rubric: [
      "$\\vec{a}\\cdot\\vec{b}=|\\vec{a}||\\vec{b}|\\cos\\theta$ を述べている",
      "角度の計算に使えることを述べている",
      "直交条件との関連に触れている",
    ],
    rubricKeywords: [["\\\\vec{a}\\\\cdot\\\\vec{b}=|\\\\vec{a}||\\\\vec{b}|\\\\cos\\\\theta", "vec", "cdot", "cos"], [], []],
    solution:
      "内積は $\\vec{a}\\cdot\\vec{b}=|\\vec{a}||\\vec{b}|\\cos\\theta$。角度計算に使え、$\\theta=90^\\circ$ なら0。",
    level: 2,
  },
  {
    id: "writeup_complex_arg_1",
    topicId: "complex_argument_basic",
    title: "偏角の意味",
    statement: "複素数の偏角の意味を説明せよ。",
    rubric: [
      "原点からの角度であることを述べている",
      "偏角が $\\arg z$ と書かれることに触れている",
      "複素数の極形式との関係に触れていると良い",
    ],
    rubricKeywords: [[], ["\\\\arg z", "偏角が", "arg"], []],
    solution:
      "偏角は複素数を原点から見た角度で $\\arg z$ と書く。極形式 $z=r(\\cos\\theta+i\\sin\\theta)$ の角度に対応する。",
    level: 1,
  },
  {
    id: "writeup_conic_circle_1",
    topicId: "conic_circle_basic",
    title: "円の標準形",
    statement: "円の標準形と中心・半径の読み取り方を説明せよ。",
    rubric: [
      "$(x-a)^2+(y-b)^2=r^2$ の形を示している",
      "中心 $(a,b)$ と半径 $r$ を述べている",
      "一般形から平方完成で標準形に直すことを述べている",
    ],
    rubricKeywords: [["(x-a)^2+(y-b)^2=r^2"], ["(a,b)", "r", "中心", "と半径"], []],
    solution:
      "円の標準形は $(x-a)^2+(y-b)^2=r^2$。中心は $(a,b)$、半径は $r$。一般形は平方完成して標準形に直す。",
    level: 1,
  },
  {
    id: "writeup_calc_derivative_1",
    topicId: "calc_derivative_basic",
    title: "微分係数の意味",
    statement: "微分係数の意味を、接線の傾きとの関係で説明せよ。",
    rubric: [
      "微分係数が変化率であることを述べている",
      "接線の傾きを表すことを述べている",
      "極限を用いた定義に触れている",
    ],
    rubricKeywords: [[], [], []],
    solution:
      "微分係数は平均変化率の極限で、曲線の接線の傾きを表す。$f'(a)=\\lim_{h\\to0}\\frac{f(a+h)-f(a)}{h}$。",
    level: 1,
  },
  {
    id: "writeup_calc_tangent_1",
    topicId: "calc_tangent_line_basic",
    title: "接線の方程式",
    statement: "接線の方程式を求める手順を説明せよ。",
    rubric: [
      "微分して傾きを求めることを述べている",
      "点 $(a,f(a))$ を通る直線の式を用いることを述べている",
      "式 $y-f(a)=f'(a)(x-a)$ を示している",
    ],
    rubricKeywords: [[], ["(a,f(a))"], ["y-f(a)=f'(a)(x-a)"]],
    solution:
      "傾きは $f'(a)$。点 $(a,f(a))$ を通るので $y-f(a)=f'(a)(x-a)$。",
    level: 2,
  },
  {
    id: "writeup_integral_area_1",
    topicId: "calc_area_basic",
    title: "面積と定積分",
    statement: "定積分と面積の関係を、符号付き面積の観点で説明せよ。",
    rubric: [
      "定積分が符号付き面積に対応することを述べている",
      "負の部分は面積がマイナスになると述べている",
      "必要なら区間を分けて計算することに触れている",
    ],
    rubricKeywords: [[], [], []],
    solution:
      "定積分は符号付き面積で、$x$軸より下の部分はマイナスとして数える。必要に応じて区間を分けて計算する。",
    level: 2,
  },
  {
    id: "writeup_prob_combi_1",
    topicId: "prob_combi_basic",
    title: "組合せと確率の関係",
    statement: "確率計算で組合せを使う理由を説明せよ。",
    rubric: [
      "順序を区別しない場合に組合せを使うことを述べている",
      "全体と有利な場合を数える流れを述べている",
      "具体例に触れていると良い",
    ],
    rubricKeywords: [[], [], []],
    solution:
      "抽出の順序を区別しない場合は組合せで数える。全体の組合せと有利な組合せの比で確率を求める。",
    level: 1,
  },
  {
    id: "writeup_exp_log_prop_1",
    topicId: "exp_log_property_basic",
    title: "指数法則と対数法則",
    statement: "指数法則と対数法則の関係を説明せよ。",
    rubric: [
      "指数の積・商・累乗の法則に触れている",
      "対数の積・商・累乗の法則に触れている",
      "互いに対応していることを述べている",
    ],
    rubricKeywords: [["指数の積"], ["対数の積"], []],
    solution:
      "指数法則 $a^m a^n=a^{m+n}$ などに対応して、対数法則 $\\log_a MN=\\log_a M+\\log_a N$ が成り立つ。",
    level: 2,
  },
  {
    id: "writeup_trig_radian_1",
    topicId: "trig_radian_basic",
    title: "弧度法の意味",
    statement: "弧度法の意味と、角度の測り方を説明せよ。",
    rubric: [
      "半径と弧の長さで角を測ることを述べている",
      "1ラジアンの定義に触れている",
      "度数法との関係を述べている",
    ],
    rubricKeywords: [[], [], []],
    solution:
      "弧度法は弧の長さ/半径で角を測る。弧長=半径のとき1ラジアン。$180^\\circ=\\pi$ラジアン。",
    level: 1,
  },
  {
    id: "writeup_coord_circle_1",
    topicId: "coord_circle_center_basic",
    title: "円の中心の求め方",
    statement: "円の方程式から中心を求める方法を説明せよ。",
    rubric: [
      "平方完成で標準形に直すことを述べている",
      "中心 $(a,b)$ を読み取ることを述べている",
      "半径も同時に得られると触れている",
    ],
    rubricKeywords: [[], ["(a,b)", "中心"], []],
    solution:
      "一般形を平方完成して $(x-a)^2+(y-b)^2=r^2$ に直し、中心 $(a,b)$ を読み取る。",
    level: 1,
  },
  {
    id: "writeup_vector_unit_1",
    topicId: "vector_unit_basic",
    title: "単位ベクトルの意味",
    statement: "単位ベクトルの意味と求め方を説明せよ。",
    rubric: [
      "大きさ1のベクトルであることを述べている",
      "元のベクトルを長さで割ることを述べている",
      "向きを保持することに触れている",
    ],
    rubricKeywords: [[], [], []],
    solution:
      "単位ベクトルは大きさ1で方向を表す。$\\vec{a}$ の単位ベクトルは $\\vec{a}/|\\vec{a}|$。",
    level: 1,
  },
  {
    id: "writeup_complex_conjugate_1",
    topicId: "complex_conjugate_basic",
    title: "共役複素数の意味",
    statement: "共役複素数の意味と性質を説明せよ。",
    rubric: [
      "共役 $\\overline{a+bi}=a-bi$ を述べている",
      "積が実数になることを述べている",
      "複素数平面での対称性に触れている",
    ],
    rubricKeywords: [["\\\\overline{a+bi}=a-bi", "共役", "overline", "bi"], [], []],
    solution:
      "共役は $\\overline{a+bi}=a-bi$。$z\\overline{z}=a^2+b^2$ は実数。複素平面では実軸対称。",
    level: 1,
  },
  {
    id: "writeup_exp_log_domain_2",
    topicId: "exp_log_domain_basic",
    title: "真数条件の確認",
    statement: "対数の真数条件を確認する理由を説明せよ。",
    rubric: [
      "真数が正でないと対数が定義できないと述べている",
      "解の候補が条件を満たすか確認する必要を述べている",
    ],
    rubricKeywords: [[], []],
    solution:
      "対数は真数が正でないと定義できない。方程式で得た解が真数条件を満たすか必ず確認する。",
    level: 1,
  },
  {
    id: "writeup_coord_parallel_2",
    topicId: "coord_line_parallel_perp_basic",
    title: "傾きの注意点",
    statement: "傾きが定義できない直線の平行・垂直をどう判断するか説明せよ。",
    rubric: [
      "垂直線は $x=$ 定数と述べている",
      "同じ形なら平行、水平線なら垂直関係に触れている",
    ],
    rubricKeywords: [["x=", "垂直線は"], ["同じ形なら平行"]],
    solution:
      "垂直線は $x=$ 定数で、同じ形なら平行。水平線 $y=$ 定数とは互いに垂直になる。",
    level: 2,
  },
  {
    id: "writeup_poly_remainder_2",
    topicId: "poly_remainder_basic",
    title: "余りの定理の活用",
    statement: "余りの定理が計算を簡単にする理由を説明せよ。",
    rubric: [
      "代入だけで余りが求まると述べている",
      "割り算を避けられることに触れている",
    ],
    rubricKeywords: [[], []],
    solution:
      "$x-a$ で割った余りは $f(a)$ なので、長い割り算をせず代入だけで求められる。",
    level: 2,
  },
  {
    id: "writeup_seq_limit_2",
    topicId: "seq_geometric_limit_basic",
    title: "収束の直感",
    statement: "等比数列が収束する直感的な理由を説明せよ。",
    rubric: [
      "公比の絶対値が1未満なら項が小さくなると述べている",
      "無限和が一定値に近づくことに触れている",
    ],
    rubricKeywords: [[], []],
    solution:
      "|r|<1 なら項がどんどん小さくなり、部分和が一定値に近づくため収束する。",
    level: 2,
  },
  {
    id: "writeup_seq_recurrence_2",
    topicId: "seq_recurrence_basic",
    title: "初期条件の重要性",
    statement: "漸化式で初期条件が必要な理由を説明せよ。",
    rubric: [
      "初期値がないと数列が定まらないと述べている",
      "具体的な例に触れていると良い",
    ],
    rubricKeywords: [[], []],
    solution:
      "漸化式は関係だけなので、初期値がないと数列が一意に定まらない。",
    level: 1,
  },
  {
    id: "writeup_stats_se_2",
    topicId: "stats_standard_error_basic",
    title: "標準誤差と精度",
    statement: "標準誤差が小さいことの意味を説明せよ。",
    rubric: [
      "標本平均のばらつきが小さいと述べている",
      "推定の精度が高いことに触れている",
    ],
    rubricKeywords: [[], []],
    solution:
      "標準誤差が小さいほど標本平均のばらつきが小さく、推定の精度が高い。",
    level: 1,
  },
  {
    id: "writeup_stats_corr_2",
    topicId: "stats_correlation_basic",
    title: "相関と因果",
    statement: "相関が因果関係を意味しない理由を説明せよ。",
    rubric: [
      "相関は関係の強さであり原因を示さないと述べている",
      "他の要因の影響に触れている",
    ],
    rubricKeywords: [[], []],
    solution:
      "相関は一緒に変化する傾向を示すだけで、原因を示さない。第三の要因が影響する場合もある。",
    level: 2,
  },
  {
    id: "writeup_vector_parallel_2",
    topicId: "vector_parallel_basic",
    title: "成分比の条件",
    statement: "成分比から平行を判断する方法を説明せよ。",
    rubric: [
      "成分比が等しいと平行と述べている",
      "比例係数が存在することに触れている",
    ],
    rubricKeywords: [[], []],
    solution:
      "成分比が等しいなら比例係数 $k$ が存在し、$\\vec{b}=k\\vec{a}$ となるので平行と判断できる。",
    level: 1,
  },
  {
    id: "writeup_complex_arg_2",
    topicId: "complex_argument_basic",
    title: "偏角の主値",
    statement: "偏角の主値を取る理由を説明せよ。",
    rubric: [
      "偏角は無数に存在することを述べている",
      "代表値として主値を決めることを述べている",
    ],
    rubricKeywords: [[], []],
    solution:
      "偏角は $2\\pi$ の周期で無数にあるため、代表値として一定範囲の主値を定める。",
    level: 2,
  },
  {
    id: "writeup_conic_circle_2",
    topicId: "conic_circle_basic",
    title: "円の半径の意味",
    statement: "円の半径が方程式にどう表れるか説明せよ。",
    rubric: [
      "標準形の右辺が $r^2$ であることを述べている",
      "半径が距離であることに触れている",
    ],
    rubricKeywords: [["r^2", "標準形の右辺が"], []],
    solution:
      "標準形 $(x-a)^2+(y-b)^2=r^2$ で右辺が半径の二乗。中心からの距離が一定であることを示す。",
    level: 1,
  },
  {
    id: "writeup_quad_inequality_2",
    topicId: "quad_inequality_basic",
    title: "二次不等式とグラフ",
    statement:
      "二次不等式 $ax^2+bx+c\\le 0$ の解をグラフで判断する方法を説明せよ。",
    rubric: [
      "放物線の形（上に凸・下に凸）に触れている",
      "x軸との交点で符号が変わることを述べている",
      "不等号の向きに応じて内側/外側を選ぶと書けている",
    ],
    rubricKeywords: [["放物線の形", "上に凸", "下に凸"], [], ["不等号の向きに応じて内側"]],
    solution:
      "グラフは放物線で、x軸との交点で符号が変わる。$a>0$ なら下にある区間、$a<0$ なら上にある区間が解になる。",
    level: 1,
  },
  {
    id: "writeup_geo_sine_cosine_law_2",
    topicId: "geo_sine_cosine_law_basic",
    title: "余弦定理の適用場面",
    statement:
      "三角形の2辺とその間の角が分かっているとき、余弦定理で何が求められるか説明せよ。",
    rubric: [
      "余弦定理の形を示している",
      "未知の辺を求められることを述べている",
      "角が鈍角でも使えることに触れていると良い",
    ],
    rubricKeywords: [[], [], []],
    solution:
      "余弦定理 $c^2=a^2+b^2-2ab\\cos C$ により、2辺とその間の角から第三辺を求められる。",
    level: 1,
  },
  {
    id: "writeup_combi_basic_2",
    topicId: "combi_basic",
    title: "順列と組合せの違い",
    statement: "順列と組合せの違いを簡潔に説明せよ。",
    rubric: [
      "順序を考えるかどうかの違いを述べている",
      "記号 $P$ と $C$ の意味に触れている",
    ],
    rubricKeywords: [[], ["P", "C", "記号"]],
    solution:
      "順列は順序を区別し、組合せは順序を区別しない。$nPr$ と $nCr$ の違い。",
    level: 1,
  },
  {
    id: "writeup_exp_log_2",
    topicId: "exp_log_basic",
    title: "底の変換",
    statement: "対数の底の変換公式の意味を説明せよ。",
    rubric: [
      "$\\log_a b=\\frac{\\log_c b}{\\log_c a}$ を示している",
      "任意の底に変換できることを述べている",
      "計算の都合で底を選ぶと触れている",
    ],
    rubricKeywords: [["\\\\log_a b=\\\\frac{\\\\log_c b}{\\\\log_c a}", "log", "frac"], [], []],
    solution:
      "底の変換は $\\log_a b=\\frac{\\log_c b}{\\log_c a}$。任意の底に変換でき、計算しやすい底を選べる。",
    level: 2,
  },
  {
    id: "writeup_trig_identities_2",
    topicId: "trig_identities_basic",
    title: "二倍角との連携",
    statement: "三角恒等式と二倍角公式の組み合わせ方を説明せよ。",
    rubric: [
      "$\\sin^2\\theta+\\cos^2\\theta=1$ を使う方針がある",
      "二倍角公式で $\\sin^2\\theta,\\cos^2\\theta$ を置き換えられることを述べている",
    ],
    rubricKeywords: [["\\\\sin^2\\\\theta+\\\\cos^2\\\\theta=1", "sin", "theta", "cos"], ["\\\\sin^2\\\\theta,\\\\cos^2\\\\theta", "sin", "theta", "cos"]],
    solution:
      "$\\cos 2\\theta=1-2\\sin^2\\theta$ などを使い、$\\sin^2\\theta$ や $\\cos^2\\theta$ を他の形へ変換できる。",
    level: 2,
  },
  {
    id: "writeup_stats_mean_2",
    topicId: "stats_sample_mean_basic",
    title: "標本平均の偏り",
    statement: "標本平均が母平均の不偏推定量であることを説明せよ。",
    rubric: [
      "期待値の概念に触れている",
      "標本平均の期待値が母平均になると述べている",
    ],
    rubricKeywords: [[], []],
    solution:
      "標本平均の期待値は母平均に等しいため、不偏推定量といえる。",
    level: 2,
  },
  {
    id: "writeup_integral_meaning_2",
    topicId: "calc_integral_basic",
    title: "積分と面積の符号",
    statement: "定積分の符号が何を表すか説明せよ。",
    rubric: [
      "x軸より上/下で符号が変わることを述べている",
      "面積は符号付きであることを述べている",
    ],
    rubricKeywords: [["x軸より上"], []],
    solution:
      "定積分は符号付き面積なので、関数がx軸より上なら正、下なら負になる。",
    level: 1,
  },
  {
    id: "writeup_poly_factor_2",
    topicId: "poly_factor_k_basic",
    title: "係数条件と因数分解",
    statement:
      "多項式にパラメータがあるとき、因数分解できる条件の探し方を説明せよ。",
    rubric: [
      "一次因数を仮定して割り切れる条件を調べると述べている",
      "代入または剰余定理の利用に触れている",
      "条件式を解いて $k$ を決める方針が書けている",
    ],
    rubricKeywords: [[], [], ["k"]],
    solution:
      "一次因数 $(x-\\alpha)$ を仮定し $P(\\alpha)=0$ の条件から $k$ を決める。剰余定理を使うとよい。",
    level: 2,
  },
  {
    id: "writeup_identity_coeff_2",
    topicId: "identity_coefficient_basic",
    title: "係数比較の考え方",
    statement:
      "恒等式で係数比較を行う理由と手順を説明せよ。",
    rubric: [
      "恒等式は全ての $x$ で成り立つことに触れている",
      "同次数の係数を比較する方針が書けている",
      "必要なら代入法との違いに触れている",
    ],
    rubricKeywords: [["x"], [], []],
    solution:
      "恒等式は全ての $x$ で成り立つため、同次数の係数を比較して未知係数を求める。",
    level: 1,
  },
  {
    id: "writeup_trig_double_2",
    topicId: "trig_double_angle_basic",
    title: "二倍角公式の使い分け",
    statement: "二倍角公式の3つの形を使い分ける理由を説明せよ。",
    rubric: [
      "$\\sin^2\\theta$ や $\\cos^2\\theta$ の形に応じて選ぶと述べている",
      "式変形の目的（統一・簡約）に触れている",
    ],
    rubricKeywords: [["\\\\sin^2\\\\theta", "\\\\cos^2\\\\theta", "sin", "theta"], ["統一", "簡約"]],
    solution:
      "二倍角は $\\cos 2\\theta=1-2\\sin^2\\theta=2\\cos^2\\theta-1$ など形が複数ある。目的の式に合わせて使い分ける。",
    level: 2,
  },
  {
    id: "writeup_calc_derivative_2",
    topicId: "calc_derivative_basic",
    title: "導関数の意味",
    statement: "導関数 $f'(x)$ の意味を言葉で説明せよ。",
    rubric: [
      "接線の傾きとしての意味を述べている",
      "変化率の極限として説明している",
    ],
    rubricKeywords: [[], []],
    solution:
      "導関数は接線の傾きであり、平均との差分の極限としての瞬間変化率を表す。",
    level: 1,
  },
  {
    id: "writeup_calc_tangent_2",
    topicId: "calc_tangent_line_basic",
    title: "接線の式の求め方",
    statement:
      "関数 $y=f(x)$ の点 $x=a$ における接線の式を求める手順を説明せよ。",
    rubric: [
      "傾きが $f'(a)$ であることを述べている",
      "点 $(a, f(a))$ を通る直線を立てると述べている",
      "最終的に $y-f(a)=f'(a)(x-a)$ を示している",
    ],
    rubricKeywords: [["f'(a)", "傾きが"], ["(a, f(a))"], ["y-f(a)=f'(a)(x-a)", "最終的に"]],
    solution:
      "接線の傾きは $f'(a)$、点は $(a,f(a))$。よって $y-f(a)=f'(a)(x-a)$。",
    level: 1,
  },
  {
    id: "writeup_calc_area_2",
    topicId: "calc_area_basic",
    title: "面積計算の基本",
    statement: "2曲線で囲まれた面積の求め方を説明せよ。",
    rubric: [
      "上側-下側の関数差を積分すると述べている",
      "交点を求めて積分区間を決めることに触れている",
    ],
    rubricKeywords: [["上側"], []],
    solution:
      "交点で区間を分け、上側の関数から下側の関数を引いた差を積分して面積を求める。",
    level: 1,
  },
  {
    id: "writeup_prob_combi_2",
    topicId: "prob_combi_basic",
    title: "場合分けの重要性",
    statement:
      "確率の計算で場合分けが必要になる理由を説明せよ。",
    rubric: [
      "事象が重ならない部分に分けると数えやすいことを述べている",
      "全体の場合の数も同様に分ける必要に触れている",
    ],
    rubricKeywords: [[], []],
    solution:
      "重なりがあると数え漏れや重複が起こるため、互いに排反な場合に分けて数えるのが基本。",
    level: 1,
  },
  {
    id: "writeup_exp_log_prop_2",
    topicId: "exp_log_property_basic",
    title: "対数の性質の使い道",
    statement:
      "対数の性質（積→和、商→差）を使う利点を説明せよ。",
    rubric: [
      "計算や変形が容易になることを述べている",
      "指数が前に出せることに触れている",
    ],
    rubricKeywords: [[], []],
    solution:
      "積や商を和・差に変換でき、複雑な計算や方程式の整理がしやすくなる。指数を前に出せるのも利点。",
    level: 1,
  },
  {
    id: "writeup_trig_radian_2",
    topicId: "trig_radian_basic",
    title: "ラジアンと円周率",
    statement:
      "ラジアンが円周率 $\\pi$ と結び付いている理由を説明せよ。",
    rubric: [
      "弧長=半径×角度の定義に触れている",
      "半径1の円での弧長が角度そのものになると述べている",
    ],
    rubricKeywords: [["弧長", "半径"], []],
    solution:
      "ラジアンは弧長/半径で定義され、半径1の円では弧長が角度になる。円周は $2\\pi$ だから $\\pi$ と自然に結び付く。",
    level: 1,
  },
  {
    id: "writeup_coord_circle_2",
    topicId: "coord_circle_center_basic",
    title: "中心と半径の読み取り",
    statement:
      "円の方程式から中心と半径を読み取る手順を説明せよ。",
    rubric: [
      "平方完成で標準形に直すことを述べている",
      "中心と半径の対応を明記している",
    ],
    rubricKeywords: [[], ["中心と半径の対応を明記している"]],
    solution:
      "平方完成で $(x-a)^2+(y-b)^2=r^2$ に直し、中心は $(a,b)$、半径は $r$ と読み取る。",
    level: 1,
  },
  {
    id: "writeup_vector_unit_2",
    topicId: "vector_unit_basic",
    title: "単位ベクトルの意味",
    statement:
      "単位ベクトルが「方向を表す」理由を説明せよ。",
    rubric: [
      "大きさが1であることを述べている",
      "長さの情報が除かれ方向だけになることに触れている",
    ],
    rubricKeywords: [[], []],
    solution:
      "単位ベクトルは大きさが1なので長さの情報が消え、方向のみを表す。",
    level: 1,
  },
  {
    id: "writeup_complex_conjugate_2",
    topicId: "complex_conjugate_basic",
    title: "共役複素数の役割",
    statement:
      "共役複素数を使うと何が便利か説明せよ。",
    rubric: [
      "積が実数になることを述べている",
      "分母の有理化や絶対値計算に触れている",
    ],
    rubricKeywords: [[], []],
    solution:
      "共役を掛けると積が実数になり、分母の有理化や絶対値計算が簡単になる。",
    level: 1,
  },
  {
    id: "writeup_prob_basic_3",
    topicId: "prob_basic",
    title: "独立性の確認",
    statement: "2つの事象が独立であるかを判断する方法を説明せよ。",
    rubric: [
      "$P(A\\cap B)=P(A)P(B)$ を用いることを述べている",
      "$P(A|B)=P(A)$ の同値条件に触れている",
    ],
    rubricKeywords: [["P(A\\\\cap B)=P(A)P(B)", "cap"], ["P(A|B)=P(A)"]],
    solution:
      "$P(A\\cap B)=P(A)P(B)$ が成り立てば独立。条件付き確率で $P(A|B)=P(A)$ でも判断できる。",
    level: 2,
  },
  {
    id: "writeup_exp_log_equation_3",
    topicId: "exp_log_equations_basic",
    title: "対数方程式の解法手順",
    statement:
      "対数方程式を解くときの標準的な手順を説明せよ。",
    rubric: [
      "定義域の確認を最初に行うと述べている",
      "指数化して方程式を解く手順を述べている",
      "得られた解を定義域で検証すると書いている",
    ],
    rubricKeywords: [[], [], ["得られた解を定義域で検証すると書いている"]],
    solution:
      "まず定義域を確認し、両辺を指数化して方程式を解く。最後に定義域に合う解だけを残す。",
    level: 2,
  },
  {
    id: "writeup_trig_period_3",
    topicId: "trig_period_basic",
    title: "周期の読み取り",
    statement: "三角関数 $y=\\sin(kx)$ の周期の求め方を説明せよ。",
    rubric: [
      "基本周期 $2\\pi$ を述べている",
      "$k$ 倍で周期が $\\frac{2\\pi}{k}$ になることを述べている",
    ],
    rubricKeywords: [["2\\\\pi", "基本周期", "pi"], ["k", "\\\\frac{2\\\\pi}{k}", "倍で周期が", "frac"]],
    solution:
      "基本周期は $2\\pi$。$x$ が $k$ 倍されるので周期は $\\frac{2\\pi}{k}$ になる。",
    level: 1,
  },
  {
    id: "writeup_stats_ci_3",
    topicId: "stats_confidence_interval_basic",
    title: "信頼区間の幅",
    statement: "信頼区間の幅が何に依存するか説明せよ。",
    rubric: [
      "標本数が増えると幅が狭くなることを述べている",
      "標準偏差や信頼係数に依存することに触れている",
    ],
    rubricKeywords: [[], []],
    solution:
      "幅は標準偏差や信頼係数に依存し、標本数が増えると標準誤差が小さくなって幅は狭くなる。",
    level: 2,
  },
  {
    id: "writeup_vector_projection_3",
    topicId: "vector_projection_basic",
    title: "射影の意味",
    statement: "ベクトルの射影が何を表しているか説明せよ。",
    rubric: [
      "一方のベクトル方向の成分を表すことを述べている",
      "内積を使って計算できると触れている",
    ],
    rubricKeywords: [[], []],
    solution:
      "射影は特定方向に沿った成分の大きさを表し、内積で計算できる。",
    level: 1,
  },
  {
    id: "writeup_coord_distance_3",
    topicId: "coord_distance_point_line_basic",
    title: "点と直線の距離",
    statement:
      "点と直線の距離公式がどのように導かれるか説明せよ。",
    rubric: [
      "垂線の長さとして距離を捉えている",
      "直線の一般形 $ax+by+c=0$ を使うと述べている",
    ],
    rubricKeywords: [["垂線の長さとして距離を捉えている"], ["ax+by+c=0", "直線の一般形", "ax", "by"]],
    solution:
      "点から直線への垂線の長さとして距離を考え、直線 $ax+by+c=0$ に対して公式 $\\frac{|ax_0+by_0+c|}{\\sqrt{a^2+b^2}}$ を得る。",
    level: 2,
  },
  {
    id: "writeup_poly_factor_3",
    topicId: "poly_factor_k_basic",
    title: "整式の割り切れ条件",
    statement:
      "多項式が $(x-a)$ で割り切れる条件を説明せよ。",
    rubric: [
      "剰余定理 $P(a)=0$ を明記している",
      "割り切れの確認として代入を使うと述べている",
    ],
    rubricKeywords: [["P(a)=0", "剰余定理", "を明記している"], []],
    solution:
      "剰余定理より、$(x-a)$ で割り切れる条件は $P(a)=0$。",
    level: 1,
  },
  {
    id: "writeup_binomial_middle_3",
    topicId: "binomial_middle_coeff_basic",
    title: "中央の係数の求め方",
    statement:
      "$(a+b)^n$ の中央の係数の求め方を説明せよ。",
    rubric: [
      "二項係数 $\\binom{n}{k}$ を使うことを述べている",
      "$n$ が偶数/奇数で中央項の位置が変わることに触れている",
    ],
    rubricKeywords: [["\\\\binom{n}{k}", "二項係数", "binom"], ["n", "が偶数"]],
    solution:
      "$(a+b)^n$ の係数は $\\binom{n}{k}$。$n$ が偶数なら $k=\\frac{n}{2}$、奇数なら中央は2項で $k=\\frac{n-1}{2},\\frac{n+1}{2}$。",
    level: 2,
  },
  {
    id: "writeup_identity_coeff_3",
    topicId: "identity_coefficient_basic",
    title: "恒等式と代入法",
    statement: "恒等式で係数比較と代入法をどう使い分けるか説明せよ。",
    rubric: [
      "係数比較は一般形で一度に解けると述べている",
      "代入法は簡便だが必要条件になる点に触れている",
    ],
    rubricKeywords: [[], []],
    solution:
      "係数比較は全ての $x$ で成り立つ性質を使うので確実。代入法は手軽だが条件が不足する場合があるため、必要に応じて使い分ける。",
    level: 2,
  },
  {
    id: "writeup_complex_modulus_3",
    topicId: "complex_modulus_basic",
    title: "絶対値の幾何学的意味",
    statement: "複素数の絶対値の幾何学的意味を説明せよ。",
    rubric: [
      "原点からの距離であることを述べている",
      "座標表示 $z=x+iy$ に触れている",
    ],
    rubricKeywords: [[], ["z=x+iy", "座標表示", "iy"]],
    solution:
      "複素数 $z=x+iy$ の絶対値 $|z|$ は複素平面で原点から点 $(x,y)$ までの距離を表す。",
    level: 1,
  },
  {
    id: "writeup_quad_graph_3",
    topicId: "quad_graph_basic",
    title: "グラフの形の判断",
    statement: "二次関数のグラフの形を係数から判断する方法を説明せよ。",
    rubric: [
      "$a$ の符号で開きが決まることを述べている",
      "頂点の位置が $b,c$ で決まることに触れている",
    ],
    rubricKeywords: [["a"], ["b,c", "頂点の位置が"]],
    solution:
      "$a>0$ なら上に開き、$a<0$ なら下に開く。軸は $x=-\\frac{b}{2a}$ で頂点位置が決まる。",
    level: 1,
  },
  {
    id: "writeup_quad_inequality_3",
    topicId: "quad_inequality_basic",
    title: "判別式の役割",
    statement: "二次不等式で判別式を使う理由を説明せよ。",
    rubric: [
      "実数解の有無で符号の変化が決まることを述べている",
      "グラフとx軸の交点の有無に触れている",
    ],
    rubricKeywords: [[], []],
    solution:
      "判別式は実数解の有無を決め、放物線がx軸と交わるかどうかを判断する。交点の有無で符号の変化が決まる。",
    level: 1,
  },
  {
    id: "writeup_geo_sine_cosine_law_3",
    topicId: "geo_sine_cosine_law_basic",
    title: "正弦定理の活用",
    statement: "正弦定理を使って角を求める流れを説明せよ。",
    rubric: [
      "向かい合う辺と角の比を用いることを述べている",
      "未知角を逆三角関数で求めることに触れている",
    ],
    rubricKeywords: [[], []],
    solution:
      "正弦定理 $\\frac{a}{\\sin A}=\\frac{b}{\\sin B}=2R$ を使い、既知の辺と角の比から未知角を求める。",
    level: 2,
  },
  {
    id: "writeup_combi_basic_3",
    topicId: "combi_basic",
    title: "同じものを含む並べ方",
    statement: "同じものを含む並べ方の数え方を説明せよ。",
    rubric: [
      "全てを区別した場合から割る考えを述べている",
      "階乗で割る理由を述べている",
    ],
    rubricKeywords: [[], []],
    solution:
      "同じものを区別した並べ方は $n!$。同じものの並び替えが重複するため、それぞれの個数の階乗で割る。",
    level: 2,
  },
  {
    id: "writeup_exp_log_3",
    topicId: "exp_log_basic",
    title: "指数関数と対数関数の関係",
    statement:
      "指数関数と対数関数が逆関数であることを説明せよ。",
    rubric: [
      "$\\log_a(a^x)=x$ を示している",
      "$a^{\\log_a x}=x$ を示している",
    ],
    rubricKeywords: [["\\\\log_a(a^x)=x", "log"], ["a^{\\\\log_a x}=x", "log"]],
    solution:
      "定義より $\\log_a(a^x)=x$、また $a^{\\log_a x}=x$ が成り立つので互いに逆関数。",
    level: 1,
  },
  {
    id: "writeup_trig_identities_3",
    topicId: "trig_identities_basic",
    title: "恒等式の確認方法",
    statement: "三角恒等式が正しいことを確認する手順を説明せよ。",
    rubric: [
      "片側を変形してもう一方に合わせると述べている",
      "条件（定義域）を意識すると書いている",
    ],
    rubricKeywords: [[], ["定義域", "を意識すると書いている"]],
    solution:
      "一方の式を既知の恒等式で変形し、もう一方と一致することを示す。定義域の確認も行う。",
    level: 1,
  },
  {
    id: "writeup_vector_inner_3",
    topicId: "vector_inner_basic",
    title: "角度の求め方",
    statement: "内積でベクトルのなす角を求める方法を説明せよ。",
    rubric: [
      "$\\vec{a}\\cdot\\vec{b}=|a||b|\\cos\\theta$ を述べている",
      "成分から内積を計算することに触れている",
    ],
    rubricKeywords: [["\\\\vec{a}\\\\cdot\\\\vec{b}=|a||b|\\\\cos\\\\theta", "vec", "cdot", "cos"], []],
    solution:
      "内積の公式 $\\vec{a}\\cdot\\vec{b}=|a||b|\\cos\\theta$ を使い、成分から内積を計算して角度を求める。",
    level: 2,
  },
  {
    id: "writeup_stats_mean_3",
    topicId: "stats_sample_mean_basic",
    title: "標本平均のばらつき",
    statement: "標本平均のばらつきが何に依存するか説明せよ。",
    rubric: [
      "標本数に依存することを述べている",
      "標準偏差や標準誤差の概念に触れている",
    ],
    rubricKeywords: [[], []],
    solution:
      "標本数が増えると標準誤差が小さくなり、標本平均のばらつきは減る。母標準偏差にも依存する。",
    level: 2,
  },
  {
    id: "writeup_calc_integral_3",
    topicId: "calc_integral_basic",
    title: "不定積分との関係",
    statement: "定積分と不定積分の関係を説明せよ。",
    rubric: [
      "原始関数の差で表せることを述べている",
      "微分積分の基本定理に触れている",
    ],
    rubricKeywords: [[], []],
    solution:
      "微分積分の基本定理より、$\\int_a^b f(x)\\,dx=F(b)-F(a)$（$F$ は原始関数）として表せる。",
    level: 2,
  },
  {
    id: "writeup_seq_arithmetic_sum_3",
    topicId: "seq_arithmetic_sum_basic",
    title: "等差数列の和の応用",
    statement: "等差数列の和が求まると何が便利か説明せよ。",
    rubric: [
      "等差的に増減する量の合計を扱えると述べている",
      "具体的な応用例があると良い",
    ],
    rubricKeywords: [[], ["具体的な応用例があると良い"]],
    solution:
      "等差的に増える量の合計を効率的に計算でき、階段状の合計や総和の問題に応用できる。",
    level: 1,
  },
  {
    id: "writeup_prob_complement_3",
    topicId: "prob_complement_basic",
    title: "余事象の使いどころ",
    statement: "余事象を使うと計算が簡単になる場面を説明せよ。",
    rubric: [
      "求めたい事象が数えにくい場合と述べている",
      "全体から引く方針を明記している",
    ],
    rubricKeywords: [[], []],
    solution:
      "求めたい事象が複雑なとき、補集合（余事象）を数えて 1 から引くと簡単になる。",
    level: 1,
  },
  {
    id: "writeup_trig_addition_3",
    topicId: "trig_addition_basic",
    title: "加法定理の活用",
    statement: "加法定理がどのような場面で有効か説明せよ。",
    rubric: [
      "角の和差を単一角に変換できることを述べている",
      "合成や変形に使えることに触れている",
    ],
    rubricKeywords: [[], []],
    solution:
      "角の和差を単一角の三角関数に変換できるので、合成や恒等変形に有効。",
    level: 1,
  },
  {
    id: "writeup_algebra_ineq_3",
    topicId: "algebra_ineq_basic",
    title: "一次不等式の解き方",
    statement: "一次不等式の解き方で注意すべき点を説明せよ。",
    rubric: [
      "負の数で割ると不等号が反転することを述べている",
      "解の範囲として表すことに触れている",
    ],
    rubricKeywords: [[], []],
    solution:
      "不等式を変形するとき、負の数で割ると不等号が反転する点に注意する。解は数直線の範囲で表す。",
    level: 1,
  },
  {
    id: "writeup_set_operations_3",
    topicId: "set_operations_basic",
    title: "集合とベン図",
    statement: "和集合・共通部分をベン図で説明せよ。",
    rubric: [
      "和集合がどちらかに含まれる全体と述べている",
      "共通部分が両方に含まれる部分と述べている",
    ],
    rubricKeywords: [[], []],
    solution:
      "和集合はどちらか一方に属する領域全体、共通部分は両方に共通する領域としてベン図で表す。",
    level: 1,
  },
  {
    id: "writeup_identity_eval_3",
    topicId: "identity_eval_basic",
    title: "恒等式の使い道",
    statement: "恒等式を用いる利点を説明せよ。",
    rubric: [
      "式変形を簡単にできることを述べている",
      "計算量の削減や整理に触れている",
    ],
    rubricKeywords: [[], []],
    solution:
      "恒等式を使うと式変形が簡単になり、計算量を減らして整理できる。",
    level: 1,
  },
  {
    id: "writeup_inequality_amgm_3",
    topicId: "inequality_amgm_basic",
    title: "AM-GMの使いどころ",
    statement: "AM-GMの不等式が有効な場面を説明せよ。",
    rubric: [
      "積と和が絡む最小最大に触れている",
      "等号成立条件を意識すると述べている",
    ],
    rubricKeywords: [[], []],
    solution:
      "和と積が絡む最小最大問題で有効。等号成立が揃う点を意識して条件を満たす。",
    level: 2,
  },
  {
    id: "writeup_trig_double_3",
    topicId: "trig_double_angle_basic",
    title: "半角への変換",
    statement: "二倍角公式を使って半角の式を作る方法を説明せよ。",
    rubric: [
      "$\\sin^2\\theta$ や $\\cos^2\\theta$ の形へ変形できることを述べている",
      "恒等式と組み合わせると述べている",
    ],
    rubricKeywords: [["\\\\sin^2\\\\theta", "\\\\cos^2\\\\theta", "sin", "theta"], []],
    solution:
      "$\\cos 2\\theta=1-2\\sin^2\\theta$ などを変形して $\\sin^2\\theta$ や $\\cos^2\\theta$ を表す。",
    level: 2,
  },
  {
    id: "writeup_exp_log_domain_3",
    topicId: "exp_log_domain_basic",
    title: "定義域の確認",
    statement: "対数関数の定義域確認が重要な理由を説明せよ。",
    rubric: [
      "真数が正である必要を述べている",
      "解の候補を排除する必要に触れている",
    ],
    rubricKeywords: [[], []],
    solution:
      "対数は真数が正でなければならず、解の候補が定義域外だと無効になるため最初に確認する。",
    level: 1,
  },
  {
    id: "writeup_coord_line_parallel_3",
    topicId: "coord_line_parallel_perp_basic",
    title: "平行・垂直の判定",
    statement: "直線の平行・垂直を傾きで判定する方法を説明せよ。",
    rubric: [
      "平行なら傾きが等しいと述べている",
      "垂直なら傾きの積が -1 と述べている",
    ],
    rubricKeywords: [[], ["垂直なら傾きの積が"]],
    solution:
      "傾きが等しければ平行、傾きの積が -1 なら垂直。",
    level: 1,
  },
  {
    id: "writeup_poly_remainder_3",
    topicId: "poly_remainder_basic",
    title: "剰余定理の活用",
    statement: "剰余定理がどのような場面で便利か説明せよ。",
    rubric: [
      "割り算の剰余を代入で得られると述べている",
      "条件決定に使えることに触れている",
    ],
    rubricKeywords: [[], []],
    solution:
      "割り算の剰余は代入で求まるため、係数条件や値の決定に有効。",
    level: 1,
  },
  {
    id: "writeup_seq_geo_limit_3",
    topicId: "seq_geometric_limit_basic",
    title: "等比数列の極限条件",
    statement: "等比数列の極限が存在する条件を説明せよ。",
    rubric: [
      "公比 $r$ の大きさに依存することを述べている",
      "$|r|<1$ で 0 に収束することを述べている",
    ],
    rubricKeywords: [["r", "公比"], ["|r|<1"]],
    solution:
      "等比数列 $a_n=ar^{n-1}$ は $|r|<1$ なら 0 に収束し、$|r|\\ge 1$ では発散する。",
    level: 2,
  },
  {
    id: "writeup_seq_recurrence_3",
    topicId: "seq_recurrence_basic",
    title: "漸化式の扱い方",
    statement: "一次の漸化式を解く基本手順を説明せよ。",
    rubric: [
      "一般項を求める方針を述べている",
      "初期条件を利用すると述べている",
    ],
    rubricKeywords: [[], []],
    solution:
      "漸化式を変形して一般項を求め、初期条件で定数を決めるのが基本。",
    level: 1,
  },
  {
    id: "writeup_stats_se_3",
    topicId: "stats_standard_error_basic",
    title: "標準誤差の意味",
    statement: "標準誤差が何を表すか説明せよ。",
    rubric: [
      "標本平均のばらつきの尺度であると述べている",
      "$\\sigma/\\sqrt{n}$ の形に触れている",
    ],
    rubricKeywords: [[], ["\\\\sigma/\\\\sqrt{n}", "sigma", "sqrt"]],
    solution:
      "標準誤差は標本平均のばらつきの尺度で、$\\sigma/\\sqrt{n}$ で表される。",
    level: 1,
  },
  {
    id: "writeup_stats_corr_3",
    topicId: "stats_correlation_basic",
    title: "相関係数の解釈",
    statement: "相関係数の符号と大きさの意味を説明せよ。",
    rubric: [
      "符号で正/負の関係を述べている",
      "大きさで強さを述べている",
    ],
    rubricKeywords: [["符号で正"], []],
    solution:
      "符号は正の相関・負の相関を示し、絶対値が1に近いほど関係が強い。",
    level: 1,
  },
  {
    id: "writeup_vector_parallel_3",
    topicId: "vector_parallel_basic",
    title: "平行条件の判定",
    statement: "2つのベクトルが平行である条件を説明せよ。",
    rubric: [
      "スカラー倍の関係を述べている",
      "成分比が等しいことに触れている",
    ],
    rubricKeywords: [["スカラ"], []],
    solution:
      "一方が他方のスカラー倍であれば平行。成分比が等しいことでも判定できる。",
    level: 1,
  },
  {
    id: "writeup_complex_argument_3",
    topicId: "complex_argument_basic",
    title: "偏角の幾何学的意味",
    statement: "偏角が何を表しているか説明せよ。",
    rubric: [
      "原点からの方向角であると述べている",
      "複素平面での位置と結び付けている",
    ],
    rubricKeywords: [[], ["複素平面での位置と結び付けている"]],
    solution:
      "偏角は複素平面で原点から点への方向角を表す。",
    level: 1,
  },
  {
    id: "writeup_conic_circle_3",
    topicId: "conic_circle_basic",
    title: "中心移動の意味",
    statement: "円の方程式で中心を移動する意味を説明せよ。",
    rubric: [
      "標準形で中心が座標として現れると述べている",
      "平行移動による表現と触れている",
    ],
    rubricKeywords: [[], []],
    solution:
      "$(x-a)^2+(y-b)^2=r^2$ は中心 $(a,b)$ の円で、平行移動した座標系で表せる。",
    level: 1,
  },
  {
    id: "writeup_calc_derivative_3",
    topicId: "calc_derivative_basic",
    title: "微分係数の求め方",
    statement: "微分係数の定義を用いた求め方を説明せよ。",
    rubric: [
      "差分商の極限を述べている",
      "式 $\\lim_{h\\to 0}\\frac{f(x+h)-f(x)}{h}$ に触れている",
    ],
    rubricKeywords: [[], ["\\\\lim_{h\\\\to 0}\\\\frac{f(x+h)-f(x)}{h}", "lim", "to", "frac"]],
    solution:
      "微分係数は差分商の極限で、$f'(x)=\\lim_{h\\to 0}\\frac{f(x+h)-f(x)}{h}$。",
    level: 2,
  },
  {
    id: "writeup_calc_tangent_3",
    topicId: "calc_tangent_line_basic",
    title: "接線と微分",
    statement: "接線の傾きが微分係数である理由を説明せよ。",
    rubric: [
      "割線の傾きの極限として説明している",
      "接線の傾きになることを述べている",
    ],
    rubricKeywords: [[], []],
    solution:
      "割線の傾きの極限が微分係数であり、その極限が接線の傾きになる。",
    level: 2,
  },
  {
    id: "writeup_calc_area_3",
    topicId: "calc_area_basic",
    title: "符号付き面積の扱い",
    statement: "面積計算で符号に注意する理由を説明せよ。",
    rubric: [
      "積分は符号付き面積であることを述べている",
      "必要なら絶対値や区間分割を使うと述べている",
    ],
    rubricKeywords: [[], []],
    solution:
      "積分は符号付き面積なので、上下が入れ替わると負になる。必要に応じて絶対値や区間分割で面積を求める。",
    level: 2,
  },
  {
    id: "writeup_prob_combi_3",
    topicId: "prob_combi_basic",
    title: "場合の数の設計",
    statement: "確率計算で場合の数を設計する手順を説明せよ。",
    rubric: [
      "全体を同様に確からしい単位に分けると述べている",
      "有利な場合を同じ単位で数えると述べている",
    ],
    rubricKeywords: [[], []],
    solution:
      "全体を同様に確からしい単位で数え、有利な場合も同じ単位で数えることで確率が求められる。",
    level: 1,
  },
  {
    id: "writeup_exp_log_prop_3",
    topicId: "exp_log_property_basic",
    title: "指数への戻し方",
    statement: "対数の性質を使って指数式に戻す流れを説明せよ。",
    rubric: [
      "和や差を積や商に戻すことを述べている",
      "最後に指数を取ると述べている",
    ],
    rubricKeywords: [[], []],
    solution:
      "対数の和・差を積・商に戻し、最後に指数化して元の式に戻す。",
    level: 2,
  },
  {
    id: "writeup_trig_radian_3",
    topicId: "trig_radian_basic",
    title: "度数法との変換",
    statement: "度数法と弧度法の変換方法を説明せよ。",
    rubric: [
      "$180^\\circ=\\pi$ を用いることを述べている",
      "具体的な変換式に触れている",
    ],
    rubricKeywords: [["180^\\\\circ=\\\\pi", "180", "circ", "pi"], []],
    solution:
      "度数法と弧度法は $180^\\circ=\\pi$ を使って換算する。$x^\\circ=\\frac{x\\pi}{180}$。",
    level: 1,
  },
  {
    id: "writeup_coord_circle_3",
    topicId: "coord_circle_center_basic",
    title: "一般形から標準形",
    statement: "円の一般形から標準形への変換手順を説明せよ。",
    rubric: [
      "平方完成を使うと述べている",
      "中心と半径が読み取れることに触れている",
    ],
    rubricKeywords: [[], []],
    solution:
      "平方完成して $(x-a)^2+(y-b)^2=r^2$ に直すと中心と半径が読み取れる。",
    level: 1,
  },
  {
    id: "writeup_vector_unit_3",
    topicId: "vector_unit_basic",
    title: "正規化の理由",
    statement: "ベクトルを正規化する理由を説明せよ。",
    rubric: [
      "方向情報だけを取り出すと述べている",
      "内積や投影で便利になることに触れている",
    ],
    rubricKeywords: [[], []],
    solution:
      "正規化すると方向だけが残り、内積や投影の計算が簡単になる。",
    level: 1,
  },
  {
    id: "writeup_complex_conjugate_3",
    topicId: "complex_conjugate_basic",
    title: "実部・虚部の取り出し",
    statement: "共役を使って実部・虚部を取り出す流れを説明せよ。",
    rubric: [
      "$z$ と $\\overline{z}$ の和や差を使うことを述べている",
      "実部と虚部が式で表せることに触れている",
    ],
    rubricKeywords: [["z", "\\\\overline{z}", "overline"], []],
    solution:
      "複素数 $z$ と共役 $\\overline{z}$ を用いて $\\Re z=\\frac{z+\\overline{z}}{2}$、$\\Im z=\\frac{z-\\overline{z}}{2i}$ と表せる。",
    level: 2,
  },
  {
    id: "writeup_quad_graph_4",
    topicId: "quad_graph_basic",
    title: "グラフの対称性",
    statement: "二次関数のグラフが軸に関して対称である理由を説明せよ。",
    rubric: [
      "軸 $x=\\alpha$ に対して $x=\\alpha\\pm t$ を比較すると述べている",
      "同じ $y$ になることを示している",
    ],
    rubricKeywords: [["x=\\\\alpha", "x=\\\\alpha\\\\pm t", "alpha", "に対して"], ["y", "同じ"]],
    solution:
      "軸を $x=\\alpha$ とすると、$x=\\alpha\\pm t$ のとき $y$ が同じ値になるため、軸に関して対称になる。",
    level: 2,
  },
  {
    id: "writeup_exp_log_equation_4",
    topicId: "exp_log_equations_basic",
    title: "底の統一",
    statement:
      "指数・対数方程式で底を統一する理由を説明せよ。",
    rubric: [
      "同じ底にすると比較や整理が容易と述べている",
      "変換によって等式が解けると述べている",
    ],
    rubricKeywords: [[], []],
    solution:
      "底を統一すると指数の比較や対数の性質が使いやすくなり、方程式を単純化できる。",
    level: 1,
  },
  {
    id: "writeup_stats_ci_4",
    topicId: "stats_confidence_interval_basic",
    title: "信頼区間と信頼度",
    statement: "信頼度を上げると信頼区間がどう変わるか説明せよ。",
    rubric: [
      "信頼度が上がると区間が広くなると述べている",
      "誤差を小さくするためのトレードオフに触れている",
    ],
    rubricKeywords: [[], ["誤差を小さくするためのトレ"]],
    solution:
      "信頼度を上げると区間は広くなる。確実性と区間の狭さはトレードオフ。",
    level: 1,
  },
  {
    id: "writeup_coord_distance_4",
    topicId: "coord_distance_point_line_basic",
    title: "距離公式の使い分け",
    statement: "点と直線の距離公式を使う場面を説明せよ。",
    rubric: [
      "垂線の長さを求めたい場面と述べている",
      "座標で計算を簡単にできると触れている",
    ],
    rubricKeywords: [[], []],
    solution:
      "点から直線への最短距離（垂線の長さ）を求めたいときに使う。座標で計算できるため便利。",
    level: 1,
  },
  {
    id: "writeup_vector_inner_4",
    topicId: "vector_inner_basic",
    title: "内積と長さ",
    statement: "内積を使ってベクトルの長さを表す方法を説明せよ。",
    rubric: [
      "$\\vec{a}\\cdot\\vec{a}=|a|^2$ を述べている",
      "成分から計算できることに触れている",
    ],
    rubricKeywords: [["\\\\vec{a}\\\\cdot\\\\vec{a}=|a|^2", "vec", "cdot"], []],
    solution:
      "内積より $\\vec{a}\\cdot\\vec{a}=|a|^2$。成分から内積を計算して長さが求まる。",
    level: 1,
  },
  {
    id: "writeup_trig_period_4",
    topicId: "trig_period_basic",
    title: "周期の変形",
    statement: "三角関数の周期を変形で確かめる方法を説明せよ。",
    rubric: [
      "$\\sin(x+2\\pi)=\\sin x$ の性質に触れている",
      "一般形で周期を判断できると述べている",
    ],
    rubricKeywords: [["\\\\sin(x+2\\\\pi)=\\\\sin x", "sin", "pi"], []],
    solution:
      "基本性質 $\\sin(x+2\\pi)=\\sin x$ を使い、置換して同じ値になる周期を確認する。",
    level: 2,
  },
  {
    id: "writeup_prob_basic_4",
    topicId: "prob_basic",
    title: "確率の加法",
    statement: "確率の加法定理の意味を説明せよ。",
    rubric: [
      "排反なら $P(A\\cup B)=P(A)+P(B)$ と述べている",
      "一般形で重なりを引くと述べている",
    ],
    rubricKeywords: [["P(A\\\\cup B)=P(A)+P(B)", "排反なら", "cup"], []],
    solution:
      "排反なら和でよく、一般には $P(A\\cup B)=P(A)+P(B)-P(A\\cap B)$ と重なりを引く。",
    level: 2,
  },
  {
    id: "writeup_combi_basic_4",
    topicId: "combi_basic",
    title: "積の法則の応用",
    statement: "複数段階の選び方を数えるときの考え方を説明せよ。",
    rubric: [
      "順に選ぶと掛け合わせると述べている",
      "例や一般的な式で説明できている",
    ],
    rubricKeywords: [[], []],
    solution:
      "各段階の選び方を順に掛け合わせることで全体の数が得られる（積の法則）。",
    level: 1,
  },
  {
    id: "writeup_calc_integral_4",
    topicId: "calc_integral_basic",
    title: "面積以外の意味",
    statement: "定積分が面積以外に表す量の例を説明せよ。",
    rubric: [
      "累積量や総和としての意味に触れている",
      "具体例（移動距離など）を述べている",
    ],
    rubricKeywords: [[], ["具体例", "移動距離など"]],
    solution:
      "定積分は面積以外にも累積量を表す。例えば速度の積分は移動距離になる。",
    level: 2,
  },
  {
    id: "writeup_complex_modulus_4",
    topicId: "complex_modulus_basic",
    title: "絶対値の計算",
    statement: "複素数の絶対値を成分で計算する方法を説明せよ。",
    rubric: [
      "$|x+iy|=\\sqrt{x^2+y^2}$ を述べている",
      "共役を使う方法にも触れていると良い",
    ],
    rubricKeywords: [["|x+iy|=\\\\sqrt{x^2+y^2}", "iy", "sqrt"], []],
    solution:
      "$|x+iy|=\\sqrt{x^2+y^2}$。また $|z|^2=z\\overline{z}$ を使って計算できる。",
    level: 1,
  },
  {
    id: "writeup_quad_inequality_4",
    topicId: "quad_inequality_basic",
    title: "解の範囲の書き方",
    statement: "二次不等式の解の範囲を正しく書く方法を説明せよ。",
    rubric: [
      "区間の形で表すことを述べている",
      "等号の有無を不等号に合わせると述べている",
    ],
    rubricKeywords: [[], []],
    solution:
      "解は区間で表し、$\\le,\\ge$ のとき端点を含む。$<,>$ なら端点を含めない。",
    level: 1,
  },
  {
    id: "writeup_geo_sine_cosine_law_4",
    topicId: "geo_sine_cosine_law_basic",
    title: "余弦定理から角を求める",
    statement: "余弦定理を使って角を求める方法を説明せよ。",
    rubric: [
      "三辺が分かれば角が求められると述べている",
      "余弦の逆関数を使うと触れている",
    ],
    rubricKeywords: [[], []],
    solution:
      "三辺が分かれば余弦定理で $\\cos C$ を求め、$\\arccos$ で角を求める。",
    level: 2,
  },
  {
    id: "writeup_exp_log_4",
    topicId: "exp_log_basic",
    title: "グラフの特徴",
    statement: "指数関数と対数関数のグラフの特徴を説明せよ。",
    rubric: [
      "単調性に触れている",
      "通る点や漸近線に触れている",
    ],
    rubricKeywords: [[], []],
    solution:
      "指数関数は単調増加で $(0,1)$ を通る。対数関数も単調増加で $(1,0)$ を通り、互いに対称。",
    level: 2,
  },
  {
    id: "writeup_trig_identities_4",
    topicId: "trig_identities_basic",
    title: "恒等式の導出",
    statement: "三角恒等式を導く方法を説明せよ。",
    rubric: [
      "単位円の定義に触れている",
      "基本恒等式から派生させると述べている",
    ],
    rubricKeywords: [[], []],
    solution:
      "単位円で $\\sin^2\\theta+\\cos^2\\theta=1$ を得て、これを基に他の恒等式を導く。",
    level: 2,
  },
  {
    id: "writeup_stats_mean_4",
    topicId: "stats_sample_mean_basic",
    title: "標本平均の使いどころ",
    statement: "標本平均が実務で使われる場面を説明せよ。",
    rubric: [
      "母平均の推定に使うと述べている",
      "ばらつきとの関係に触れている",
    ],
    rubricKeywords: [[], []],
    solution:
      "標本平均は母平均の推定に使われ、標準誤差と合わせて推定の精度を議論できる。",
    level: 1,
  },
  {
    id: "writeup_seq_arithmetic_sum_4",
    topicId: "seq_arithmetic_sum_basic",
    title: "等差数列の一般項",
    statement: "等差数列の一般項の求め方を説明せよ。",
    rubric: [
      "公差と初項で表すことを述べている",
      "$a_n=a_1+(n-1)d$ を示している",
    ],
    rubricKeywords: [[], ["a_n=a_1+(n-1)d"]],
    solution:
      "等差数列の一般項は $a_n=a_1+(n-1)d$。",
    level: 1,
  },
  {
    id: "writeup_vector_projection_4",
    topicId: "vector_projection_basic",
    title: "射影の計算方法",
    statement: "射影の計算手順を説明せよ。",
    rubric: [
      "内積と長さを使うと述べている",
      "公式の形に触れている",
    ],
    rubricKeywords: [[], []],
    solution:
      "射影の大きさは $\\frac{\\vec{a}\\cdot\\vec{b}}{|b|}$ の形で求められる（方向ベクトルで調整）。",
    level: 2,
  },
  {
    id: "writeup_poly_factor_4",
    topicId: "poly_factor_k_basic",
    title: "代入で条件決定",
    statement: "因数分解の条件を代入で決める手順を説明せよ。",
    rubric: [
      "候補の因数を仮定すると述べている",
      "代入で条件式を作ると述べている",
    ],
    rubricKeywords: [[], []],
    solution:
      "候補の因数 $(x-\\alpha)$ を仮定し、$P(\\alpha)=0$ の条件からパラメータを決める。",
    level: 2,
  },
  {
    id: "writeup_binomial_middle_4",
    topicId: "binomial_middle_coeff_basic",
    title: "係数の最大",
    statement: "二項係数の最大値がどこで生じるか説明せよ。",
    rubric: [
      "$k$ が $n/2$ 付近で最大になると述べている",
      "対称性に触れている",
    ],
    rubricKeywords: [["k", "n/2"], []],
    solution:
      "二項係数は $\\binom{n}{k}=\\binom{n}{n-k}$ の対称性があり、$k$ が $n/2$ 付近で最大になる。",
    level: 2,
  },
  {
    id: "writeup_identity_coeff_4",
    topicId: "identity_coefficient_basic",
    title: "次数ごとの比較",
    statement: "係数比較で次数ごとに比較する理由を説明せよ。",
    rubric: [
      "同次数同士が一致する必要があると述べている",
      "恒等式の性質に触れている",
    ],
    rubricKeywords: [[], []],
    solution:
      "恒等式は全ての $x$ で成立するので、同次数の係数が一致する必要がある。",
    level: 1,
  },
  {
    id: "writeup_prob_complement_4",
    topicId: "prob_complement_basic",
    title: "少なくともの確率",
    statement: "「少なくとも1回起こる」確率の求め方を説明せよ。",
    rubric: [
      "起こらない確率を引くと述べている",
      "余事象の考え方に触れている",
    ],
    rubricKeywords: [[], []],
    solution:
      "「少なくとも1回」は余事象が「一度も起こらない」なので、その確率を引けばよい。",
    level: 1,
  },
  {
    id: "writeup_trig_addition_4",
    topicId: "trig_addition_basic",
    title: "合成の考え方",
    statement: "三角関数の合成に加法定理を使う理由を説明せよ。",
    rubric: [
      "和差を単一角に変換できることを述べている",
      "係数の整理に使えると触れている",
    ],
    rubricKeywords: [[], []],
    solution:
      "加法定理で和差を単一角に変換でき、合成の係数を整理できる。",
    level: 2,
  },
  {
    id: "writeup_algebra_ineq_4",
    topicId: "algebra_ineq_basic",
    title: "不等式の解の確認",
    statement: "不等式の解を確認する方法を説明せよ。",
    rubric: [
      "数直線で符号を確認すると述べている",
      "境界での符号変化を述べている",
    ],
    rubricKeywords: [[], []],
    solution:
      "境界点で区間を分け、符号を確認して解の範囲を決める。",
    level: 1,
  },
  {
    id: "writeup_set_operations_4",
    topicId: "set_operations_basic",
    title: "補集合の意味",
    statement: "補集合の意味と使い方を説明せよ。",
    rubric: [
      "全体集合との差として説明している",
      "余事象との対応に触れている",
    ],
    rubricKeywords: [[], []],
    solution:
      "補集合は全体集合から集合を除いた部分で、確率では余事象として扱える。",
    level: 1,
  },
  {
    id: "writeup_identity_eval_4",
    topicId: "identity_eval_basic",
    title: "公式の活用",
    statement: "恒等式を使って計算を簡単にする流れを説明せよ。",
    rubric: [
      "置き換えや分解に触れている",
      "計算量が減ることを述べている",
    ],
    rubricKeywords: [[], []],
    solution:
      "恒等式で式を置き換えたり分解したりすると、計算量が減り整理しやすくなる。",
    level: 1,
  },
  {
    id: "writeup_inequality_amgm_4",
    topicId: "inequality_amgm_basic",
    title: "等号成立条件",
    statement: "AM-GM の等号成立条件を説明せよ。",
    rubric: [
      "全ての変数が等しいと述べている",
      "最小値・最大値で使うと触れている",
    ],
    rubricKeywords: [[], ["最小値"]],
    solution:
      "AM-GM は各変数が等しいときに等号成立し、最小値問題などで条件を決める手掛かりになる。",
    level: 2,
  },
  {
    id: "writeup_trig_double_4",
    topicId: "trig_double_angle_basic",
    title: "別形の使い分け",
    statement: "二倍角公式の形を使い分ける理由を説明せよ。",
    rubric: [
      "目的の式に合わせると述べている",
      "変形の容易さに触れている",
    ],
    rubricKeywords: [[], []],
    solution:
      "式に含まれる $\\sin^2$ や $\\cos^2$ の形に合わせると変形が容易になるため、形を使い分ける。",
    level: 2,
  },
  {
    id: "writeup_exp_log_domain_4",
    topicId: "exp_log_domain_basic",
    title: "定義域の落とし穴",
    statement: "対数の定義域を見落とすと何が起こるか説明せよ。",
    rubric: [
      "解として不適切な値が混入することを述べている",
      "チェックの必要性に触れている",
    ],
    rubricKeywords: [[], []],
    solution:
      "定義域外の値が解として残ってしまう。必ず真数が正か確認する必要がある。",
    level: 1,
  },
  {
    id: "writeup_coord_line_parallel_4",
    topicId: "coord_line_parallel_perp_basic",
    title: "法線ベクトルで判定",
    statement: "直線の法線ベクトルで平行・垂直を判定する方法を説明せよ。",
    rubric: [
      "法線ベクトルの平行が直線の平行を意味すると述べている",
      "内積0で垂直になることに触れている",
    ],
    rubricKeywords: [[], []],
    solution:
      "直線 $ax+by+c=0$ の法線ベクトルは $(a,b)$。法線が平行なら直線も平行、内積0なら直線は垂直。",
    level: 2,
  },
  {
    id: "writeup_poly_remainder_4",
    topicId: "poly_remainder_basic",
    title: "一次式で割った剰余",
    statement: "一次式で割った剰余の求め方を説明せよ。",
    rubric: [
      "代入で剰余が求まると述べている",
      "剰余定理に触れている",
    ],
    rubricKeywords: [[], []],
    solution:
      "一次式 $(x-a)$ で割った剰余は $P(a)$。剰余定理で求まる。",
    level: 1,
  },
  {
    id: "writeup_seq_geo_limit_4",
    topicId: "seq_geometric_limit_basic",
    title: "極限と初項",
    statement: "等比数列の極限が初項に依存するか説明せよ。",
    rubric: [
      "$|r|<1$ なら初項に関わらず0に収束と述べている",
      "他の場合の発散にも触れている",
    ],
    rubricKeywords: [["|r|<1"], []],
    solution:
      "$|r|<1$ なら初項に関わらず0に収束する。$|r|\\ge1$ なら発散して初項に依存する。",
    level: 2,
  },
  {
    id: "writeup_seq_recurrence_4",
    topicId: "seq_recurrence_basic",
    title: "漸化式の見通し",
    statement: "漸化式を解くときの見通しを説明せよ。",
    rubric: [
      "差分を取る・代入する等の方針に触れている",
      "既知の型に帰着させることを述べている",
    ],
    rubricKeywords: [["差分を取る"], []],
    solution:
      "差分を取る・代入するなどで既知の型（一次・等差・等比）に帰着させ、一般項を求める。",
    level: 2,
  },
  {
    id: "writeup_stats_se_4",
    topicId: "stats_standard_error_basic",
    title: "標準誤差と標本数",
    statement: "標本数が標準誤差に与える影響を説明せよ。",
    rubric: [
      "$\\sigma/\\sqrt{n}$ を述べている",
      "標本数が増えると減ると述べている",
    ],
    rubricKeywords: [["\\\\sigma/\\\\sqrt{n}", "sigma", "sqrt"], []],
    solution:
      "標準誤差は $\\sigma/\\sqrt{n}$ なので、標本数が増えると小さくなる。",
    level: 1,
  },
  {
    id: "writeup_stats_corr_4",
    topicId: "stats_correlation_basic",
    title: "相関と因果",
    statement: "相関係数と因果関係の違いを説明せよ。",
    rubric: [
      "相関は関係の強さを表すと述べている",
      "因果関係とは別であると述べている",
    ],
    rubricKeywords: [[], []],
    solution:
      "相関は関係の強さを表すだけで、因果関係を直接示すものではない。",
    level: 2,
  },
  {
    id: "writeup_vector_parallel_4",
    topicId: "vector_parallel_basic",
    title: "平行条件と内積",
    statement: "平行条件を内積で表す方法を説明せよ。",
    rubric: [
      "$\\vec{a}\\times\\vec{b}=\\vec{0}$ などの条件に触れている",
      "成分比例で示せることに触れている",
    ],
    rubricKeywords: [["\\\\vec{a}\\\\times\\\\vec{b}=\\\\vec{0}", "vec", "times"], []],
    solution:
      "平行なら成分が比例し、（3次元なら）外積がゼロになる。2次元でも比例で判定できる。",
    level: 2,
  },
  {
    id: "writeup_complex_argument_4",
    topicId: "complex_argument_basic",
    title: "偏角の加法",
    statement: "複素数の積で偏角がどう変わるか説明せよ。",
    rubric: [
      "偏角が加法的に変化すると述べている",
      "極形式に触れている",
    ],
    rubricKeywords: [[], []],
    solution:
      "極形式で $z_1z_2=r_1r_2(\\cos(\\theta_1+\\theta_2)+i\\sin(\\theta_1+\\theta_2))$ となり、偏角は加算される。",
    level: 2,
  },
  {
    id: "writeup_conic_circle_4",
    topicId: "conic_circle_basic",
    title: "円の標準形の利点",
    statement: "円を標準形にする利点を説明せよ。",
    rubric: [
      "中心と半径が直ちに分かると述べている",
      "図形的に解釈しやすいことに触れている",
    ],
    rubricKeywords: [[], []],
    solution:
      "標準形にすると中心と半径が直ちに分かり、図形的に扱いやすくなる。",
    level: 1,
  },
  {
    id: "writeup_calc_derivative_4",
    topicId: "calc_derivative_basic",
    title: "接線と増減",
    statement: "導関数の符号が増減を表す理由を説明せよ。",
    rubric: [
      "導関数が傾きであることを述べている",
      "正なら増加、負なら減少と述べている",
    ],
    rubricKeywords: [[], ["正なら増加"]],
    solution:
      "導関数は接線の傾きなので、正なら増加、負なら減少、0 なら停滞点を意味する。",
    level: 2,
  },
  {
    id: "writeup_calc_tangent_4",
    topicId: "calc_tangent_line_basic",
    title: "接線の判定",
    statement: "曲線と直線が接する条件を説明せよ。",
    rubric: [
      "共有点が1つになる条件に触れている",
      "方程式が重解をもつと述べている",
    ],
    rubricKeywords: [[], []],
    solution:
      "曲線と直線が接するのは共有点が1つのときで、連立して得られる方程式が重解を持つことが条件。",
    level: 2,
  },
  {
    id: "writeup_calc_area_4",
    topicId: "calc_area_basic",
    title: "面積と区間分割",
    statement: "面積計算で区間分割が必要な理由を説明せよ。",
    rubric: [
      "上下が入れ替わる場合に触れている",
      "交点で区間を分けると述べている",
    ],
    rubricKeywords: [[], []],
    solution:
      "上下が入れ替わると差の符号が変わるため、交点で区間を分けて積分する必要がある。",
    level: 2,
  },
  {
    id: "writeup_exp_log_property_4",
    topicId: "exp_log_property_basic",
    title: "対数の性質の導出",
    statement: "対数の性質が成り立つ理由を説明せよ。",
    rubric: [
      "指数法則との対応に触れている",
      "積が和、商が差になる理由を述べている",
    ],
    rubricKeywords: [[], ["積が和"]],
    solution:
      "指数法則 $a^{x+y}=a^xa^y$ を対数で表すと、積が和、商が差になる性質が得られる。",
    level: 2,
  },
  {
    id: "writeup_trig_radian_4",
    topicId: "trig_radian_basic",
    title: "弧度法の利点",
    statement: "弧度法を使う利点を説明せよ。",
    rubric: [
      "三角関数の微分・積分が簡単になると述べている",
      "弧長と角度が直接対応すると述べている",
    ],
    rubricKeywords: [["三角関数の微分"], []],
    solution:
      "弧度法では弧長と角度が直接対応し、三角関数の微分・積分の公式が簡潔になる。",
    level: 2,
  },
  {
    id: "writeup_coord_circle_4",
    topicId: "coord_circle_center_basic",
    title: "中心からの距離",
    statement: "円の方程式が中心からの距離で表される理由を説明せよ。",
    rubric: [
      "距離公式に触れている",
      "中心からの距離が一定と述べている",
    ],
    rubricKeywords: [[], []],
    solution:
      "距離公式で中心 $(a,b)$ からの距離が $r$ と一定になる条件が $(x-a)^2+(y-b)^2=r^2$。",
    level: 1,
  },
  {
    id: "writeup_vector_unit_4",
    topicId: "vector_unit_basic",
    title: "正規化の計算",
    statement: "ベクトルを正規化する計算手順を説明せよ。",
    rubric: [
      "大きさで割ると述べている",
      "式 $\\vec{a}/|a|$ を示している",
    ],
    rubricKeywords: [[], ["\\\\vec{a}/|a|", "vec"]],
    solution:
      "ベクトルを正規化するには $\\vec{a}/|a|$ として大きさで割る。",
    level: 1,
  },
  {
    id: "writeup_complex_conjugate_4",
    topicId: "complex_conjugate_basic",
    title: "共役と絶対値",
    statement: "共役を使って絶対値を表す方法を説明せよ。",
    rubric: [
      "$|z|^2=z\\overline{z}$ を述べている",
      "実数になる理由に触れている",
    ],
    rubricKeywords: [["|z|^2=z\\\\overline{z}", "overline"], []],
    solution:
      "共役を掛けると $z\\overline{z}=|z|^2$ となり実数になる。",
    level: 1,
  },
  {
    id: "writeup_quad_inequality_5",
    topicId: "quad_inequality_basic",
    title: "判別式と解の形",
    statement: "二次不等式の解の形と判別式の関係を説明せよ。",
    rubric: [
      "判別式が負なら符号が変わらないと述べている",
      "判別式が正なら区間で符号が変わると述べている",
    ],
    rubricKeywords: [[], []],
    solution:
      "判別式が負なら交点がなく符号が変わらない。正なら2交点で区間に分かれ、符号が変わる。",
    level: 3,
  },
  {
    id: "writeup_exp_log_5",
    topicId: "exp_log_basic",
    title: "指数・対数の単調性",
    statement: "指数関数と対数関数の単調性の理由を説明せよ。",
    rubric: [
      "底が1より大きい場合の増加性を述べている",
      "逆関数として単調性が対応すると述べている",
    ],
    rubricKeywords: [[], []],
    solution:
      "底が $a>1$ のとき指数関数は増加。対数関数はその逆関数なので同様に増加する。",
    level: 3,
  },
  {
    id: "writeup_trig_identities_5",
    topicId: "trig_identities_basic",
    title: "恒等式の変形方針",
    statement: "三角恒等式の変形で迷わないための方針を説明せよ。",
    rubric: [
      "片側を因数分解・共通因数でまとめると述べている",
      "基本恒等式へ寄せる方針に触れている",
    ],
    rubricKeywords: [["片側を因数分解"], []],
    solution:
      "一方を因数分解して共通因数を作り、基本恒等式 $\\sin^2+\\cos^2=1$ へ寄せるのが定石。",
    level: 3,
  },
  {
    id: "writeup_stats_mean_5",
    topicId: "stats_sample_mean_basic",
    title: "標本平均と標準誤差",
    statement: "標本平均と標準誤差の関係を説明せよ。",
    rubric: [
      "標本平均のばらつきが標準誤差で表されると述べている",
      "$\\sigma/\\sqrt{n}$ に触れている",
    ],
    rubricKeywords: [[], ["\\\\sigma/\\\\sqrt{n}", "sigma", "sqrt"]],
    solution:
      "標本平均のばらつきの尺度が標準誤差で、$\\sigma/\\sqrt{n}$ と表される。",
    level: 3,
  },
  {
    id: "writeup_seq_arithmetic_sum_5",
    topicId: "seq_arithmetic_sum_basic",
    title: "和の導出の別解",
    statement: "等差数列の和を別の方法で導く手順を説明せよ。",
    rubric: [
      "平均との差分や平均値×項数の考えに触れている",
      "最終式へ導くと述べている",
    ],
    rubricKeywords: [["平均との差分や平均値"], []],
    solution:
      "等差数列の平均は $(a_1+a_n)/2$。平均×項数で $S_n=\\frac{n(a_1+a_n)}{2}$ を得る。",
    level: 3,
  },
  {
    id: "writeup_trig_addition_5",
    topicId: "trig_addition_basic",
    title: "加法定理の証明方針",
    statement: "加法定理を導く一般的な方針を説明せよ。",
    rubric: [
      "単位円や回転行列の利用に触れている",
      "座標の回転・合成で導くと述べている",
    ],
    rubricKeywords: [[], ["座標の回転"]],
    solution:
      "単位円上の回転や回転行列の合成で座標を比較すると、加法定理を導ける。",
    level: 3,
  },
  {
    id: "writeup_inequality_amgm_5",
    topicId: "inequality_amgm_basic",
    title: "置換の方針",
    statement: "AM-GMを使う際の置換の方針を説明せよ。",
    rubric: [
      "非負条件を満たす形に変形すると述べている",
      "等号成立が見える形にすることを述べている",
    ],
    rubricKeywords: [[], []],
    solution:
      "非負になる形に置換し、等号成立が分かる形で AM-GM を適用するのが基本。",
    level: 3,
  },
  {
    id: "writeup_calc_area_5",
    topicId: "calc_area_basic",
    title: "面積の式の立て方",
    statement: "面積の式を立てるときの一般的な流れを説明せよ。",
    rubric: [
      "交点を求めて区間を決めると述べている",
      "上側-下側で差を取ると述べている",
    ],
    rubricKeywords: [[], ["上側"]],
    solution:
      "交点を求めて区間を決め、上側の関数から下側の関数を引いた差を積分する。",
    level: 3,
  },
  {
    id: "writeup_complex_argument_5",
    topicId: "complex_argument_basic",
    title: "偏角と積の関係",
    statement: "偏角が積で加算される理由を説明せよ。",
    rubric: [
      "極形式での表現に触れている",
      "角度の和になることを述べている",
    ],
    rubricKeywords: [[], []],
    solution:
      "極形式 $z=re^{i\\theta}$ を用いると積は $r_1r_2e^{i(\\theta_1+\\theta_2)}$ となり、偏角は加算される。",
    level: 3,
  },
  {
    id: "writeup_vector_projection_5",
    topicId: "vector_projection_basic",
    title: "射影と内積の関係",
    statement: "射影が内積で表せる理由を説明せよ。",
    rubric: [
      "内積が成分の積の和であることに触れている",
      "方向成分の取り出しと結び付けている",
    ],
    rubricKeywords: [[], ["方向成分の取り出しと結び付けている"]],
    solution:
      "内積は一方のベクトルの他方方向成分を測る量であり、射影の大きさを内積で表せる。",
    level: 3,
  },
  {
    id: "writeup_exp_log_equation_5",
    topicId: "exp_log_equations_basic",
    title: "解の妥当性チェック",
    statement: "対数方程式の解を検算する理由を説明せよ。",
    rubric: [
      "定義域外の解が混入しうると述べている",
      "代入で確認する必要に触れている",
    ],
    rubricKeywords: [[], []],
    solution:
      "対数は定義域があり、操作で無効な解が混入しうるため、元の式に代入して確認する。",
    level: 3,
  },
  {
    id: "writeup_stats_ci_5",
    topicId: "stats_confidence_interval_basic",
    title: "信頼区間の解釈",
    statement: "信頼区間を誤解しやすい点を説明せよ。",
    rubric: [
      "固定された区間に母平均が入る確率ではないと述べている",
      "標本ごとに区間が変わることに触れている",
    ],
    rubricKeywords: [[], []],
    solution:
      "信頼区間は標本に依存して変わる。固定区間に母平均が確率的に入るという意味ではない。",
    level: 3,
  },
  {
    id: "writeup_coord_distance_5",
    topicId: "coord_distance_point_line_basic",
    title: "距離公式と幾何",
    statement: "点と直線の距離公式が幾何的に納得できる理由を説明せよ。",
    rubric: [
      "垂線の長さとして捉えると述べている",
      "直線の法線ベクトルに触れている",
    ],
    rubricKeywords: [[], []],
    solution:
      "直線の法線方向に射影した長さが距離になるため、法線ベクトルの大きさで割る形になる。",
    level: 3,
  },
  {
    id: "writeup_poly_factor_5",
    topicId: "poly_factor_k_basic",
    title: "因数分解とグラフ",
    statement: "因数分解とグラフの交点の関係を説明せよ。",
    rubric: [
      "因数の根がx軸交点になると述べている",
      "割り切れ条件と根の一致に触れている",
    ],
    rubricKeywords: [[], []],
    solution:
      "因数 $(x-a)$ を持つと $x=a$ が根となり、グラフはx軸と交わる。割り切れ条件と根は一致する。",
    level: 3,
  },
  {
    id: "writeup_binomial_middle_5",
    topicId: "binomial_middle_coeff_basic",
    title: "最大係数の理由",
    statement: "中央係数が最大になる理由を説明せよ。",
    rubric: [
      "対称性と隣り合う係数の比に触れている",
      "増加から減少に変わる点として述べている",
    ],
    rubricKeywords: [[], []],
    solution:
      "二項係数は対称で、隣り合う係数の比で増加→減少が変わる点が中央付近となるため最大になる。",
    level: 3,
  },
  {
    id: "writeup_identity_coeff_5",
    topicId: "identity_coefficient_basic",
    title: "係数比較の優位性",
    statement: "係数比較が代入法より優れている点を説明せよ。",
    rubric: [
      "全ての係数を一度に決められると述べている",
      "条件不足を避けられることに触れている",
    ],
    rubricKeywords: [[], []],
    solution:
      "係数比較は全次数を同時に比較でき、少数の代入による条件不足を避けられる。",
    level: 3,
  },
  {
    id: "writeup_trig_double_5",
    topicId: "trig_double_angle_basic",
    title: "二倍角の導出",
    statement: "二倍角公式の導き方の方針を説明せよ。",
    rubric: [
      "加法定理の利用に触れている",
      "同一角の和として導くと述べている",
    ],
    rubricKeywords: [[], []],
    solution:
      "加法定理に $\\alpha=\\beta=\\theta$ を代入して、二倍角公式を導く。",
    level: 3,
  },
  {
    id: "writeup_exp_log_domain_5",
    topicId: "exp_log_domain_basic",
    title: "底の条件",
    statement: "対数の底の条件 $a>0, a\\neq 1$ の意味を説明せよ。",
    rubric: [
      "指数関数の定義に触れている",
      "単調性が保たれる条件と述べている",
    ],
    rubricKeywords: [[], []],
    solution:
      "底が正でないと指数関数が定義できず、$a=1$ では一対一対応が崩れるため条件が必要。",
    level: 3,
  },
  {
    id: "writeup_coord_line_parallel_5",
    topicId: "coord_line_parallel_perp_basic",
    title: "傾きが使えない場合",
    statement: "傾きが使えない場合の平行・垂直判定法を説明せよ。",
    rubric: [
      "法線ベクトルを使うと述べている",
      "係数比較の考えに触れている",
    ],
    rubricKeywords: [[], []],
    solution:
      "直線 $ax+by+c=0$ の法線ベクトル $(a,b)$ を用い、係数の比例や内積で平行・垂直を判定する。",
    level: 3,
  },
  {
    id: "writeup_seq_geo_limit_5",
    topicId: "seq_geometric_limit_basic",
    title: "比が1に近い場合",
    statement: "公比が1に近いときの極限の挙動を説明せよ。",
    rubric: [
      "|r|<1 と |r|=1 の違いに触れている",
      "発散や振動の可能性に触れている",
    ],
    rubricKeywords: [[], []],
    solution:
      "|r|<1 なら0へ収束するが、|r|=1 では一定または振動し、収束しない場合がある。",
    level: 3,
  },
  {
    id: "writeup_stats_se_5",
    topicId: "stats_standard_error_basic",
    title: "推定精度との関係",
    statement: "標準誤差が推定精度にどう影響するか説明せよ。",
    rubric: [
      "小さいほど推定が精密と述べている",
      "標本数で改善できることに触れている",
    ],
    rubricKeywords: [[], []],
    solution:
      "標準誤差が小さいほど推定は精密。標本数を増やすと標準誤差が下がり精度が上がる。",
    level: 3,
  },
  {
    id: "writeup_vector_parallel_5",
    topicId: "vector_parallel_basic",
    title: "比例関係の使い方",
    statement: "平行条件の比例関係を使って未知数を求める手順を説明せよ。",
    rubric: [
      "成分比を等しく置くと述べている",
      "連立方程式で解くことに触れている",
    ],
    rubricKeywords: [[], []],
    solution:
      "平行なら成分比が等しいので比例式を立て、未知数を連立で解く。",
    level: 3,
  },
  {
    id: "writeup_stats_corr_5",
    topicId: "stats_correlation_basic",
    title: "相関係数の限界",
    statement: "相関係数の限界や注意点を説明せよ。",
    rubric: [
      "非線形関係を捉えにくいことに触れている",
      "因果関係を示さない点を述べている",
    ],
    rubricKeywords: [[], []],
    solution:
      "相関係数は線形関係の強さしか表さず、非線形の関係や因果関係は示せない。",
    level: 3,
  },
  {
    id: "writeup_calc_derivative_5",
    topicId: "calc_derivative_basic",
    title: "増減と極値",
    statement: "導関数を使って極値を調べる流れを説明せよ。",
    rubric: [
      "導関数=0 の点を候補にすることを述べている",
      "増減表で判定することに触れている",
    ],
    rubricKeywords: [["導関数"], []],
    solution:
      "導関数を求めて $f'(x)=0$ の点を候補にし、増減表で符号が変わるかで極値を判定する。",
    level: 3,
  },
  {
    id: "writeup_calc_tangent_5",
    topicId: "calc_tangent_line_basic",
    title: "共有点の条件",
    statement: "接線条件を共有点の数で説明せよ。",
    rubric: [
      "共有点が1つになることを述べている",
      "連立で重解になると述べている",
    ],
    rubricKeywords: [[], []],
    solution:
      "曲線と直線の共有点が1つになるとき接線であり、連立して得る方程式が重解になる。",
    level: 3,
  },
  {
    id: "writeup_prob_combi_5",
    topicId: "prob_combi_basic",
    title: "数え上げの設計",
    statement: "複雑な場合の数を設計する方針を説明せよ。",
    rubric: [
      "条件で場合分けすることを述べている",
      "積や和の法則を併用することに触れている",
    ],
    rubricKeywords: [[], []],
    solution:
      "条件で排反な場合に分け、各場合で積・和の法則を使って数え上げる。",
    level: 3,
  },
  {
    id: "writeup_exp_log_prop_5",
    topicId: "exp_log_property_basic",
    title: "対数のまとめ方",
    statement: "複数の対数を1つにまとめる手順を説明せよ。",
    rubric: [
      "和は積、差は商に直すと述べている",
      "指数を前に出す性質に触れている",
    ],
    rubricKeywords: [["和は積"], []],
    solution:
      "対数の和は積、差は商に直し、指数は前に出して1つの対数にまとめる。",
    level: 3,
  },
  {
    id: "writeup_trig_radian_5",
    topicId: "trig_radian_basic",
    title: "弧度法の自然さ",
    statement: "弧度法が「自然な角度の測り方」と言われる理由を説明せよ。",
    rubric: [
      "弧長/半径の定義に触れている",
      "微分積分での簡潔さに触れている",
    ],
    rubricKeywords: [["弧長"], []],
    solution:
      "弧度法は弧長/半径で定義され、角度が長さに直接対応する。三角関数の微分・積分も簡潔になる。",
    level: 3,
  },
  {
    id: "writeup_coord_circle_5",
    topicId: "coord_circle_center_basic",
    title: "一般形の判定",
    statement: "二次方程式が円を表す条件を説明せよ。",
    rubric: [
      "平方完成で $r^2>0$ を確認することを述べている",
      "係数の一致（$x^2,y^2$ の係数が等しい）に触れている",
    ],
    rubricKeywords: [["r^2>0", "平方完成で"], ["x^2,y^2", "係数の一致", "の係数が等しい"]],
    solution:
      "$x^2,y^2$ の係数が等しく、平方完成で $r^2>0$ となれば円を表す。",
    level: 3,
  },
  {
    id: "writeup_vector_unit_5",
    topicId: "vector_unit_basic",
    title: "単位ベクトルの用途",
    statement: "単位ベクトルが役立つ場面を説明せよ。",
    rubric: [
      "方向の統一に使えると述べている",
      "射影や内積で便利になると触れている",
    ],
    rubricKeywords: [[], []],
    solution:
      "方向を統一したいときに使い、射影や内積の計算で扱いやすくなる。",
    level: 3,
  },
  {
    id: "writeup_complex_conjugate_5",
    topicId: "complex_conjugate_basic",
    title: "分母の有理化",
    statement: "共役を用いた分母の有理化の流れを説明せよ。",
    rubric: [
      "共役を掛けると述べている",
      "実数が残ることを述べている",
    ],
    rubricKeywords: [[], []],
    solution:
      "分母に共役を掛けると $z\\overline{z}$ が実数になるため、有理化できる。",
    level: 3,
  },
  {
    id: "writeup_prob_complement_5",
    topicId: "prob_complement_basic",
    title: "余事象の設計",
    statement: "余事象を使うべきか判断する基準を説明せよ。",
    rubric: [
      "直接数えるのが難しい場合と述べている",
      "余事象が簡単に数えられることに触れている",
    ],
    rubricKeywords: [[], []],
    solution:
      "直接数えるのが複雑なとき、余事象が簡単に数えられるなら余事象を用いるのが有効。",
    level: 3,
  },
  {
    id: "writeup_algebra_ineq_5",
    topicId: "algebra_ineq_basic",
    title: "不等式の同値変形",
    statement: "不等式の同値変形で注意すべき点を説明せよ。",
    rubric: [
      "負の数で割ると不等号が反転すると述べている",
      "同値性を保つ操作を選ぶと触れている",
    ],
    rubricKeywords: [[], []],
    solution:
      "負の数で割ると不等号が反転する。常に同値な変形になっているかを確認する。",
    level: 3,
  },
  {
    id: "writeup_set_operations_5",
    topicId: "set_operations_basic",
    title: "ド・モルガンの法則",
    statement: "集合のド・モルガンの法則の意味を説明せよ。",
    rubric: [
      "補集合の和と共通部分の入れ替えに触れている",
      "記号で示せている",
    ],
    rubricKeywords: [["補集合", "∪", "∩"], ["(A∪B)^c", "(A∩B)^c"], ["記号"]],
    solution:
      "補集合に対して $(A\\cup B)^c=A^c\\cap B^c$、$(A\\cap B)^c=A^c\\cup B^c$ が成り立つ。",
    level: 3,
  },
  {
    id: "writeup_identity_eval_5",
    topicId: "identity_eval_basic",
    title: "式変形の戦略",
    statement: "恒等式を使った式変形の戦略を説明せよ。",
    rubric: [
      "形を揃える方針に触れている",
      "既知の公式に合わせると述べている",
    ],
    rubricKeywords: [["形を揃える", "公式"], ["置換", "恒等式"], ["戦略"]],
    solution:
      "目標の形や既知の公式に合わせるように式を変形し、恒等式で置き換えるのが基本。",
    level: 3,
  },
  {
    id: "writeup_conic_circle_5",
    topicId: "conic_circle_basic",
    title: "円と距離の関係",
    statement: "円の方程式が距離の一定条件であることを説明せよ。",
    rubric: [
      "中心からの距離が一定と述べている",
      "距離公式に触れている",
    ],
    rubricKeywords: [["中心", "距離一定"], ["距離公式"], ["r^2", "結論"]],
    solution:
      "中心 $(a,b)$ からの距離が一定 $r$ である条件が $(x-a)^2+(y-b)^2=r^2$ となる。",
    level: 3,
  },
  {
    id: "writeup_quad_graph_5",
    topicId: "quad_graph_basic",
    title: "頂点と軸の求め方",
    statement: "二次関数の頂点と軸を効率的に求める方法を説明せよ。",
    rubric: [
      "平方完成を用いると述べている",
      "軸 $x=-\\frac{b}{2a}$ を示している",
    ],
    rubricKeywords: [["平方完成"], ["軸", "x=-b/2a"], ["頂点"]],
    solution:
      "平方完成で $y=a(x+\\frac{b}{2a})^2+\\cdots$ とし、軸 $x=-\\frac{b}{2a}$ と頂点を求める。",
    level: 3,
  },
  {
    id: "writeup_geo_sine_cosine_law_5",
    topicId: "geo_sine_cosine_law_basic",
    title: "解の一意性",
    statement: "正弦定理・余弦定理で解が一意かどうか判断する視点を説明せよ。",
    rubric: [
      "正弦定理は角が2通りになる場合があると述べている",
      "余弦定理は一意に決まると触れている",
    ],
    rubricKeywords: [["正弦定理", "2通り"], ["余弦定理", "一意"], ["判断"]],
    solution:
      "正弦定理は角の正弦が同じになる場合があり2通りが生じることがある。余弦定理は三辺が決まれば角は一意。",
    level: 3,
  },
  {
    id: "writeup_combi_basic_5",
    topicId: "combi_basic",
    title: "重複の除き方",
    statement: "場合の数で重複を除く考え方を説明せよ。",
    rubric: [
      "重複する分を割ると述べている",
      "同一の並び替えをまとめることに触れている",
    ],
    rubricKeywords: [["重複", "割る"], ["並び替え", "同一"], ["除く"]],
    solution:
      "重複する並び替えは同一とみなすため、その重複数だけ割って除く。",
    level: 3,
  },
  {
    id: "writeup_prob_basic_5",
    topicId: "prob_basic",
    title: "条件付き確率の視点",
    statement: "条件付き確率の考え方を説明せよ。",
    rubric: [
      "標本空間を条件で絞ると述べている",
      "式 $P(A|B)=\\frac{P(A\\cap B)}{P(B)}$ に触れている",
    ],
    rubricKeywords: [["条件付き", "標本空間"], ["P(A|B)", "P(A∩B)/P(B)"], ["割合"]],
    solution:
      "条件 $B$ が起きたと仮定して標本空間を絞り、その中で $A$ が起きる割合を考える。",
    level: 3,
  },
  {
    id: "writeup_vector_inner_5",
    topicId: "vector_inner_basic",
    title: "内積の利用場面",
    statement: "内積が役立つ場面を説明せよ。",
    rubric: [
      "角度や射影の計算に触れている",
      "直交判定に使えると述べている",
    ],
    rubricKeywords: [["角度", "射影"], ["直交判定"], ["利用"]],
    solution:
      "内積は角度や射影の計算、直交判定などに使える。",
    level: 3,
  },
  {
    id: "writeup_calc_integral_5",
    topicId: "calc_integral_basic",
    title: "積分の設計",
    statement: "定積分の計算方針を立てる手順を説明せよ。",
    rubric: [
      "積分区間を確認すると述べている",
      "原始関数を求めて差を取ると述べている",
    ],
    rubricKeywords: [["区間確認"], ["原始関数"], ["上端-下端"]],
    solution:
      "積分区間を確認し、原始関数を求めて上端-下端の差を取る。",
    level: 3,
  },
  {
    id: "writeup_trig_period_5",
    topicId: "trig_period_basic",
    title: "周期とグラフ",
    statement: "周期がグラフにどう反映されるか説明せよ。",
    rubric: [
      "周期ごとに同じ形が繰り返されると述べている",
      "横方向の伸縮と関連付けている",
    ],
    rubricKeywords: [["周期", "繰り返し"], ["横方向", "伸縮"], ["係数"]],
    solution:
      "周期ごとに同じ形が繰り返される。係数があると横方向の伸縮が起き、周期が変化する。",
    level: 3,
  },
  {
    id: "writeup_complex_modulus_5",
    topicId: "complex_modulus_basic",
    title: "絶対値と積",
    statement: "複素数の積で絶対値がどう変化するか説明せよ。",
    rubric: [
      "|zw|=|z||w| に触れている",
      "幾何学的意味に触れている",
    ],
    rubricKeywords: [["|zw|=|z||w|"], ["幾何学的", "距離"], ["倍率"]],
    solution:
      "複素数の積では絶対値が掛け算される。距離（大きさ）が倍率として作用する。",
    level: 3,
  },
  {
    id: "writeup_poly_remainder_5",
    topicId: "poly_remainder_basic",
    title: "剰余の設計",
    statement: "剰余定理を使った設計問題の方針を説明せよ。",
    rubric: [
      "剰余条件を式にすることを述べている",
      "代入で条件を立てると述べている",
    ],
    rubricKeywords: [["P(a)=r", "剰余定理"], ["条件式"], ["パラメータ"]],
    solution:
      "剰余が与えられる場合は $P(a)=r$ の形で条件式を作り、パラメータを決める。",
    level: 3,
  },
  {
    id: "writeup_seq_recurrence_5",
    topicId: "seq_recurrence_basic",
    title: "一般項の決定",
    statement: "漸化式から一般項を決定する流れを説明せよ。",
    rubric: [
      "形を整えて既知の型にすることを述べている",
      "初期条件で定数を決めると述べている",
    ],
    rubricKeywords: [["型に整える"], ["初期条件"], ["一般項"]],
    solution:
      "漸化式を既知の型に整えて一般項を求め、初期条件で定数を決める。",
    level: 3,
  },
  {
    id: "writeup_prob_combi_6",
    topicId: "prob_combi_basic",
    title: "順列・組合せの切り替え",
    statement: "同じ状況で順列と組合せを使い分ける視点を説明せよ。",
    rubric: [
      "順序を区別するかどうかを述べている",
      "具体的な例で言及していると良い",
    ],
    rubricKeywords: [[], []],
    solution:
      "順序を区別するなら順列、区別しないなら組合せを使う。例えば席順は順列、チーム分けは組合せ。",
    level: 2,
  },
  {
    id: "writeup_conic_circle_6",
    topicId: "conic_circle_basic",
    title: "円の一般形の判定",
    statement: "円の一般形から中心と半径を求める流れを説明せよ。",
    rubric: [
      "平方完成を述べている",
      "中心と半径が読み取れると述べている",
    ],
    rubricKeywords: [[], []],
    solution:
      "平方完成して標準形に直し、中心と半径を読み取る。",
    level: 2,
  },
  {
    id: "writeup_coord_circle_6",
    topicId: "coord_circle_center_basic",
    title: "円の式の読み替え",
    statement: "円の式を中心と半径に読み替える手順を説明せよ。",
    rubric: [
      "平方完成の手順に触れている",
      "半径の平方が正であることに触れている",
    ],
    rubricKeywords: [[], []],
    solution:
      "平方完成で $(x-a)^2+(y-b)^2=r^2$ に直し、$r^2>0$ を確認して中心と半径を読む。",
    level: 2,
  },
  {
    id: "writeup_vector_unit_6",
    topicId: "vector_unit_basic",
    title: "方向ベクトルとの関係",
    statement: "単位ベクトルと方向ベクトルの関係を説明せよ。",
    rubric: [
      "方向ベクトルを正規化すると単位ベクトルになると述べている",
      "大きさだけが違う点に触れている",
    ],
    rubricKeywords: [[], []],
    solution:
      "方向ベクトルを正規化すれば単位ベクトルになる。方向は同じで大きさだけが違う。",
    level: 2,
  },
  {
    id: "writeup_exp_log_equation_6",
    topicId: "exp_log_equations_basic",
    title: "底の統一の狙い",
    statement: "指数・対数方程式で底を揃える狙いを説明せよ。",
    rubric: [
      "同じ底にすると比較ができると述べている",
      "変形の自由度が増すことに触れている",
    ],
    rubricKeywords: [[], []],
    solution:
      "底を揃えると指数や対数を比較でき、方程式の形が簡単になって解きやすい。",
    level: 1,
  },
  {
    id: "writeup_stats_ci_6",
    topicId: "stats_confidence_interval_basic",
    title: "信頼区間の作り方",
    statement: "信頼区間を作るときの基本手順を説明せよ。",
    rubric: [
      "推定量と標準誤差を用いると述べている",
      "信頼係数で幅を決めることに触れている",
    ],
    rubricKeywords: [[], []],
    solution:
      "推定量に標準誤差を用いて誤差幅を作り、信頼係数に対応する幅を加減して区間を作る。",
    level: 1,
  },
  {
    id: "writeup_exp_log_property_6",
    topicId: "exp_log_property_basic",
    title: "対数の性質の方向",
    statement: "対数の性質で「まとめる」と「分解する」を使い分ける理由を説明せよ。",
    rubric: [
      "計算の見通しが良くなると述べている",
      "方程式の形に合わせると触れている",
    ],
    rubricKeywords: [[], []],
    solution:
      "式の形に合わせてまとめたり分解したりすると、計算や解法の見通しが良くなる。",
    level: 1,
  },
  {
    id: "writeup_calc_tangent_6",
    topicId: "calc_tangent_line_basic",
    title: "接線と接点",
    statement: "接線の式を求めるときに接点が重要な理由を説明せよ。",
    rubric: [
      "接点の座標で直線が定まると述べている",
      "傾きと点が必要であることを述べている",
    ],
    rubricKeywords: [[], []],
    solution:
      "接線は傾きと通る点で決まるため、接点の座標が必要になる。",
    level: 1,
  },
  {
    id: "writeup_calc_area_6",
    topicId: "calc_area_basic",
    title: "上下の判断",
    statement: "面積計算で上下の関数を判断する方法を説明せよ。",
    rubric: [
      "区間の中点で値を比較すると述べている",
      "グラフの位置関係を見ると触れている",
    ],
    rubricKeywords: [[], []],
    solution:
      "区間の中点などで値を比較し、上にある関数から下にある関数を引く。",
    level: 1,
  },
  {
    id: "writeup_quad_param_range_1",
    topicId: "quad_inequality_basic",
    title: "パラメータと判別式",
    statement:
      "実数 $a$ について、不等式 $x^2-2ax+a+3\\ge 0$ が全ての実数 $x$ で成り立つような $a$ の範囲を求めよ。",
    rubric: [
      "二次式が常に非負になる条件（判別式 $\\le 0$）を使う方針が書けている",
      "判別式を $a$ について整理している",
      "範囲を結論として示している",
    ],
    rubricKeywords: [["判別式", "常に非負"], ["a^2-a-3", "4a^2-4a-12"], ["範囲", "√13"]],
    solution:
      "判別式 $D=( -2a)^2-4(a+3)=4a^2-4a-12\\le 0$ より $a^2-a-3\\le 0$。したがって $\\frac{1-\\sqrt{13}}{2}\\le a\\le \\frac{1+\\sqrt{13}}{2}$。",
    level: 3,
  },
  {
    id: "writeup_quad_points_min_1",
    topicId: "quad_maxmin_basic",
    title: "2点通過と最小値",
    statement:
      "二次関数 $y=ax^2+bx+c$ が点 $(1,2),(3,0)$ を通るとき、$y$ の最小値を求めよ。",
    rubric: [
      "2点を代入して $a,b,c$ の関係式を立てている",
      "平方完成または軸で最小値を求める方針を示している",
      "最小値を結論として示している",
    ],
    rubricKeywords: [["2点", "連立"], ["平方完成", "軸", "頂点"], ["最小値", "1-a"]],
    solution:
      "条件より $a+b+c=2$, $9a+3b+c=0$。差を取って $8a+2b=-2$ なので $4a+b=-1$、よって $b=-1-4a$。すると $c=2-a-b=3+3a$。よって $y=a(x^2-4x+3)-x+3+3a=a(x-2)^2+(-x+3-a)$. 頂点は $x=2$ で $y= a(0)+(-2+3-a)=1-a$。また $a>0$ のとき最小値は $1-a$。$a<0$ なら最大値なので不適、よって $a>0$ を満たすとき最小値は $1-a$。",
    level: 3,
  },
  {
    id: "writeup_combi_restriction_1",
    topicId: "combi_conditions_basic",
    title: "条件付き組合せ",
    statement:
      "6人の中から3人を選ぶ。A,Bは同時に選ばれず、Cは必ず選ばれるときの選び方を求めよ。",
    rubric: [
      "Cを固定する方針を書いている",
      "A,Bの条件を場合分けして数えている",
      "合計の選び方を結論として示している",
    ],
    rubricKeywords: [["C固定", "必ず"], ["A,B", "同時", "場合分け"], ["合計", "通り"]],
    solution:
      "Cを固定し残り2人を選ぶ。Aを含む場合はBを除いて残り3人から1人選ぶので $3$ 通り。Aを含まない場合はBを含む/含まないで、A,Bを除いた3人から2人選ぶので $\\binom{3}{2}=3$ 通り。合計 $6$ 通り。",
    level: 3,
  },
  {
    id: "writeup_prob_condition_1",
    topicId: "prob_combi_basic",
    title: "条件付き確率",
    statement:
      "赤球3個・白球2個の袋から2個同時に取り出す。少なくとも1個が赤であるとき、2個とも赤である確率を求めよ。",
    rubric: [
      "条件付き確率 $P(A\\mid B)=\\frac{P(A\\cap B)}{P(B)}$ を用いている",
      "全事象と条件事象を組合せで数えている",
      "計算結果を結論として示している",
    ],
    rubricKeywords: [["条件付き確率", "P(A|B)"], ["組合せ", "C(5,2)", "C(3,2)"], ["1/3", "結論"]],
    solution:
      "全体は $\\binom{5}{2}=10$。2個とも赤は $\\binom{3}{2}=3$。少なくとも1個赤は $10-\\binom{2}{2}=9$。よって $\\frac{3}{9}=\\frac{1}{3}$。",
    level: 3,
  },
  {
    id: "writeup_int_diophantine_1",
    topicId: "int_diophantine_basic",
    title: "一次不定方程式の解",
    statement:
      "一次不定方程式 $3x+5y=1$ の整数解を求め、一般解を示せ。",
    rubric: [
      "1組の解を見つける方針が書けている",
      "一般解を $x=x_0+5t, y=y_0-3t$ の形で示している",
      "整数解であることを明記している",
    ],
    rubricKeywords: [["一次不定", "1組"], ["一般解", "x=", "y="], ["整数解", "t∈Z"]],
    solution:
      "$3(2)+5(-1)=1$ より $(x_0,y_0)=(2,-1)$。一般解は $x=2+5t, y=-1-3t$（$t\\in\\mathbb{Z}$）。",
    level: 3,
  },
  {
    id: "writeup_exp_log_param_1",
    topicId: "exp_log_equations_basic",
    title: "対数方程式（パラメータ）",
    statement:
      "実数 $a>1$ とする。方程式 $\\log_a(x-1)+\\log_a(x-3)=1$ の解を求めよ。",
    rubric: [
      "定義域 $x>3$ を確認している",
      "対数の和を積にまとめて解いている",
      "解が定義域を満たすか確認している",
    ],
    rubricKeywords: [["定義域", "x>3"], ["対数の和", "積"], ["x=2+", "確認"]],
    solution:
      "定義域は $x>3$。左辺は $\\log_a((x-1)(x-3))=1$ より $(x-1)(x-3)=a$。$x^2-4x+3-a=0$ を解いて $x=2\\pm\\sqrt{1+a}$。定義域より $x=2+\\sqrt{1+a}$。",
    level: 3,
  },
  {
    id: "writeup_trig_equation_1",
    topicId: "trig_equations_basic",
    title: "三角方程式の解",
    statement:
      "$0\\le \\theta<2\\pi$ で $\\sin\\theta+\\cos\\theta=\\frac{1}{2}$ を満たす $\\theta$ を求めよ。",
    rubric: [
      "合成または変形で $\\sin(\\theta+\\alpha)$ にまとめている",
      "解の範囲を考えて列挙している",
      "結論を範囲内の角で示している",
    ],
    rubricKeywords: [["合成", "√2"], ["解の範囲", "0≤θ<2π"], ["解", "結論"]],
    solution:
      "$\\sin\\theta+\\cos\\theta=\\sqrt{2}\\sin(\\theta+\\frac{\\pi}{4})=\\frac{1}{2}$ より $\\sin(\\theta+\\frac{\\pi}{4})=\\frac{1}{2\\sqrt{2}}$。$0\\le\\theta<2\\pi$ を満たす解を列挙する。",
    level: 3,
  },
  {
    id: "writeup_calc_increasing_param_1",
    topicId: "calc_increasing_basic",
    title: "増減とパラメータ",
    statement:
      "関数 $f(x)=x^3-3x^2+(m-2)x+1$ が区間 $[0,2]$ で単調増加となるような $m$ の範囲を求めよ。",
    rubric: [
      "導関数 $f'(x)$ を求めている",
      "区間で $f'(x)\\ge 0$ の条件を立てている",
      "範囲を結論として示している",
    ],
    rubricKeywords: [["導関数"], [">=0", "区間"], ["m>=5", "結論"]],
    solution:
      "$f'(x)=3x^2-6x+(m-2)$。$[0,2]$ で最小は $x=1$ なので $f'(1)=m-5\\ge 0$ より $m\\ge 5$。",
    level: 3,
  },
  {
    id: "writeup_seq_recurrence_1",
    topicId: "seq_recurrence_basic",
    title: "漸化式と一般項",
    statement:
      "数列 $a_{n+1}=2a_n+3$、$a_1=1$ の一般項を求めよ。",
    rubric: [
      "一次線形漸化式の解法（特解＋一般解）を示している",
      "初期条件で定数を決めている",
      "一般項を結論として示している",
    ],
    rubricKeywords: [["特解", "一般解"], [], []],
    solution:
      "定数解 $a= -3$。$b_n=a_n+3$ とおくと $b_{n+1}=2b_n$、$b_1=4$。よって $b_n=4\\cdot2^{n-1}$、$a_n=4\\cdot2^{n-1}-3$。",
    level: 3,
  },
  {
    id: "writeup_stats_regression_1",
    topicId: "stats_regression_basic",
    title: "回帰直線の利用",
    statement:
      "回帰直線 $y=0.8x+5$ が得られたとする。$x=30$ のときの予測値 $y$ を求め、解釈を述べよ。",
    rubric: [
      "回帰直線に代入して予測値を計算している",
      "予測値がデータの推定であることを述べている",
      "結論が簡潔に書けている",
    ],
    rubricKeywords: [["回帰直線", "代入"], ["予測値", "推定"], ["29", "結論"]],
    solution:
      "$y=0.8\\cdot30+5=29$。$x=30$ のときの推定値は $29$ となる。",
    level: 3,
  },
  {
    id: "writeup_calc_area_abs_1",
    topicId: "calc_integral_advanced_basic",
    title: "絶対値を含む面積",
    statement:
      "曲線 $y=x^3-3x$ と $x$ 軸で囲まれる部分の面積を求めよ。",
    rubric: [
      "交点を求めて区間を分けている",
      "符号に応じて積分を分割している",
      "面積として正の値で結論を示している",
    ],
    rubricKeywords: [["交点", "√3", "区間分割"], ["符号", "分割積分"], ["面積", "正"]],
    solution:
      "$x^3-3x=0$ より $x=-\\sqrt{3},0,\\sqrt{3}$。符号が変わるので区間を分割し、面積は $2\\int_0^{\\sqrt{3}}(3x-x^3)dx$。",
    level: 3,
  },
  {
    id: "writeup_calc_tangent_param_1",
    topicId: "calc_derivative_advanced_basic",
    title: "接線条件（パラメータ）",
    statement:
      "関数 $f(x)=x^3+ax^2+bx$ の $x=1$ と $x=2$ における接線が平行であるとき、$a,b$ を求めよ。",
    rubric: [
      "導関数から接線の傾きを求めている",
      "平行条件 $f'(1)=f'(2)$ を立てている",
      "連立を解いて $a,b$ を結論として示している",
    ],
    rubricKeywords: [["導関数", "傾き"], ["平行", "f(1)=f(2)"], ["a,b", "連立"]],
    solution:
      "$f'(x)=3x^2+2ax+b$。$f'(1)=3+2a+b$, $f'(2)=12+4a+b$ より $3+2a+b=12+4a+b$、$a=-\\frac{9}{2}$。",
    level: 3,
  },
  {
    id: "writeup_complex_locus_1",
    topicId: "complex_locus_circle_radius_basic",
    title: "等距離の軌跡",
    statement:
      "$|z-(1+i)|=|z-(3-i)|$ を満たす複素数 $z$ の軌跡を求めよ。",
    rubric: [
      "距離の等式を実数・虚数で整理している",
      "2点の垂直二等分線になることを示している",
      "結論を直線の式で示している",
    ],
    rubricKeywords: [["z=x+iy", "整理"], ["垂直二等分線", "等距離"], ["x-y=2", "直線"]],
    solution:
      "$z=x+iy$ とすると $(x-1)^2+(y-1)^2=(x-3)^2+(y+1)^2$。整理して $x-y=2$。",
    level: 3,
  },
  {
    id: "writeup_vector_plane_dist_1",
    topicId: "vector_plane_basic",
    title: "空間内の距離",
    statement:
      "点 $P(1,2,3)$ と平面 $x+2y-2z=4$ の距離を求めよ。",
    rubric: [
      "法線ベクトルを用いる方針を書いている",
      "距離公式 $\\frac{|ax_0+by_0+cz_0-d|}{\\sqrt{a^2+b^2+c^2}}$ を使っている",
      "数値を代入して結論を示している",
    ],
    rubricKeywords: [["法線ベクトル", "距離公式"], ["ax0+by0+cz0-d"], ["5/3", "結論"]],
    solution:
      "距離は $\\frac{|1+4-6-4|}{\\sqrt{1^2+2^2+(-2)^2}}=\\frac{5}{3}$。",
    level: 3,
  },
  {
    id: "writeup_quad_solve_1",
    topicId: "quad_solve_basic",
    title: "二次方程式の解法",
    statement: "方程式 $x^2-5x+6=0$ を解け。",
    rubric: [
      "因数分解または解の公式を使う方針が書けている",
      "因数分解 $(x-2)(x-3)=0$ もしくは公式で $x=2,3$ を導いている",
      "解を結論として明記している",
    ],
    rubricKeywords: [["因数分解", "解の公式"], ["x=2", "x=3"], ["解"]],
    solution: "$(x-2)(x-3)=0$ より $x=2,3$。",
    level: 2,
  },
  {
    id: "writeup_quad_discriminant_1",
    topicId: "quad_discriminant_basic",
    title: "判別式と実数解",
    statement:
      "方程式 $x^2-2(k-1)x+k+2=0$ が実数解をもつような $k$ の範囲を求めよ。",
    rubric: [
      "判別式 $D=b^2-4ac$ を用いる方針が書けている",
      "$D\\ge0$ の条件を立てている",
      "$k$ の範囲を結論として示している",
    ],
    rubricKeywords: [["判別式", "D"], ["D\\ge0"], ["k"]],
    solution: "判別式 $D=4(k-1)^2-4(k+2)$。$D\\ge0$ より $k\\le -1$ または $k\\ge2$。",
    level: 2,
  },
  {
    id: "writeup_quad_roots_relations_1",
    topicId: "quad_roots_relations_basic",
    title: "解と係数の関係",
    statement:
      "方程式 $x^2-3x+m=0$ の解を $\\alpha,\\beta$ とする。$\\alpha^2+\\beta^2=10$ のとき $m$ を求めよ。",
    rubric: [
      "$\\alpha+\\beta=3,\\ \\alpha\\beta=m$ を用いている",
      "$\\alpha^2+\\beta^2=(\\alpha+\\beta)^2-2\\alpha\\beta$ に変形している",
      "$m=-\\frac{1}{2}$ を結論として示している",
    ],
    rubricKeywords: [["α+β=3", "αβ=m"], ["(α+β)^2-2αβ"], ["m=-1/2"]],
    solution:
      "$10=(\\alpha+\\beta)^2-2\\alpha\\beta=9-2m$ より $m=-\\frac12$。",
    level: 2,
  },
  {
    id: "writeup_trig_ratio_1",
    topicId: "trig_ratio_basic",
    title: "三角比の基本",
    statement:
      "直角三角形で斜辺が $5$、一方の辺が $3$ のとき、残りの辺の長さと $\\sin\\theta,\\cos\\theta,\\tan\\theta$ を求めよ（$\\theta$ は長さ $3$ の辺の向かい角）。",
    rubric: [
      "三平方の定理で残りの辺を求めている",
      "$\\sin,\\cos,\\tan$ の定義に従って値を出している",
      "結果を整理して示している",
    ],
    rubricKeywords: [["三平方", "5-3"], ["sin", "cos", "tan"], ["結論"]],
    solution:
      "残りの辺は $4$。よって $\\sin\\theta=\\frac35,\\ \\cos\\theta=\\frac45,\\ \\tan\\theta=\\frac34$。",
    level: 2,
  },
  {
    id: "writeup_trig_special_angles_1",
    topicId: "trig_special_angles_basic",
    title: "特殊角の三角比",
    statement: "$\\sin30^\\circ,\\cos60^\\circ,\\tan45^\\circ$ を求めよ。",
    rubric: [
      "特殊角の値を使う方針が書けている",
      "$\\sin30^\\circ=\\frac12,\\ \\cos60^\\circ=\\frac12$ を示している",
      "$\\tan45^\\circ=1$ を結論として示している",
    ],
    rubricKeywords: [["特殊角"], ["1/2"], ["1"]],
    solution: "$\\sin30^\\circ=\\frac12,\\ \\cos60^\\circ=\\frac12,\\ \\tan45^\\circ=1$。",
    level: 1,
  },
  {
    id: "writeup_geo_right_triangle_1",
    topicId: "geo_measure_right_triangle_basic",
    title: "直角三角形の計量",
    statement: "直角三角形で直角をはさむ辺が $6,8$ のとき、斜辺の長さを求めよ。",
    rubric: [
      "三平方の定理を使う方針が書けている",
      "$c^2=6^2+8^2$ を計算している",
      "斜辺 $10$ を結論として示している",
    ],
    rubricKeywords: [["三平方"], ["6^2+8^2"], ["10"]],
    solution: "$c^2=36+64=100$ より $c=10$。",
    level: 1,
  },
  {
    id: "writeup_data_summary_1",
    topicId: "data_summary_basic",
    title: "平均と中央値",
    statement: "データ $2,3,4,6,9$ の平均と中央値を求めよ。",
    rubric: [
      "平均の定義（和÷個数）を使っている",
      "中央値が並べたときの中央であることを使っている",
      "平均と中央値を結論として示している",
    ],
    rubricKeywords: [["平均"], ["中央値"], ["結論"]],
    solution: "平均は $\\frac{2+3+4+6+9}{5}=4.8$、中央値は $4$。",
    level: 1,
  },
  {
    id: "writeup_data_variance_1",
    topicId: "data_variance_sd_basic",
    title: "分散と標準偏差",
    statement: "データ $1,2,3,4$ の分散と標準偏差を求めよ。",
    rubric: [
      "平均を求めている",
      "分散 $\\frac{1}{n}\\sum(x_i-\\bar{x})^2$ を計算している",
      "標準偏差を結論として示している",
    ],
    rubricKeywords: [["平均"], ["分散"], ["標準偏差"]],
    solution:
      "平均 $\\bar{x}=2.5$。分散 $\\frac{(1.5)^2+(0.5)^2+(0.5)^2+(1.5)^2}{4}=1.25$、標準偏差 $\\sqrt{1.25}$。",
    level: 2,
  },
  {
    id: "writeup_data_scatter_1",
    topicId: "data_scatter_basic",
    title: "散布図の傾向",
    statement: "点 $(1,2),(2,3),(3,5),(4,6)$ の散布図の傾向（正の相関・負の相関・相関なし）を述べよ。",
    rubric: [
      "点の並びから増加傾向を読み取っている",
      "正の相関と判断している",
      "結論を簡潔に示している",
    ],
    rubricKeywords: [["正の相関"], ["増加傾向"], ["結論"]],
    solution: "右上がりに並ぶため正の相関。",
    level: 1,
  },
  {
    id: "writeup_data_covariance_1",
    topicId: "data_covariance_basic",
    title: "共分散",
    statement: "データ $(x,y)=(1,2),(2,4),(3,5)$ の共分散を求めよ。",
    rubric: [
      "$\\bar{x},\\bar{y}$ を求めている",
      "共分散 $\\frac{1}{n}\\sum(x_i-\\bar{x})(y_i-\\bar{y})$ を計算している",
      "結果を結論として示している",
    ],
    rubricKeywords: [["共分散"], ["(x-\\bar{x})(y-\\bar{y})"], ["結論"]],
    solution:
      "$\\bar{x}=2,\\ \\bar{y}=\\frac{11}{3}$。共分散 $\\frac{1}{3}[(-1)(-\\tfrac53)+0(\\tfrac13)+(1)(\\tfrac23)]=1$。",
    level: 2,
  },
  {
    id: "writeup_data_correlation_1",
    topicId: "data_correlation_basic",
    title: "相関係数",
    statement: "データ $(x,y)=(1,2),(2,4),(3,5)$ の相関係数 $r$ を求めよ。",
    rubric: [
      "$r=\\frac{\\text{共分散}}{\\sigma_x\\sigma_y}$ を用いている",
      "分散・標準偏差を計算している",
      "相関係数の値を結論として示している",
    ],
    rubricKeywords: [["相関係数", "共分散"], ["標準偏差"], ["r"]],
    solution:
      "共分散 $1$、$\\sigma_x=\\sqrt{2/3},\\ \\sigma_y=\\sqrt{14/9}$ より $r=\\frac{1}{\\sqrt{28}/3}=\\frac{3}{\\sqrt{28}}$。",
    level: 2,
  },
  {
    id: "writeup_data_regression_1",
    topicId: "data_regression_basic",
    title: "回帰直線",
    statement: "データ $(x,y)=(1,2),(2,4),(3,5)$ の回帰直線 $y=ax+b$ を求めよ。",
    rubric: [
      "$a=\\frac{\\text{共分散}}{\\sigma_x^2}$、$b=\\bar{y}-a\\bar{x}$ を用いている",
      "$\\bar{x},\\bar{y}$ を計算している",
      "回帰直線の式を結論として示している",
    ],
    rubricKeywords: [["回帰直線"], ["a=共分散/分散"], ["b=\\bar{y}-a\\bar{x}"]],
    solution:
      "$\\bar{x}=2,\\ \\bar{y}=\\frac{11}{3}$。共分散 $1$、分散 $\\sigma_x^2=\\frac{2}{3}$ より $a=\\frac{3}{2}$、$b=\\frac{2}{3}$。",
    level: 2,
  },
  {
    id: "writeup_int_divisor_multiple_1",
    topicId: "int_divisor_multiple_basic",
    title: "約数と倍数",
    statement: "$360$ の正の約数の個数を求めよ。",
    rubric: [
      "素因数分解 $360=2^3\\cdot3^2\\cdot5$ をしている",
      "個数 $(3+1)(2+1)(1+1)$ を用いている",
      "答え $24$ を結論として示している",
    ],
    rubricKeywords: [["素因数分解"], ["(3+1)(2+1)(1+1)"], ["24"]],
    solution: "$360=2^3\\cdot3^2\\cdot5$ より個数は $4\\cdot3\\cdot2=24$。",
    level: 2,
  },
  {
    id: "writeup_int_remainder_1",
    topicId: "int_remainder_basic",
    title: "余りの計算",
    statement: "$7^4+5^3$ を $6$ で割った余りを求めよ。",
    rubric: [
      "合同式で簡単化する方針が書けている",
      "$7\\equiv1,\\ 5\\equiv -1\\pmod6$ を用いている",
      "余り $0$ を結論として示している",
    ],
    rubricKeywords: [["合同", "mod"], ["7≡1", "5≡-1"], ["余り"]],
    solution: "$7^4\\equiv1,\\ 5^3\\equiv-1$ より $1-1\\equiv0$。",
    level: 2,
  },
  {
    id: "writeup_int_prime_factor_1",
    topicId: "int_prime_factor_basic",
    title: "素因数分解",
    statement: "$540$ を素因数分解せよ。",
    rubric: [
      "2や3で割るなど素因数分解の手順が書けている",
      "$540=2^2\\cdot3^3\\cdot5$ を導いている",
      "結果を結論として示している",
    ],
    rubricKeywords: [["素因数分解"], ["2^2", "3^3", "5"], ["結論"]],
    solution: "$540=54\\cdot10=2^2\\cdot3^3\\cdot5$。",
    level: 1,
  },
  {
    id: "writeup_int_gcd_lcm_1",
    topicId: "int_gcd_lcm_applications_basic",
    title: "最大公約数・最小公倍数",
    statement: "$72$ と $120$ の最大公約数と最小公倍数を求めよ。",
    rubric: [
      "素因数分解を用いている",
      "最大公約数と最小公倍数の定義に従っている",
      "答えを結論として示している",
    ],
    rubricKeywords: [["最大公約数", "最小公倍数"], ["素因数分解"], ["結論"]],
    solution: "$72=2^3\\cdot3^2,\\ 120=2^3\\cdot3\\cdot5$。最大公約数 $2^3\\cdot3=24$、最小公倍数 $2^3\\cdot3^2\\cdot5=360$。",
    level: 2,
  },
  {
    id: "writeup_int_mod_intro_1",
    topicId: "int_mod_arithmetic_intro",
    title: "合同式の基礎",
    statement: "$12345$ を $7$ で割った余りを求めよ。",
    rubric: [
      "合同式で桁を分解する方針が書けている",
      "$10\\equiv3\\pmod7$ を用いて計算している",
      "余りを結論として示している",
    ],
    rubricKeywords: [["合同式"], ["10≡3"], ["余り"]],
    solution: "$12345\\equiv1\\cdot3^4+2\\cdot3^3+3\\cdot3^2+4\\cdot3+5\\equiv4$。",
    level: 2,
  },
  {
    id: "writeup_prop_basic_1",
    topicId: "prop_proposition_basic",
    title: "命題と対偶",
    statement: "命題「$x$ が偶数ならば $x^2$ は偶数である」の対偶を述べよ。",
    rubric: [
      "対偶の形を理解している",
      "「$x^2$ が奇数ならば $x$ は奇数」と書けている",
      "結論が簡潔に示されている",
    ],
    rubricKeywords: [["対偶"], ["奇数"], ["結論"]],
    solution: "対偶は「$x^2$ が奇数ならば $x$ は奇数である」。",
    level: 1,
  },
  {
    id: "writeup_algebra_expand_1",
    topicId: "algebra_expand_basic",
    title: "展開",
    statement: "$(2x-3)(x+5)$ を展開せよ。",
    rubric: [
      "分配法則を使っている",
      "各項を正しく掛けている",
      "整理して結論を示している",
    ],
    rubricKeywords: [["分配法則"], ["2x^2", "7x", "-15"], ["結論"]],
    solution: "$2x^2+10x-3x-15=2x^2+7x-15$。",
    level: 1,
  },
  {
    id: "writeup_algebra_factor_1",
    topicId: "algebra_factor_basic",
    title: "因数分解",
    statement: "$x^2-9x+20$ を因数分解せよ。",
    rubric: [
      "積が $20$、和が $-9$ となる組を探している",
      "$(x-4)(x-5)$ を導いている",
      "結論を示している",
    ],
    rubricKeywords: [["因数分解"], ["x-4", "x-5"], ["結論"]],
    solution: "$x^2-9x+20=(x-4)(x-5)$。",
    level: 1,
  },
  {
    id: "writeup_algebra_linear_eq_1",
    topicId: "algebra_linear_eq_basic",
    title: "一次方程式",
    statement: "$3x-7=2x+5$ を解け。",
    rubric: [
      "移項して $x$ を整理している",
      "$x=12$ を導いている",
      "結論を示している",
    ],
    rubricKeywords: [["移項"], ["x=12"], ["結論"]],
    solution: "$3x-2x=5+7$ より $x=12$。",
    level: 1,
  },
  {
    id: "writeup_exp_log_change_base_1",
    topicId: "exp_log_change_base_basic",
    title: "底の変換",
    statement: "$\\log_2 8$ を底の変換公式で求めよ。",
    rubric: [
      "底の変換公式 $\\log_a b=\\frac{\\log_c b}{\\log_c a}$ を使っている",
      "$\\log_2 8=\\frac{\\log 8}{\\log 2}$ などと変形している",
      "答え $3$ を結論として示している",
    ],
    rubricKeywords: [["底の変換", "log_c"], ["log 8", "log 2"], ["3"]],
    solution: "$\\log_2 8=\\frac{\\log 8}{\\log 2}=3$。",
    level: 2,
  },
  {
    id: "writeup_exp_log_growth_1",
    topicId: "exp_log_growth_basic",
    title: "指数成長と対数",
    statement: "$2\\times 3^n=162$ を満たす $n$ を求めよ。",
    rubric: [
      "指数部分を取り出して $3^n=81$ としている",
      "対数または指数の対応で $n=4$ を導いている",
      "結論を示している",
    ],
    rubricKeywords: [["3^n=81"], ["n=4"], ["結論"]],
    solution: "$3^n=81=3^4$ より $n=4$。",
    level: 2,
  },
  {
    id: "writeup_exp_log_simple_eq_1",
    topicId: "exp_log_simple_equation_basic",
    title: "指数方程式",
    statement: "$2^x=32$ を解け。",
    rubric: [
      "$32=2^5$ に書き換えている",
      "指数を比較して $x=5$ を導いている",
      "結論を示している",
    ],
    rubricKeywords: [["2^5"], ["x=5"], ["結論"]],
    solution: "$32=2^5$ より $x=5$。",
    level: 1,
  },
  {
    id: "writeup_exp_log_power_eq_1",
    topicId: "exp_log_power_equation_basic",
    title: "指数方程式（2x）",
    statement: "$5^{2x}=125$ を解け。",
    rubric: [
      "$125=5^3$ に直している",
      "指数を比較して $2x=3$ を導いている",
      "$x=\\frac{3}{2}$ を結論として示している",
    ],
    rubricKeywords: [["5^3"], ["2x=3"], ["3/2"]],
    solution: "$5^{2x}=5^3$ より $2x=3$、$x=\\frac{3}{2}$。",
    level: 2,
  },
  {
    id: "writeup_exp_log_log_eq_1",
    topicId: "exp_log_log_equation_basic",
    title: "対数方程式",
    statement: "$\\log_3 x=2$ を満たす $x$ を求めよ。",
    rubric: [
      "対数の定義 $\\log_a b=c\\iff a^c=b$ を用いている",
      "$x=3^2$ としている",
      "答え $9$ を結論として示している",
    ],
    rubricKeywords: [["定義", "a^c=b"], ["3^2"], ["9"]],
    solution: "$x=3^2=9$。",
    level: 1,
  },
  {
    id: "writeup_exp_log_sum_1",
    topicId: "exp_log_log_sum_basic",
    title: "対数の加法",
    statement: "$\\log_2 3+\\log_2 4$ を計算せよ。",
    rubric: [
      "加法公式 $\\log_a x+\\log_a y=\\log_a(xy)$ を用いている",
      "$\\log_2(12)$ にまとめている",
      "結論を示している",
    ],
    rubricKeywords: [["加法公式"], ["log_2(12)"], ["結論"]],
    solution: "$\\log_2 3+\\log_2 4=\\log_2(12)$。",
    level: 2,
  },
  {
    id: "writeup_exp_log_diff_1",
    topicId: "exp_log_log_diff_basic",
    title: "対数の減法",
    statement: "$\\log_3 27-\\log_3 3$ を計算せよ。",
    rubric: [
      "減法公式 $\\log_a x-\\log_a y=\\log_a(x/y)$ を用いている",
      "$\\log_3(9)$ にまとめている",
      "答え $2$ を結論として示している",
    ],
    rubricKeywords: [["減法公式"], ["log_3(9)"], ["2"]],
    solution: "$\\log_3 27-\\log_3 3=\\log_3 9=2$。",
    level: 1,
  },
  {
    id: "writeup_exp_log_product_1",
    topicId: "exp_log_log_product_basic",
    title: "指数法則と対数",
    statement: "$\\log_2(2^3\\cdot2^4)$ を計算せよ。",
    rubric: [
      "指数法則で $2^3\\cdot2^4=2^7$ を用いている",
      "$\\log_2(2^7)=7$ を導いている",
      "結論を示している",
    ],
    rubricKeywords: [["指数法則"], ["2^7"], ["7"]],
    solution: "$2^3\\cdot2^4=2^7$ より $\\log_2(2^7)=7$。",
    level: 1,
  },
  {
    id: "writeup_coord_line_slope_1",
    topicId: "coord_line_slope_basic",
    title: "直線の傾き",
    statement: "点 $A(1,2)$ と $B(5,6)$ を結ぶ直線の傾きを求めよ。",
    rubric: [
      "傾きの公式 $\\frac{y_2-y_1}{x_2-x_1}$ を用いている",
      "$\\frac{6-2}{5-1}$ を計算している",
      "答え $1$ を結論として示している",
    ],
    rubricKeywords: [["傾き", "(y2-y1)/(x2-x1)"], ["4/4"], ["1"]],
    solution: "$\\frac{6-2}{5-1}=1$。",
    level: 1,
  },
  {
    id: "writeup_coord_line_intercept_1",
    topicId: "coord_line_intercept_basic",
    title: "切片",
    statement: "直線 $y=-2x+6$ の $x$ 切片を求めよ。",
    rubric: [
      "$y=0$ を代入している",
      "$-2x+6=0$ を解いている",
      "$x=3$ を結論として示している",
    ],
    rubricKeywords: [["y=0"], ["-2x+6=0"], ["3"]],
    solution: "$y=0$ より $-2x+6=0$、$x=3$。",
    level: 1,
  },
  {
    id: "writeup_coord_circle_radius_1",
    topicId: "coord_circle_radius_basic",
    title: "円の半径",
    statement: "中心 $C(2,-1)$ をもち点 $P(5,3)$ を通る円の半径を求めよ。",
    rubric: [
      "距離公式を用いている",
      "$(5-2)^2+(3+1)^2$ を計算している",
      "半径 $5$ を結論として示している",
    ],
    rubricKeywords: [["距離公式"], ["(5-2)^2+(3+1)^2"], ["5"]],
    solution: "$r=\\sqrt{3^2+4^2}=5$。",
    level: 1,
  },
  {
    id: "writeup_coord_region_1",
    topicId: "coord_region_basic",
    title: "領域",
    statement: "不等式 $x+y\\le4,\\ x\\ge0,\\ y\\ge0$ が表す領域を座標平面に図示し説明せよ。",
    rubric: [
      "第一象限の条件を反映している",
      "直線 $x+y=4$ の下側を示している",
      "三角形領域であることを説明している",
    ],
    rubricKeywords: [["第一象限"], ["x+y=4"], ["三角形"]],
    solution: "第一象限で直線 $x+y=4$ の下側。頂点 $(0,0),(4,0),(0,4)$ の三角形。",
    level: 2,
  },
  {
    id: "writeup_trig_identity_pythag_1",
    topicId: "trig_identity_pythag_basic",
    title: "三角恒等式",
    statement: "$\\sin^2\\theta+\\cos^2\\theta=1$ から $\\sin^2\\theta$ を $\\cos\\theta$ で表せ。",
    rubric: [
      "恒等式を変形している",
      "$\\sin^2\\theta=1-\\cos^2\\theta$ を導いている",
      "結論を示している",
    ],
    rubricKeywords: [["恒等式"], ["1-\\cos^2\\theta"], ["結論"]],
    solution: "$\\sin^2\\theta=1-\\cos^2\\theta$。",
    level: 1,
  },
  {
    id: "writeup_trig_amplitude_1",
    topicId: "trig_amplitude_basic",
    title: "振幅",
    statement: "関数 $y=3\\sin x-2$ の振幅を求めよ。",
    rubric: [
      "振幅は係数の絶対値であることを用いている",
      "$|3|=3$ としている",
      "結論を示している",
    ],
    rubricKeywords: [["振幅"], ["|3|"], ["3"]],
    solution: "振幅は $3$。",
    level: 1,
  },
  {
    id: "writeup_trig_phase_shift_1",
    topicId: "trig_phase_shift_basic",
    title: "位相シフト",
    statement: "関数 $y=\\sin(x-\\frac{\\pi}{3})$ の位相のずれを答えよ。",
    rubric: [
      "$x-\\alpha$ 形は右に $\\alpha$ だけ移動と理解している",
      "$\\frac{\\pi}{3}$ だけ右にずれると書けている",
      "結論を示している",
    ],
    rubricKeywords: [["位相"], ["右に\\pi/3"], ["結論"]],
    solution: "右に $\\frac{\\pi}{3}$ だけずれる。",
    level: 2,
  },
  {
    id: "writeup_trig_vertical_shift_1",
    topicId: "trig_vertical_shift_basic",
    title: "縦の平行移動",
    statement: "関数 $y=\\cos x+4$ の中線（平均値）を求めよ。",
    rubric: [
      "中線は $y=d$（縦方向の平行移動）と理解している",
      "$d=4$ を読み取っている",
      "結論を示している",
    ],
    rubricKeywords: [["中線", "平均値"], ["d=4"], ["結論"]],
    solution: "中線は $y=4$。",
    level: 1,
  },
  {
    id: "writeup_trig_graph_range_1",
    topicId: "trig_graph_range_basic",
    title: "値域",
    statement: "関数 $y=2\\sin x-1$ の値域を求めよ。",
    rubric: [
      "$\\sin x\\in[-1,1]$ を用いている",
      "$y\\in[-3,1]$ を導いている",
      "結論を示している",
    ],
    rubricKeywords: [["-1\\le\\sin x\\le1"], ["-3\\le y\\le1"], ["結論"]],
    solution: "$-1\\le\\sin x\\le1$ より $-3\\le y\\le1$。",
    level: 2,
  },
  {
    id: "writeup_trig_graph_period_1",
    topicId: "trig_graph_period_basic",
    title: "周期",
    statement: "関数 $y=\\sin(2x)$ の周期を求めよ。",
    rubric: [
      "周期は $\\frac{2\\pi}{|k|}$ を用いている",
      "$\\frac{2\\pi}{2}=\\pi$ を計算している",
      "結論を示している",
    ],
    rubricKeywords: [["周期", "2\\pi/|k|"], ["\\pi"], ["結論"]],
    solution: "周期は $\\pi$。",
    level: 2,
  },
  {
    id: "writeup_trig_graph_midline_1",
    topicId: "trig_graph_midline_basic",
    title: "中線",
    statement: "関数 $y=2\\sin x+3$ の中線（平均値）を求めよ。",
    rubric: [
      "中線は $y=d$ と理解している",
      "$d=3$ を読み取っている",
      "結論を示している",
    ],
    rubricKeywords: [["中線"], ["d=3"], ["結論"]],
    solution: "中線は $y=3$。",
    level: 1,
  },
  {
    id: "writeup_trig_graph_max_1",
    topicId: "trig_graph_max_basic",
    title: "最大値",
    statement: "関数 $y=4\\sin x+1$ の最大値を求めよ。",
    rubric: [
      "$\\sin x\\le1$ を用いている",
      "最大値 $4\\cdot1+1=5$ を導いている",
      "結論を示している",
    ],
    rubricKeywords: [["最大値"], ["\\sin x\\le1"], ["5"]],
    solution: "最大値は $5$。",
    level: 1,
  },
  {
    id: "writeup_trig_graph_min_1",
    topicId: "trig_graph_min_basic",
    title: "最小値",
    statement: "関数 $y=3\\cos x-2$ の最小値を求めよ。",
    rubric: [
      "$\\cos x\\ge-1$ を用いている",
      "最小値 $3(-1)-2=-5$ を導いている",
      "結論を示している",
    ],
    rubricKeywords: [["最小値"], ["\\cos x\\ge-1"], ["-5"]],
    solution: "最小値は $-5$。",
    level: 1,
  },
  {
    id: "writeup_trig_graph_intercept_1",
    topicId: "trig_graph_intercept_basic",
    title: "切片",
    statement: "関数 $y=2\\sin x-3$ の $x=0$ における値を求めよ。",
    rubric: [
      "$\\sin0=0$ を用いている",
      "$y=-3$ を導いている",
      "結論を示している",
    ],
    rubricKeywords: [["sin0=0"], ["y=-3"], ["結論"]],
    solution: "$y=2\\sin0-3=-3$。",
    level: 1,
  },
  {
    id: "writeup_trig_equation_radian_1",
    topicId: "trig_equation_radian_basic",
    title: "三角方程式",
    statement: "$0\\le x<2\\pi$ で $\\sin x=\\frac12$ を満たす $x$ を求めよ。",
    rubric: [
      "基準角 $\\frac{\\pi}{6}$ を使っている",
      "解が $\\frac{\\pi}{6},\\frac{5\\pi}{6}$ としている",
      "結論を示している",
    ],
    rubricKeywords: [["\\pi/6"], ["5\\pi/6"], ["結論"]],
    solution: "$x=\\frac{\\pi}{6},\\ \\frac{5\\pi}{6}$。",
    level: 2,
  },
  {
    id: "writeup_trig_identity_tan_1",
    topicId: "trig_identity_tan_basic",
    title: "正接の恒等式",
    statement: "$1+\\tan^2\\theta=\\frac{1}{\\cos^2\\theta}$ を示せ。",
    rubric: [
      "$\\tan\\theta=\\frac{\\sin\\theta}{\\cos\\theta}$ を用いている",
      "$\\sin^2\\theta+\\cos^2\\theta=1$ を使っている",
      "恒等式を結論として示している",
    ],
    rubricKeywords: [["tan=sin/cos"], ["sin^2+cos^2=1"], ["結論"]],
    solution:
      "$1+\\tan^2\\theta=1+\\frac{\\sin^2\\theta}{\\cos^2\\theta}=\\frac{\\sin^2\\theta+\\cos^2\\theta}{\\cos^2\\theta}=\\frac{1}{\\cos^2\\theta}$。",
    level: 2,
  },
  {
    id: "writeup_trig_identity_tan_relation_1",
    topicId: "trig_identity_tan_relation_basic",
    title: "正接の関係式",
    statement: "$\\tan\\theta+\\cot\\theta=\\frac{1}{\\sin\\theta\\cos\\theta}$ を示せ。",
    rubric: [
      "$\\tan\\theta=\\frac{\\sin\\theta}{\\cos\\theta}$, $\\cot\\theta=\\frac{\\cos\\theta}{\\sin\\theta}$ を用いている",
      "通分して $\\frac{\\sin^2\\theta+\\cos^2\\theta}{\\sin\\theta\\cos\\theta}$ を導いている",
      "$\\frac{1}{\\sin\\theta\\cos\\theta}$ を結論として示している",
    ],
    rubricKeywords: [["tan", "cot"], ["sin^2+cos^2"], ["1/(sin cos)"]],
    solution:
      "$\\tan\\theta+\\cot\\theta=\\frac{\\sin\\theta}{\\cos\\theta}+\\frac{\\cos\\theta}{\\sin\\theta}=\\frac{\\sin^2\\theta+\\cos^2\\theta}{\\sin\\theta\\cos\\theta}=\\frac{1}{\\sin\\theta\\cos\\theta}$。",
    level: 3,
  },
  {
    id: "writeup_geo_ratio_1",
    topicId: "geo_ratio_theorems",
    title: "中点連結定理",
    statement:
      "三角形 $ABC$ で $AB=AC$ とする。$AB$ の中点を $D$、$AC$ の中点を $E$ とするとき、$DE\\parallel BC$ を示せ。",
    rubric: [
      "中点連結定理（中点を結ぶ線分が平行）を用いている",
      "$D,E$ がそれぞれ中点であることを明示している",
      "$DE\\parallel BC$ を結論として示している",
    ],
    rubricKeywords: [["中点連結定理"], ["中点"], ["DE\\parallel BC"]],
    solution: "三角形の2辺の中点を結ぶ線分は第三辺に平行なので $DE\\parallel BC$。",
    level: 2,
  },
  {
    id: "writeup_geo_circle_geometry_1",
    topicId: "geo_circle_geometry",
    title: "円周角の定理",
    statement: "円周上の点 $A,B,C$ に対し、弧 $BC$ に対する円周角 $\\angle BAC$ が中心角の半分であることを述べよ。",
    rubric: [
      "円周角の定理を使う方針が書けている",
      "中心角 $\\angle BOC$ と円周角 $\\angle BAC$ の関係を述べている",
      "結論として「円周角は中心角の半分」を示している",
    ],
    rubricKeywords: [["円周角", "中心角"], ["1/2"], ["結論"]],
    solution: "円周角の定理より $\\angle BAC=\\frac12\\angle BOC$。",
    level: 2,
  },
  {
    id: "writeup_geo_triangle_centers_1",
    topicId: "geo_triangle_centers",
    title: "三角形の重心",
    statement:
      "三角形の3本の中線は1点で交わり、その点は各中線を $2:1$ に内分することを示せ。",
    rubric: [
      "中線の交点が重心であることを述べている",
      "内分比 $2:1$ を示している",
      "結論を明確に書いている",
    ],
    rubricKeywords: [["重心"], ["2:1"], ["中線"]],
    solution: "中線は一点で交わり、その点（重心）は各中線を頂点側から $2:1$ に内分する。",
    level: 2,
  },
  {
    id: "writeup_geo_circle_relations_1",
    topicId: "geo_circle_relations",
    title: "接線と半径",
    statement: "円の接線は接点における半径と直交することを示せ。",
    rubric: [
      "接線の性質を用いる方針が書けている",
      "半径が最短距離になることを述べている",
      "直交を結論として示している",
    ],
    rubricKeywords: [["接線"], ["半径"], ["直交"]],
    solution: "円の中心から接点への半径が最短距離となるため接線と直交する。",
    level: 2,
  },
  {
    id: "writeup_poly_value_sum_1",
    topicId: "poly_value_sum_basic",
    title: "多項式の値の和",
    statement: "多項式 $f(x)=x^3-2x^2+1$ について $f(1)+f(-1)$ を求めよ。",
    rubric: [
      "代入して $f(1), f(-1)$ を求めている",
      "計算を整理している",
      "結論を示している",
    ],
    rubricKeywords: [["f(1)", "f(-1)"], ["代入"], ["結論"]],
    solution: "$f(1)=0,\\ f(-1)=-2$ より和は $-2$。",
    level: 1,
  },
  {
    id: "writeup_poly_coeff_from_roots_1",
    topicId: "poly_coeff_from_roots_basic",
    title: "解と係数（多項式）",
    statement:
      "二次方程式 $x^2-ax+b=0$ の解が $2,3$ のとき $a,b$ を求めよ。",
    rubric: [
      "解と係数の関係 $a=\\alpha+\\beta,\\ b=\\alpha\\beta$ を用いている",
      "$a=5, b=6$ を導いている",
      "結論を示している",
    ],
    rubricKeywords: [["α+β", "αβ"], ["a=5", "b=6"], ["結論"]],
    solution: "$a=2+3=5,\\ b=2\\cdot3=6$。",
    level: 1,
  },
  {
    id: "writeup_binomial_coeff_1",
    topicId: "binomial_coeff_basic",
    title: "二項係数",
    statement: "$(x+y)^5$ の展開における $x^2y^3$ の係数を求めよ。",
    rubric: [
      "二項定理を用いている",
      "係数が $\\binom{5}{2}$ としている",
      "答え $10$ を示している",
    ],
    rubricKeywords: [["二項定理"], ["\\binom{5}{2}"], ["10"]],
    solution: "係数は $\\binom{5}{2}=10$。",
    level: 2,
  },
  {
    id: "writeup_binomial_xy_coeff_1",
    topicId: "binomial_xy_coeff_basic",
    title: "係数（一般形）",
    statement: "$(x+2y)^4$ の展開における $x^2y^2$ の係数を求めよ。",
    rubric: [
      "二項定理で一般項を用いている",
      "係数が $\\binom{4}{2}2^2$ としている",
      "答え $24$ を示している",
    ],
    rubricKeywords: [["二項定理"], ["\\binom{4}{2}2^2"], ["24"]],
    solution: "係数は $\\binom{4}{2}2^2=6\\cdot4=24$。",
    level: 2,
  },
  {
    id: "writeup_binomial_value_1",
    topicId: "binomial_value_basic",
    title: "二項展開の値",
    statement: "$(1+2)^6$ を二項定理を使って求めよ。",
    rubric: [
      "二項定理の形を示している",
      "計算して $3^6$ に一致させている",
      "値 $729$ を示している",
    ],
    rubricKeywords: [["二項定理"], ["3^6"], ["729"]],
    solution: "$(1+2)^6=3^6=729$。",
    level: 1,
  },
  {
    id: "writeup_identity_coeff_quad_1",
    topicId: "identity_coeff_quadratic_basic",
    title: "恒等式の係数比較",
    statement:
      "$(x+1)^2\\equiv x^2+ax+b$ が恒等式となるとき $a,b$ を求めよ。",
    rubric: [
      "展開して係数比較する方針が書けている",
      "$x^2+2x+1$ と比較している",
      "$a=2, b=1$ を示している",
    ],
    rubricKeywords: [["係数比較"], ["2x", "1"], ["a=2", "b=1"]],
    solution: "$(x+1)^2=x^2+2x+1$ より $a=2,b=1$。",
    level: 1,
  },
  {
    id: "writeup_inequality_mean_1",
    topicId: "inequality_mean_basic",
    title: "相加相乗平均",
    statement: "正の数 $a,b$ が $ab=9$ を満たすとき $a+b$ の最小値を求めよ。",
    rubric: [
      "相加相乗平均 $a+b\\ge2\\sqrt{ab}$ を用いている",
      "$2\\sqrt{9}=6$ を計算している",
      "最小値 $6$ を示している",
    ],
    rubricKeywords: [["相加相乗平均"], ["2\\sqrt{9}"], ["6"]],
    solution: "$a+b\\ge2\\sqrt{ab}=6$ より最小値は $6$。",
    level: 2,
  },
  {
    id: "writeup_inequality_sum_product_1",
    topicId: "inequality_sum_product_basic",
    title: "和と積の関係",
    statement:
      "正の数 $x,y$ が $x+y=10$ を満たすとき、積 $xy$ の最大値を求めよ。",
    rubric: [
      "相加相乗平均または平方完成で最大化している",
      "$xy\\le(10/2)^2$ を導いている",
      "最大値 $25$ を示している",
    ],
    rubricKeywords: [["相加相乗平均", "平方完成"], ["(10/2)^2"], ["25"]],
    solution: "相加相乗平均より $xy\\le\\left(\\frac{10}{2}\\right)^2=25$。",
    level: 2,
  },
  {
    id: "writeup_calc_derivative_linear_1",
    topicId: "calc_derivative_linear_basic",
    title: "一次関数の微分",
    statement: "関数 $f(x)=3x-4$ の導関数を求めよ。",
    rubric: [
      "一次関数の導関数が係数であることを用いている",
      "$f'(x)=3$ を示している",
      "結論を示している",
    ],
    rubricKeywords: [["導関数"], ["f'(x)=3"], ["結論"]],
    solution: "$f'(x)=3$。",
    level: 1,
  },
  {
    id: "writeup_calc_tangent_slope_1",
    topicId: "calc_tangent_slope_basic",
    title: "接線の傾き",
    statement: "関数 $f(x)=x^2$ の $x=1$ における接線の傾きを求めよ。",
    rubric: [
      "導関数 $f'(x)=2x$ を求めている",
      "$x=1$ で $2$ を代入している",
      "傾き $2$ を結論として示している",
    ],
    rubricKeywords: [["f'(x)=2x"], ["x=1"], ["2"]],
    solution: "$f'(x)=2x$ より傾きは $2$。",
    level: 2,
  },
  {
    id: "writeup_calc_average_value_1",
    topicId: "calc_average_value_basic",
    title: "平均値",
    statement: "関数 $f(x)=x$ の区間 $[0,2]$ における平均値を求めよ。",
    rubric: [
      "平均値の公式 $\\frac{1}{b-a}\\int_a^b f(x)dx$ を用いている",
      "積分 $\\int_0^2 x dx$ を計算している",
      "平均値 $1$ を示している",
    ],
    rubricKeywords: [["平均値公式"], ["積分"], ["1"]],
    solution: "$\\frac{1}{2}\\int_0^2 x dx=\\frac{1}{2}\\cdot2=1$。",
    level: 2,
  },
  {
    id: "writeup_calc_area_between_lines_1",
    topicId: "calc_area_between_lines_basic",
    title: "直線で囲まれる面積",
    statement: "直線 $y=x$ と $y=2$、$x=0$ に囲まれる面積を求めよ。",
    rubric: [
      "積分で面積を求める方針が書けている",
      "$\\int_0^2 (2-x)dx$ を計算している",
      "面積 $2$ を結論として示している",
    ],
    rubricKeywords: [["積分"], ["\\int_0^2 (2-x)dx"], ["2"]],
    solution: "面積は $\\int_0^2(2-x)dx=2$。",
    level: 2,
  },
  {
    id: "writeup_calc_integral_linear_1",
    topicId: "calc_integral_linear_basic2",
    title: "定積分（一次）",
    statement: "$\\int_0^3 (2x+1)\\,dx$ を求めよ。",
    rubric: [
      "原始関数を求めている",
      "上下限を代入して計算している",
      "結論を示している",
    ],
    rubricKeywords: [["原始関数"], ["代入"], ["結論"]],
    solution: "原始関数は $x^2+x$。$[x^2+x]_0^3=12$。",
    level: 1,
  },
  {
    id: "writeup_calc_area_parabola_1",
    topicId: "calc_area_between_parabola_basic",
    title: "放物線と直線の面積",
    statement: "曲線 $y=x^2$ と直線 $y=4$ に囲まれる面積を求めよ。",
    rubric: [
      "交点 $x=\\pm2$ を求めている",
      "面積を積分で表している",
      "$\\int_{-2}^{2}(4-x^2)dx$ を計算している",
    ],
    rubricKeywords: [["交点"], ["\\int_{-2}^{2}"], ["面積"]],
    solution: "面積は $\\int_{-2}^{2}(4-x^2)dx=\\frac{32}{3}$。",
    level: 2,
  },
  {
    id: "writeup_calc_area_under_line_1",
    topicId: "calc_area_under_line_basic",
    title: "直線下の面積",
    statement: "直線 $y=3x$ と $x$ 軸で囲まれる $x\\in[0,2]$ の面積を求めよ。",
    rubric: [
      "面積を積分で表している",
      "$\\int_0^2 3x\\,dx$ を計算している",
      "結論を示している",
    ],
    rubricKeywords: [["積分"], ["\\int_0^2 3x"], ["結論"]],
    solution: "面積は $\\int_0^2 3x dx=6$。",
    level: 1,
  },
  {
    id: "writeup_calc_tangent_value_1",
    topicId: "calc_tangent_value_basic",
    title: "接点の座標",
    statement: "関数 $f(x)=x^2+1$ の $x=1$ における接点の $y$ 座標を求めよ。",
    rubric: [
      "接点の $y$ 座標が $f(1)$ であることを使っている",
      "$f(1)=2$ を計算している",
      "結論を示している",
    ],
    rubricKeywords: [["f(1)"], ["2"], ["結論"]],
    solution: "$f(1)=1^2+1=2$。",
    level: 1,
  },
  {
    id: "writeup_calc_integral_constant_1",
    topicId: "calc_integral_constant_basic",
    title: "定積分（定数）",
    statement: "$\\int_1^4 3\\,dx$ を求めよ。",
    rubric: [
      "定数の積分を使っている",
      "$3(x)\\big|_1^4$ を計算している",
      "結論を示している",
    ],
    rubricKeywords: [["定数"], ["3(x)"], ["結論"]],
    solution: "$3(4-1)=9$。",
    level: 1,
  },
  {
    id: "writeup_calc_integral_sum_1",
    topicId: "calc_integral_sum_basic",
    title: "定積分（和）",
    statement: "$\\int_0^1 (x^2+x)\\,dx$ を求めよ。",
    rubric: [
      "項別に積分している",
      "原始関数を用いている",
      "結論を示している",
    ],
    rubricKeywords: [["項別"], ["原始関数"], ["結論"]],
    solution: "$\\left[\\frac{x^3}{3}+\\frac{x^2}{2}\\right]_0^1=\\frac{5}{6}$。",
    level: 2,
  },
  {
    id: "writeup_calc_integral_quadratic_1",
    topicId: "calc_integral_quadratic_basic",
    title: "定積分（二次）",
    statement: "$\\int_0^2 x^2\\,dx$ を求めよ。",
    rubric: [
      "原始関数 $\\frac{x^3}{3}$ を用いている",
      "上下限を代入している",
      "結論を示している",
    ],
    rubricKeywords: [["x^3/3"], ["代入"], ["結論"]],
    solution: "$\\left[\\frac{x^3}{3}\\right]_0^2=\\frac{8}{3}$。",
    level: 1,
  },
  {
    id: "writeup_calc_extrema_1",
    topicId: "calc_extrema_basic",
    title: "極値",
    statement: "関数 $f(x)=x^3-3x$ の極値を求めよ。",
    rubric: [
      "導関数 $f'(x)=3x^2-3$ を求めている",
      "臨界点 $x=\\pm1$ を求めている",
      "極大値・極小値を示している",
    ],
    rubricKeywords: [["f'(x)"], ["x=±1"], ["極大", "極小"]],
    solution: "$x=1$ で極小 $-2$、$x=-1$ で極大 $2$。",
    level: 2,
  },
  {
    id: "writeup_calc_limit_1",
    topicId: "calc_limit_basic",
    title: "極限",
    statement: "$\\lim_{x\\to1}\\frac{x^2-1}{x-1}$ を求めよ。",
    rubric: [
      "因数分解して約分する方針が書けている",
      "$\\frac{(x-1)(x+1)}{x-1}=x+1$ としている",
      "極限値 $2$ を示している",
    ],
    rubricKeywords: [["因数分解"], ["x+1"], ["2"]],
    solution: "約分して $x+1$ となるので極限は $2$。",
    level: 1,
  },
  {
    id: "writeup_calc_continuity_1",
    topicId: "calc_continuity_basic",
    title: "連続条件",
    statement:
      "関数 $f(x)=\\begin{cases}x^2+c & (x<1)\\\\ 2x-1 & (x\\ge1)\\end{cases}$ が $x=1$ で連続となるように $c$ を求めよ。",
    rubric: [
      "左極限と右極限を一致させる方針が書けている",
      "$1^2+c=2\\cdot1-1$ を立てている",
      "$c=0$ を結論として示している",
    ],
    rubricKeywords: [["左極限", "右極限"], ["1^2+c"], ["c=0"]],
    solution: "$1+c=1$ より $c=0$。",
    level: 2,
  },
  {
    id: "writeup_calc_curve_area_1",
    topicId: "calc_curve_area_basic",
    title: "曲線と曲線の面積",
    statement: "曲線 $y=x^2$ と $y=x$ に囲まれる面積を求めよ。",
    rubric: [
      "交点 $x=0,1$ を求めている",
      "面積を $\\int_0^1(x-x^2)dx$ と表している",
      "結論を示している",
    ],
    rubricKeywords: [["交点"], ["\\int_0^1"], ["結論"]],
    solution: "$\\int_0^1(x-x^2)dx=\\frac{1}{6}$。",
    level: 2,
  },
  {
    id: "writeup_calc_parametric_1",
    topicId: "calc_parametric_basic",
    title: "媒介変数",
    statement: "媒介変数表示 $x=t^2,\\ y=t^3$ を用いて $\\frac{dy}{dx}$ を求めよ。",
    rubric: [
      "$\\frac{dy}{dx}=\\frac{dy/dt}{dx/dt}$ を用いている",
      "$dy/dt=3t^2,\\ dx/dt=2t$ を求めている",
      "$\\frac{dy}{dx}=\\frac{3t}{2}$ を結論として示している",
    ],
    rubricKeywords: [["dy/dx"], ["3t^2", "2t"], ["3t/2"]],
    solution: "$\\frac{dy}{dx}=\\frac{3t^2}{2t}=\\frac{3t}{2}$。",
    level: 3,
  },
  {
    id: "writeup_seq_arithmetic_1",
    topicId: "seq_arithmetic_basic",
    title: "等差数列の一般項",
    statement:
      "初項 $a_1=5$、公差 $d=3$ の等差数列の一般項 $a_n$ を求め、$a_{10}$ を計算せよ。",
    rubric: [
      "$a_n=a_1+(n-1)d$ を用いている",
      "$a_{10}$ を正しく代入している",
      "結論が簡潔である",
    ],
    solution:
      "$a_n=5+(n-1)\\cdot3=3n+2$。よって $a_{10}=3\\cdot10+2=32$。",
    level: 1,
  },
  {
    id: "writeup_seq_geometric_1",
    topicId: "seq_geometric_basic",
    title: "等比数列の一般項",
    statement:
      "初項 $a_1=2$、公比 $r=3$ の等比数列の一般項 $a_n$ を求め、$a_5$ を計算せよ。",
    rubric: [
      "$a_n=a_1 r^{n-1}$ を用いている",
      "$a_5$ を正しく代入している",
      "結論が簡潔である",
    ],
    solution:
      "$a_n=2\\cdot3^{n-1}$。よって $a_5=2\\cdot3^4=162$。",
    level: 1,
  },
  {
    id: "writeup_seq_geom_mean_1",
    topicId: "seq_geometric_mean_basic",
    title: "等比中項",
    statement:
      "$a$ と $b$ の等比中項 $x$ は $x^2=ab$ を満たす。$a=4, b=9$ のときの $x$ を求めよ。",
    rubric: [
      "$x^2=ab$ を使っている",
      "正の解を選んでいる",
      "結論が簡潔である",
    ],
    solution:
      "$x^2=36$ より $x=6$（正の中項）。",
    level: 1,
  },
  {
    id: "writeup_seq_term_from_sum_1",
    topicId: "seq_term_from_sum_basic",
    title: "部分和から一般項",
    statement:
      "数列の部分和が $S_n=n^2+n$ と与えられるとき、一般項 $a_n$ を求めよ。",
    rubric: [
      "$a_n=S_n-S_{n-1}$ を用いている",
      "代入計算が正しい",
      "結論が簡潔である",
    ],
    solution:
      "$a_n=(n^2+n)-((n-1)^2+(n-1))=2n$。",
    level: 1,
  },
  {
    id: "writeup_seq_geom_sum_n_1",
    topicId: "seq_geometric_sum_n_basic",
    title: "等比数列の和",
    statement:
      "初項 $a_1=3$、公比 $r=2$ の等比数列の和 $S_n$ を求め、$S_4$ を計算せよ。",
    rubric: [
      "$S_n=a_1(1-r^n)/(1-r)$ を用いている",
      "$S_4$ を正しく計算している",
      "結論が簡潔である",
    ],
    solution:
      "$S_n=3(1-2^n)/(1-2)=3(2^n-1)$。よって $S_4=3(16-1)=45$。",
    level: 1,
  },
  {
    id: "writeup_seq_ratio_from_terms_1",
    topicId: "seq_common_ratio_from_terms_basic",
    title: "公比の決定",
    statement:
      "等比数列で $a_2=6, a_5=48$ のとき、公比 $r$ と初項 $a_1$ を求めよ。",
    rubric: [
      "$a_5=a_2 r^3$ を用いている",
      "$r$ と $a_1$ を正しく求めている",
      "結論が簡潔である",
    ],
    solution:
      "$48=6r^3$ より $r^3=8$、$r=2$。$a_1=a_2/r=3$。",
    level: 1,
  },
  {
    id: "writeup_seq_sum_1",
    topicId: "seq_sum_basic",
    title: "等差数列の和",
    statement:
      "初項 $a_1=4$、公差 $d=2$ の等差数列の和 $S_n$ を求め、$S_{10}$ を計算せよ。",
    rubric: [
      "$S_n=\\frac{n}{2}(2a_1+(n-1)d)$ を用いている",
      "$S_{10}$ を正しく計算している",
      "結論が簡潔である",
    ],
    solution:
      "$S_n=\\frac{n}{2}(8+2(n-1))=n(n+3)$。よって $S_{10}=10\\cdot13=130$。",
    level: 1,
  },
  {
    id: "writeup_seq_common_diff_1",
    topicId: "seq_common_difference_basic",
    title: "公差の決定",
    statement:
      "等差数列で $a_3=7, a_6=16$ のとき、公差 $d$ と初項 $a_1$ を求めよ。",
    rubric: [
      "$a_6-a_3=3d$ を用いている",
      "$d$ と $a_1$ を正しく求めている",
      "結論が簡潔である",
    ],
    solution:
      "$16-7=3d$ より $d=3$。$a_1=a_3-2d=1$。",
    level: 1,
  },
  {
    id: "writeup_seq_geom_sum_1",
    topicId: "seq_geometric_sum_basic",
    title: "等比数列の無限和",
    statement:
      "初項 $a_1=5$、公比 $r=\\frac12$ の等比数列の無限和 $S_\\infty$ を求めよ。",
    rubric: [
      "$|r|<1$ を確認している",
      "$S_\\infty=\\frac{a_1}{1-r}$ を用いている",
      "結論が簡潔である",
    ],
    solution:
      "$S_\\infty=\\frac{5}{1-1/2}=10$。",
    level: 1,
  },
  {
    id: "writeup_seq_arith_sum_terms_1",
    topicId: "seq_arithmetic_sum_from_terms_basic",
    title: "末項から和",
    statement:
      "等差数列で $a_1=2$, $a_{10}=20$ のとき、公差 $d$ と $S_{10}$ を求めよ。",
    rubric: [
      "$a_{10}=a_1+9d$ を用いている",
      "$S_{10}=\\frac{10}{2}(a_1+a_{10})$ を用いている",
      "結論が簡潔である",
    ],
    solution:
      "$20=2+9d$ より $d=2$。$S_{10}=5(2+20)=110$。",
    level: 1,
  },
  {
    id: "writeup_seq_arith_mean_1",
    topicId: "seq_arithmetic_mean_basic",
    title: "等差中項",
    statement:
      "$a$ と $b$ の等差中項 $x$ は $x=\\frac{a+b}{2}$ である。$a=6, b=14$ のときの $x$ を求めよ。",
    rubric: [
      "$x=\\frac{a+b}{2}$ を用いている",
      "計算が正しい",
      "結論が簡潔である",
    ],
    solution:
      "$x=\\frac{6+14}{2}=10$。",
    level: 1,
  },
  {
    id: "writeup_seq_arith_diff_1",
    topicId: "seq_arithmetic_diff_from_terms_basic",
    title: "公差と一般項",
    statement:
      "等差数列で $a_1=3$, $a_4=12$ のとき、公差 $d$ と一般項 $a_n$ を求めよ。",
    rubric: [
      "$a_4=a_1+3d$ を用いている",
      "$a_n$ を正しく表している",
      "結論が簡潔である",
    ],
    solution:
      "$12=3+3d$ より $d=3$。$a_n=3+(n-1)3=3n$。",
    level: 1,
  },
  {
    id: "writeup_seq_recurrence_term_1",
    topicId: "seq_recurrence_term_basic",
    title: "漸化式の一般項",
    statement:
      "数列 $a_{n+1}=a_n+3$, $a_1=2$ の一般項 $a_n$ と $a_{10}$ を求めよ。",
    rubric: [
      "等差数列として捉えている",
      "$a_n$ を正しく表している",
      "$a_{10}$ を正しく計算している",
    ],
    solution:
      "$a_n=2+3(n-1)=3n-1$。$a_{10}=29$。",
    level: 1,
  },
  {
    id: "writeup_stats_sampling_mean_1",
    topicId: "stats_sampling_mean_basic",
    title: "標本平均の分布",
    statement:
      "母平均 $\\mu=50$、母標準偏差 $\\sigma=10$ の母集団から大きさ $n=25$ の標本をとる。標本平均 $\\bar{X}$ の平均と標準偏差を求めよ。",
    rubric: [
      "$E(\\bar{X})=\\mu$ を用いている",
      "$\\mathrm{SD}(\\bar{X})=\\sigma/\\sqrt{n}$ を用いている",
      "結論が簡潔である",
    ],
    solution:
      "平均は $50$、標準偏差は $10/5=2$。",
    level: 2,
  },
  {
    id: "writeup_stats_scatter_1",
    topicId: "stats_scatter_basic",
    title: "散布図の傾向",
    statement:
      "データ $(1,2),(2,3),(3,4),(4,5)$ の散布図について、相関の符号（正・負・なし）を答えよ。",
    rubric: [
      "右上がりの傾向を読み取っている",
      "相関が正と判断している",
      "結論が簡潔である",
    ],
    solution:
      "右上がりなので相関は正。",
    level: 1,
  },
  {
    id: "writeup_stats_covariance_1",
    topicId: "stats_covariance_basic",
    title: "共分散",
    statement:
      "データ $x:1,2,3$ と $y:2,4,6$ の共分散を求めよ。",
    rubric: [
      "平均を求めている",
      "共分散の定義を用いている",
      "計算が正しい",
    ],
    solution:
      "平均は $\\bar{x}=2,\\bar{y}=4$。共分散は $\\frac{1}{3}[(1-2)(2-4)+(2-2)(4-4)+(3-2)(6-4)]=\\frac{4}{3}$。",
    level: 2,
  },
  {
    id: "writeup_stats_inference_1",
    topicId: "stats_inference_basic",
    title: "母平均の信頼区間",
    statement:
      "標本平均 $\\bar{x}=12$、母標準偏差 $\\sigma=3$、標本サイズ $n=36$ のとき、95%信頼区間を求めよ（$z=1.96$）。",
    rubric: [
      "標準誤差 $\\sigma/\\sqrt{n}$ を求めている",
      "$\\bar{x}\\pm z\\cdot\\sigma/\\sqrt{n}$ を用いている",
      "区間を正しく表している",
    ],
    solution:
      "標準誤差は $3/6=0.5$。よって $12\\pm1.96\\times0.5=12\\pm0.98$、区間は $[11.02,12.98]$。",
    level: 2,
  },

  {
    id: "writeup_vector_ops_1",
    topicId: "vector_operations_basic",
    title: "ベクトルの演算",
    statement: "ベクトル $\vec{a}=(2,-1)$, $\vec{b}=(3,4)$ のとき、$2\vec{a}-\vec{b}$ を求めよ。",
    rubric: ["成分計算ができている", "計算過程が簡潔である"],
    solution: "$2\vec{a}-\vec{b}=(4,-2)-(3,4)=(1,-6)$。",
    level: 1,
  },
  {
    id: "writeup_vector_length_1",
    topicId: "vector_length_basic",
    title: "ベクトルの大きさ",
    statement: "$\vec{a}=(3,-4)$ の大きさ $|\vec{a}|$ を求めよ。",
    rubric: ["平方和の平方根で求めている"],
    solution: "$|\vec{a}|=\sqrt{3^2+(-4)^2}=5$。",
    level: 1,
  },
  {
    id: "writeup_vector_component_1",
    topicId: "vector_component_basic",
    title: "成分表示",
    statement: "点 $A(1,2)$, $B(4,6)$ に対し $\vec{AB}$ を成分で表せ。",
    rubric: ["終点−始点で計算している"],
    solution: "$\vec{AB}=(4-1,6-2)=(3,4)$。",
    level: 1,
  },
  {
    id: "writeup_vector_line_point_1",
    topicId: "vector_line_point_basic",
    title: "直線のベクトル方程式",
    statement: "点 $A(1,0)$ を通り、方向ベクトル $\vec{d}=(2,1)$ の直線のベクトル方程式を求めよ。",
    rubric: ["$\vec{r}=\vec{a}+t\vec{d}$ を用いている"],
    solution: "$\vec{r}=(1,0)+t(2,1)$。",
    level: 2,
  },
  {
    id: "writeup_vector_orthogonal_1",
    topicId: "vector_orthogonal_condition_basic",
    title: "直交条件",
    statement: "$\vec{a}=(1,2,3)$, $\vec{b}=(2,-1,k)$ が直交するとき $k$ を求めよ。",
    rubric: ["内積=0 を用いている"],
    solution: "$1\cdot2+2\cdot(-1)+3k=0$ より $k=0$。",
    level: 2,
  },
  {
    id: "writeup_vector_plane_normal_1",
    topicId: "vector_plane_normal_basic",
    title: "平面の法線ベクトル",
    statement: "平面 $2x-y+3z=6$ の法線ベクトルを求めよ。",
    rubric: ["係数を法線とみなしている"],
    solution: "法線ベクトルは $(2,-1,3)$。",
    level: 1,
  },
  {
    id: "writeup_vector_distance_plane_1",
    topicId: "vector_distance_plane_basic",
    title: "点と平面の距離",
    statement: "点 $P(1,2,0)$ と平面 $x+y+z=3$ の距離を求めよ。",
    rubric: ["距離公式を用いている"],
    solution: "距離は $|1+2+0-3|/\sqrt{1^2+1^2+1^2}=0$。よって距離0。",
    level: 2,
  },
  {
    id: "writeup_vector_midpoint_1",
    topicId: "vector_midpoint_basic",
    title: "中点",
    statement: "点 $A(2,1)$, $B(6,5)$ の中点を求めよ。",
    rubric: ["平均で求めている"],
    solution: "中点は $(4,3)$。",
    level: 1,
  },
  {
    id: "writeup_vector_inner_angle_1",
    topicId: "vector_inner_from_angle_basic",
    title: "内積と角",
    statement: "$|\vec{a}|=3, |\vec{b}|=4$、なす角 $60^\circ$ のとき $\vec{a}\cdot\vec{b}$ を求めよ。",
    rubric: ["$\vec{a}\cdot\vec{b}=|a||b|\cos\theta$ を用いている"],
    solution: "$3\cdot4\cdot\cos60^\circ=6$。",
    level: 1,
  },
  {
    id: "writeup_complex_basic_1",
    topicId: "complex_basic",
    title: "複素数の演算",
    statement: "$z=2-3i$ のとき $z^2$ を求めよ。",
    rubric: ["展開して $i^2=-1$ を使っている"],
    solution: "$z^2=(2-3i)^2=4-12i+9i^2=-5-12i$。",
    level: 1,
  },
  {
    id: "writeup_complex_plane_1",
    topicId: "complex_plane_basic",
    title: "複素平面",
    statement: "複素数 $z=-1+2i$ を複素平面上の点で表せ。",
    rubric: ["実部・虚部を正しく対応させている"],
    solution: "点 $(-1,2)$。",
    level: 1,
  },
  {
    id: "writeup_complex_rotation_1",
    topicId: "complex_rotation_basic",
    title: "回転",
    statement: "点 $1+i$ を原点中心に $90^\circ$ 回転した点を複素数で表せ。",
    rubric: ["$i$ 倍で90度回転を用いている"],
    solution: "$(1+i)i=-1+i$。",
    level: 2,
  },
  {
    id: "writeup_complex_polar_1",
    topicId: "complex_polar_basic",
    title: "極形式",
    statement: "$z=1+\sqrt{3}i$ を極形式 $r(\cos\theta+i\sin\theta)$ で表せ。",
    rubric: ["$r$ と $\theta$ を正しく求めている"],
    solution: "$r=2, \theta=\pi/3$ より $2(\cos\pi/3+i\sin\pi/3)$。",
    level: 2,
  },
  {
    id: "writeup_complex_distance_1",
    topicId: "complex_distance_basic",
    title: "複素平面の距離",
    statement: "$z_1=1+i, z_2=4-1i$ の距離を求めよ。",
    rubric: ["差の絶対値で求めている"],
    solution: "$|z_2-z_1|=|3-2i|=\sqrt{13}$。",
    level: 1,
  },
  {
    id: "writeup_complex_midpoint_1",
    topicId: "complex_midpoint_basic",
    title: "中点（複素数）",
    statement: "$z_1=2+i, z_2=4+3i$ の中点を表す複素数を求めよ。",
    rubric: ["平均で求めている"],
    solution: "$(z_1+z_2)/2=3+2i$。",
    level: 1,
  },
  {
    id: "writeup_complex_square_real_1",
    topicId: "complex_square_real_basic",
    title: "平方が実数",
    statement: "$z=x+iy$ が $z^2$ を実数にする条件を求めよ。",
    rubric: ["虚部=0条件を立てている"],
    solution: "$z^2=(x^2-y^2)+2xyi$。虚部0より $xy=0$。",
    level: 2,
  },
  {
    id: "writeup_complex_power_i_1",
    topicId: "complex_power_i_basic",
    title: "$i$ の累乗",
    statement: "$i^{2024}$ を求めよ。",
    rubric: ["周期4を用いている"],
    solution: "$2024%=4$ より $i^{2024}=1$。",
    level: 1,
  },
  {
    id: "writeup_complex_conjugate_prod_1",
    topicId: "complex_conjugate_product_basic",
    title: "共役積",
    statement: "$z=3-2i$ のとき $z\overline{z}$ を求めよ。",
    rubric: ["$z\overline{z}=|z|^2$ を用いている"],
    solution: "$z\overline{z}=3^2+(-2)^2=13$。",
    level: 1,
  },
  {
    id: "writeup_complex_modulus_square_1",
    topicId: "complex_modulus_square_basic",
    title: "絶対値の平方",
    statement: "$z=1-4i$ のとき $|z|^2$ を求めよ。",
    rubric: ["実部・虚部の平方和"],
    solution: "$|z|^2=1^2+(-4)^2=17$。",
    level: 1,
  },
  {
    id: "writeup_conic_circle_center_1",
    topicId: "conic_circle_center_basic",
    title: "円の中心",
    statement: "円 $x^2+y^2-4x+6y+9=0$ の中心を求めよ。",
    rubric: ["平方完成して中心を求めている"],
    solution: "$(x-2)^2+(y+3)^2=4$ より中心は $(2,-3)$。",
    level: 2,
  },
  {
    id: "writeup_conic_circle_radius_1",
    topicId: "conic_circle_radius_basic",
    title: "円の半径",
    statement: "円 $x^2+y^2+2x-4y-4=0$ の半径を求めよ。",
    rubric: ["平方完成して半径を求めている"],
    solution: "$(x+1)^2+(y-2)^2=9$ より半径は $3$。",
    level: 2,
  },
  {
    id: "writeup_conic_parabola_1",
    topicId: "conic_parabola_basic",
    title: "放物線",
    statement: "放物線 $y^2=4x$ の焦点と準線を求めよ。",
    rubric: ["標準形から焦点・準線を答えている"],
    solution: "焦点 $(1,0)$、準線 $x=-1$。",
    level: 2,
  },
  {
    id: "writeup_conic_ellipse_1",
    topicId: "conic_ellipse_basic",
    title: "楕円",
    statement: "楕円 $\frac{x^2}{9}+\frac{y^2}{4}=1$ の長軸・短軸の長さを求めよ。",
    rubric: ["長軸=2a, 短軸=2b を用いている"],
    solution: "長軸の長さは $2\cdot3=6$、短軸は $2\cdot2=4$。",
    level: 2,
  },
  {
    id: "writeup_conic_hyperbola_1",
    topicId: "conic_hyperbola_basic",
    title: "双曲線",
    statement: "双曲線 $\frac{x^2}{4}-\frac{y^2}{9}=1$ の漸近線を求めよ。",
    rubric: ["$y=\pm (b/a)x$ を用いている"],
    solution: "漸近線は $y=\pm (3/2)x$。",
    level: 2,
  },

  {
    id: "writeup_vector_section_1",
    topicId: "vector_section_basic",
    title: "内分点",
    statement: "点 $A(1,2)$, $B(5,6)$ を $2:1$ に内分する点の座標を求めよ。",
    rubric: ["内分公式を用いている"],
    solution: "内分点は $((1cdot1+2cdot5)/3,(1cdot2+2cdot6)/3)=(11/3,14/3)$。",
    level: 2,
  },
  {
    id: "writeup_vector_distance_1",
    topicId: "vector_distance_basic",
    title: "点間距離",
    statement: "点 $A(1,1,1)$, $B(4,5,1)$ の距離を求めよ。",
    rubric: ["3次元の距離公式を用いている"],
    solution: "$\sqrt{(3)^2+(4)^2+0^2}=5$。",
    level: 1,
  },
  {
    id: "writeup_vector_space_1",
    topicId: "vector_space_basic",
    title: "一次独立",
    statement: "$\vec{a}=(1,0,1)$, $\vec{b}=(2,0,2)$ が一次独立か判定せよ。",
    rubric: ["一次従属の定義を用いている"],
    solution: "\vec{b}=2\vec{a}$ なので一次独立ではない。",
    level: 2,
  },
  {
    id: "writeup_vector_orthogonality_1",
    topicId: "vector_orthogonality_basic",
    title: "直交の判定",
    statement: "$\vec{a}=(1,2)$, $\vec{b}=(2,-1)$ が直交するか判定せよ。",
    rubric: ["内積で判定している"],
    solution: "$1cdot2+2cdot(-1)=0$ より直交。",
    level: 1,
  },
  {
    id: "writeup_complex_argument_axis_1",
    topicId: "complex_argument_axis_basic",
    title: "偏角（軸上）",
    statement: "$z=2i$ の偏角を求めよ。",
    rubric: ["正の虚軸上の角を答えている"],
    solution: "$\pi/2$。",
    level: 1,
  },
  {
    id: "writeup_complex_argument_quadrant_1",
    topicId: "complex_argument_quadrant_basic",
    title: "偏角（象限）",
    statement: "$z=-1+1i$ の偏角を求めよ。",
    rubric: ["第2象限として角を答えている"],
    solution: "$3\pi/4$。",
    level: 1,
  },
  {
    id: "writeup_complex_argument_degree_1",
    topicId: "complex_argument_degree_basic",
    title: "偏角（度）",
    statement: "$z=1+i$ の偏角を度数法で答えよ。",
    rubric: ["$45^\circ$ を答えている"],
    solution: "$45^\circ$。",
    level: 1,
  },
  {
    id: "writeup_complex_polar_value_1",
    topicId: "complex_polar_value_basic",
    title: "極形式から値",
    statement: "$z=2(\cos\pi/3+i\sin\pi/3)$ を $a+bi$ の形で表せ。",
    rubric: ["三角比を代入している"],
    solution: "$z=2(1/2+i\sqrt{3}/2)=1+i\sqrt{3}$。",
    level: 1,
  },
  {
    id: "writeup_complex_de_moivre_1",
    topicId: "complex_de_moivre_basic",
    title: "ド・モアブルの定理",
    statement: "$z=\cos\theta+i\sin\theta$ とするとき $z^3$ を求めよ。",
    rubric: ["ド・モアブルを用いている"],
    solution: "$z^3=\cos3\theta+i\sin3\theta$。",
    level: 2,
  },
  {
    id: "writeup_complex_root_unity_1",
    topicId: "complex_root_unity_basic",
    title: "1のn乗根",
    statement: "$z^3=1$ の解を求めよ。",
    rubric: ["$2\pi/3$ 間隔の根を挙げている"],
    solution: "$1,\cos(2\pi/3)+i\sin(2\pi/3),\cos(4\pi/3)+i\sin(4\pi/3)$。",
    level: 2,
  },
  {
    id: "writeup_complex_multiply_real_1",
    topicId: "complex_multiply_real_basic",
    title: "実数倍",
    statement: "$z=1-2i$ のとき $3z$ を求めよ。",
    rubric: ["実数倍の計算が正しい"],
    solution: "$3-6i$。",
    level: 1,
  },
  {
    id: "writeup_complex_multiply_imag_1",
    topicId: "complex_multiply_imag_basic",
    title: "虚数単位倍",
    statement: "$z=2-3i$ のとき $iz$ を求めよ。",
    rubric: ["$i^2=-1$ を使っている"],
    solution: "$iz=2i-3i^2=3+2i$。",
    level: 1,
  },
  {
    id: "writeup_complex_modulus_product_1",
    topicId: "complex_modulus_product_basic",
    title: "絶対値の積",
    statement: "$|z_1|=2, |z_2|=3$ のとき $|z_1z_2|$ を求めよ。",
    rubric: ["$|z_1z_2|=|z_1||z_2|$ を用いている"],
    solution: "$6$。",
    level: 1,
  },
  {
    id: "writeup_complex_equation_abs_1",
    topicId: "complex_equation_abs_basic",
    title: "絶対値の方程式",
    statement: "$|z-1|=2$ を満たす複素数 $z$ の集合を述べよ。",
    rubric: ["円として解釈している"],
    solution: "中心 $(1,0)$、半径 $2$ の円。",
    level: 2,
  },
  {
    id: "writeup_complex_equation_real_imag_1",
    topicId: "complex_equation_real_imag_basic",
    title: "実部・虚部の条件",
    statement: "$z=x+iy$ として、$z^2$ が純虚数となる条件を求めよ。",
    rubric: ["実部=0の条件を立てている"],
    solution: "$z^2=(x^2-y^2)+2xyi$。実部0より $x^2=y^2$。",
    level: 2,
  },
  {
    id: "writeup_complex_equation_conjugate_1",
    topicId: "complex_equation_conjugate_basic",
    title: "共役の方程式",
    statement: "$z+\overline{z}=4$ を満たす $z$ の条件を求めよ。",
    rubric: ["実部だけが残ることを使っている"],
    solution: "$z=x+iy$ とすると $2x=4$ より $x=2$。虚部は任意。",
    level: 2,
  },
  {
    id: "writeup_complex_rotation_real_1",
    topicId: "complex_rotation_real_basic",
    title: "回転（実軸）",
    statement: "点 $2$ を原点中心に $90^\circ$ 回転した点を求めよ。",
    rubric: ["$i$ 倍を用いている"],
    solution: "$2i$。",
    level: 1,
  },
  {
    id: "writeup_complex_rotation_imag_1",
    topicId: "complex_rotation_imag_basic",
    title: "回転（虚軸）",
    statement: "点 $-3i$ を原点中心に $90^\circ$ 回転した点を求めよ。",
    rubric: ["$i$ 倍で回転"],
    solution: "$-3i\cdot i=3$。",
    level: 1,
  },
  {
    id: "writeup_complex_rotation_180_1",
    topicId: "complex_rotation_180_basic",
    title: "180度回転",
    statement: "点 $1-2i$ を原点中心に $180^\circ$ 回転した点を求めよ。",
    rubric: ["$-1$ 倍で回転"],
    solution: "$-1+2i$。",
    level: 1,
  },
  {
    id: "writeup_complex_division_real_1",
    topicId: "complex_division_real_basic",
    title: "複素数の除法",
    statement: "$\frac{1+i}{1-i}$ を求めよ。",
    rubric: ["共役で有理化している"],
    solution: "共役を掛けて $((1+i)^2)/(1+1)=i$。",
    level: 2,
  },
  {
    id: "writeup_complex_modulus_sum_1",
    topicId: "complex_modulus_sum_basic",
    title: "絶対値の和",
    statement: "$|1+i|+|1-i|$ を求めよ。",
    rubric: ["各絶対値を計算している"],
    solution: "$\sqrt{2}+\sqrt{2}=2\sqrt{2}$。",
    level: 1,
  },
  {
    id: "writeup_complex_polar_imag_1",
    topicId: "complex_polar_imag_basic",
    title: "極形式の虚部",
    statement: "$z=2(\cos\pi/6+i\sin\pi/6)$ の虚部を求めよ。",
    rubric: ["$r\sin\theta$ を用いている"],
    solution: "虚部は $2\sin\pi/6=1$。",
    level: 1,
  },
  {
    id: "writeup_complex_conjugate_modulus_1",
    topicId: "complex_conjugate_modulus_basic",
    title: "共役と絶対値",
    statement: "$z=2-5i$ のとき $|\overline{z}|$ を求めよ。",
    rubric: ["共役でも絶対値は同じ"],
    solution: "$|\overline{z}|=|z|=\sqrt{29}$。",
    level: 1,
  },
  {
    id: "writeup_conic_intersection_1",
    topicId: "conic_intersection_basic",
    title: "円と直線の交点",
    statement: "円 $x^2+y^2=4$ と直線 $y=x$ の交点を求めよ。",
    rubric: ["連立して解いている"],
    solution: "$2x^2=4$ より $x=\pm\sqrt{2}$、$y=x$。",
    level: 2,
  },
  {
    id: "writeup_conic_tangent_1",
    topicId: "conic_tangent_basic",
    title: "円の接線",
    statement: "円 $x^2+y^2=1$ の点 $(1,0)$ における接線を求めよ。",
    rubric: ["接線公式を用いている"],
    solution: "接線は $x=1$。",
    level: 2,
  },
  {
    id: "writeup_conic_parabola_focus_1",
    topicId: "conic_parabola_focus_basic",
    title: "放物線の焦点",
    statement: "放物線 $y^2=8x$ の焦点を求めよ。",
    rubric: ["標準形から焦点を求めている"],
    solution: "焦点は $(2,0)$。",
    level: 2,
  },
  {
    id: "writeup_conic_parabola_vertex_1",
    topicId: "conic_parabola_vertex_basic",
    title: "放物線の頂点",
    statement: "放物線 $y=(x-1)^2+3$ の頂点を求めよ。",
    rubric: ["頂点形式を読んでいる"],
    solution: "頂点は $(1,3)$。",
    level: 1,
  },
  {
    id: "writeup_conic_ellipse_major_axis_1",
    topicId: "conic_ellipse_major_axis_basic",
    title: "楕円の長軸",
    statement: "楕円 $\frac{x^2}{16}+\frac{y^2}{9}=1$ の長軸の長さを求めよ。",
    rubric: ["$2a$ を用いている"],
    solution: "長軸は $2\cdot4=8$。",
    level: 1,
  },
  {
    id: "writeup_conic_ellipse_minor_axis_1",
    topicId: "conic_ellipse_minor_axis_basic",
    title: "楕円の短軸",
    statement: "楕円 $\frac{x^2}{25}+\frac{y^2}{4}=1$ の短軸の長さを求めよ。",
    rubric: ["$2b$ を用いている"],
    solution: "短軸は $2\cdot2=4$。",
    level: 1,
  },
  {
    id: "writeup_conic_hyperbola_asymptote_1",
    topicId: "conic_hyperbola_asymptote_basic",
    title: "双曲線の漸近線",
    statement: "双曲線 $\frac{x^2}{9}-\frac{y^2}{4}=1$ の漸近線を求めよ。",
    rubric: ["$y=\pm (b/a)x$ を用いている"],
    solution: "漸近線は $y=\pm \frac{2}{3}x$。",
    level: 2,
  },
  {
    id: "writeup_conic_hyperbola_vertex_1",
    topicId: "conic_hyperbola_vertex_basic",
    title: "双曲線の頂点",
    statement: "双曲線 $\frac{x^2}{4}-\frac{y^2}{9}=1$ の頂点を求めよ。",
    rubric: ["$a$ を読み取っている"],
    solution: "頂点は $(\pm2,0)$。",
    level: 1,
  },

  {
    id: "writeup_vector_angle_1",
    topicId: "vector_angle_basic",
    title: "ベクトルのなす角",
    statement: "$\vec{a}=(1,0)$, $\vec{b}=(1,1)$ のなす角を求めよ。",
    rubric: ["内積と長さで角度を求めている"],
    solution: "$\cos\theta=\frac{1}{\sqrt{2}}$ より $\theta=45^\circ$。",
    level: 1,
  },
  {
    id: "writeup_vector_line_1",
    topicId: "vector_line_basic",
    title: "直線の方程式",
    statement: "点 $A(0,1)$、方向ベクトル $\vec{d}=(3,2)$ の直線を $x,y$ で表せ。",
    rubric: ["媒介変数から $y=\frac{2}{3}x+1$ を導いている"],
    solution: "$x=3t, y=1+2t$ より $y=\frac{2}{3}x+1$。",
    level: 2,
  },
  {
    id: "writeup_vector_area_1",
    topicId: "vector_area_basic",
    title: "三角形の面積",
    statement: "$\vec{a}=(2,1)$, $\vec{b}=(1,3)$ が作る平行四辺形の面積を求めよ。",
    rubric: ["外積（行列式）を用いている"],
    solution: "面積は $|2cdot3-1cdot1|=5$。",
    level: 2,
  },
  {
    id: "writeup_vector_equation_1",
    topicId: "vector_equation_basic",
    title: "ベクトル方程式",
    statement: "$\vec{r}=(1,2)+t(2,-1)$ のとき $t=3$ での点を求めよ。",
    rubric: ["代入して座標を求めている"],
    solution: "$\vec{r}=(1,2)+3(2,-1)=(7,-1)$。",
    level: 1,
  },
  {
    id: "writeup_complex_add_modulus_square_1",
    topicId: "complex_add_modulus_square_basic",
    title: "和の絶対値の平方",
    statement: "$z_1=1+i, z_2=2-i$ のとき $|z_1+z_2|^2$ を求めよ。",
    rubric: ["加算してから絶対値平方を計算"],
    solution: "$z_1+z_2=3$ より $|z_1+z_2|^2=9$。",
    level: 1,
  },
  {
    id: "writeup_complex_sub_modulus_square_1",
    topicId: "complex_sub_modulus_square_basic",
    title: "差の絶対値の平方",
    statement: "$z_1=2+3i, z_2=1-i$ のとき $|z_1-z_2|^2$ を求めよ。",
    rubric: ["差を計算してから絶対値平方"],
    solution: "$z_1-z_2=1+4i$ より $|z_1-z_2|^2=1^2+4^2=17$。",
    level: 1,
  },
  {
    id: "writeup_complex_triangle_area_1",
    topicId: "complex_triangle_area_basic",
    title: "三角形の面積",
    statement: "複素数 $z_1=0$, $z_2=2$, $z_3=2i$ が作る三角形の面積を求めよ。",
    rubric: ["直角三角形として面積を求めている"],
    solution: "底辺2、高さ2より面積2。",
    level: 1,
  },
  {
    id: "writeup_complex_midpoint_distance_1",
    topicId: "complex_midpoint_distance_basic",
    title: "中点と距離",
    statement: "$z_1=1+i, z_2=5+1i$ の中点と、2点間距離を求めよ。",
    rubric: ["中点と距離の両方を求めている"],
    solution: "中点は $(3+i)$、距離は $4$。",
    level: 1,
  },
  {
    id: "writeup_complex_parallel_1",
    topicId: "complex_parallel_condition_basic",
    title: "平行条件",
    statement: "$z_1=1+i, z_2=3+3i, z_3=2+1i, z_4=6+1i$ で、$z_1z_2$ と $z_3z_4$ が平行か判定せよ。",
    rubric: ["方向ベクトルの実数倍を確認"],
    solution: "$z_2-z_1=2+2i$, $z_4-z_3=4$ で比例しないため平行でない。",
    level: 3,
  },
  {
    id: "writeup_complex_perpendicular_1",
    topicId: "complex_perpendicular_condition_basic",
    title: "直交条件",
    statement: "$z_1=0, z_2=2, z_3=0, z_4=2i$ で、線分が直交するか判定せよ。",
    rubric: ["方向ベクトルの内積=0を確認"],
    solution: "方向は 2 と 2i で直交。",
    level: 2,
  },
  {
    id: "writeup_complex_locus_circle_1",
    topicId: "complex_locus_circle_center_basic",
    title: "軌跡（円）",
    statement: "$|z-(2+i)|=3$ の表す図形を述べよ。",
    rubric: ["中心と半径を読み取っている"],
    solution: "中心 $(2,1)$、半径3の円。",
    level: 1,
  },
  {
    id: "writeup_complex_arg_product_1",
    topicId: "complex_argument_product_basic",
    title: "偏角の積",
    statement: "$\arg z_1=\pi/6$, $\arg z_2=\pi/3$ のとき $\arg(z_1z_2)$ を求めよ。",
    rubric: ["偏角の和を用いている"],
    solution: "$\pi/2$。",
    level: 1,
  },
  {
    id: "writeup_complex_arg_quotient_1",
    topicId: "complex_argument_quotient_basic",
    title: "偏角の商",
    statement: "$\arg z_1=\pi/2$, $\arg z_2=\pi/6$ のとき $\arg(z_1/z_2)$ を求めよ。",
    rubric: ["偏角の差を用いている"],
    solution: "$\pi/3$。",
    level: 1,
  },
  {
    id: "writeup_complex_rotation_90_1",
    topicId: "complex_rotation_90_matrix_basic",
    title: "90度回転",
    statement: "点 $1+2i$ を原点中心に $90^\circ$ 回転した点を求めよ。",
    rubric: ["$i$ 倍を用いている"],
    solution: "$(1+2i)i=-2+ i$。",
    level: 2,
  },
  {
    id: "writeup_complex_arg_power_1",
    topicId: "complex_argument_power_basic",
    title: "偏角の冪",
    statement: "$\arg z=\pi/4$ のとき $\arg(z^3)$ を求めよ。",
    rubric: ["偏角が3倍になる"],
    solution: "$3\pi/4$。",
    level: 1,
  },
  {
    id: "writeup_complex_modulus_power_1",
    topicId: "complex_modulus_power_basic",
    title: "絶対値の冪",
    statement: "$|z|=2$ のとき $|z^4|$ を求めよ。",
    rubric: ["$|z^n|=|z|^n$ を用いている"],
    solution: "$2^4=16$。",
    level: 1,
  },
  {
    id: "writeup_complex_locus_bisector_1",
    topicId: "complex_locus_bisector_basic",
    title: "垂直二等分線",
    statement: "$|z-1|=|z+1|$ の表す直線を答えよ。",
    rubric: ["垂直二等分線を答えている"],
    solution: "虚軸 $x=0$。",
    level: 1,
  },
  {
    id: "writeup_complex_locus_vertical_1",
    topicId: "complex_locus_vertical_line_basic",
    title: "垂直線の軌跡",
    statement: "$\Re(z)=2$ の表す直線を答えよ。",
    rubric: ["実部一定の直線を答えている"],
    solution: "直線 $x=2$。",
    level: 1,
  },
  {
    id: "writeup_complex_arg_conjugate_1",
    topicId: "complex_argument_conjugate_basic",
    title: "共役と偏角",
    statement: "$\arg z=\theta$ のとき $\arg \overline{z}$ を求めよ。",
    rubric: ["共役で符号が反転する"],
    solution: "$-\theta$（範囲調整含む）。",
    level: 2,
  },
  {
    id: "writeup_complex_arg_inverse_1",
    topicId: "complex_argument_inverse_basic",
    title: "逆数と偏角",
    statement: "$\arg z=\theta$ のとき $\arg(1/z)$ を求めよ。",
    rubric: ["逆数で符号が反転する"],
    solution: "$-\theta$。",
    level: 2,
  },
  {
    id: "writeup_complex_locus_horizontal_1",
    topicId: "complex_locus_horizontal_line_basic",
    title: "水平線の軌跡",
    statement: "$\Im(z)=-3$ の表す直線を答えよ。",
    rubric: ["虚部一定の直線を答えている"],
    solution: "直線 $y=-3$。",
    level: 1,
  },
  {
    id: "writeup_complex_section_internal_1",
    topicId: "complex_section_internal_basic",
    title: "内分（複素数）",
    statement: "$z_1=0, z_2=4$ を $1:3$ に内分する点を求めよ。",
    rubric: ["内分公式を使っている"],
    solution: "内分点は $1$。",
    level: 1,
  },
  {
    id: "writeup_complex_section_external_1",
    topicId: "complex_section_external_basic",
    title: "外分（複素数）",
    statement: "$z_1=0, z_2=3$ を $1:2$ に外分する点を求めよ。",
    rubric: ["外分公式を使っている"],
    solution: "外分点は $-3$。",
    level: 2,
  },
  {
    id: "writeup_complex_line_point_1",
    topicId: "complex_line_point_basic",
    title: "直線の内分点",
    statement: "$z_1=1+i, z_2=5+3i$ を $1:1$ に内分する点を求めよ。",
    rubric: ["平均を取っている"],
    solution: "中点は $3+2i$。",
    level: 1,
  },

  {
    id: "writeup_conic_parabola_directrix_1",
    topicId: "conic_parabola_directrix_basic",
    title: "放物線の準線",
    statement: "放物線 $y^2=4x$ の準線を求めよ。",
    rubric: ["標準形から準線を答えている"],
    solution: "準線は $x=-1$。",
    level: 2,
  },
  {
    id: "writeup_conic_parabola_latus_1",
    topicId: "conic_parabola_latus_rectum_basic",
    title: "弦（通径）",
    statement: "放物線 $y^2=8x$ の準径（通径）の長さを求めよ。",
    rubric: ["通径の長さ=4p を用いている"],
    solution: "$y^2=4px$ より $p=2$、通径の長さは $8$。",
    level: 2,
  },
  {
    id: "writeup_conic_parabola_tangent_slope_1",
    topicId: "conic_parabola_tangent_slope_basic",
    title: "放物線の接線傾き",
    statement: "放物線 $y^2=4x$ の点 $(1,2)$ における接線の傾きを求めよ。",
    rubric: ["暗黙微分で傾きを求めている"],
    solution: "2y y'=4 より $y'=2/y=1$。",
    level: 3,
  },
  {
    id: "writeup_conic_ellipse_axis_1",
    topicId: "conic_ellipse_axis_basic",
    title: "楕円の軸",
    statement: "楕円 $\frac{x^2}{25}+\frac{y^2}{9}=1$ の長軸・短軸を答えよ。",
    rubric: ["長軸がx軸方向であることを述べている"],
    solution: "長軸はx軸方向、短軸はy軸方向。",
    level: 1,
  },
  {
    id: "writeup_conic_ellipse_tangent_1",
    topicId: "conic_ellipse_tangent_basic",
    title: "楕円の接線",
    statement: "楕円 $\frac{x^2}{9}+\frac{y^2}{4}=1$ の点 $(3,0)$ における接線を求めよ。",
    rubric: ["接線公式 $xx_0/a^2+yy_0/b^2=1$ を用いている"],
    solution: "$x/3=1$ より $x=3$。",
    level: 3,
  },
  {
    id: "writeup_conic_ellipse_focus_1",
    topicId: "conic_ellipse_focus_basic",
    title: "楕円の焦点",
    statement: "楕円 $\frac{x^2}{25}+\frac{y^2}{9}=1$ の焦点を求めよ。",
    rubric: ["$c^2=a^2-b^2$ を用いている"],
    solution: "$c=4$ より焦点は $(\pm4,0)$。",
    level: 2,
  },
  {
    id: "writeup_conic_hyperbola_asym_slope_1",
    topicId: "conic_hyperbola_asymptote_slope_basic",
    title: "漸近線の傾き",
    statement: "双曲線 $\frac{x^2}{4}-\frac{y^2}{1}=1$ の漸近線の傾きを求めよ。",
    rubric: ["$y=\pm (b/a)x$ を用いている"],
    solution: "傾きは $\pm \frac{1}{2}$。",
    level: 2,
  },
  {
    id: "writeup_conic_hyperbola_transverse_1",
    topicId: "conic_hyperbola_transverse_axis_basic",
    title: "実軸の長さ",
    statement: "双曲線 $\frac{x^2}{9}-\frac{y^2}{4}=1$ の実軸の長さを求めよ。",
    rubric: ["$2a$ を用いている"],
    solution: "実軸の長さは $2\cdot3=6$。",
    level: 1,
  },
  {
    id: "writeup_conic_circle_tangent_slope_1",
    topicId: "conic_circle_tangent_slope_basic",
    title: "円の接線傾き",
    statement: "円 $x^2+y^2=25$ の点 $(3,4)$ における接線の傾きを求めよ。",
    rubric: ["暗黙微分を使っている"],
    solution: "$2x+2y y'=0$ より $y'=-x/y=-3/4$。",
    level: 2,
  },
  {
    id: "writeup_conic_line_intersections_1",
    topicId: "conic_line_intersection_count_basic",
    title: "交点の個数",
    statement: "円 $x^2+y^2=1$ と直線 $y=2$ の交点の個数を答えよ。",
    rubric: ["距離で判定している"],
    solution: "中心から直線までの距離2>半径1なので交点0。",
    level: 1,
  },
  {
    id: "writeup_conic_circle_general_radius_1",
    topicId: "conic_circle_general_radius_basic",
    title: "一般形の半径",
    statement: "円 $x^2+y^2+6x-8y+9=0$ の半径を求めよ。",
    rubric: ["平方完成で半径を出している"],
    solution: "$(x+3)^2+(y-4)^2=16$ より半径4。",
    level: 2,
  },
  {
    id: "writeup_conic_circle_general_center_1",
    topicId: "conic_circle_general_center_basic",
    title: "一般形の中心",
    statement: "円 $x^2+y^2-2x+4y-4=0$ の中心を求めよ。",
    rubric: ["平方完成で中心を出している"],
    solution: "$(x-1)^2+(y+2)^2=9$ より中心は $(1,-2)$。",
    level: 2,
  },
  {
    id: "writeup_conic_hyperbola_foci_dist_1",
    topicId: "conic_hyperbola_foci_distance_basic",
    title: "焦点間距離",
    statement: "双曲線 $\frac{x^2}{9}-\frac{y^2}{4}=1$ の焦点間距離を求めよ。",
    rubric: ["$c^2=a^2+b^2$ を用いている"],
    solution: "$c=\sqrt{13}$ より焦点間距離は $2\sqrt{13}$。",
    level: 2,
  },
  {
    id: "writeup_conic_ellipse_c_1",
    topicId: "conic_ellipse_c_basic",
    title: "楕円の $c$",
    statement: "楕円 $\frac{x^2}{16}+\frac{y^2}{9}=1$ の $c$ を求めよ。",
    rubric: ["$c^2=a^2-b^2$ を用いている"],
    solution: "$c=\sqrt{7}$。",
    level: 2,
  },
  {
    id: "writeup_conic_hyperbola_c_1",
    topicId: "conic_hyperbola_c_basic",
    title: "双曲線の $c$",
    statement: "双曲線 $\frac{x^2}{4}-\frac{y^2}{9}=1$ の $c$ を求めよ。",
    rubric: ["$c^2=a^2+b^2$ を用いている"],
    solution: "$c=\sqrt{13}$。",
    level: 2,
  },
  {
    id: "writeup_conic_parabola_line_count_1",
    topicId: "conic_parabola_line_intersection_count_basic",
    title: "放物線と直線の交点数",
    statement: "放物線 $y=x^2$ と直線 $y=2x+3$ の交点の個数を答えよ。",
    rubric: ["判別式で個数を判定している"],
    solution: "$x^2-2x-3=0$ は判別式 $16>0$ なので2個。",
    level: 2,
  },
  {
    id: "writeup_conic_ellipse_value_1",
    topicId: "conic_ellipse_value_basic",
    title: "楕円の点の判定",
    statement: "点 $(2,1)$ が楕円 $\frac{x^2}{9}+\frac{y^2}{4}=1$ 上にあるか判定せよ。",
    rubric: ["代入して判定している"],
    solution: "$4/9+1/4<1$ なので楕円上ではない（内部）。",
    level: 2,
  },
  {
    id: "writeup_conic_hyperbola_value_1",
    topicId: "conic_hyperbola_value_basic",
    title: "双曲線の点の判定",
    statement: "点 $(3,0)$ が双曲線 $\frac{x^2}{4}-\frac{y^2}{9}=1$ 上にあるか判定せよ。",
    rubric: ["代入して判定している"],
    solution: "$9/4=2.25$ で1でないので上にはない。",
    level: 1,
  },
  {
    id: "writeup_conic_parabola_focus_general_1",
    topicId: "conic_parabola_general_focus_basic",
    title: "一般形の焦点",
    statement: "放物線 $y^2-4y=8x$ の焦点を求めよ。",
    rubric: ["平方完成して標準形に直している"],
    solution: "$(y-2)^2=8(x+1/2)$ より焦点は $(1/2,2)$。",
    level: 3,
  },
  {
    id: "writeup_conic_parabola_vertex_shift_1",
    topicId: "conic_parabola_vertex_shift_basic",
    title: "頂点の移動",
    statement: "放物線 $y=(x-2)^2-3$ の頂点を求めよ。",
    rubric: ["頂点形式から読む"],
    solution: "頂点は $(2,-3)$。",
    level: 1,
  },
  {
    id: "writeup_conic_circle_tangent_point_1",
    topicId: "conic_circle_tangent_point_basic",
    title: "接点",
    statement: "円 $x^2+y^2=4$ の点 $(0,2)$ における接点を答えよ。",
    rubric: ["接点は与点である"],
    solution: "接点は $(0,2)$。",
    level: 1,
  },
  {
    id: "writeup_conic_parabola_focus_vertical_1",
    topicId: "conic_parabola_focus_vertical_basic",
    title: "縦向き放物線の焦点",
    statement: "放物線 $x^2=4y$ の焦点を求めよ。",
    rubric: ["縦向き標準形から焦点を求めている"],
    solution: "焦点は $(0,1)$。",
    level: 2,
  },
  {
    id: "writeup_conic_parabola_directrix_vertical_1",
    topicId: "conic_parabola_directrix_vertical_basic",
    title: "縦向き放物線の準線",
    statement: "放物線 $x^2=4y$ の準線を求めよ。",
    rubric: ["標準形から準線を求めている"],
    solution: "準線は $y=-1$。",
    level: 2,
  },
  {
    id: "writeup_conic_ellipse_focus_distance_1",
    topicId: "conic_ellipse_focus_distance_basic",
    title: "焦点距離",
    statement: "楕円 $\frac{x^2}{9}+\frac{y^2}{4}=1$ の焦点間距離を求めよ。",
    rubric: ["$2c$ を求めている"],
    solution: "$c=\sqrt{5}$ より $2\sqrt{5}$。",
    level: 2,
  },
  {
    id: "writeup_conic_circle_point_on_1",
    topicId: "conic_circle_point_on_basic",
    title: "円上の判定",
    statement: "点 $(1,1)$ が円 $x^2+y^2=2$ 上にあるか判定せよ。",
    rubric: ["代入して判定"],
    solution: "$1^2+1^2=2$ より円上にある。",
    level: 1,
  },
  {
    id: "writeup_conic_parabola_tangent_intercept_1",
    topicId: "conic_parabola_tangent_intercept_basic",
    title: "放物線の接線切片",
    statement: "放物線 $y^2=4x$ の点 $(1,2)$ における接線の $x$ 切片を求めよ。",
    rubric: ["接線方程式から切片を求めている"],
    solution: "接線は $y=x+1$、$y=0$ で $x=-1$。",
    level: 3,
  },
  {
    id: "writeup_conic_ellipse_center_1",
    topicId: "conic_ellipse_center_basic",
    title: "楕円の中心",
    statement: "楕円 $\frac{(x-1)^2}{9}+\frac{(y+2)^2}{4}=1$ の中心を答えよ。",
    rubric: ["中心を読み取っている"],
    solution: "中心は $(1,-2)$。",
    level: 1,
  },
  {
    id: "writeup_conic_hyperbola_center_1",
    topicId: "conic_hyperbola_center_basic",
    title: "双曲線の中心",
    statement: "双曲線 $\frac{(x-2)^2}{4}-\frac{(y+1)^2}{9}=1$ の中心を答えよ。",
    rubric: ["中心を読み取っている"],
    solution: "中心は $(2,-1)$。",
    level: 1,
  },
  {
    id: "writeup_conic_hyperbola_asym_eq_1",
    topicId: "conic_hyperbola_asymptote_equation_basic",
    title: "漸近線の方程式",
    statement: "双曲線 $\frac{(x-1)^2}{9}-\frac{(y-2)^2}{4}=1$ の漸近線を求めよ。",
    rubric: ["中心移動を考慮している"],
    solution: "$y-2=\pm \frac{2}{3}(x-1)$。",
    level: 3,
  },

  {
    id: "writeup_hd_calc_extrema_param_1",
    topicId: "calc_extrema_basic",
    title: "極値とパラメータ（難）",
    statement: "関数 $f(x)=x^3-3x^2+ax$ が極大値と極小値をともに持つための $a$ の範囲を求めよ。",
    rubric: [
      "導関数を求めている",
      "判別式または増減表で条件を立てている",
      "範囲を正しく結論付けている",
    ],
    solution:
      "導関数は $3x^2-6x+a$。これが異なる2実数解を持てばよい。判別式 $36-12a>0$ より $a<3$。",
    level: 3,
  },
  {
    id: "writeup_hd_integral_area_1",
    topicId: "calc_curve_area_basic",
    title: "2曲線で囲む面積（難）",
    statement: "曲線 $y=x^2$ と $y=2x$ で囲まれる部分の面積を求めよ。",
    rubric: [
      "交点を求めている",
      "上下面を判断して積分している",
      "面積を正しく計算している",
    ],
    solution:
      "交点は $x=0,2$。面積は $\int_0^2(2x-x^2)dx=[x^2-\frac{x^3}{3}]_0^2=\frac{4}{3}$。",
    level: 3,
  },
  {
    id: "writeup_hd_trig_equation_1",
    topicId: "trig_equations_basic",
    title: "三角方程式（難）",
    statement: "$0\le x<2\pi$ において $2\sin x+\sqrt{3}=0$ を解け。",
    rubric: [
      "$\sin x=-\sqrt{3}/2$ を導いている",
      "解の範囲を正しく取っている",
    ],
    solution:
      "$x=\frac{4\pi}{3},\frac{5\pi}{3}$。",
    level: 3,
  },
  {
    id: "writeup_hd_exp_log_eq_1",
    topicId: "exp_log_log_equation_basic",
    title: "対数方程式（難）",
    statement: "$\log_2(x-1)+\log_2(x-3)=3$ を解け。",
    rubric: [
      "定義域を考慮している",
      "積の形にまとめている",
      "解を正しく判定している",
    ],
    solution:
      "$(x-1)(x-3)=2^3=8$ より $x^2-4x-5=0$。$x=5,-1$。定義域から $x=5$。",
    level: 3,
  },
  {
    id: "writeup_hd_binomial_coeff_1",
    topicId: "binomial_xy_coeff_basic",
    title: "二項定理（難）",
    statement: "$(x^2+\frac{1}{x})^6$ の $x^5$ の係数を求めよ。",
    rubric: [
      "一般項を立てて次数条件を解いている",
      "係数を正しく判断している",
    ],
    solution:
      "一般項は $\binom{6}{k}x^{12-3k}$。$12-3k=5$ は整数解を持たないため係数0。",
    level: 3,
  },
  {
    id: "writeup_hd_poly_factor_1",
    topicId: "poly_factor_k_basic",
    title: "因数分解とパラメータ（難）",
    statement: "多項式 $x^3+ax^2+bx+1$ が $(x+1)^2$ を因数にもつとき、$a,b$ を求めよ。",
    rubric: [
      "$x=-1$ を代入して条件を立てている",
      "導関数の条件を用いている",
      "連立して $a,b$ を求めている",
    ],
    solution:
      "$f(-1)=0$ から $a=b$。導関数は $3x^2+2ax+b$、$x=-1$ で $3-2a+b=0$。$a=b$ より $a=b=3$。",
    level: 3,
  },
  {
    id: "writeup_hd_quad_param_range_2",
    topicId: "quad_param_range_basic",
    title: "2次関数と範囲（難）",
    statement:
      "$f(x)=x^2-2ax+a^2-1$ が区間 $[0,2]$ で常に負となるような $a$ の範囲を求めよ。",
    rubric: [
      "平方完成して $f(x)=(x-a)^2-1$ としている",
      "区間端点と頂点位置の場合分けをしている",
      "範囲を不等式で正しくまとめている",
    ],
    rubricWeights: [1.2, 1.0, 1.5],
    solution:
      "$f(x)=(x-a)^2-1$。区間内での最大値が $<0$ となる必要がある。頂点 $x=a$ が $[0,2]$ にあるとき最大は端点なので $\\max\\{(0-a)^2-1,(2-a)^2-1\\}<0$。これは $a^2<1$ かつ $(2-a)^2<1$ より $-1<a<1$ と $1<a<3$ を同時に満たせず不可。頂点が区間外なら端点で最大。$a\\le0$ のとき最大は $x=2$: $(2-a)^2-1<0\\Rightarrow 1<a<3$ は矛盾。$a\\ge2$ のとき最大は $x=0$: $a^2-1<0\\Rightarrow -1<a<1$ は矛盾。よって該当なし。",
    level: 3,
  },
  {
    id: "writeup_hd_quad_intersection_1",
    topicId: "quad_graph_through_points_variant_basic",
    title: "2曲線の共有点（難）",
    statement:
      "放物線 $y=x^2+px+q$ と直線 $y=2x+1$ が異なる2点で交わり、その2点の $x$ 座標の和が $4$ である。$p,q$ の関係式を求めよ。",
    rubric: [
      "交点を二次方程式で表している",
      "解の和が係数から $4$ と置けている",
      "$p,q$ の関係式を導いている",
    ],
    rubricWeights: [1.2, 1.0, 1.5],
    solution:
      "交点は $x^2+px+q=2x+1\\Rightarrow x^2+(p-2)x+(q-1)=0$。解の和は $-(p-2)=4$ より $p-2=-4$、$p=-2$。異なる2点条件は判別式 $D=(p-2)^2-4(q-1)>0$。$p=-2$ から $16-4(q-1)>0\\Rightarrow q<5$。関係は $p=-2$ かつ $q<5$。",
    level: 3,
  },
  {
    id: "writeup_hd_trig_range_1",
    topicId: "trig_range_basic",
    title: "三角関数の値域（難）",
    statement:
      "$f(x)=2\\sin x+\\sqrt{3}\\cos x$ の最大値・最小値と、それをとる $x$ を $0\\le x<2\\pi$ で求めよ。",
    rubric: [
      "合成して $R\\sin(x+\\alpha)$ の形にしている",
      "最大最小が $\\pm R$ と分かっている",
      "対応する $x$ を正しく求めている",
    ],
    rubricWeights: [1.2, 1.0, 1.5],
    solution:
      "$f(x)=R\\sin(x+\\alpha)$ とおくと $R=\\sqrt{2^2+(\\sqrt3)^2}=\\sqrt7$。$\\cos\\alpha=2/\\sqrt7,\\sin\\alpha=\\sqrt3/\\sqrt7$。最大値 $\\sqrt7$ は $x+\\alpha=\\pi/2$、最小値 $-\\sqrt7$ は $x+\\alpha=3\\pi/2$。",
    level: 3,
  },
  {
    id: "writeup_hd_exp_log_1",
    topicId: "exp_log_equations_basic",
    title: "指数方程式（難）",
    statement:
      "$2^{2x}+2^x-6=0$ を解け。",
    rubric: [
      "$2^x=t$ とおき二次方程式にしている",
      "$t>0$ を考慮している",
      "元の $x$ に戻して解を求めている",
    ],
    rubricWeights: [1.2, 1.0, 1.5],
    solution:
      "$t=2^x(>0)$ とおくと $t^2+t-6=0$ で $(t-2)(t+3)=0$。$t=2$ より $2^x=2$、$x=1$。",
    level: 3,
  },
  {
    id: "writeup_hd_data_regression_1",
    topicId: "data_regression_basic",
    title: "回帰直線（難）",
    statement:
      "データ $(1,2),(2,3),(3,5),(4,4)$ について回帰直線 $y=ax+b$ を求めよ。",
    rubric: [
      "平均 $\\bar{x},\\bar{y}$ を求めている",
      "$a=\\frac{\\sum (x-\\bar{x})(y-\\bar{y})}{\\sum (x-\\bar{x})^2}$ を使っている",
      "$b=\\bar{y}-a\\bar{x}$ を使っている",
    ],
    solution:
      "$\\bar{x}=2.5,\\bar{y}=3.5$。$\\sum (x-\\bar{x})(y-\\bar{y})=3.5$、$\\sum (x-\\bar{x})^2=5$ より $a=0.7$。$b=3.5-0.7\\times2.5=1.75$。",
    level: 3,
  },
  {
    id: "writeup_hd_int_mod_1",
    topicId: "int_mod_arithmetic_intro",
    title: "合同式（難）",
    statement:
      "$7^n$ を $11$ で割った余りが $1$ となる最小の正の整数 $n$ を求めよ。",
    rubric: [
      "合同式の性質を使っている",
      "周期を調べている",
      "最小の $n$ を答えている",
    ],
    rubricWeights: [1.2, 1.0, 1.5],
    solution:
      "$7^2=49\\equiv5$、$7^3\\equiv5\\cdot7=35\\equiv2$、$7^4\\equiv2\\cdot7=14\\equiv3$、$7^5\\equiv3\\cdot7=21\\equiv10$、$7^6\\equiv10\\cdot7=70\\equiv4$、$7^7\\equiv4\\cdot7=28\\equiv6$、$7^8\\equiv6\\cdot7=42\\equiv9$、$7^9\\equiv9\\cdot7=63\\equiv8$、$7^{10}\\equiv8\\cdot7=56\\equiv1$。よって最小は $n=10$。",
    level: 3,
  },
  {
    id: "writeup_hd_calc_tangent_1",
    topicId: "calc_tangent_slope_basic",
    title: "接線の傾き（難）",
    statement:
      "$y=x^3-3x+1$ の $x=a$ における接線が点 $(1,-1)$ を通る。$a$ を求めよ。",
    rubric: [
      "$f'(a)$ を用いて接線の式を立てている",
      "点 $(1,-1)$ を代入して方程式を作っている",
      "$a$ を正しく求めている",
    ],
    rubricWeights: [1.2, 1.0, 1.5],
    solution:
      "$f(x)=x^3-3x+1$、$f'(x)=3x^2-3$。接線は $y=f'(a)(x-a)+f(a)$。点 $(1,-1)$ を代入して $-1=(3a^2-3)(1-a)+a^3-3a+1$。整理して $-1= -3a^3+6a^2-3 +a^3-3a+1$ より $-1=-2a^3+6a^2-3a-2$。$0=2a^3-6a^2+3a+1=(a-1)(2a^2-4a-1)$。$a=1$ または $a=1\pm\sqrt{\tfrac{3}{2}}$。",
    level: 3,
  },
  {
    id: "writeup_hd_calc_area_1",
    topicId: "calc_curve_area_basic",
    title: "面積（難）",
    statement:
      "$y=x^2$ と $y=2x$ で囲まれる部分の面積を求めよ。",
    rubric: [
      "交点を求めている",
      "積分で面積を計算している",
      "結論が簡潔である",
    ],
    rubricWeights: [1.2, 1.0, 1.5],
    solution:
      "交点は $x^2=2x$ より $x=0,2$。面積は $\int_0^2 (2x-x^2)\,dx=\left[x^2-\tfrac{x^3}{3}\right]_0^2=4-\tfrac{8}{3}=\tfrac{4}{3}$。",
    level: 3,
  },
  {
    id: "writeup_hd_exp_log_param_1",
    topicId: "exp_log_power_equation_basic",
    title: "指数方程式（パラメータ）",
    statement:
      "$3^{2x}-3^x+(m-2)=0$ が実数解をもつための $m$ の範囲を求めよ。",
    rubric: [
      "$t=3^x$ とおいて二次方程式にしている",
      "$t>0$ を考慮している",
      "判別式と範囲を正しくまとめている",
    ],
    rubricWeights: [1.2, 1.0, 1.5],
    solution:
      "$t=3^x(>0)$ とすると $t^2-t+(m-2)=0$。判別式 $D=1-4(m-2)=9-4m\ge0$ より $m\le\tfrac94$。さらに実数解 $t$ が正である必要がある。二次方程式の解は $\tfrac{1\pm\sqrt{9-4m}}{2}$。小さい方が正となるには $1-\sqrt{9-4m}>0\Rightarrow 9-4m<1\Rightarrow m>2$。よって $2<m\le\tfrac94$。$m=2$ のとき $t(t-1)=0$ で $t=1$ があり解をもつので結論は $2\le m\le\tfrac94$。",
    level: 3,
  },
  {
    id: "writeup_hd_trig_equation_2",
    topicId: "trig_equations_basic",
    title: "三角方程式（難）",
    statement:
      "$\sin x+\sqrt{3}\cos x=1$ を $0\le x<2\pi$ で解け。",
    rubric: [
      "合成して $R\sin(x+\alpha)$ にしている",
      "方程式を解いている",
      "区間内の解を列挙している",
    ],
    rubricWeights: [1.2, 1.0, 1.5],
    solution:
      "$\sin x+\sqrt3\cos x=2\sin(x+\pi/3)$。よって $2\sin(x+\pi/3)=1$、$\sin(x+\pi/3)=1/2$。$x+\pi/3=\pi/6,5\pi/6$。したがって $x=-\pi/6, \; x=\pi/2$。区間内では $x=11\pi/6,\pi/2$。",
    level: 3,
  },
  {
    id: "writeup_hd_binomial_eq_1",
    topicId: "binomial_xy_coeff_basic",
    title: "二項係数（難）",
    statement:
      "$(x+2)^8$ の展開式で $x^3$ の係数を求めよ。",
    rubric: [
      "一般項を立てている",
      "係数の指数条件を正しく適用している",
      "計算が正しい",
    ],
    rubricWeights: [1.2, 1.0, 1.5],
    solution:
      "一般項は $\binom{8}{k}x^{8-k}2^k$。$8-k=3$ より $k=5$。係数は $\binom{8}{5}2^5=56\times32=1792$。",
    level: 3,
  },
  {
    id: "writeup_hd_poly_param_1",
    topicId: "poly_remainder_basic",
    title: "剰余の定理（難）",
    statement:
      "多項式 $P(x)=x^3+ax^2+bx+1$ が $x=1$ で 2 を、$x=-1$ で 0 を与えるとき $a,b$ を求めよ。",
    rubric: [
      "$P(1),P(-1)$ を用いて連立方程式を作っている",
      "$a,b$ を正しく解いている",
      "結論が簡潔である",
    ],
    rubricWeights: [1.2, 1.0, 1.5],
    solution:
      "$P(1)=1+a+b+1=2\Rightarrow a+b=0$。$P(-1)=-1+a-b+1=0\Rightarrow a-b=0$。よって $a=b=0$。",
    level: 3,
  },
  {
    id: "writeup_hd_calc_limit_1",
    topicId: "calc_limit_basic",
    title: "極限（難）",
    statement:
      "$\lim_{x\to0} \frac{\sin x - x + \tfrac{x^3}{6}}{x^5}$ を求めよ。",
    rubric: [
      "テイラー展開または近似式を用いている",
      "次数を比較して極限を求めている",
      "結論が簡潔である",
    ],
    rubricWeights: [1.2, 1.0, 1.5],
    solution:
      "$\sin x = x-\tfrac{x^3}{6}+\tfrac{x^5}{120}+\cdots$ より分子は $\tfrac{x^5}{120}+\cdots$。したがって極限は $1/120$。",
    level: 3,
  },
  {
    id: "writeup_hd_calc_extrema_2",
    topicId: "calc_extrema_basic",
    title: "極値条件（難）",
    statement:
      "$f(x)=x^4-4x^3+6x^2-4x+m$ が $x=1$ で極小をとるための $m$ を求めよ。",
    rubric: [
      "$f'(x)$ を求めている",
      "$f'(1)=0$ を用いている",
      "極小条件を確認している",
    ],
    rubricWeights: [1.2, 1.0, 1.5],
    solution:
      "$f'(x)=4x^3-12x^2+12x-4=4(x-1)^3$。$f'(1)=0$ は常に成り立つので $m$ によらない。$f''(x)=12(x-1)^2$ で $x=1$ で $0$ だが $f'(x)$ の符号は $(x-1)^3$ によって変わり、$x=1$ は極小。従って $m$ は任意。",
    level: 3,
  },
  {
    id: "writeup_hd_calc_integral_1",
    topicId: "calc_integral_advanced_basic",
    title: "定積分（難）",
    statement:
      "$\int_0^1 x\ln(1+x)\,dx$ を求めよ。",
    rubric: [
      "部分積分を用いている",
      "計算が正しい",
      "結論が簡潔である",
    ],
    rubricWeights: [1.2, 1.0, 1.5],
    solution:
      "$u=\ln(1+x),\,dv=x\,dx$ とすると $du=\tfrac{1}{1+x}dx,\,v=\tfrac{x^2}{2}$。よって $\int_0^1 x\ln(1+x)dx=\left[\tfrac{x^2}{2}\ln(1+x)\right]_0^1-\tfrac12\int_0^1 \tfrac{x^2}{1+x}dx$。後者は $\tfrac12\int_0^1 (x-1+\tfrac{1}{1+x})dx=\tfrac12\left[\tfrac{x^2}{2}-x+\ln(1+x)\right]_0^1=\tfrac12(\tfrac12-1+\ln2)$. したがって全体は $\tfrac12\ln2-\tfrac12(\tfrac12-1+\ln2)=\tfrac14$.",
    level: 3,
  },
  {
    id: "writeup_hd_conic_ellipse_1",
    topicId: "conic_ellipse_basic",
    title: "楕円（難）",
    statement:
      "$\frac{x^2}{9}+\frac{y^2}{4}=1$ の焦点と離心率を求めよ。",
    rubric: [
      "$a^2,b^2$ を読み取っている",
      "$c^2=a^2-b^2$ を用いている",
      "離心率 $e=c/a$ を求めている",
    ],
    rubricWeights: [1.2, 1.0, 1.5],
    solution:
      "$a^2=9,b^2=4$ より $c^2=5$、$c=\sqrt5$。焦点は $(\pm\sqrt5,0)$、離心率 $e=\sqrt5/3$。",
    level: 3,
  },
  {
    id: "writeup_hd_vector_plane_1",
    topicId: "vector_plane_basic",
    title: "平面ベクトル（難）",
    statement:
      "点 $A(1,0,2), B(2,1,3), C(0,1,1)$ を通る平面の方程式を求めよ。",
    rubric: [
      "2つの方向ベクトルを作っている",
      "法線ベクトルを求めている",
      "平面方程式を立てている",
    ],
    rubricWeights: [1.2, 1.0, 1.5],
    solution:
      "$\overrightarrow{AB}=(1,1,1),\overrightarrow{AC}=(-1,1,-1)$。外積より法線 $n=( -2,0,2)\sim( -1,0,1)$。点 $A$ を通るので $-(x-1)+ (z-2)=0$、すなわち $z-x-1=0$。",
    level: 3,
  },
  {
    id: "writeup_hd_complex_1",
    topicId: "complex_polar_basic",
    title: "複素数（難）",
    statement:
      "$z=1+i$ の $5$ 乗を求めよ。",
    rubric: [
      "極形式に直している",
      "ド・モアブルの定理を用いている",
      "結果を正しく計算している",
    ],
    rubricWeights: [1.2, 1.0, 1.5],
    solution:
      "$z=\sqrt2\,\mathrm{cis}(\pi/4)$。よって $z^5=(\sqrt2)^5\,\mathrm{cis}(5\pi/4)=4\sqrt2\,(\!-\tfrac{\sqrt2}{2}-\tfrac{\sqrt2}{2}i)=-4-4i$。",
    level: 3,
  },
  {
    id: "writeup_hd_complex_polar_2",
    topicId: "complex_polar_basic",
    title: "複素数の冪（難）",
    statement:
      "$z=\sqrt{3}-i$ の $6$ 乗を求めよ。",
    rubric: [
      "極形式に直している",
      "ド・モアブルの定理を用いている",
      "結果を正しく計算している",
    ],
    rubricWeights: [1.2, 1.0, 1.5],
    solution:
      "$z=2\,\mathrm{cis}(-\pi/6)$。よって $z^6=2^6\,\mathrm{cis}(-\pi)=64(-1)=-64$。",
    level: 3,
  },
  {
    id: "writeup_hd_complex_locus_1",
    topicId: "complex_locus_circle_radius_basic",
    title: "軌跡（難）",
    statement:
      "$|z-1|=|z+1|$ を満たす複素数 $z$ の軌跡を求めよ。",
    rubric: [
      "距離の等式を用いている",
      "実部・虚部に分けて整理している",
      "軌跡を直線として答えている",
    ],
    rubricWeights: [1.2, 1.0, 1.5],
    solution:
      "$z=x+iy$ とすると $(x-1)^2+y^2=(x+1)^2+y^2$ より $x=0$。よって虚軸。",
    level: 3,
  },
  {
    id: "writeup_hd_vector_triple_1",
    topicId: "vector_space_basic",
    title: "空間ベクトル（難）",
    statement:
      "3点 $A(1,0,0), B(0,1,0), C(0,0,1)$ を通る平面と、点 $P(1,1,1)$ の距離を求めよ。",
    rubric: [
      "平面の方程式を立てている",
      "距離公式を用いている",
      "計算が正しい",
    ],
    rubricWeights: [1.2, 1.0, 1.5],
    solution:
      "平面は $x+y+z=1$。距離は $\frac{|1+1+1-1|}{\sqrt{1^2+1^2+1^2}}=\frac{2}{\sqrt3}$。",
    level: 3,
  },
  {
    id: "writeup_hd_vector_projection_1",
    topicId: "vector_projection_basic",
    title: "射影（難）",
    statement:
      "$\vec{a}=(2,1,2)$ を $\vec{b}=(1,2,2)$ に正射影したベクトルを求めよ。",
    rubric: [
      "射影公式を用いている",
      "内積と長さを正しく計算している",
      "ベクトルとして答えている",
    ],
    rubricWeights: [1.2, 1.0, 1.5],
    solution:
      "$\mathrm{proj}_{\vec b}\vec a=\frac{\vec a\cdot \vec b}{\|\vec b\|^2}\vec b$。$\vec a\cdot\vec b=2+2+4=8$、$\|\vec b\|^2=1+4+4=9$。よって $\frac{8}{9}(1,2,2)=(8/9,16/9,16/9)$。",
    level: 3,
  },
  {
    id: "writeup_hd_conic_parabola_1",
    topicId: "conic_parabola_basic",
    title: "放物線（難）",
    statement:
      "$y^2=4px$ の焦点と準線を求めよ。",
    rubric: [
      "標準形を理解している",
      "焦点と準線を正しく書いている",
      "結論が簡潔である",
    ],
    rubricWeights: [1.2, 1.0, 1.5],
    solution:
      "焦点は $(p,0)$、準線は $x=-p$。",
    level: 3,
  },
  {
    id: "writeup_hd_conic_hyperbola_1",
    topicId: "conic_hyperbola_basic",
    title: "双曲線（難）",
    statement:
      "$\frac{x^2}{9}-\frac{y^2}{4}=1$ の漸近線の方程式を求めよ。",
    rubric: [
      "$a,b$ を読み取っている",
      "漸近線が $y=\pm \frac{b}{a}x$ と分かっている",
      "結論が簡潔である",
    ],
    rubricWeights: [1.2, 1.0, 1.5],
    solution:
      "$a=3,b=2$ より漸近線は $y=\pm \frac{2}{3}x$。",
    level: 3,
  },

];

export function getWriteupProblemsByTopic(topicId?: TopicId) {
  if (!topicId) return WRITEUP_PROBLEMS;
  return WRITEUP_PROBLEMS.filter((p) => p.topicId === topicId);
}

export function getWriteupProblemById(problemId: string) {
  return WRITEUP_PROBLEMS.find((p) => p.id === problemId);
}

export function getDefaultRubric() {
  return DEFAULT_RUBRIC;
}
