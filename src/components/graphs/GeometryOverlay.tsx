'use client';
import { useMemo } from 'react';

type Point = [number | null, number | null];
type Layer = { label: string; points: Point[] };
type Props = {
  bbox: [number, number, number, number]; // [xmin,xmax,ymin,ymax]
  layers: Layer[];
  width?: number;
  height?: number;
  showGrid?: boolean;
};

function worldToSvgFactory(bbox: [number,number,number,number], width: number, height: number) {
  const [xmin, xmax, ymin, ymax] = bbox;
  const sx = width / (xmax - xmin);
  const sy = height / (ymax - ymin);
  // SVG は y 軸下向き → 反転
  return (p: Point): [number, number] | null => {
    const [x,y] = p;
    if (x === null || y === null || !isFinite(x) || !isFinite(y)) return null;
    const X = (x - xmin) * sx;
    const Y = (ymax - y) * sy;
    return [X, Y];
  };
}

function pathFromPoints(points: Point[], map: (p:Point)=>[number,number]|null): string {
  let d = '';
  let penUp = true;
  for (const p of points) {
    const m = map(p);
    if (!m) { penUp = true; continue; }
    const [X,Y] = m;
    if (penUp) { d += `M ${X} ${Y}`; penUp = false; }
    else { d += ` L ${X} ${Y}`; }
  }
  return d || 'M 0 0';
}

const COLORS = ['#2563eb','#ef4444','#10b981','#f59e0b','#8b5cf6','#14b8a6'];

export default function GeometryOverlay({ bbox, layers, width=640, height=480, showGrid=true }: Props) {
  const map = useMemo(()=> worldToSvgFactory(bbox, width, height), [bbox,width,height]);

  // 軸/目盛さっと描く
  const grid = useMemo(()=>{
    if (!showGrid) return null;
    const [xmin,xmax,ymin,ymax] = bbox;
    const xs:number[] = []; const ys:number[] = [];
    const stepX = niceStep(xmax-xmin); const stepY = niceStep(ymax-ymin);
    for (let x=Math.ceil(xmin/stepX)*stepX; x<=xmax; x+=stepX) xs.push(x);
    for (let y=Math.ceil(ymin/stepY)*stepY; y<=ymax; y+=stepY) ys.push(y);
    return { xs, ys };
  }, [bbox,showGrid]);

  return (
    <div className="w-full">
      <svg width={width} height={height} className="bg-white rounded-md border">
        {/* grid */}
        {showGrid && grid && (
          <>
            {grid.xs.map((gx,i)=>{
              const a = map([gx, bbox[2]]); const b = map([gx, bbox[3]]);
              if (!a || !b) return null;
              return <line key={'x'+i} x1={a[0]} y1={a[1]} x2={b[0]} y2={b[1]} stroke="#e5e7eb" strokeWidth={1}/>;
            })}
            {grid.ys.map((gy,i)=>{
              const a = map([bbox[0], gy]); const b = map([bbox[1], gy]);
              if (!a || !b) return null;
              return <line key={'y'+i} x1={a[0]} y1={a[1]} x2={b[0]} y2={b[1]} stroke="#e5e7eb" strokeWidth={1}/>;
            })}
          </>
        )}

        {/* layers */}
        {layers.map((L, idx)=>{
          const d = pathFromPoints(L.points, map);
          return <path key={L.label} d={d} fill="none" stroke={COLORS[idx%COLORS.length]} strokeWidth={2} />;
        })}
      </svg>
      <div className="mt-2 flex gap-4 flex-wrap text-sm">
        {layers.map((L,idx)=>(
          <span key={L.label} className="flex items-center gap-2">
            <span className="inline-block w-4 h-0.5" style={{backgroundColor:COLORS[idx%COLORS.length]}}/>
            {L.label}
          </span>
        ))}
      </div>
    </div>
  );
}

// ざっくりグリッド間隔
function niceStep(range:number){
  const raw = range/8;
  const pow = Math.pow(10, Math.floor(Math.log10(Math.max(1e-9, raw))));
  const n = raw/pow;
  if (n<1.5) return 1*pow;
  if (n<3) return 2*pow;
  if (n<7) return 5*pow;
  return 10*pow;
}
