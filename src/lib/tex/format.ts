// src/lib/tex/format.ts
export type Rat = { n: number; d: number };
export function gcd(a:number,b:number){a=Math.trunc(Math.abs(a));b=Math.trunc(Math.abs(b));if(a===0)return b||1;if(b===0)return a||1;while(b){const t=b;b=a%b;a=t;}return a||1;}
export function simplifyFrac(n:number,d:number):Rat{if(!Number.isFinite(n)||!Number.isFinite(d)||d===0)return{n,d};if(d<0){n=-n;d=-d;}const g=gcd(n,d);return{n:n/g,d:d/g};}
export function floatToFrac(x:number,maxDen=100000){if(!Number.isFinite(x))return{n:x,d:1};const s=Math.sign(x);x=Math.abs(x);let h1=1,h0=0,k1=0,k0=1,b=x;for(;;){const a=Math.floor(b);const h2=a*h1+h0,k2=a*k1+k0;if(k2>maxDen)break;h0=h1;h1=h2;k0=k1;k1=k2;const f=b-a;if(f<1e-12)break;b=1/f;}return simplifyFrac(s*h1,k1);}
export function toRat(x:number):Rat{const r=floatToFrac(x);return simplifyFrac(r.n,r.d);}
export function negRat(a:Rat):Rat{return{n:-a.n,d:a.d};}
export function ratAdd(a:Rat,b:Rat):Rat{return simplifyFrac(a.n*b.d+b.n*a.d,a.d*b.d);}
export function ratSub(a:Rat,b:Rat):Rat{return simplifyFrac(a.n*b.d-b.n*a.d,a.d*b.d);}
export function ratMul(a:Rat,b:Rat):Rat{return simplifyFrac(a.n*b.n,a.d*b.d);}
export function ratDiv(a:Rat,b:Rat):Rat{return simplifyFrac(a.n*b.d,a.d*b.n);}
export function texRat(r:Rat){const s=simplifyFrac(r.n,r.d);return s.d===1?`${s.n}`:`\\dfrac{${s.n}}{${s.d}}`;}
export function texFrac(n:number,d:number){return texRat(simplifyFrac(n,d));}
export function texFromNumber(x:number){return texRat(toRat(x));}
export function texSigned(x:number){const s=Math.sign(x);const body=texFromNumber(Math.abs(x));return s<0?`- ${body}`:`+ ${body}`;}
export function texTerm(coeff:number,varName='x',first=false){if(coeff===0)return first?'0':'';const s=Math.sign(coeff),a=Math.abs(coeff);const head=first?(s<0?'-':''):(s<0?'- ':'+ ');const c=(a===1?'':texFromNumber(a));return `${head}${c}${varName}`.trim();}
export function texConst(c:number,first=false){if(c===0)return first?'0':'';const s=Math.sign(c),a=Math.abs(c);const head=first?(s<0?'-':''):(s<0?'- ':'+ ');return `${head}${texFromNumber(a)}`.trim();}
export function texPoly2(a:number,b:number,c:number){let out='';if(a)out+=texTerm(a,'x^2',!out);if(b)out+=(out?' ':'')+texTerm(b,'x',!out);if(c)out+=(out?' ':'')+texConst(c,!out);return out||'0';}
export function texShiftSquare(varName:string,pNum:number,pDen:number){const{n,d}=simplifyFrac(pNum,pDen);if(n===0)return`(${varName})^2`;const p=texRat({n:Math.abs(n),d});const sign=n<0?'-':'+';return`(${varName} ${sign} ${p})^2`;}
export function normalizeTeXSigns(s:string){return s.replace(/\+\s*-/g,'- ').replace(/-\s*-/g,'+ ').replace(/\+\s*\+/g,'+ ').replace(/\s{2,}/g,' ').trim();}
// Added helpers
export function texVarLead(r:Rat,varName='x'){const s=simplifyFrac(r.n,r.d);const sign=s.n<0?'-':'';const abs=Math.abs(s.n);const coeff=abs===1&&s.d===1?'':texRat({n:abs,d:s.d});return `${sign} ${coeff}${varName}`.trim();}
export function texVarMid(r:Rat,varName='x'){const s=simplifyFrac(r.n,r.d);const pm=s.n<0?'- ':'+ ';const abs=Math.abs(s.n);const coeff=abs===1&&s.d===1?'':texRat({n:abs,d:s.d});return `${pm}${coeff}${varName}`;}
// 定数（式の途中用）: + a/b / - a/b
export function texConstMid(r: Rat) {
    const s = simplifyFrac(r.n, r.d);
    const pm = s.n < 0 ? '- ' : '+ ';
    const abs = { n: Math.abs(s.n), d: s.d };
    return `${pm}${texRat(abs)}`;
  }
  
