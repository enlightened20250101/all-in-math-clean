// src/lib/format/tex.ts
export function gcd(a:number,b:number){a=Math.trunc(Math.abs(a));b=Math.trunc(Math.abs(b));if(a===0)return b||1;if(b===0)return a||1;while(b!==0){const t=b;b=a%b;a=t;}return Math.abs(a)||1;}
export function simplifyFraction(n:number,d:number){if(!Number.isFinite(n)||!Number.isFinite(d)||d===0)return {n,d,simplified:false};if(d<0){n=-n;d=-d;}const g=gcd(n,d);return {n:n/g,d:d/g,simplified:g!==1};}
export function fractionFromFloat(x:number,maxDen=1000000){if(!Number.isFinite(x))return {n:x,d:1};const s=Math.sign(x);x=Math.abs(x);let h1=1,h0=0,k1=0,k0=1,b=x;while(true){const a=Math.floor(b);const h2=a*h1+h0,k2=a*k1+k0;if(k2>maxDen)break;h0=h1;h1=h2;k0=k1;k1=k2;const frac=b-a;if(frac<1e-12)break;b=1/frac;}return {n:s*h1,d:k1};}
export function texFrac(n:number,d:number){const s=simplifyFraction(n,d);if(s.d===1)return `${s.n}`;return `\\frac{${s.n}}{${s.d}}`;}
export function texFloatAsFrac(x:number){const f=fractionFromFloat(x);return texFrac(f.n,f.d);}
export function texTerm(coeff:number,varName='x',first=false){if(coeff===0)return first?'0':'';const s=Math.sign(coeff),a=Math.abs(coeff);const head=first?(s<0?'-':''):(s<0?'- ':'+ ');const c=a===1?'':`${a}`;return `${head}${c}${varName}`.trim();}
export function texConst(value:number,first=false){if(value===0)return first?'0':'';const s=Math.sign(value),a=Math.abs(value);const head=first?(s<0?'-':''):(s<0?'- ':'+ ');return `${head}${a}`.trim();}
export function normalizeSigns(tex:string){return tex.replace(/\+\s*-/g,'- ').replace(/-\s*-/g,'+ ').replace(/\+\s*\+/g,'+ ').replace(/\s+/g,(m)=> (m.length>1?' ':m));}
export function texJoin(...parts: string[]): string {
  return parts.map((p) => p.trim()).filter(Boolean).join(" ");
}
export function texPoly2(a:number,b:number,c:number):string{let s='';if(a!==0){const head=Math.sign(a)<0?'-':'';const aa=Math.abs(a);s+=`${head}${aa===1?'':aa}x^2`;}if(b!==0){const plus=b>0?' + ':' - ';const bb=Math.abs(b);s+=`${a!==0?plus:(b<0?'-':'')}${bb===1?'':bb}x`;}if(c!==0){const plus=c>0?' + ':' - ';const cc=Math.abs(c);s+=`${(a!==0||b!==0)?plus:(c<0?'-':'')}${cc}`;}if(!s)s='0';return s;}
export function texSignedScalar(v:number,isFirst=false){if(v===0)return isFirst?'0':'';const s=Math.sign(v)<0?'- ':(isFirst?'':'+ ');return `${s}${Math.abs(v)}`.trim();}
export function texParenShift(varName:string,p_num:number,p_den:number){const s=simplifyFraction(p_num,p_den);const sign=s.n<0?' - ':' + ';const nn=Math.abs(s.n);const pp=(s.d===1)?`${nn}`:`\\tfrac{${nn}}{${s.d}}`;return `(${varName}${nn===0?'':(sign+pp)})^2`;}

// 角度と辺の表記（三角比用）
export function texAngle(vertex: string, deg: number): string {
  return `\\angle{${vertex}} = ${deg}^\\circ`;
}

export function texSegment(a: string, b: string): string {
  return `\\overline{${a}${b}}`;
}

