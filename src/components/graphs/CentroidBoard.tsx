// src/components/graphs/CentroidBoard.tsx
'use client';
import { useCallback, useEffect, useRef, useState } from 'react';
type Props = { speak?: (text: string) => void };
const CAPTIONS = [
  '△ABC を用意します。点はドラッグできます。',
  'AB の中点を取り、頂点 C と結ぶ中線を引きます。',
  'BC の中点を取り、頂点 A と結ぶ中線を引きます。',
  '2 本の中線の交点 G が重心です。'
];
export default function CentroidBoard({ speak }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [phase, setPhase] = useState(0);
  const brdRef = useRef<any>(null);
  const pointsRef = useRef<{A?: any; B?: any; C?: any}>({});
  const auxRef = useRef<any>({});
  const buildAux = useCallback((p:number)=>{ const brd=brdRef.current; if(!brd) return; const {A,B,C}=pointsRef.current; for(const k of Object.keys(auxRef.current||{})){ const g=auxRef.current[k]; if(g){ try{ brd.removeObject(g);}catch{} } } auxRef.current={}; if(p>=1){ auxRef.current.midAB=brd.create('midpoint',[A,B],{name:'M_AB',size:2}); auxRef.current.medC=brd.create('segment',[C,auxRef.current.midAB],{strokeColor:'#0a0'}); } if(p>=2){ auxRef.current.midBC=brd.create('midpoint',[B,C],{name:'M_BC',size:2}); auxRef.current.medA=brd.create('segment',[A,auxRef.current.midBC],{strokeColor:'#06c'}); } if(p>=3){ auxRef.current.G=brd.create('intersection',[auxRef.current.medC,auxRef.current.medA,0],{name:'G',size:3,strokeColor:'#c00'}); } brd.update(); },[]);
  useEffect(()=>{ speak?.(CAPTIONS[phase]); },[phase, speak]);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(()=>{ let mounted=true; (async()=>{ const mod:any=await import('jsxgraph'); if(!mounted) return; const el=containerRef.current!; const brd=mod.JSXGraph.initBoard(el.id,{boundingbox:[-5,5,5,-5],axis:true,showNavigation:false,showCopyright:false,keepaspectratio:true}); brdRef.current=brd; const A=brd.create('point',[-3,-1],{name:'A',size:3}); const B=brd.create('point',[3,-1],{name:'B',size:3}); const C=brd.create('point',[0,3],{name:'C',size:3}); pointsRef.current={A,B,C}; const AB=brd.create('segment',[A,B],{strokeColor:'#666',dash:2}); const BC=brd.create('segment',[B,C],{strokeColor:'#666',dash:2}); const CA=brd.create('segment',[C,A],{strokeColor:'#666',dash:2}); const rebuild=()=>buildAux(phase); A.on('drag',rebuild); B.on('drag',rebuild); C.on('drag',rebuild); buildAux(phase); const onResize=()=>adjustSquare(); window.addEventListener('resize',onResize); adjustSquare(); function adjustSquare(){ const bb=brd.getBoundingBox(); const cx=(bb[0]+bb[2])/2, cy=(bb[1]+bb[3])/2; const half=Math.max((bb[2]-bb[0])/2,(bb[1]-bb[3])/2); brd.setBoundingBox([cx-half,cy+half,cx+half,cy-half],true); brd.update(); } return ()=>{ window.removeEventListener('resize',onResize); try{ brd?.destroy(); }catch{}; }; })(); return ()=>{ mounted=false; }; },[]);
  useEffect(()=>{ if(!brdRef.current) return; buildAux(phase); },[buildAux, phase]);
  return (<div className="space-y-3">
    <div className="flex items-center justify-between text-sm text-gray-500"><div>ステップ {phase+1}/4</div><div className="flex gap-2"><button className="px-3 py-1 rounded-lg border" onClick={()=>setPhase(p=>Math.max(0,p-1))}>戻る</button><button className="px-3 py-1 rounded-lg border" onClick={()=>setPhase(p=>Math.min(3,p+1))}>次へ</button></div></div>
    <div className="w-full"><div id="centroid-board" ref={containerRef} className="w-full aspect-square rounded-xl border bg-white"/></div>
    <div className="rounded-xl border p-3 bg-gray-50"><div className="text-xs text-gray-500 mb-1">字幕</div><div className="font-medium">{CAPTIONS[phase]}</div></div>
  </div>);
}
