// src/lib/course/topicContent.ts
import type { TopicId } from './topics';

type TopicContent = {
  core: string;   // 人間が書いたベース解説（Markdown+TeX）
};

export const TOPIC_CONTENT: Partial<Record<TopicId, TopicContent>> = {
  quad_solve_basic: {
    core: `
# 二次方程式の解（判別式）

二次方程式

$$
ax^2 + bx + c = 0\\ (a \\neq 0)
$$

の実数解の個数は、判別式

$$
D = b^2 - 4ac
$$

で判断します。

- $D > 0$ のとき：**2つの実数解**
- $D = 0$ のとき：**重解（同じ解が2つ）**
- $D < 0$ のとき：**実数解なし**

---

## このアプリでの答え方

- 2つの実数解：\`a,b\`（順不同）
  - 例: \`1,3\` または \`3,1\`
- 重解：\`a,a\`
  - 例: \`2,2\`
- 実数解なし：\`none\`（または \`なし\`）
`,
  },
  quad_discriminant_basic: {
    core: `
# 判別式と解の個数

二次方程式

$$
ax^2 + bx + c = 0\\ (a \\neq 0)
$$

の判別式は

$$
D = b^2 - 4ac
$$

です。判別式で実数解の個数を判断します。

- $D > 0$ のとき：**実数解が2つ**
- $D = 0$ のとき：**重解（1つ）**
- $D < 0$ のとき：**実数解なし**

このトピックでは、$D$ の計算と解の個数の判定に慣れます。
`,
  },
  quad_roots_relations_basic: {
    core: `
# 解と係数の関係（和と積）

二次方程式

$$
ax^2 + bx + c = 0\\ (a \\neq 0)
$$

の解を $\\alpha,\\beta$ とすると、次が成り立ちます。

$$
\\alpha + \\beta = -\\frac{b}{a},\\quad
\\alpha\\beta = \\frac{c}{a}
$$

この関係を使うと、解の**和**や**積**、小さい方の解を効率よく求められます。
`,
  },
  trig_ratio_basic: {
    core: `
# 三角比（直角三角形）

直角三角形で、ある鋭角を $A$ とすると

- $\\sin A = \\dfrac{\\text{向かい側の辺}}{\\text{斜辺}}$
- $\\cos A = \\dfrac{\\text{となりの辺}}{\\text{斜辺}}$
- $\\tan A = \\dfrac{\\text{向かい側の辺}}{\\text{となりの辺}}$

です。直角三角形の辺の長さから、対応する比を計算します。
`,
  },
  trig_special_angles_basic: {
    core: `
# 特殊角の三角比

よく使う角度の三角比は次の通りです。

$$
\\sin 30^\\circ=\\frac{1}{2},\\quad
\\cos 30^\\circ=\\frac{\\sqrt{3}}{2},\\quad
\\tan 30^\\circ=\\frac{\\sqrt{3}}{3}
$$

$$
\\sin 45^\\circ=\\frac{\\sqrt{2}}{2},\\quad
\\cos 45^\\circ=\\frac{\\sqrt{2}}{2},\\quad
\\tan 45^\\circ=1
$$

$$
\\sin 60^\\circ=\\frac{\\sqrt{3}}{2},\\quad
\\cos 60^\\circ=\\frac{1}{2},\\quad
\\tan 60^\\circ=\\sqrt{3}
$$
`,
  },
  geo_measure_right_triangle_basic: {
    core: `
# 直角三角形の計量

直角三角形では、三角比を使って高さや距離を求めます。

$$
\\sin A = \\frac{\\text{向かい側}}{\\text{斜辺}},\\quad
\\cos A = \\frac{\\text{となり}}{\\text{斜辺}},\\quad
\\tan A = \\frac{\\text{向かい側}}{\\text{となり}}
$$

## 例

直角三角形で $\\angle{A}=30^\\circ$, 斜辺が 10 のとき

$$
\\sin 30^\\circ = \\frac{1}{2}
$$

より、向かい側の長さは $10\\times\\frac{1}{2}=5$ です。
`,
  },
  geo_sine_cosine_law_basic: {
    core: `
# 正弦定理・余弦定理

一般の三角形 $\\triangle{ABC}$ で、辺 $a,b,c$ はそれぞれ角 $A,B,C$ の対辺とします。

## 正弦定理

$$
\\frac{a}{\\sin A} = \\frac{b}{\\sin B} = \\frac{c}{\\sin C}
$$

## 余弦定理

$$
c^2 = a^2 + b^2 - 2ab\\cos C
$$

角が $60^\\circ$ や $90^\\circ$ のとき、計算が簡単になります。
`,
  },
  data_summary_basic: {
    core: `
# データの代表値

データをまとめるとき、平均・中央値・最頻値・範囲を使います。

## 平均

$$
\\text{平均} = \\frac{\\text{合計}}{\\text{個数}}
$$

## 中央値

データを小さい順に並べ、真ん中の値を取ります。

## 最頻値

最も多く出る値です。

## 範囲

$$
\\text{範囲} = \\text{最大値} - \\text{最小値}
$$

### 例
データが 2, 3, 3, 7, 9 のとき、平均は 24 ÷ 5 = 4.8、中央値は 3、最頻値は 3、範囲は 9 − 2 = 7 です。
`,
  },
  data_variance_sd_basic: {
    core: `
# 分散・標準偏差（母分散）

平均との差の二乗の平均を **分散（母分散）** とします。

$$
\\text{分散} = \\frac{(x_1-\\bar{x})^2 + (x_2-\\bar{x})^2 + \\cdots + (x_n-\\bar{x})^2}{n}
$$

標準偏差は分散の平方根です。

$$
\\text{標準偏差} = \\sqrt{\\text{分散}}
$$

### 例
データが 1, 1, 3, 3 のとき、平均は 2、分散は 1、標準偏差は 1 です。
`,
  },
  prob_basic: {
    core: `
# 確率の基本

確率は

$$
\\text{確率} = \\frac{\\text{起こってほしい場合の数}}{\\text{起こりうる場合の数}}
$$

で求めます。

## 例（サイコロ）

サイコロを1回投げるとき、1が出る確率は

$$
\\frac{1}{6}
$$

です（全体6通り、1が出るのは1通り）。

## 例（コイン）

コインを2回投げて表がちょうど1回出る確率は

$$
\\frac{2}{4} = \\frac{1}{2}
$$

です。
`,
  },
  prob_complement_basic: {
    core: `
# 補集合（余事象）と確率

ある事象 $A$ が起こる確率を $P(A)$ とすると、起こらない確率は

$$
P(\\overline{A}) = 1 - P(A)
$$

です。

## 例（少なくとも1回）

コインを2回投げて「少なくとも1回表が出る」確率は、
「1回も表が出ない（=裏が2回）」の確率を使うと簡単です。

$$
P(\\text{少なくとも1回表}) = 1 - P(\\text{裏が2回})
$$
`,
  },
  int_divisor_multiple_basic: {
    core: `
# 約数・倍数・最大公約数・最小公倍数

## 約数と倍数
整数 $a$ が $b$ を割り切るとき、$a$ を $b$ の約数、$b$ を $a$ の倍数といいます。

## 最大公約数（gcd）
2つの数の共通の約数のうち、最大のものです。

## 最小公倍数（lcm）
2つの数の共通の倍数のうち、最小のものです。

### 例
12 と 18 の最大公約数は 6、最小公倍数は 36 です。
`,
  },
  int_remainder_basic: {
    core: `
# 余りと剰余

整数 $n$ を $k$ で割ったとき、$n = kq + r$（$0 \\le r < k$）となる $r$ を **余り** といいます。

### 例
17 を 5 で割ると $17 = 5\\times 3 + 2$ なので、余りは 2 です。

「$n$ を 4 で割ると 1 余る」なら $n$ は 4 の倍数に 1 足した数です。
`,
  },
  int_prime_factor_basic: {
    core: `
# 素因数分解と素数判定

## 素数と合成数
1 と自分自身以外に約数を持たない数を **素数** といいます。
それ以外の数は **合成数** です。

## 素因数分解
数を素数の積に分解します（例: 12 = 2×2×3）。

## 約数の個数
素因数分解の指数を使って、約数の個数を数えます。

### 例
60 = 2^2 × 3 × 5 なので、約数の個数は (2+1)(1+1)(1+1) = 12 個です。
`,
  },
  int_gcd_lcm_applications_basic: {
    core: `
# 最大公約数・最小公倍数の応用

## gcd の使いどころ
同じ大きさに分けるとき、最大公約数を使います。

## lcm の使いどころ
周期的な出来事が再び同時に起こるとき、最小公倍数を使います。

### 例
6 分ごとと 8 分ごとのイベントが同時に起こるのは 24 分後です。
`,
  },
  int_mod_arithmetic_intro: {
    core: `
# 剰余の入門

「$a$ を $m$ で割った余りが同じ」なら $a$ は合同です（例: 17 と 5 は 12 で割ると同じ余り）。

## 下1桁の周期
2^n の下1桁は 2,4,8,6... の周期で繰り返します。

### 例
2^5 の下1桁は周期の 1 周目 4 番目なので 2^5 の下1桁は 2 です。
`,
  },
  geo_ratio_theorems: {
    core: `
# 比の定理

## 角の二等分線の定理
点Dが $\\angle A$ の二等分線と $\\overline{BC}$ の交点なら
$$
\\frac{BD}{DC} = \\frac{AB}{AC}
$$

## 中点連結定理
点M,Nがそれぞれ辺AB,ACの中点のとき
$$
\\overline{MN} \\parallel \\overline{BC},\\ \\overline{MN} = \\frac{1}{2}\\overline{BC}
$$

## メネラウスの定理
一直線上に $D,E,F$ があるとき
$$
\\frac{AF}{FB} \\cdot \\frac{BD}{DC} \\cdot \\frac{CE}{EA} = 1
$$

## チェバの定理
3本の線分が一点で交わるとき
$$
\\frac{AF}{FB} \\cdot \\frac{BD}{DC} \\cdot \\frac{CE}{EA} = 1
$$

## 面積比
同じ高さをもつ三角形の面積比は底辺の比に等しくなります。
`,
  },
  geo_circle_geometry: {
    core: `
# 円の性質

## 内接四角形
向かい合う角の和が $180^\\circ$。

## 接弦定理
接線と弦のなす角は、対応する弧に対する円周角に等しい。

## 円の冪
### 交わる弦
$$
AP\\cdot PB = CP\\cdot PD
$$

### 割線と接線
$$
x^2 = \\text{外部}\\times\\text{全体}
$$
`,
  },
  geo_triangle_centers: {
    core: `
# 三角形の中心

## 重心
中線の交点を重心といい、中線を $2:1$ に内分します。

## 内心
三角形の内角の二等分線の交点が内心です。

## 外心
辺の垂直二等分線の交点が外心で、3頂点から等距離です。
`,
  },
  geo_circle_relations: {
    core: `
# 2円の位置関係

中心間距離 $d$ と半径の和・差を比較して、交点の数や共通接線の本数を判断します。
`,
  },
  set_operations_basic: {
    core: `
# 集合の基本と演算

集合 $A,B$ に対して、次の記号を使います。

- 和集合: $A \\cup B$
- 共通部分: $A \\cap B$
- 補集合: $A^\\mathrm{c}$
- 差集合: $A \\setminus B$

## 個数（要素数）
$$
n(A \\cup B) = n(A) + n(B) - n(A \\cap B)
$$

### 例
$$
n(A)=8,\\ n(B)=5,\\ n(A \\cap B)=2
$$
なら $n(A \\cup B)=11$ です。
`,
  },
  prop_proposition_basic: {
    core: `
# 命題と条件

命題「$P$ ならば $Q$」の関係を整理します。

- 逆: $Q \\Rightarrow P$
- 裏: $\\neg P \\Rightarrow \\neg Q$
- 対偶: $\\neg Q \\Rightarrow \\neg P$

## 必要条件・十分条件

$P \\Rightarrow Q$ のとき、
- $P$ は $Q$ の十分条件
- $Q$ は $P$ の必要条件

### 例
$4 \\mid x$ ならば $2 \\mid x$ なので、
「$x$ が 4 の倍数」は「$x$ が偶数」の十分条件です。
`,
  },
  combi_conditions_basic: {
    core: `
# 条件付きの数え上げ

条件があるときは、**場合分け**や**補集合**を使うと数えやすくなります。

## 基本公式

$$
{}_nC_k = \\frac{n!}{k!(n-k)!},\\quad
{}_nP_k = \\frac{n!}{(n-k)!}
$$

## 例（含まない）

7人から3人を選ぶとき、Aさんを含まない場合の数は

$$
{}_6C_3
$$

です（Aさんを除いて6人から選ぶ）。

## 例（少なくとも1人）

「少なくとも1人含む」は

$$
\\text{全体} - \\text{含まない}
$$

で数えると簡単です。
`,
  },
  prob_combi_basic: {
    core: `
# 組合せと確率

確率は

$$
\\text{確率} = \\frac{\\text{有利な場合の数}}{\\text{全体の場合の数}}
$$

です。順序を区別しないときは組合せを使います。

## 例（玉の問題）

赤3個・青2個の箱から2個取り出すとき、赤1個の確率は

$$
\\frac{{}_3C_1\\cdot{}_2C_1}{{}_5C_2} = \\frac{6}{10} = \\frac{3}{5}
$$

です。
`,
  },
  quad_maxmin_basic: {
    core: `
# 二次関数の最大・最小（平方完成）

二次関数 $y = ax^2 + bx + c\\ (a \\neq 0)$ は、グラフが放物線になります。

平方完成をすると、つぎの形で表せます。

$$
y = a(x - p)^2 + q
$$

このとき、

- 放物線の頂点は $(p, q)$
- $a > 0$ のとき、$y$ の**最小値**は $q$
- $a < 0$ のとき、$y$ の**最大値**は $q$

です。

---

## 具体例

二次関数 $y = x^2 + 4x + 5$ について考えます。

1. 平方完成
   $$
   y = x^2 + 4x + 5
     = (x^2 + 4x + 4) + 1
     = (x+2)^2 + 1
   $$

2. 頂点
   - 頂点は $(-2, 1)$

3. 最大・最小
   - $a = 1 > 0$ なので、最小値は $1$
   - $x=-2$ のとき $y=1$
   - $x$ が $-2$ から離れると $y$ は増加する

したがって、この二次関数の**最小値は $1$** で、**最大値は存在しません**。
`,
  },

  quad_graph_basic: {
    core: `
# 二次関数のグラフと頂点

二次関数 $y = ax^2 + bx + c\\ (a \\neq 0)$ のグラフは、$y$ 軸に対して左右対称な放物線になります。

---

## 1. グラフの形

- $a > 0$ のとき：上に開いた放物線（∪ の形）
- $a < 0$ のとき：下に開いた放物線（∩ の形）

---

## 2. 頂点と軸

平方完成をして

$$
y = a(x - p)^2 + q
$$

と書き直すと、

- 頂点の座標：$(p, q)$
- 放物線の軸：$x = p$

です。

---

## 3. 例

$y = 2x^2 - 4x + 1$ について考えます。

$$
y = 2(x^2 - 2x) + 1
  = 2\{(x^2 - 2x + 1) - 1\} + 1
  = 2(x-1)^2 - 1
$$

- 頂点：$(1, -1)$
- 軸：$x = 1$
- $a = 2 > 0$ なので上に開いた放物線
`,
  },

  combi_basic: {
    core: `
# 場合の数の基本：和の法則と積の法則

ある事柄が何通りあるかを数えるとき、基本となる考え方はつぎの2つです。

---

## 1. 和の法則（足し算）

「A のやり方が $m$ 通り、B のやり方が $n$ 通り」で、

- A と B が**同時には起こらない**（互いに排反）

とき、全体のやり方は

$$
m + n\\ \\text{通り}
$$

になります。

---

## 2. 積の法則（掛け算）

「A のやり方が $m$ 通り、B のやり方が $n$ 通り」で、

- A と B を**順番に両方行う**

とき、全体のやり方は

$$
m \\times n\\ \\text{通り}
$$

になります。

---

## 3. 例

1〜5 の数字から異なる2つの数字を選んで並べる方法を考えます。

1. まず 1つ目の数字を選ぶ：5通り
2. つぎに 2つ目の数字を選ぶ：残りは4つ → 4通り

積の法則より、

$$
5 \\times 4 = 20
$$

通りとなります。
`,
  },

  algebra_expand_basic: {
    core: `
# 展開（基本）

分配法則を使って展開します。

- $(x+a)(x+b)=x^2+(a+b)x+ab$
- $(ax+b)(cx+d)$ はそれぞれを掛けて足し合わせます。

「値」を聞かれている問題では、先に $x$ を代入してから計算してもOKです。
`,
  },

  algebra_factor_basic: {
    core: `
# 因数分解（基本）

因数分解は「展開の逆」です。

代表例：
$$
x^2+(a+b)x+ab=(x+a)(x+b)
$$

因数分解したら、代入して元の式と一致するかで確認できます。
`,
  },

  algebra_linear_eq_basic: {
    core: `
# 一次方程式（基本）

$ax+b=cx+d$ は、移項して $x$ をまとめます。

$$
(a-c)x=d-b
$$

$$
x=\\frac{d-b}{a-c}
$$

このトピックでは整数解中心で練習します。
`,
  },

  algebra_ineq_basic: {
    core: `
# 一次不等式（基本）

$ax+b>cx+d$ を満たす範囲を求めます。

$$
(a-c)x>d-b
$$

最後に「最小の整数解」など条件があれば、解の範囲から条件を満たす最小値を選びます。
`,
  },
  exp_log_basic: {
    core: `
# 指数・対数の計算（基本）

指数は「同じ数を何回かけるか」、対数は「指数の逆」です。

$$
\\log_a b = n \\iff a^n = b
$$

計算は「指数に戻す」か「対数に戻す」かを意識すると整理できます。
`,
  },
  exp_log_equations_basic: {
    core: `
# 指数・対数方程式（基本）

指数方程式や対数方程式は、定義に戻して解きます。

$$
a^x = b \\Rightarrow x = \\log_a b
$$
$$
\\log_a x = n \\Rightarrow x = a^n
$$

このトピックでは整数解が出る基本問題に取り組みます。
`,
  },
  exp_log_change_base_basic: {
    core: `
# 底の変換（基本）

底の変換公式：
$$
\\log_a b = \\frac{\\log_c b}{\\log_c a}
$$

このトピックでは指数の形に戻せる簡単な問題を扱います。
`,
  },
  exp_log_growth_basic: {
    core: `
# 指数成長（基本）

指数的な増加は
$$
A_n=a\\times r^n
$$
の形で表されます。等式から $n$ を求めます。
`,
  },
  exp_log_domain_basic: {
    core: `
# 定義域（基本）

対数の中身は正なので
$$
x-\\alpha>0
$$
を満たす範囲が定義域です。
`,
  },
  exp_log_simple_equation_basic: {
    core: `
# 指数方程式（同底）（基本）

同じ底なら指数が等しくなります：
$$
a^x=a^k \\Rightarrow x=k
$$
`,
  },
  exp_log_power_equation_basic: {
    core: `
# 指数方程式（2x）（基本）

指数の形が $2x$ のときは
$$
a^{2x}=a^k \\Rightarrow 2x=k
$$
で解きます。
`,
  },
  exp_log_log_equation_basic: {
    core: `
# 対数方程式（基本）

$$
\\log_a x = n \\Rightarrow x=a^n
$$
に戻して解きます。
`,
  },
  exp_log_log_sum_basic: {
    core: `
# 対数の加法（基本）

$$
\\log_a x+\\log_a y=\\log_a(xy)
$$
を使います。
`,
  },
  exp_log_log_diff_basic: {
    core: `
# 対数の減法（基本）

$$
\\log_a x-\\log_a y=\\log_a\\left(\\frac{x}{y}\\right)
$$
を使います。
`,
  },
  exp_log_log_product_basic: {
    core: `
# 対数と指数の積（基本）

指数法則を使って
$$
a^m a^n=a^{m+n}
$$
としてから対数を取ります。
`,
  },
  poly_remainder_basic: {
    core: `
# 余りの定理（基本）

多項式 $f(x)$ を $x-a$ で割った余りは $f(a)$ です。
`,
  },
  poly_factor_k_basic: {
    core: `
# 因数定理（基本）

$x-a$ が $f(x)$ の因数であることは $f(a)=0$ と同値です。
`,
  },
  poly_value_sum_basic: {
    core: `
# 多項式の値（基本）

与えられた $x$ を代入して $f(x)$ を計算します。
`,
  },
  poly_coeff_from_roots_basic: {
    core: `
# 因数から係数（基本）

$(x-a)(x-b)=x^2-(a+b)x+ab$ から係数を読み取ります。
`,
  },
  binomial_coeff_basic: {
    core: `
# 二項定理の係数（基本）

$(x+a)^n$ の $x^k$ の係数は
$$
\\binom{n}{k}a^{n-k}
$$
です。
`,
  },
  binomial_xy_coeff_basic: {
    core: `
# 二項定理（x+y）（基本）

$(x+y)^n$ の $x^k y^{n-k}$ の係数は
$$
\\binom{n}{k}
$$
です。
`,
  },
  binomial_value_basic: {
    core: `
# 二項定理の値（基本）

$(1+a)^n$ を計算します。
`,
  },
  binomial_middle_coeff_basic: {
    core: `
# 二項定理の中央項（基本）

$n$ が偶数のとき中央項の係数は $\\binom{n}{n/2}$ です。
`,
  },
  identity_eval_basic: {
    core: `
# 恒等式の値（基本）

恒等式の両辺は常に等しいので、代入で値が求まります。
`,
  },
  identity_coefficient_basic: {
    core: `
# 恒等式の係数（基本）

恒等式では同じ次数の係数を比較して未知数を求めます。
`,
  },
  identity_coeff_quadratic_basic: {
    core: `
# 恒等式の係数比較（基本）

積を展開し、係数を比較して未知数を決めます。
`,
  },
  inequality_mean_basic: {
    core: `
# 相加相乗（基本）

正の数 $a,b$ について
$$
a+b\\ge 2\\sqrt{ab}
$$
です。
`,
  },
  inequality_sum_product_basic: {
    core: `
# 和と積（基本）

和一定のとき積は $x=y$ のとき最大です。
`,
  },
  inequality_amgm_basic: {
    core: `
# 相加相乗の差（基本）

相加平均 $\\frac{a+b}{2}$ と相乗平均 $\\sqrt{ab}$ の差を求めます。
`,
  },
  coord_line_slope_basic: {
    core: `
# 直線の傾き（基本）

2点 $(x_1,y_1),(x_2,y_2)$ を通る直線の傾きは
$$
\\frac{y_2-y_1}{x_2-x_1}
$$
です。
`,
  },
  coord_line_intercept_basic: {
    core: `
# 直線の切片（基本）

直線を $y=mx+b$ とおき、点を代入して $b$ を求めます。
`,
  },
  coord_line_parallel_perp_basic: {
    core: `
# 平行・垂直の傾き（基本）

平行なら傾きは同じ、垂直なら傾きは負の逆数です。
`,
  },
  coord_distance_point_line_basic: {
    core: `
# 点と直線の距離（基本）

直線 $ax+by+c=0$ と点 $(x_0,y_0)$ の距離は
$$
\\frac{|ax_0+by_0+c|}{\\sqrt{a^2+b^2}}
$$
です。
`,
  },
  coord_circle_radius_basic: {
    core: `
# 円の半径（基本）

中心 $(h,k)$ から点 $(x,y)$ までの距離が半径です。
`,
  },
  coord_circle_center_basic: {
    core: `
# 円の中心（基本）

標準形 $(x-h)^2+(y-k)^2=r^2$ の中心は $(h,k)$ です。
`,
  },
  trig_identities_basic: {
    core: `
# 三角恒等式（基本）

代表的な恒等式：

$$
\\sin^2\\theta + \\cos^2\\theta = 1
$$
$$
1 + \\tan^2\\theta = \\frac{1}{\\cos^2\\theta}
$$

基本恒等式を使って、値を素早く計算できるようにします。
`,
  },
  trig_identity_pythag_basic: {
    core: `
# 三角恒等式（1）（基本）

$$
\\sin^2\\theta+\\cos^2\\theta=1
$$
を確認します。
`,
  },
  trig_amplitude_basic: {
    core: `
# 振幅（基本）

関数 $y=a\\sin x$ や $y=a\\cos x$ の振幅は
$$
|a|
$$
です。
`,
  },
  trig_phase_shift_basic: {
    core: `
# 位相のずれ（基本）

関数 $y=\\sin(x-\\phi)$ の位相のずれは $\\phi$ です。
`,
  },
  trig_vertical_shift_basic: {
    core: `
# 上下移動（基本）

関数 $y=\\sin x + c$ の中心線は $y=c$ です。
`,
  },
  trig_graph_range_basic: {
    core: `
# 値域（基本）

関数 $y=a\\sin x$ や $y=a\\cos x$ の値域は
$$
[-|a|,|a|]
$$
です。
`,
  },
  trig_graph_period_basic: {
    core: `
# 周期（グラフ）（基本）

関数 $y=\\sin(kx)$ の周期は
$$
\\frac{2\\pi}{|k|}
$$
です。
`,
  },
  trig_graph_midline_basic: {
    core: `
# 中心線（基本）

関数 $y=a\\sin x+c$ の中心線は $y=c$ です。
`,
  },
  trig_graph_max_basic: {
    core: `
# 最大値（基本）

関数 $y=a\\sin x+c$ の最大値は
$$
c+|a|
$$
です。
`,
  },
  trig_graph_min_basic: {
    core: `
# 最小値（基本）

関数 $y=a\\sin x+c$ の最小値は
$$
c-|a|
$$
です。
`,
  },
  trig_graph_intercept_basic: {
    core: `
# y切片（基本）

$x=0$ を代入して $y$ を求めます。
`,
  },
  trig_equation_radian_basic: {
    core: `
# 三角方程式（弧度）（基本）

弧度法の基本角を用いて解を求めます。
`,
  },
  trig_identity_tan_basic: {
    core: `
# tanの値（基本）

基本角の $\\tan$ の値を確認します。
`,
  },
  trig_identity_tan_relation_basic: {
    core: `
# tanの恒等式（基本）

$$
1+\\tan^2\\theta=\\frac{1}{\\cos^2\\theta}
$$
を使って値を求めます。
`,
  },
  trig_addition_basic: {
    core: `
# 加法定理（基本）

加法定理：
$$
\\sin(\\alpha+\\beta)=\\sin\\alpha\\cos\\beta+\\cos\\alpha\\sin\\beta
$$
$$
\\cos(\\alpha+\\beta)=\\cos\\alpha\\cos\\beta-\\sin\\alpha\\sin\\beta
$$
`,
  },
  trig_double_angle_basic: {
    core: `
# 倍角（基本）

倍角は加法定理の特別な場合です。
$$
\\sin 2\\theta = 2\\sin\\theta\\cos\\theta
$$
$$
\\cos 2\\theta = \\cos^2\\theta-\\sin^2\\theta
$$
`,
  },
  trig_period_basic: {
    core: `
# 周期（基本）

三角関数 $y=\\sin(kx),\\cos(kx)$ の周期は
$$
\\frac{2\\pi}{|k|}
$$
です。
`,
  },
  trig_radian_basic: {
    core: `
# 弧度法（基本）

代表的な値：
$$
\\sin\\frac{\\pi}{6}=\\frac{1}{2},\\ \\cos\\frac{\\pi}{3}=\\frac{1}{2}
$$
などを使って計算します。
`,
  },
  calc_derivative_basic: {
    core: `
# 微分の計算（基本）

2次関数 $f(x)=ax^2+bx+c$ の導関数は

$$
f'(x)=2ax+b
$$

で求まります。指定された点での値を計算しましょう。
`,
  },
  calc_derivative_linear_basic: {
    core: `
# 一次関数の微分（基本）

一次関数 $f(x)=ax+b$ の導関数は
$$
f'(x)=a
$$
です。
`,
  },
  calc_integral_basic: {
    core: `
# 積分の計算（基本）

1次関数 $ax+b$ の原始関数は

$$
\\int (ax+b)\\,dx = \\frac{a}{2}x^2+bx
$$

定積分は両端を代入して差をとります。
`,
  },
  calc_tangent_slope_basic: {
    core: `
# 接線の傾き（基本）

接線の傾きは導関数の値です。
$$
\\text{傾き}=f'(x_0)
$$
`,
  },
  calc_tangent_line_basic: {
    core: `
# 接線の式（基本）

接線は
$$
y=f'(x_0)(x-x_0)+f(x_0)
$$
の形になります。傾きと通過点を整理して切片を求めます。
`,
  },
  calc_increasing_basic: {
    core: `
# 増減（基本）

導関数 $f'(x)$ の符号で増加・減少を判定します。
$f'(x)>0$ なら増加、$f'(x)<0$ なら減少です。
`,
  },
  calc_average_value_basic: {
    core: `
# 平均値（基本）

平均値は
$$
\\frac{1}{b-a}\\int_a^b f(x)\\,dx
$$
で求めます。線形関数では端点の平均になります。
`,
  },
  calc_area_between_lines_basic: {
    core: `
# 直線間の面積（基本）

平行な直線 $y=f(x),y=g(x)$ の間の面積は
$$
\\int_a^b (f(x)-g(x))\\,dx
$$
で求められます。
`,
  },
  calc_integral_linear_basic2: {
    core: `
# 定積分（一次関数）（基本）

一次関数 $ax+b$ の定積分は
$$
\\int_p^q (ax+b)\\,dx=\\frac{a}{2}(q^2-p^2)+b(q-p)
$$
で求めます。
`,
  },
  calc_area_between_parabola_basic: {
    core: `
# 放物線と直線の面積（基本）

囲まれた面積は
$$
\\int_a^b (g(x)-f(x))\\,dx
$$
で求めます。
`,
  },
  calc_area_under_line_basic: {
    core: `
# 直線下の面積（基本）

直線と $x$ 軸で囲まれる面積は三角形の面積です。
`,
  },
  calc_tangent_value_basic: {
    core: `
# 接点の座標（基本）

接点の $y$ 座標は $y=f(x_0)$ で求めます。
`,
  },
  calc_integral_constant_basic: {
    core: `
# 定数の積分（基本）

定数の定積分は
$$
\\int_a^b c\\,dx=c(b-a)
$$
です。
`,
  },
  calc_integral_sum_basic: {
    core: `
# 定積分（基本）

原始関数を求めて $F(b)-F(a)$ を計算します。
`,
  },
  calc_integral_quadratic_basic: {
    core: `
# 2次関数の積分（基本）

$$
\\int (ax^2+bx+c)dx=\\frac{a}{3}x^3+\\frac{b}{2}x^2+cx
$$
を使って定積分を計算します。
`,
  },
  calc_extrema_basic: {
    core: `
# 極値（基本）

導関数 $f'(x)=0$ を解き、増減を確認して極大・極小を判定します。
`,
  },
  calc_area_basic: {
    core: `
# 面積（基本）

グラフと $x$ 軸で囲まれた面積は、非負関数なら
$$
\\int_a^b f(x)\\,dx
$$
で求められます。
`,
  },
  calc_limit_basic: {
    core: `
# 極限（基本）

多項式・分数関数の極限を計算します。
$$
\\lim_{x\\to a} f(x)
$$
の形に慣れ、必要に応じて整理します。

## 代表例
$$
\\lim_{x\\to 2} (x^2-1)=3
$$

## 0/0の形の整理
$$
\\lim_{x\\to 1} \\frac{x^2-1}{x-1}
$$
は
$$
\\frac{x^2-1}{x-1}=x+1
$$
と変形できるので、答えは $2$ です。
`,
  },
  calc_continuity_basic: {
    core: `
# 連続性（基本）

連続であるためには
$$
\\lim_{x\\to a} f(x) = f(a)
$$
が成立する必要があります。

## 例（区分関数）
$$
f(x)=\\begin{cases}
2x+1 & (x<1)\\\\
c & (x=1)\\\\
3x-2 & (x>1)
\\end{cases}
$$
が連続になるには、左右の値が一致する必要があるため
$$
2\\cdot 1+1 = 3\\cdot 1-2 = c
$$
より $c=3$ です。
`,
  },
  calc_derivative_advanced_basic: {
    core: `
# 微分法（応用）

合成関数・指数/対数・三角関数を含む微分を扱います。
連鎖律を使って
$$
\\frac{d}{dx}f(g(x)) = f'(g(x))g'(x)
$$
を適用します。

## 例
$$
f(x)=(2x-1)^3
$$
のとき
$$
f'(x)=3(2x-1)^2\\cdot 2=6(2x-1)^2
$$
となります。
`,
  },
  calc_integral_advanced_basic: {
    core: `
# 積分法（応用）

置換積分・部分積分の基本パターンを扱います。
$$
\\int f(g(x))g'(x)\\,dx = \\int f(u)\\,du
$$
を活用します。

## 例（置換積分）
$$
\\int 2x(x^2+1)\\,dx
$$
で $u=x^2+1$ と置くと $du=2x\\,dx$ なので
$$
\\int u\\,du=\\frac{u^2}{2}+C
$$
となります。
`,
  },
  calc_curve_area_basic: {
    core: `
# 曲線で囲まれた面積（基本）

2曲線 $y=f(x), y=g(x)$ で囲まれた面積は
$$
\\int_a^b (g(x)-f(x))\\,dx
$$
で求めます。

## 例
$$
y=x,\\quad y=x^2\\quad (0\\le x\\le 1)
$$
では直線が上にあるため
$$
\\int_0^1 (x-x^2)\\,dx=\\frac{1}{6}
$$
となります。
`,
  },
  calc_parametric_basic: {
    core: `
# 媒介変数表示（基本）

$x=x(t), y=y(t)$ のとき
$$
\\frac{dy}{dx} = \\frac{dy/dt}{dx/dt}
$$
を使って接線の傾きを求めます。

## 例
$$
x=2t,\\ y=t^2
$$
なら
$$
\\frac{dy}{dx} = \\frac{2t}{2}=t
$$
なので、$t=1$ での傾きは $1$ です。
`,
  },
  exp_log_property_basic: {
    core: `
# 対数の性質（基本）

対数の性質：
$$
\\log_a (a^n)=n
$$
などを使って計算します。
`,
  },
  trig_equations_basic: {
    core: `
# 三角方程式（基本）

三角方程式は、基本角の値と象限を意識して解きます。

$$
0^\\circ \\le x < 360^\\circ
$$

の範囲で答える練習をします。
`,
  },
  seq_arithmetic_basic: {
    core: `
# 等差数列の一般項（基本）

等差数列は
$$
a_n = a_1 + (n-1)d
$$
で表されます。初項 $a_1$ と公差 $d$ から一般項を求めます。
`,
  },
  seq_geometric_basic: {
    core: `
# 等比数列の一般項（基本）

等比数列は
$$
a_n = a_1 r^{n-1}
$$
で表されます。初項 $a_1$ と公比 $r$ から一般項を求めます。
`,
  },
  seq_geometric_mean_basic: {
    core: `
# 等比数列の平均（基本）

等比数列では
$$
a_2^2=a_1 a_3
$$
が成り立ちます。
`,
  },
  seq_term_from_sum_basic: {
    core: `
# 和から項（基本）

$$
a_n=S_n-S_{n-1}
$$
で求めます。
`,
  },
  seq_geometric_sum_n_basic: {
    core: `
# 等比数列の和（基本）

等比数列の和は
$$
S_n=a_1\\frac{1-r^n}{1-r}
$$
です。
`,
  },
  seq_common_ratio_from_terms_basic: {
    core: `
# 公比（項から）（基本）

等比数列では $a_3=a_1 r^2$ などを使って公比を求めます。
`,
  },
  seq_sum_basic: {
    core: `
# 数列の和（基本）

等差数列の和：
$$
S_n = \\frac{n}{2}(2a_1+(n-1)d)
$$

等比数列の和：
$$
S_n = a_1 \\frac{1-r^n}{1-r} \\quad (r\\neq 1)
$$
`,
  },
  seq_common_difference_basic: {
    core: `
# 公差の計算（基本）

等差数列の公差は
$$
d=a_2-a_1
$$
で求まります。
`,
  },
  seq_geometric_sum_basic: {
    core: `
# 等比数列の和（基本）

等比数列の和は
$$
S_n = a_1\\frac{1-r^n}{1-r} \\quad (r\\neq 1)
$$
です。
`,
  },
  seq_geometric_limit_basic: {
    core: `
# 等比数列の無限和（基本）

公比 $|r|<1$ のとき、無限和は
$$
S=\\frac{a_1}{1-r}
$$
で求められます。
`,
  },
  seq_arithmetic_sum_basic: {
    core: `
# 等差数列の和（基本）

等差数列の和は
$$
S_n=\\frac{n}{2}(2a_1+(n-1)d)
$$
です。
`,
  },
  seq_arithmetic_sum_from_terms_basic: {
    core: `
# 等差数列の和（項から）（基本）

初項 $a_1$ と $a_n$ が分かると
$$
S_n=\\frac{n(a_1+a_n)}{2}
$$
で求められます。
`,
  },
  seq_arithmetic_mean_basic: {
    core: `
# 等差数列の平均（基本）

等差数列では
$$
a_2=\\frac{a_1+a_3}{2}
$$
となります。
`,
  },
  seq_arithmetic_diff_from_terms_basic: {
    core: `
# 公差（項から）（基本）

等差数列では $a_4=a_1+3d$ を使って公差を求めます。
`,
  },
  stats_sample_mean_basic: {
    core: `
# 標本平均（基本）

データの合計を個数で割って平均を求めます。
`,
  },
  stats_sampling_mean_basic: {
    core: `
# 標本平均の平均（基本）

標本平均の期待値は母平均に等しいです。
`,
  },
  stats_standard_error_basic: {
    core: `
# 標準誤差（基本）

標準誤差は
$$
\\frac{\\sigma}{\\sqrt{n}}
$$
です。
`,
  },
  stats_confidence_interval_basic: {
    core: `
# 信頼区間の幅（基本）

幅（片側）は $z\\cdot \\text{SE}$ で求めます。
`,
  },
  vector_operations_basic: {
    core: `
# ベクトルの演算（基本）

成分表示 $\`(x,y)\`$ を使って加減・実数倍を計算します。
`,
  },
  vector_inner_basic: {
    core: `
# 内積（基本）

内積は
$$
\\vec{a}\\cdot\\vec{b}=x_1x_2+y_1y_2
$$
で計算します。内積が 0 なら直交です。
`,
  },
  seq_recurrence_basic: {
    core: `
# 漸化式（基本）

一次の漸化式は、初項と規則から順に計算するか、等差・等比型に直して一般項を求めます。
`,
  },
  seq_recurrence_term_basic: {
    core: `
# 漸化式の項（基本）

定義された漸化式に従って、具体的な項を順に計算します。
`,
  },
  vector_length_basic: {
    core: `
# ベクトルの長さ（基本）

$$
\\vec{a}=(x,y) \\Rightarrow |\\vec{a}|^2=x^2+y^2
$$

まず長さの二乗を計算してから、必要なら平方根を取ります。
`,
  },
  vector_unit_basic: {
    core: `
# 単位ベクトル（基本）

単位ベクトルは
$$
\\frac{\\vec{a}}{|\\vec{a}|}
$$
で求めます。
`,
  },
  vector_parallel_basic: {
    core: `
# 平行条件（基本）

平行なら成分比が等しく、
$$
\\vec{b}=k\\vec{a}
$$
となります。
`,
  },
  vector_component_basic: {
    core: `
# 成分（基本）

ベクトル $(x,y)$ の $x$ 成分は $x$ です。
`,
  },
  vector_line_point_basic: {
    core: `
# 直線上の点（基本）

点 $P$ と方向ベクトル $\\vec{v}$ から
$$
P+t\\vec{v}
$$
で座標を求めます。
`,
  },
  vector_orthogonal_condition_basic: {
    core: `
# 直交条件（基本）

直交条件は内積が0：
$$
\\vec{a}\\cdot\\vec{b}=0
$$
です。
`,
  },
  vector_distance_plane_basic: {
    core: `
# 平面との距離（基本）

点と平面の距離の基本問題を扱います。
`,
  },
  vector_plane_normal_basic: {
    core: `
# 法線ベクトル（基本）

平面 $ax+by+cz=d$ の法線ベクトルは $(a,b,c)$ です。
`,
  },
  vector_midpoint_basic: {
    core: `
# 中点（基本）

中点は
$$
\\left(\\frac{x_1+x_2}{2},\\frac{y_1+y_2}{2}\\right)
$$
で求めます。
`,
  },
  vector_inner_from_angle_basic: {
    core: `
# 内積と角（基本）

$$
\\vec{a}\\cdot\\vec{b}=|\\vec{a}||\\vec{b}|\\cos\\theta
$$
を使います。
`,
  },
  complex_basic: {
    core: `
# 複素数の計算（基本）

$$
(a+bi)+(c+di)=(a+c)+(b+d)i
$$
$$
(a+bi)(c+di)=(ac-bd)+(ad+bc)i
$$
`,
  },
  complex_modulus_basic: {
    core: `
# 複素数の絶対値（基本）

$$
|a+bi|=\\sqrt{a^2+b^2}
$$

まず $a^2+b^2$ を計算してから平方根を取ります。
`,
  },
  complex_plane_basic: {
    core: `
# 複素数平面（基本）

複素数 $z=a+bi$ は複素数平面で点 $(a,b)$ に対応します。
実部が $x$ 軸、虚部が $y$ 軸です。
`,
  },
  complex_conjugate_basic: {
    core: `
# 共役複素数（基本）

共役複素数は
$$
\\overline{a+bi}=a-bi
$$
です。積 $z\\overline{z}$ は $|z|^2$ になります。
`,
  },
  complex_rotation_basic: {
    core: `
# 複素数の回転（基本）

$i$ を掛けると90度回転し、
$$
i(a+bi)=-b+ai
$$
になります。
`,
  },
  complex_polar_basic: {
    core: `
# 極形式（基本）

複素数 $z=a+bi$ は
$$
z=r(\\cos\\theta+i\\sin\\theta)
$$
の形で表せます。$r$ は絶対値、$\\theta$ は偏角です。
`,
  },
  complex_distance_basic: {
    core: `
# 複素数平面の距離（基本）

複素数 $z=a+bi$ は点 $(a,b)$ に対応します。
2点間の距離の二乗は
$$
(a_1-a_2)^2+(b_1-b_2)^2
$$
です。
`,
  },
  complex_midpoint_basic: {
    core: `
# 複素数平面の中点（基本）

2点 $(a_1,b_1)$ と $(a_2,b_2)$ の中点は
$$
\\left(\\frac{a_1+a_2}{2},\\frac{b_1+b_2}{2}\\right)
$$
です。
`,
  },
  complex_square_real_basic: {
    core: `
# 複素数の平方（実部）（基本）

$$
(a+bi)^2=(a^2-b^2)+2abi
$$
なので実部は $a^2-b^2$ です。
`,
  },
  complex_power_i_basic: {
    core: `
# iの累乗（基本）

$i$ は4周期で
$$
i^1=i,\\ i^2=-1,\\ i^3=-i,\\ i^4=1
$$
となります。
`,
  },
  complex_conjugate_product_basic: {
    core: `
# 共役積（基本）

$$
z\\overline{z}=a^2+b^2
$$
です。
`,
  },
  complex_modulus_square_basic: {
    core: `
# 絶対値の二乗（基本）

$$
|z|^2=a^2+b^2
$$
です。
`,
  },
  conic_circle_basic: {
    core: `
# 円の方程式（基本）

$$
(x-h)^2+(y-k)^2=r^2
$$

中心 $(h,k)$ と半径 $r$ を読み取ります。
`,
  },
  conic_circle_center_basic: {
    core: `
# 円の中心（基本）

標準形 $(x-h)^2+(y-k)^2=r^2$ から中心 $(h,k)$ を読み取ります。
`,
  },
  conic_intersection_basic: {
    core: `
# 交点の判別（基本）

円と直線の交点の個数は、判別式の符号で判断します。
`,
  },
  conic_tangent_basic: {
    core: `
# 接線の条件（基本）

円と直線が接するとき、交点は1つ（判別式 $D=0$）になります。
`,
  },
  conic_parabola_basic: {
    core: `
# 放物線の基本（焦点）

$$
y^2=4px \\Rightarrow \\text{焦点 }(p,0)
$$
$$
x^2=4py \\Rightarrow \\text{焦点 }(0,p)
$$
`,
  },
  conic_parabola_directrix_basic: {
    core: `
# 放物線の準線（基本）

$$
y^2=4px \\Rightarrow \\text{準線 }x=-p
$$
$$
x^2=4py \\Rightarrow \\text{準線 }y=-p
$$
`,
  },
  conic_parabola_focus_basic: {
    core: `
# 放物線の焦点（基本）

$$
y^2=4px \\Rightarrow \\text{焦点 }(p,0)
$$
`,
  },
  conic_parabola_latus_rectum_basic: {
    core: `
# 放物線の準弦（基本）

準弦の長さは $4p$ です。
`,
  },
  conic_parabola_tangent_slope_basic: {
    core: `
# 放物線の接線の傾き（基本）

$y^2=4px$ の接線の傾きは $t/p$ です。
`,
  },
  conic_parabola_vertex_basic: {
    core: `
# 放物線の頂点（基本）

放物線 $y=(x-h)^2+k$ の頂点は $(h,k)$ です。
`,
  },
  conic_circle_radius_basic: {
    core: `
# 円の半径（基本）

円 $(x-h)^2+(y-k)^2=r^2$ の半径は $r$ です。
`,
  },
  conic_ellipse_axis_basic: {
    core: `
# 楕円の軸（基本）

分母が大きい方が長軸なので、長軸がどの軸かを判定します。
`,
  },
  conic_hyperbola_vertex_basic: {
    core: `
# 双曲線の頂点（基本）

双曲線の頂点は $(\\pm a,0)$ です。
`,
  },
  complex_argument_axis_basic: {
    core: `
# 偏角（軸上）（基本）

軸上の点は基本角 $0^\\circ,90^\\circ,180^\\circ,270^\\circ$ のいずれかです。
`,
  },
  complex_argument_quadrant_basic: {
    core: `
# 偏角（象限）（基本）

第1〜第4象限の偏角（45°刻み）を確認します。
`,
  },
  complex_argument_degree_basic: {
    core: `
# 偏角（度数法）（基本）

度数法で主値の偏角を求めます。
`,
  },
  complex_polar_value_basic: {
    core: `
# 極形式の実部（基本）

極形式 $z=r(\\cos\\theta+i\\sin\\theta)$ の実部は $r\\cos\\theta$ です。
`,
  },
  complex_de_moivre_basic: {
    core: `
# ド・モアブル（基本）

$(\\cos\\theta+i\\sin\\theta)^n=\\cos n\\theta+i\\sin n\\theta$ を使います。
`,
  },
  complex_root_unity_basic: {
    core: `
# n乗根の偏角（基本）

$n$ 乗根の偏角は $\\theta=\\frac{360^\\circ k}{n}$ です。
`,
  },
  complex_multiply_real_basic: {
    core: `
# 積の実部（基本）

$(a+bi)(c+di)=(ac-bd)+(ad+bc)i$ です。
`,
  },
  complex_multiply_imag_basic: {
    core: `
# 積の虚部（基本）

$(a+bi)(c+di)$ の虚部は $ad+bc$ です。
`,
  },
  complex_modulus_product_basic: {
    core: `
# 積の絶対値（基本）

複素数の積の絶対値は
$$
|z_1z_2|=|z_1||z_2|
$$
です。
`,
  },
  complex_equation_abs_basic: {
    core: `
# 絶対値（基本）

$$
|a+bi|=\\sqrt{a^2+b^2}
$$
です。
`,
  },
  complex_equation_real_imag_basic: {
    core: `
# 実部（基本）

複素数 $a+bi$ の実部は $a$ です。
`,
  },
  complex_equation_conjugate_basic: {
    core: `
# 共役の和（基本）

$z+\\overline{z}=2\\Re(z)$ です。
`,
  },
  complex_rotation_real_basic: {
    core: `
# 回転の実部（基本）

$z' = z(\\cos\\theta+i\\sin\\theta)$ の実部を求めます。
`,
  },
  complex_rotation_imag_basic: {
    core: `
# 回転の虚部（基本）

$z' = z(\\cos\\theta+i\\sin\\theta)$ の虚部を求めます。
`,
  },
  complex_rotation_180_basic: {
    core: `
# 180度回転（基本）

$180^\\circ$ 回転は $z'=-z$ です。
`,
  },
  complex_division_real_basic: {
    core: `
# 除法の実部（基本）

$$
\\frac{a+bi}{c+di}=\\frac{(a+bi)(c-di)}{c^2+d^2}
$$
の実部を求めます。
`,
  },
  complex_modulus_sum_basic: {
    core: `
# 絶対値の和（基本）

$|z_1|+|z_2|$ を計算します。
`,
  },
  complex_polar_imag_basic: {
    core: `
# 極形式の虚部（基本）

極形式 $z=r(\\cos\\theta+i\\sin\\theta)$ の虚部は $r\\sin\\theta$ です。
`,
  },
  complex_conjugate_modulus_basic: {
    core: `
# 共役の絶対値（基本）

$|\\overline{z}|=|z|$ です。
`,
  },
  complex_add_modulus_square_basic: {
    core: `
# 和の絶対値（基本）

$|z_1+z_2|^2$ を成分で計算します。
`,
  },
  complex_sub_modulus_square_basic: {
    core: `
# 差の絶対値（基本）

$|z_1-z_2|^2$ を成分で計算します。
`,
  },
  complex_triangle_area_basic: {
    core: `
# 三角形の面積（基本）

座標の面積公式で求めます。
`,
  },
  complex_midpoint_distance_basic: {
    core: `
# 中点と距離（基本）

中点は両端点の平均、距離は半分です。
`,
  },
  complex_parallel_condition_basic: {
    core: `
# 平行条件（基本）

$\\frac{z_1}{z_2}$ が実数なら平行です。
`,
  },
  complex_perpendicular_condition_basic: {
    core: `
# 直交条件（基本）

$\\frac{z_1}{z_2}$ が純虚数なら直交です。
`,
  },
  complex_locus_circle_radius_basic: {
    core: `
# 軌跡の半径（基本）

$|z-(a+bi)|=r$ は半径 $r$ の円です。
`,
  },
  complex_locus_circle_center_basic: {
    core: `
# 軌跡の中心（基本）

$|z-(a+bi)|=r$ の中心は $(a,b)$ です。
`,
  },
  complex_argument_product_basic: {
    core: `
# 偏角の加法（基本）

積の偏角は偏角の和になります。
`,
  },
  complex_argument_quotient_basic: {
    core: `
# 偏角の減法（基本）

商の偏角は偏角の差になります。
`,
  },
  complex_argument_power_basic: {
    core: `
# 偏角のべき（基本）

偏角はべきで $n\\theta$ になります。
`,
  },
  complex_modulus_power_basic: {
    core: `
# 絶対値のべき（基本）

$|z^n|=|z|^n$ です。
`,
  },
  complex_locus_bisector_basic: {
    core: `
# 垂直二等分線（基本）

2点から等距離の軌跡は垂直二等分線です。
`,
  },
  complex_locus_vertical_line_basic: {
    core: `
# 垂直二等分線（実軸）（基本）

実軸上の2点の垂直二等分線は $x=\\frac{a+b}{2}$ です。
`,
  },
  complex_locus_horizontal_line_basic: {
    core: `
# 垂直二等分線（虚軸）（基本）

虚軸方向に対称な2点の垂直二等分線は $y=0$ です。
`,
  },
  complex_section_internal_basic: {
    core: `
# 内分点（基本）

内分点は $\\left(\\frac{nx_1+mx_2}{m+n},\\frac{ny_1+my_2}{m+n}\\right)$ です。
`,
  },
  complex_section_external_basic: {
    core: `
# 外分点（基本）

外分点は $\\left(\\frac{nx_1-mx_2}{n-m},\\frac{ny_1-my_2}{n-m}\\right)$ です。
`,
  },
  complex_line_point_basic: {
    core: `
# 線分上の点（基本）

線分を比で内分する点は内分公式で求めます。
`,
  },
  complex_argument_conjugate_basic: {
    core: `
# 共役の偏角（基本）

共役は偏角の符号を反転します。
`,
  },
  complex_argument_inverse_basic: {
    core: `
# 逆数の偏角（基本）

$\\arg(1/z)=-\\arg(z)$ です。
`,
  },
  complex_rotation_90_matrix_basic: {
    core: `
# 90度回転（基本）

$(x,y)$ を $90^\\circ$ 回転すると $(-y,x)$ になります。
`,
  },
  conic_ellipse_basic: {
    core: `
# 楕円の基本（長軸）

$$
\\frac{x^2}{a^2}+\\frac{y^2}{b^2}=1 \\quad (a>b>0)
$$
の長軸の長さは $2a$ です。
`,
  },
  conic_ellipse_major_axis_basic: {
    core: `
# 楕円の長軸（基本）

長軸の長さは $2a$ です。
`,
  },
  conic_ellipse_minor_axis_basic: {
    core: `
# 楕円の短軸（基本）

短軸の長さは $2b$ です。
`,
  },
  conic_ellipse_tangent_basic: {
    core: `
# 楕円の接線（基本）

接線は $\\frac{xx_0}{a^2}+\\frac{yy_0}{b^2}=1$ です。
`,
  },
  conic_ellipse_focus_basic: {
    core: `
# 楕円の焦点（基本）

楕円の焦点距離は
$$
c^2=a^2-b^2
$$
で求められます。
`,
  },
  conic_hyperbola_basic: {
    core: `
# 双曲線の基本（焦点）

$$
\\frac{x^2}{a^2}-\\frac{y^2}{b^2}=1
$$
では $c^2=a^2+b^2$ で、焦点は $(\\pm c,0)$ です。
`,
  },
  conic_hyperbola_asymptote_basic: {
    core: `
# 双曲線の漸近線（基本）

双曲線
$$
\\frac{x^2}{a^2}-\\frac{y^2}{b^2}=1
$$
の漸近線は $y=\\pm\\frac{b}{a}x$ です。
`,
  },
  conic_hyperbola_asymptote_slope_basic: {
    core: `
# 双曲線の漸近線の傾き（基本）

漸近線の傾きは $\\frac{b}{a}$ です。
`,
  },
  conic_hyperbola_asymptote_equation_basic: {
    core: `
# 双曲線の漸近線の式（基本）

漸近線は $y=\\pm\\frac{b}{a}x$ です。
`,
  },
  conic_hyperbola_transverse_axis_basic: {
    core: `
# 双曲線の実軸（基本）

実軸の長さは $2a$ です。
`,
  },
  conic_circle_tangent_slope_basic: {
    core: `
# 円の接線の傾き（基本）

半径と接線は直交するので、傾きは負の逆数です。
`,
  },
  conic_line_intersection_count_basic: {
    core: `
# 円と直線の交点（基本）

半径 $r$ と直線の距離の大小で交点数を判定します。
`,
  },
  conic_circle_general_radius_basic: {
    core: `
# 円の一般形の半径（基本）

平方完成で半径を求めます。
`,
  },
  conic_circle_general_center_basic: {
    core: `
# 円の一般形の中心（基本）

平方完成で中心を求めます。
`,
  },
  conic_hyperbola_foci_distance_basic: {
    core: `
# 双曲線の焦点間距離（基本）

$c^2=a^2+b^2$ より $2c$ を求めます。
`,
  },
  conic_ellipse_c_basic: {
    core: `
# 楕円の焦点距離（基本）

$c^2=a^2-b^2$ を使います。
`,
  },
  conic_hyperbola_c_basic: {
    core: `
# 双曲線の焦点距離（基本）

$c^2=a^2+b^2$ を使います。
`,
  },
  conic_parabola_line_intersection_count_basic: {
    core: `
# 放物線と直線の交点（基本）

$x=t$ を代入して交点の個数を判定します。
`,
  },
  conic_ellipse_value_basic: {
    core: `
# 楕円の代入値（基本）

式に点を代入して値を求めます。
`,
  },
  conic_hyperbola_value_basic: {
    core: `
# 双曲線の代入値（基本）

式に点を代入して値を求めます。
`,
  },
  conic_parabola_general_focus_basic: {
    core: `
# 放物線の焦点（一般形）（基本）

$(y-k)^2=4p(x-h)$ の焦点は $(h+p,k)$ です。
`,
  },
  conic_parabola_vertex_shift_basic: {
    core: `
# 放物線の頂点（平行移動）（基本）

$y=(x-h)^2+k$ の頂点は $(h,k)$ です。
`,
  },
  conic_circle_tangent_point_basic: {
    core: `
# 円の接点（基本）

接点は与えられた点の座標そのものです。
`,
  },
  conic_parabola_focus_vertical_basic: {
    core: `
# 放物線の焦点（縦）（基本）

$x^2=4py$ の焦点は $(0,p)$ です。
`,
  },
  conic_parabola_directrix_vertical_basic: {
    core: `
# 放物線の準線（縦）（基本）

$x^2=4py$ の準線は $y=-p$ です。
`,
  },
  conic_ellipse_focus_distance_basic: {
    core: `
# 楕円の焦点間距離（基本）

$c^2=a^2-b^2$ より $2c$ を求めます。
`,
  },
  conic_circle_point_on_basic: {
    core: `
# 円上の点判定（基本）

点を円の式に代入して判定します。
`,
  },
  conic_parabola_tangent_intercept_basic: {
    core: `
# 放物線の接線の切片（基本）

接線の式から切片を求めます。
`,
  },
  conic_ellipse_center_basic: {
    core: `
# 楕円の中心（基本）

標準形の中心は $(h,k)$ です。
`,
  },
  conic_hyperbola_center_basic: {
    core: `
# 双曲線の中心（基本）

標準形の中心は $(h,k)$ です。
`,
  },
  prob_binomial_expectation_basic: {
    core: `
# 二項分布の期待値（基本）

二項分布 $X\\sim\\mathrm{Bin}(n,p)$ の期待値は
$$
E[X]=np
$$
です。
`,
  },
  prob_binomial_probability_basic: {
    core: `
# 二項分布の確率（基本）

二項分布の確率は
$$
P(X=k)=\\binom{n}{k}p^k(1-p)^{n-k}
$$
で求めます。
`,
  },
  prob_binomial_variance_basic: {
    core: `
# 二項分布の分散（基本）

二項分布 $X\\sim\\mathrm{Bin}(n,p)$ の分散は
$$
\\mathrm{Var}(X)=np(1-p)
$$
です。
`,
  },
  normal_distribution_basic: {
    core: `
# 正規分布の平均・分散（基本）

正規分布 $N(\\mu,\\sigma^2)$ の平均は $\\mu$、分散は $\\sigma^2$ です。
`,
  },
  normal_standardization_basic: {
    core: `
# 標準化（基本）

正規分布 $N(\\mu,\\sigma^2)$ で
$$
z=\\frac{x-\\mu}{\\sigma}
$$
と変換します。
`,
  },
  normal_backsolve_basic: {
    core: `
# 標準化の逆（基本）

$z$ が与えられたときは
$$
x=\\mu+z\\sigma
$$
を使います。
`,
  },
  vector_section_basic: {
    core: `
# 内分・外分（基本）

点 $A(x_1,y_1)$, $B(x_2,y_2)$ を $m:n$ に内分する点 $P$ は
$$
P\\left(\\frac{nx_1+mx_2}{m+n},\\frac{ny_1+my_2}{m+n}\\right)
$$
で求まります。
`,
  },
  vector_space_basic: {
    core: `
# 空間ベクトル（基本）

空間ベクトル $(x,y,z)$ の成分計算は平面と同様に行います。
`,
  },
  vector_distance_basic: {
    core: `
# 空間距離（基本）

2点 $A(x_1,y_1,z_1)$, $B(x_2,y_2,z_2)$ の距離の二乗は
$$
|AB|^2=(x_1-x_2)^2+(y_1-y_2)^2+(z_1-z_2)^2
$$
です。
`,
  },
  vector_plane_basic: {
    core: `
# 平面の方程式（基本）

法線ベクトル $(a,b,c)$ と点 $(x_0,y_0,z_0)$ を通る平面は
$$
ax+by+cz=d,\\ d=ax_0+by_0+cz_0
$$
と表せます。
`,
  },
  vector_orthogonality_basic: {
    core: `
# 直交条件（基本）

2ベクトルが直交する条件は内積が0：
$$
\\vec{a}\\cdot\\vec{b}=0
$$
です。
`,
  },
  vector_angle_basic: {
    core: `
# ベクトルのなす角（基本）

内積を使うと
$$
\\vec{a}\\cdot\\vec{b}=|\\vec{a}||\\vec{b}|\\cos\\theta
$$
より $\\cos\\theta$ を求められます。
`,
  },
  vector_projection_basic: {
    core: `
# 射影（基本）

射影の長さの二乗は
$$
\\frac{(\\vec{a}\\cdot\\vec{b})^2}{|\\vec{b}|^2}
$$
で計算できます。
`,
  },
  vector_line_basic: {
    core: `
# 直線のパラメータ（基本）

点 $P$ と方向ベクトル $\\vec{v}$ が与えられると
$$
P+t\\vec{v}
$$
で直線上の点を表せます。
`,
  },
  vector_area_basic: {
    core: `
# 面積（基本）

平行四辺形の面積は
$$
|a_x b_y - a_y b_x|
$$
で求められます。
`,
  },
  complex_argument_basic: {
    core: `
# 偏角（基本）

偏角は複素数平面での角度です。基本角（$0^\\circ,90^\\circ,180^\\circ,270^\\circ$）から答えます。
`,
  },
};

export function getTopicKeyPoints(topicId: string): string | null {
  const c = (TOPIC_CONTENT as any)[topicId]?.core as string | undefined;
  if (!c) return null;

  // 長すぎるので「冒頭の見出し〜最初の数行」だけ切り出す雑実装（MVP）
  // もっと綺麗にやるなら「keyPoints」を別フィールドで持つのがおすすめ
  const lines = c.trim().split('\n').filter(Boolean);
  const head = lines.slice(0, 10).join('\n');

  // それっぽく「要点」カードとして見せる
  return `### 解説の要点（このトピック）
${head}
`;
}
