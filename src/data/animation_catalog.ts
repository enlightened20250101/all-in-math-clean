// src/data/animation_catalog.ts
export type AnimTemplate = {
  id: string;
  title: string;
  description: string;
  level: 'basic'|'advanced';
  kind: 'algebra'|'geometry'|'calculus';
  params?: Record<string, any>;
};
export type AnimCategory = {
  slug: string;
  title: string;
  thumbnail: string;
  templates: AnimTemplate[];
};
export const CATEGORIES: AnimCategory[] = [
  { slug:'algebra', title:'代数', thumbnail:'🧮', templates:[
    { id:'linear-equation', title:'一次方程式の解法', description:'移項→割る→数値化の基本', level:'basic', kind:'algebra', params:{a:2,b:3,c:11}},
    { id:'square-completion', title:'平方完成', description:'x²+bx+c → (x+p)²+q', level:'basic', kind:'algebra', params:{b:6,c:5}},
    { id:'system-2x2', title:'連立方程式（加減法）', description:'yを消去してx→代入でyへ', level:'basic', kind:'algebra'},
    { id:'system-substitution', title:'連立方程式（代入法）', description:'片方を解いてもう片方へ代入', level:'basic', kind:'algebra' },{ id:'factorization', title:'因数分解（基本）', description:'共通因数・平方差・三項式', level:'basic', kind:'algebra' },
    { id:'rationalization', title:'分母の有理化', description:'単項根・二項根（共役）', level:'basic', kind:'algebra' },
    { id:'parabola-vertex', title:'二次関数の頂点（平方完成×グラフ）', description:'a,b,c を動かして頂点を可視化', level:'basic', kind:'algebra' },
    { id:'exp-log-basics', title:'指数・対数の基礎', description:'性質とグラフ（鏡映）', level:'basic', kind:'algebra' },
    { id:'trig-unit', title:'三角比（単位円）', description:'sin・cos・tan を図形と式で可視化', level:'basic', kind:'algebra' },
    { id:'sequence-basics', title:'等差・等比数列（一般項と和）', description:'一般項/和の公式とグラフ可視化', level:'basic', kind:'algebra' },
    { id:'function-transform', title:'関数の変換（平行移動・拡大縮小・反転）', description:'y=f(x)→y=a f(b(x-h))+k を体感', level:'basic', kind:'algebra' },
    { id:'inequality-region', title:'不等式の解（数直線／平面＋二次曲線）', description:'一次/二次の1Dと、半平面・円・楕円・放物線の解領域を可視化', level:'basic', kind:'algebra' },
    { id:'complex-plane', title:'複素数平面（n乗根・極形式）', description:'a+bi／極形式・乗法/除法・拡大回転・n乗根・De Moivre', level:'basic', kind:'algebra' },
    { id:'square-completion-proof', title:'平方完成（コマ送り）', description:'x²+bx+c → 頂点形までを一行ずつ', level:'basic', kind:'algebra', params:{ b:6, c:5, goal:'vertex', step:0 } },
    { id:'factorization-ac-proof', title:'因数分解（AC分解コマ送り）', description:'ax²+bx+c をAC法で一手ずつ', level:'basic', kind:'algebra', params:{ a:6, b:11, c:3, step:0 } },
    { id:'diff-squares',title:'平方差（コマ送り）',description:'(p₁x+q₁)² − (p₂x+q₂)² = (L₁−L₂)(L₁+L₂) を一次式で展開・整理',level:'basic', kind:'algebra',params:{ p1:2, q1:1, p2:1, q2:-3, step:0 }},
    { id:'cubes-sumdiff',title:'立方の和/差（コマ送り）',description:'A³±B³=(A±B)(A²∓AB+B²) を一次式に拡張して因数分解',level:'basic', kind:'algebra',params:{ a:1, b:0, c:1, d:1, mode:'sum', step:0 }},
    { id:'common-factor',title:'共通因数でくくる（GCF）',description:'A₁x^{e₁}+A₂x^{e₂}+A₃x^{e₃} を g x^m( … ) に整形',level:'basic', kind:'algebra',params:{ A1:12, e1:5, A2:18, e2:3, A3:-6, e3:1, step:0 }},
    { id:'perfect-square',title:'完全平方三項式（判定→因数分解/非該当）',description:'ax²+bx+c を完成平方に整えて残差 r を判定',level:'basic', kind:'algebra',params:{ a:1, b:2, c:1, step:0 }},
  ]},
  { slug:'geometry', title:'幾何（平面）', thumbnail:'📐', templates:[
    { id:'circumcenter', title:'外心の作図', description:'垂直二等分線の交点', level:'basic', kind:'geometry'},
    { id:'centroid', title:'重心の作図', description:'3本の中線の交点', level:'basic', kind:'geometry'},
    { id:'incenter', title:'内心の作図', description:'角の二等分線の交点', level:'basic', kind:'geometry'},
    { id:'line-circle-relation', title:'円と直線の位置関係', description:'距離 d と半径 r で判別／接点・交点を可視化', level:'basic', kind:'geometry' },
    { id:'two-circles-relation', title:'2円の位置関係', description:'交わる/接する/離れる・極軸・共通接線', level:'basic', kind:'geometry' },
    { id:'angle-bisector', title:'角の二等分線（内角/外角）', description:'∠AOB の二等分線と距離等式を可視化', level:'basic', kind:'geometry' },
    { id:'nine-point-circle', title:'九点円（オイラー線）', description:'中点・垂足・AH中点の9点とO,G,H,Nの関係', level:'basic', kind:'geometry' },
    { id:'vector-2d-3d', title:'ベクトル（2D/3D・外積）', description:'2D/3D切替、内積/外積、一次結合', level:'basic', kind:'geometry' },
    { id:'locus-lab', title:'軌跡ラボ（距離比・和差・放物線ほか）', description:'きせきの代表6題を対話可視化', level:'basic', kind:'geometry' },
  ]},
  { slug:'calculus', title:'微分・積分', thumbnail:'📈', templates:[
    { id:'tangent-slope', title:'接線の傾き（割線→接線）', description:'平均変化率から接線傾きへ', level:'basic', kind:'calculus', params:{a:1,b:0,c:0,x0:1,h:1}},
    { id:'mean-value-rolle', title:'平均値の定理 & ロルの定理', description:'割線の傾き m と f\'(c) の一致（f(a)=f(b) ならロル）を可視化', level:'basic', kind:'calculus', params:{ fkey:'poly3', a:-2, b:2 }},
    { id:'riemann-integral', title:'リーマン積分（リーマン和と厳密値）', description:'左/右/中点和の比較・区間アニメ', level:'basic', kind:'calculus' },
    { id:'integration-tech', title:'置換・部分積分（図とアニメ）', description:'置換と部分積分を矩形近似で直感化', level:'basic', kind:'calculus' },
  ]},
];
