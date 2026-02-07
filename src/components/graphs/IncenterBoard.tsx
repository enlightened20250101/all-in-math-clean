// src/components/graphs/IncenterBoard.tsx
'use client';
import { useEffect, useRef, useState } from 'react';
type Props = { speak?: (text: string) => void };
export default function IncenterBoard({ speak }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [phase, setPhase] = useState(0);
  const brdRef = useRef<any>(null);
  const JXGRef = useRef<any>(null);
  const oRef = useRef<any>({});

  useEffect(()=>{ speak?.(['△ABC を用意','∠A の二等分線','∠B の二等分線','内心 I と内接円'][phase]); },[phase, speak]);

  useEffect(()=>{
    let mounted=true;
    (async()=>{
      const mod:any = await import('jsxgraph');
      if(!mounted) return;
      JXGRef.current = mod;
      const el=containerRef.current!;
      const brd=mod.JSXGraph.initBoard(el.id,{boundingbox:[-5,5,5,-5],axis:true,showNavigation:false,keepaspectratio:true,showCopyright:false});
      brdRef.current=brd;

      const A = brd.create('point',[-3,-1],{name:'A',size:3});
      const B = brd.create('point',[ 3,-1],{name:'B',size:3});
      const C = brd.create('point',[ 0, 3],{name:'C',size:3});
      const AB = brd.create('segment',[A,B],{strokeColor:'#666',dash:2});
      brd.create('segment',[B,C],{strokeColor:'#666',dash:2});
      brd.create('segment',[C,A],{strokeColor:'#666',dash:2});

      const bisA = brd.create('bisector',[B,A,C],{strokeColor:'#0a0',visible:false});
      const bisB = brd.create('bisector',[A,B,C],{strokeColor:'#06c',visible:false});
      const I    = brd.create('intersection',[bisA,bisB,0],{name:'I',size:3,strokeColor:'#c00',visible:false});

      // incircle (use perpendicular to AB to get radius point)
      const lineAB = brd.create('line',[A,B],{visible:false});
      const perpI  = brd.create('perpendicular',[lineAB, I],{visible:false});
      const foot   = brd.create('intersection',[lineAB, perpI, 0],{visible:false});
      const incirc = brd.create('circle',[I, foot],{strokeColor:'#c00',visible:false});

      oRef.current = { bisA, bisB, I, incirc };

      const onResize=()=>{ const bb=brd.getBoundingBox(); const cx=(bb[0]+bb[2])/2, cy=(bb[1]+bb[3])/2; const half=Math.max((bb[2]-bb[0])/2,(bb[1]-bb[3])/2); brd.setBoundingBox([cx-half,cy+half,cx+half,cy-half],true); brd.update(); };
      window.addEventListener('resize', onResize);
      return ()=>{ window.removeEventListener('resize', onResize); try{ brd?.destroy(); }catch{} };
    })();
    return ()=>{ mounted=false; };
  },[]);

  useEffect(()=>{
    const brd=brdRef.current; const o=oRef.current; if(!brd||!o) return;
    o.bisA.setAttribute({visible: phase>=1});
    o.bisB.setAttribute({visible: phase>=2});
    o.I.setAttribute({visible: phase>=3});
    o.incirc.setAttribute({visible: phase>=3});
    brd.update();
  },[phase]);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between text-sm text-gray-500">
        <div>ステップ {phase+1}/4</div>
        <div className="flex gap-2">
          <button className="px-3 py-1 rounded-lg border" onClick={()=>setPhase(p=>Math.max(0,p-1))}>戻る</button>
          <button className="px-3 py-1 rounded-lg border" onClick={()=>setPhase(p=>Math.min(3,p+1))}>次へ</button>
        </div>
      </div>
      <div id="incenter-board" ref={containerRef} className="w-full aspect-square rounded-xl border bg-white" />
    </div>
  );
}