export function texSegmentLen(a: string, b: string, len: number): string {
  return `\\overline{${a}${b}} = ${len}`;
}

export function texTriangle(a: string, b: string, c: string): string {
  return `\\triangle{${a}${b}${c}}`;
}

export function texText(text: string): string {
  return `\\text{${text}}`;
}

export function texSet(name: string): string {
  return `\\mathrm{${name}}`;
}

export function texSetList(items: Array<number | string>): string {
  return `\\{${items.join(", ")}\\}`;
}

export function texSetOp(a: string, op: string, b: string): string {
  return texJoin(texSet(a), op, texSet(b));
}

export function texSetUnion(a: string, b: string): string {
  return texSetOp(a, "\\cup", b);
}

export function texSetIntersection(a: string, b: string): string {
  return texSetOp(a, "\\cap", b);
}

export function texSetDiff(a: string, b: string): string {
  return texJoin(texSet(a), "\\setminus", texSet(b));
}

export function texSetComp(name: string): string {
  return `${texSet(name)}^\\mathrm{c}`;
}

export function texCard(expr: string): string {
  return `n(${expr})`;
}

export function texIn(elem: string, setExpr: string): string {
  return texJoin(elem, "\\in", setExpr);
}

export function texEq(left: string, right: string): string {
  return texJoin(left, "=", right);
}

export function texDivides(a: number | string, b: number | string): string {
  return texJoin(String(a), "\\mid", String(b));
}

export function texImplies(p: string, q: string): string {
  return texJoin(p, "\\Rightarrow", q);
}

export function texNot(expr: string): string {
  return texJoin("\\neg", expr);
}

export function texPow(base: string, exp: string | number): string {
  return `${base}^{${exp}}`;
}

export function texLeq(left: string, right: string | number): string {
  return texJoin(left, "\\le", String(right));
}

export function texGeq(left: string, right: string | number): string {
  return texJoin(left, "\\ge", String(right));
}

export function texCongruent(left: string, rem: string | number, mod: string | number): string {
  return texJoin(left, "\\equiv", String(rem), `\\pmod{${mod}}`);
}

export function texProb(event: string): string {
  return `P(${event})`;
}

export function texQuadraticVertex(a: number, p: number, q: number): string {
  const core =
    a === 1 ? texParenShift("x", -p, 1) :
    a === -1 ? `-${texParenShift("x", -p, 1)}` :
    `${a}${texParenShift("x", -p, 1)}`;
  if (q === 0) return core;
  const sign = q > 0 ? " + " : " - ";
  return `${core}${sign}${Math.abs(q)}`;
}

export function texComb(n: number, k: number): string {
  return `\\binom{${n}}{${k}}`;
}

export function texPerm(n: number, k: number): string {
  return `{}_{${n}}P_{${k}}`;
}

// ax + b を TeX 文字列にする（例: x-3, -x+2, 4, 0）
export function texLinear(a:number,b:number,varName='x'):string{
  let s='';
  const t = texTerm(a,varName,true);   // first=true なので先頭符号を自然に
  if(t && t!=='0') s += t;
  const c = texConst(b, s===''); // first 判定
  if(c && c!=='0') s += (s==='' ? c : ` ${c}`);    // texConst は "+ 3" 形式なのでスペースを揃える
  if(!s) s='0';
  return normalizeSigns(s);
}

// 方程式 "ax+b = cx+d"
export function texEquation(a:number,b:number,c:number,d:number,varName='x'):string{
  const L = texLinear(a,b,varName);
  const R = texLinear(c,d,varName);
  return `${L} = ${R}`;
}

// 不等式 "ax+b > cx+d"（opは ">" | ">=" | "<" | "<="）
export function texInequality(
  a:number,b:number,c:number,d:number,
  op: ">" | ">=" | "<" | "<=",
  varName='x'
):string{
  const L = texLinear(a,b,varName);
  const R = texLinear(c,d,varName);
  return `${L} ${op} ${R}`;
}