// === 追加: 基本ヘルパ ===
export const isZeroRat = (r: Rat) => simplifyFrac(r.n, r.d).n === 0;
export const absRat = (r: Rat): Rat => {
  const s = simplifyFrac(r.n, r.d);
  return { n: Math.abs(s.n), d: s.d };
};
export const isOneAbs = (r: Rat) => {
  const a = absRat(r);
  return a.n === 1 && a.d === 1;
};

// 先頭の定数: + を出さない
export function texConstLead(r: Rat) {
  const s = simplifyFrac(r.n, r.d);
  const sign = s.n < 0 ? '-' : '';
  const body = texRat(absRat(s));
  return `${sign} ${body}`.trim();
}

// === 既存 texVarLead/texVarMid を使い回し（±1の省略はここで担保） ===
// ※ すでにあなたの環境にある版でOK（±1なら係数を省略）

// === 追加: "線形結合" を安全に構築するビルダ ===
// vars: [{coeff, var: 'x'|'y'|'x^2'など, powerOptional}], constTerm?:Rat
export function texLinearLead(
  vars: Array<{ coeff: Rat; varName: string }>,
  constTerm?: Rat
) {
  const chunks: string[] = [];
  // 0係数の項は捨てる
  const filtered = vars.filter(v => !isZeroRat(v.coeff));

  // 先頭項
  if (filtered.length > 0) {
    const v0 = filtered[0]!;
    chunks.push(texVarLead(v0.coeff, v0.varName)); // 先頭: sign 省略
    // 2項目以降
    for (let i = 1; i < filtered.length; i++) {
      const vi = filtered[i]!;
      chunks.push(texVarMid(vi.coeff, vi.varName)); // 必ず ± を明示
    }
  }

  // 定数
  if (constTerm && !isZeroRat(constTerm)) {
    if (chunks.length === 0) {
      // 先頭に定数のみ
      chunks.push(texConstLead(constTerm));
    } else {
      // 途中定数: ± を明示
      chunks.push(texConstMid(constTerm));
    }
  }

  // 何もなければ 0
  if (chunks.length === 0) return '0';
  return normalizeTeXSigns(chunks.join(' '));
}

// 分母を必ず正にして TeX 分数を作る（分子は string でOK：√などを含められる）
export function texFracWithPosDen(numTex: string, den: Rat) {
    const s = simplifyFrac(den.n, den.d);
    const denPos = { n: Math.abs(s.n), d: s.d };      // 分母は正
    const needsMinus = s.n < 0;
    const numOut = needsMinus ? `- ${numTex}` : numTex;
    return normalizeTeXSigns(String.raw`\dfrac{${numOut}}{${texRat(denPos)}}`);
  }

// n が 0 以上の整数と仮定して、n = s^2 * k に分解（k は平方因子を持たないはずの残り）
export function sqrtFactorInt(n: number): { s: number; k: number } {
    n = Math.trunc(Math.abs(n));
    if (n === 0) return { s: 0, k: 1 };
    let s = 1;
    for (let i = 2; i * i <= n; i++) {
      while (n % (i * i) === 0) {
        s *= i;
        n = Math.trunc(n / (i * i));
      }
    }
    return { s, k: n }; // n が 1 なら k=1
  }
  
// r >= 0 を仮定。sqrt(r) = coef * sqrt(k) で返す（k は整数）
// coef は Rat（分子/分母）、分母は正。k=1 のとき "純有理" になります。
export function sqrtAsCoefRad(r: Rat): { coef: Rat; k: number } {
    const s = simplifyFrac(r.n, r.d);
    if (s.n < 0) throw new Error('sqrtAsCoefRad: negative input');
    if (s.n === 0) return { coef: { n: 0, d: 1 }, k: 1 };
  
    // √(n/d) = √(n*d) / d
    const N = Math.trunc(Math.abs(s.n * s.d)); // 整数
    const { s: out, k } = sqrtFactorInt(N);    // √(N) = out * √k
    const coef = simplifyFrac(out, s.d);       // out / d（分母は正）
    return { coef, k };
  }

  