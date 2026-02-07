// src/components/graphs/CircumcenterBoard.tsx
'use client';
import { useEffect, useRef, useState } from 'react';
type Props = { speak?: (text: string) => void };
export default function CircumcenterBoard({ speak }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [phase, setPhase] = useState(0);
  const brdRef = useRef<any>(null);
  const JXGRef = useRef<any>(null);
  const objsRef = useRef<any>({});

  useEffect(()=>{ speak?.(['△ABC を用意','AB の垂直二等分線','BC の垂直二等分線','外心 O','外接円'][phase]); },[phase, speak]);

  useEffect(()=>{
    let mounted=true;
    (async()=>{
      const mod:any = await import('jsxgraph');
      if(!mounted) return;
      JXGRef.current = mod;
      const el=containerRef.current!;
      const brd=mod.JSXGraph.initBoard(el.id,{boundingbox:[-5,5,5,-5],axis:true,showNavigation:false,keepaspectratio:true,showCopyright:false});
      brdRef.current=brd;

      // Base triangle (draggable)
      const A = brd.create('point',[-3,-1],{name:'A',size:3});
      const B = brd.create('point',[ 3,-1],{name:'B',size:3});
      const C = brd.create('point',[ 0, 3],{name:'C',size:3});
      const AB = brd.create('segment',[A,B],{strokeColor:'#666',dash:2});
      const BC = brd.create('segment',[B,C],{strokeColor:'#666',dash:2});
      const CA = brd.create('segment',[C,A],{strokeColor:'#666',dash:2});

      // Create-once auxiliaries; they auto-update when A,B,C move
      const M_AB = brd.create('midpoint',[A,B],{name:'',size:2,visible:false});
      const PERP_AB = brd.create('perpendicular',[AB, M_AB],{strokeColor:'#0a0',visible:false});
      const M_BC = brd.create('midpoint',[B,C],{name:'',size:2,visible:false});
      const PERP_BC = brd.create('perpendicular',[BC, M_BC],{strokeColor:'#06c',visible:false});
      const O = brd.create('intersection',[PERP_AB, PERP_BC, 0],{name:'O',size:3,strokeColor:'#c00',visible:false});
      const CIRC = brd.create('circle',[O, A],{strokeColor:'#c00',visible:false});

      objsRef.current = { A,B,C,AB,BC,CA,M_AB,PERP_AB,M_BC,PERP_BC,O,CIRC };

      const onResize=()=>{ const bb=brd.getBoundingBox(); const cx=(bb[0]+bb[2])/2, cy=(bb[1]+bb[3])/2; const half=Math.max((bb[2]-bb[0])/2,(bb[1]-bb[3])/2); brd.setBoundingBox([cx-half,cy+half,cx+half,cy-half],true); brd.update(); };
      window.addEventListener('resize', onResize);
      return ()=>{ window.removeEventListener('resize', onResize); try{ brd?.destroy(); }catch{} };
    })();
    return ()=>{ mounted=false; };
  },[]);

  // Reveal by phase (no deletion on drag)
  useEffect(()=>{
    const brd=brdRef.current; const o=objsRef.current; if(!brd||!o) return;
    o.PERP_AB.setAttribute({visible: phase>=1});
    o.M_AB.setAttribute({visible: phase>=1});
    o.PERP_BC.setAttribute({visible: phase>=2});
    o.M_BC.setAttribute({visible: phase>=2});
    o.O.setAttribute({visible: phase>=3});
    o.CIRC.setAttribute({visible: phase>=4});
    brd.update();
  },[phase]);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between text-sm text-gray-500">
        <div>ステップ {phase+1}/5</div>
        <div className="flex gap-2">
          <button className="px-3 py-1 rounded-lg border" onClick={()=>setPhase(p=>Math.max(0,p-1))}>戻る</button>
          <button className="px-3 py-1 rounded-lg border" onClick={()=>setPhase(p=>Math.min(4,p+1))}>次へ</button>
        </div>
      </div>
      <div id="circum-board" ref={containerRef} className="w-full aspect-square rounded-xl border bg-white" />
    </div>
  );
}
