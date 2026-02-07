// src/components/animations/DerivativeTangent.tsx
'use client';
import { useEffect, useRef, useState } from 'react';
import KaTeXBlock from '@/components/math/KaTeXBlock';
import NumInput from '@/components/ui/NumInput';
import { texPoly2, texFrac, texFromNumber } from '@/lib/tex/format';

type Props = { a?: number; b?: number; c?: number; x0?: number; h?: number; speak?: (t:string)=>void };

/**
 * 改良版:
 * - グラフ上の P, Q をドラッグ可能（グライダー）。Pが x0、Q が x0+h を表す
 * - 入力は NumInput（小数/分数OK） + 矢印キーで 0.1 刻み変更
 * - 描画は create-once。パラメータ変更は関数依存と glider 参照で即反映
 */
export default function DerivativeTangent({ a: a0=1, b: b0=0, c: c0=0, x0: x00=1, h: h0=1 }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [a,setA]=useState(a0), [b,setB]=useState(b0), [c,setC]=useState(c0);
  const [x0,setX0]=useState(x00), [h,setH]=useState(h0);

  // 共有参照（functiongraph のコールバックで使用）
  const paramsRef = useRef({a,b,c,x0,h});
  useEffect(()=>{ paramsRef.current = {a,b,c,x0,h}; }, [a,b,c,x0,h]);

  const brdRef = useRef<any>(null);
  const objsRef = useRef<any>({});

  const fx = (x:number)=> {
    const p = paramsRef.current;
    return p.a*x*x + p.b*x + p.c;
  };
  const slope = (x:number)=> {
    const p = paramsRef.current;
    return 2*p.a*x + p.b;
  };

  // 初期化は初回のみ
  useEffect(()=>{
    let mounted = true;
    (async () => {
      const mod: any = await import('jsxgraph');
      if(!mounted) return;
      const el = containerRef.current!;
      const brd = mod.JSXGraph.initBoard(el.id, {
        boundingbox:[-5,5,5,-5], axis:true, keepaspectratio:true, showNavigation:false, showCopyright:false
      });
      brdRef.current = brd;

      // 関数グラフ（関数依存のためパラメータ更新で自動再計算）
      const curve = brd.create('functiongraph', [(x:number)=> fx(x)], { strokeColor:'#111', strokeWidth:2 });

      // P: グライダー（初期 x0 で曲線上）。ドラッグで x0 を更新
      const P = brd.create('glider', [x0, fx(x0), curve], { name:'P', size:3, strokeColor:'#0a0', fillColor:'#0a0' });
      // Q: グライダー（初期 x0+h で曲線上）。ドラッグで h を更新（Q.X - P.X）
      const Q = brd.create('glider', [x0+h, fx(x0+h), curve], { name:'Q', size:3, strokeColor:'#06c', fillColor:'#06c' });

      // 接線: Pを通り、傾き f'(x0) の点 T を利用
      const T = brd.create('point', [()=>P.X()+1, ()=>P.Y()+slope(P.X())], { visible:false });
      const tan = brd.create('line', [P, T], { strokeColor:'#c00' });

      // 割線
      const sec = brd.create('line', [P, Q], { strokeColor:'#06c', dash:2 });

      // ドラッグで state も更新（右側の式と入力欄を同期）
      P.on('drag', ()=> {
        const newX0 = P.X();
        setX0(newX0);
      });
      Q.on('drag', ()=> {
        const newH = Q.X() - P.X();
        setH(newH);
      });

      // リサイズでアスペクト維持
      const onResize = ()=>{
        const bb=brd.getBoundingBox(); const cx=(bb[0]+bb[2])/2, cy=(bb[1]+bb[3])/2; const half=Math.max((bb[2]-bb[0])/2,(bb[1]-bb[3])/2);
        brd.setBoundingBox([cx-half,cy+half,cx+half,cy-half],true);
      };
      window.addEventListener('resize', onResize);

      // 保存
      objsRef.current = { curve, P, Q, T, tan, sec };

      return ()=>{
        window.removeEventListener('resize', onResize);
        try{ brd?.destroy(); }catch{}
      };
    })();
    return ()=>{ mounted=false; };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  },[]);

  // 入力欄から x0, h を変更した時は glider の位置にも反映
  useEffect(()=>{
    const { P, Q } = objsRef.current || {};
    if (P && typeof P.moveTo === 'function') P.moveTo([x0, fx(x0)], 0);
    if (Q && typeof Q.moveTo === 'function') Q.moveTo([x0+h, fx(x0+h)], 0);
  }, [x0, h, a, b, c]);

  // 右側式（都度再計算）
  const rise = fx(x0+h) - fx(x0);
  const run  = h;
  const ftex = `f(x) = ${texPoly2(a,b,c)} \\qquad f'(x) = ${texPoly2(0, 2*a, b).replace(/^\\+\\s*/,'')}`;
  const sec  = `\\text{平均変化率 } \\dfrac{f(x_0+h)-f(x_0)}{h} = ${texFrac(rise, run)} \\approx ${ ((run!==0)? rise/run : NaN).toFixed(4) }`;
  const tan  = `\\text{接線傾き } f'(x_0) = 2a\\,x_0 + b = ${texFromNumber(2*a)}\\cdot ${texFromNumber(x0)} ${b>=0?'+':''} ${texFromNumber(b)} = ${texFromNumber(2*a*x0+b)}`;

  return (
    <div className="space-y-4">
      <div className="grid md:grid-cols-2 gap-4">
        <div className="rounded-xl border p-3 bg-white">
          <div id="deriv-board" ref={containerRef} className="w-full aspect-square" />
        </div>
        <div className="rounded-xl border p-3 bg-white space-y-3">
          <KaTeXBlock tex={ftex} />
          <KaTeXBlock tex={sec} />
          <KaTeXBlock tex={tan} />
        </div>
      </div>
      <div className="grid md:grid-cols-5 gap-3">
        <label className="text-sm">a<NumInput value={a} onChange={setA} step={0.1} /></label>
        <label className="text-sm">b<NumInput value={b} onChange={setB} step={0.1} /></label>
        <label className="text-sm">c<NumInput value={c} onChange={setC} step={0.1} /></label>
        <label className="text-sm">x₀<NumInput value={x0} onChange={setX0} step={0.1} /></label>
        <label className="text-sm">h<NumInput value={h} onChange={setH} step={0.1} /></label>
      </div>
    </div>
  );
}
