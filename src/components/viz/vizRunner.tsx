// src/components/viz/VizRunner.tsx
'use client';

import React, { useEffect, useMemo, useRef, useId } from "react";
import JXG from "jsxgraph";
// ※ CSSは直接 import しない（Nextのexports制約でエラーになる環境がある）
// import "jsxgraph/distrib/jsxgraph.css";
import { VizSpec, VizSpecSchema, clampNum } from "@/lib/vizSpec";

type Props = {
  spec: VizSpec;
  className?: string;
};

type ObjMap = Record<string, JXG.GeometryElement | JXG.Composition | JXG.GeometryElement[]>;

const DEFAULT_BBOX: [number, number, number, number] = [-6, 6, 6, -6];

/** 安全サブセットで y=f(x) を評価する小さなヘルパ */
function safeEvalFx(fx: string): (x: number) => number {
  const allowed = {
    sin: Math.sin, cos: Math.cos, tan: Math.tan,
    exp: Math.exp, log: Math.log, sqrt: Math.sqrt, abs: Math.abs,
    PI: Math.PI, E: Math.E
  };
  const body = `"use strict"; const {sin,cos,tan,exp,log,sqrt,abs,PI,E} = this; return (${fx});`;
  const fn = Function("x", body).bind(allowed) as (x:number)=>number;
  return (x:number)=> {
    const y = fn(x);
    if (!Number.isFinite(y)) throw new Error("fx not finite");
    return y;
  };
}

function VizRunner({ spec, className }: Props) {
  const reactId = useId();
  const elemId = useMemo(() => `vizboard-${reactId.replace(/[:]/g,"")}`, [reactId]);
  const boxRef = useRef<HTMLDivElement>(null);
  const boardRef = useRef<JXG.Board | null>(null);
  const validation = useMemo(() => {
    try {
      return { value: VizSpecSchema.parse(spec), error: null as string | null };
    } catch (e:any) {
      return { value: null, error: e?.message ?? "vizSpec validation failed" };
    }
  }, [spec]);

  useEffect(() => {
    if (!boxRef.current || !validation.value) return;

    // 既存ボードを破棄
    if (boardRef.current) {
      try { JXG.JSXGraph.freeBoard(boardRef.current); } catch {}
      boardRef.current = null;
    }

    // CSSなしでも最低限の見た目にするためクラスを付与
    boxRef.current.classList.add("JXGbox");

    const bbox = validation.value.bbox ?? DEFAULT_BBOX;
    const board = JXG.JSXGraph.initBoard(elemId, {
      boundingbox: bbox,
      axis: false,
      showNavigation: false,
      showCopyright: false,
      keepaspectratio: false,
      pan: { enabled: false },
      zoom: { wheel: false },
    });
    boardRef.current = board;

    const objMap: ObjMap = Object.create(null);

    // 予約語としてキーだけ先に用意
    objMap["grid"] = null as any;
    objMap["axes-x"] = null as any;
    objMap["axes-y"] = null as any;

    function ensureAxes() {
      const xaxis = board.create("axis", [[0,0],[1,0]], { name:"x", withLabel:true, ticks: { drawLabels:true }});
      const yaxis = board.create("axis", [[0,0],[0,1]], { name:"y", withLabel:true, ticks: { drawLabels:true }});
      objMap["axes-x"] = xaxis; objMap["axes-y"] = yaxis;
    }
    function ensureGrid() {
      const g = board.create("grid", [], { strokeColor:"#ccc", strokeWidth:0.5 });
      objMap["grid"] = g;
    }

    function makeObject(o: NonNullable<VizSpec["objects"]>[number]) {
      const id = (o as any).id ?? `${(o as any).type}-${Math.random().toString(36).slice(2,8)}`;
      let el: JXG.GeometryElement | JXG.Composition | JXG.GeometryElement[] | null = null;
      try {
        switch ((o as any).type) {
          case "grid": {
            ensureGrid(); el = objMap["grid"]; break;
          }
          case "axes": {
            ensureAxes(); el = objMap["axes-x"]; break;
          }
          case "point": {
            // coordsExpr優先（例: P=(x0, f(x0))）
            if ((o as any).coordsExpr) {
              const fx = String((o as any).coordsExpr.fx);
              const atX = Number((o as any).coordsExpr.atX);
              const f = safeEvalFx(fx);
              const x = clampNum(atX);
              const y = clampNum(f(atX));
              el = board.create("point", [x,y], { name: (o as any).label ?? id, visible:false, fixed: !(o as any).draggable });
            } else {
              let x=0, y=0;
              if (Array.isArray((o as any).coords) && typeof (o as any).coords[0] === "number") {
                x = clampNum((o as any).coords[0] as number); y = clampNum((o as any).coords[1] as number);
              }
              el = board.create("point", [x,y], { name: (o as any).label ?? id, visible:false, fixed: !(o as any).draggable });
            }
            break;
          }
          case "line": {
            if ((o as any).expr) {
              const expr = String((o as any).expr).replaceAll(" ", "");
              if (expr.startsWith("x=")) {
                const val = Number(expr.slice(2));
                el = board.create("line", [[val,0],[val,1]], { straightFirst:true, straightLast:true, visible:false });
              } else if (expr.startsWith("y=")) {
                const rhs = expr.slice(2);
                const f = safeEvalFx(rhs);
                el = board.create("functiongraph", [(x:number)=>f(x)], { visible:false });
              }
            } else if ((o as any).through && (o as any).through.length===2) {
              const A = objMap[(o as any).through[0]] as JXG.Point;
              const B = objMap[(o as any).through[1]] as JXG.Point;
              if (A && B) el = board.create("line", [A,B], { visible:false });
            }
            break;
          }
          case "segment": {
            const A = objMap[(o as any).ends[0]] as JXG.Point;
            const B = objMap[(o as any).ends[1]] as JXG.Point;
            if (A && B) el = board.create("segment",[A,B], { visible:false });
            break;
          }
          case "circle": {
            const C = objMap[(o as any).center] as JXG.Point;
            if (C) {
              let r = 1;
              const rv = (o as any).radius;
              if (typeof rv === "number") r = Math.max(0.001, Math.abs(rv));
              el = board.create("circle", [C, r], { visible:false });
            }
            break;
          }
          case "vector": {
            const A = objMap[(o as any).from] as JXG.Point;
            const B = objMap[(o as any).to] as JXG.Point;
            if (A && B) el = board.create("arrow", [A,B], { visible:false });
            break;
          }
          case "text": {
            if ((o as any).at) {
              const P = objMap[(o as any).at] as JXG.Point;
              if (P) el = board.create("text", [()=>P.X(), ()=>P.Y(), (o as any).text], { visible:false });
            } else if ((o as any).pos) {
              el = board.create("text", [(o as any).pos[0], (o as any).pos[1], (o as any).text], { visible:false });
            }
            break;
          }
          case "curve": {
            const f = safeEvalFx((o as any).fx);
            el = board.create("functiongraph", [(x:number)=>f(x)], { visible:false, strokeWidth:2 });
            break;
          }
          case "polygon": {
            const pts = (o as any).points as [number, number][];
            if (Array.isArray(pts) && pts.length >= 3) {
              el = board.create("polygon", pts, {
                borders: { visible: true },
                fillColor: (o as any).fillColor ?? "#a3d5ff",
                fillOpacity: (o as any).fillOpacity ?? 0.25,
                visible: false,
              });
            }
            break;
          }
          case "implicit": {
            // 未対応（将来の等高線描画などで拡張）
            break;
          }
          case "region": {
            // 簡易半平面塗りつぶし（ax+by<=c / >=）
            const ineq = String((o as any).ineq ?? "");
            const m = ineq.replaceAll(" ", "").match(/^([+-]?\d*\.?\d*)x([+-]\d*\.?\d*)y([<>]=)([+-]?\d*\.?\d*)$/i);
            if (m) {
              const a = Number(m[1] || "1");
              const b = Number(m[2]);
              const sign = m[3];
              const c = Number(m[4]);
              const [x1,y1,x2,y2] = board.getBoundingBox();
              const corners: [number,number][]= [[x1,y1],[x2,y1],[x2,y2],[x1,y2]];
              const sample = (x:number,y:number)=> (a*x + b*y) - c;
              const keep   = (x:number,y:number)=> sign===">=" ? sample(x,y)>=0 : sample(x,y)<=0;
              const pts: [number,number][] = [];
              for (const p of corners) if (keep(p[0],p[1])) pts.push(p);
              if (pts.length>=3) {
                const poly = board.create("polygon", pts, { borders:{ visible:false }, fillColor:"#a3d5ff", fillOpacity:0.2, visible:false });
                el = poly;
              }
            }
            break;
          }
        }
      } catch (e:any) {
        console.warn("viz object error:", e);
        el = null;
      }
      if (el) {
        (el as any).setAttribute({ visible:false });
        objMap[id] = el;
      }
    }

    // objects を先に作成（point参照などのため）
    (validation.value.objects ?? []).forEach(o => makeObject(o));

    // 可視化ヘルパ
    function setVisible(ids: string[], flag: boolean) {
      ids.forEach(id => {
        const el = objMap[id];
        if (el && (el as any).setAttribute) (el as any).setAttribute({ visible: flag });
      });
      board.update();
    }
    function setHighlight(ids:string[], flag:boolean) {
      ids.forEach(id => {
        const el = objMap[id];
        if (el && (el as any).setAttribute) {
          (el as any).setAttribute(flag ? { strokeWidth:3, strokeColor:"#0070f3" } : { strokeWidth:1.5 });
        }
      });
      board.update();
    }

    // 簡易アニメ（point の x/y のみ補間）
    async function runAnimate(targetId:string, key:string, to:number, ms:number) {
      const el = objMap[targetId];
      if (!el) return;
      const p = el as unknown as JXG.Point;
      const from = key==="x" ? p.X() : key==="y" ? p.Y() : 0;
      const start = performance.now();
      const dur = Math.max(1, Math.min(20000, ms));
      return new Promise<void>(resolve=>{
        function tick(t:number){
          const k = Math.min(1, (t - start)/dur);
          const v = from + (to - from)*k;
          if (key==="x") p.setPosition(JXG.COORDS_BY_USER, [v, p.Y()]);
          if (key==="y") p.setPosition(JXG.COORDS_BY_USER, [p.X(), v]);
          board.update();
          if (k < 1) requestAnimationFrame(tick); else resolve();
        }
        requestAnimationFrame(tick);
      });
    }

    // steps で段階的表示／強調／アニメ
    const steps = validation.value.steps ?? [];
    if (steps.length===0) {
      // 明示が無ければ全部見せる（axes/gridがあれば先）
      if (objMap["grid"]) setVisible(["grid"], true);
      if (objMap["axes-x"] && objMap["axes-y"]) setVisible(["axes-x","axes-y"], true);
      setVisible(Object.keys(objMap).filter(k=>!["grid","axes-x","axes-y"].includes(k)), true);
    } else {
      (async()=>{
        for (const st of steps) {
          if (st.reveal) setVisible(st.reveal, true);
          if (st.highlight) setHighlight(st.highlight, true);
          if ((st as any).animate) {
            for (const a of (st as any).animate) {
              await runAnimate(a.target, a.key, a.to, a.ms ?? 600);
            }
          }
        }
      })();
    }

    return () => {
      try { JXG.JSXGraph.freeBoard(board); } catch {}
      boardRef.current = null;
    };
  }, [validation.value, elemId]);

  if (!validation.value) {
    return (
      <div className={className}>
        <div className="rounded-lg border border-red-300 bg-red-50 p-3 text-sm text-red-700">
          vizSpec の検証に失敗しました：{validation.error ?? 'unknown'}
        </div>
      </div>
    );
  }

  return (
    <div className={className}>
      {/* 高さは必須 */}
      <div id={elemId} ref={boxRef} className="w-full h-[420px] rounded-lg border border-gray-200 bg-white" />
    </div>
  );
}

export default VizRunner;
