// src/components/animations/Vector2D3DStepper.tsx
'use client';

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import StepperBase, { DrawResult } from '@/components/animations/StepperBase';
import KaTeXBlock from '@/components/math/KaTeXBlock';
import NumInput from '@/components/ui/NumInput';

/* ========================= Types ========================= */
type V2 = { x:number; y:number };
type V3 = { x:number; y:number; z:number };
type Mode = 'sumdiff'|'scalar'|'projection'|'dotangle'|'decompose'|'cross';
type Dim = '2d'|'3d';

type UIState = {
  dim: Dim;
  mode2d: Exclude<Mode,'cross'>;
  mode3d: Exclude<Mode,'projection'|'decompose'>;
  u2: V2; v2: V2; alpha2: number; beta2: number;
  u3: V3; v3: V3; alpha3: number; beta3: number;

  // NEW: view options
  showLabels2D: boolean;
  showParallelogram2D: boolean;
  showPlane3D: boolean;
  showNormal3D: boolean;
};

/* ==================== Math utilities ===================== */
const clamp = (n:number, lo:number, hi:number)=>Math.max(lo, Math.min(hi, n));
const len2 = (a:V2)=>Math.hypot(a.x,a.y);
const len3 = (a:V3)=>Math.hypot(a.x,a.y,a.z);
const dot2 = (a:V2,b:V2)=>a.x*b.x + a.y*b.y;
const dot3 = (a:V3,b:V3)=>a.x*b.x + a.y*b.y + a.z*b.z;
const cross3 = (a:V3,b:V3):V3=>({ x:a.y*b.z-a.z*b.y, y:a.z*b.x-a.x*b.z, z:a.x*b.y-a.y*b.x });
const add2 = (a:V2,b:V2)=>({x:a.x+b.x,y:a.y+b.y});
const add3 = (a:V3,b:V3)=>({x:a.x+b.x,y:a.y+b.y,z:a.z+b.z});
const sub2 = (a:V2,b:V2)=>({x:a.x-b.x,y:a.y-b.y});
const sub3 = (a:V3,b:V3)=>({x:a.x-b.x,y:a.y-b.y,z:a.z-b.z});
const mul2 = (k:number,a:V2)=>({x:k*a.x,y:k*a.y});
const mul3 = (k:number,a:V3)=>({x:k*a.x,y:k*a.y,z:k*a.z});
const projOn2 = (u:V2,v:V2):V2 => { const d = dot2(v,v); if(d===0) return {x:0,y:0}; return mul2(dot2(u,v)/d, v); };
const rejOn2  = (u:V2,v:V2)=>sub2(u, projOn2(u,v));

/* =============== TeX helpers (fraction display) =============== */
const EPS=1e-12, isZero=(x:number)=>Math.abs(x)<EPS;
const gcd=(a:number,b:number)=>{a=Math.abs(a);b=Math.abs(b);while(b){const t=b;b=a%b;a=t;}return a||1;};
const toFrac=(x:number,maxDen=48)=>{ const s=Math.sign(x)||1,ax=Math.abs(x); const ir=Math.round(ax);
  if(Math.abs(ax-ir)<1e-10) return {n:s*ir,d:1};
  let N=ir,D=1,err=Math.abs(ax-ir);
  for(let d=2; d<=maxDen; d++){ const n=Math.round(ax*d), e=Math.abs(ax-n/d); if(e<err-1e-12){err=e;N=n;D=d;} }
  const g=gcd(N,D); return {n:s*(N/g),d:D/g};
};
const texNum=(x:number)=>{ if(isZero(x))return '0'; const {n,d}=toFrac(x); if(d===1) return String(n);
  const s=n<0?'-':'', a=Math.abs(n); return String.raw`${s}\frac{${a}}{${d}}`; };
const texVec2=(v:V2)=>String.raw`\left(${texNum(v.x)},\,${texNum(v.y)}\right)`;
const texVec3=(v:V3)=>String.raw`\left(${texNum(v.x)},\,${texNum(v.y)},\,${texNum(v.z)}\right)`;
const texTermVec=(coef:number, sym:'u'|'v')=>{ if(isZero(coef))return ''; const v=String.raw`\vec{${sym}}`;
  if(Math.abs(coef-1)<EPS) return v; if(Math.abs(coef+1)<EPS) return String.raw`-${v}`; return String.raw`${texNum(coef)}\,${v}`; };
const texJoinVec=(terms:string[])=>{ const t=terms.filter(Boolean); if(!t.length) return '0'; let out=t[0];
  for(let i=1;i<t.length;i++){ const term=t[i]; out += (/^\s*-/.test(term)?` ${term}`:` + ${term}`); } return out; };

/* ================== Three.js lazy import ================== */
let THREE: any = null;
async function ensureThree() {
  if (THREE) return THREE;
  const mod = await import('three');
  const { OrbitControls } = await import('three/examples/jsm/controls/OrbitControls.js');
  (mod as any).OrbitControls = OrbitControls;
  THREE = mod;
  return THREE;
}

/* ===================== Component ===================== */
export default function Vector2D3DStepper(){
  const [s, setS] = useState<UIState>({
    dim:'2d',
    mode2d:'projection',
    mode3d:'dotangle',
    u2:{x:2,y:1}, v2:{x:1,y:2}, alpha2:1, beta2:1,
    u3:{x:2,y:1,z:0}, v3:{x:1,y:2,z:1}, alpha3:1, beta3:1,
    showLabels2D: true,
    showParallelogram2D: true,
    showPlane3D: true,
    showNormal3D: true,
  });
  const set = (p:Partial<UIState>)=>setS(v=>({...v,...p}));

  /* ================== 3D setup & lifecycle ================== */
  const threeRef = useRef<HTMLDivElement|null>(null);
  const threeObjs = useRef<{renderer:any, scene:any, camera:any, controls:any, arrows: any[], raf:number|null, ro:ResizeObserver|null} | null>(null);

  // 3D 初期化は dim 切替のタイミングのみ
  useEffect(()=>{ 
    if(s.dim!=='3d') return;
    let mounted = true;
    (async ()=>{
      await ensureThree();
      if (!mounted || !threeRef.current) return;
      const container = threeRef.current;
      const width = container.clientWidth || 600;
      const height = Math.max(320, Math.floor(width*0.6));
      const renderer = new THREE.WebGLRenderer({antialias:true});
      renderer.setSize(width, height);
      renderer.setPixelRatio(Math.min(2, window.devicePixelRatio||1));
      container.innerHTML='';
      container.appendChild(renderer.domElement);

      const scene = new THREE.Scene();
      scene.background = new THREE.Color(0xffffff);

      const camera = new THREE.PerspectiveCamera(45, width/height, 0.1, 1000);
      camera.position.set(6,6,6);

      const controls = new THREE.OrbitControls(camera, renderer.domElement);
      controls.enableDamping = true;
      controls.dampingFactor = 0.08;

      // grid & axes
      const grid = new THREE.GridHelper(12, 12, 0xdddddd, 0xeeeeee);
      scene.add(grid);
      const axes = new THREE.AxesHelper(3);
      (axes.material as any).depthTest = false;
      scene.add(axes);

      scene.add(new THREE.AmbientLight(0xffffff, 0.9));

      const arrows:any[] = [];
      const ro = new ResizeObserver(entries=>{
        for (const ent of entries){
          const w = ent.contentRect.width || container.clientWidth;
          const h = Math.max(320, Math.floor(w*0.56));
          renderer.setSize(w, h, false);
          camera.aspect = w/h;
          camera.updateProjectionMatrix();
        }
      });
      ro.observe(container);

      const obj = { renderer, scene, camera, controls, arrows, raf:null as number|null, ro };
      threeObjs.current = obj;

      const animate = ()=>{
        if (!threeObjs.current) return;
        threeObjs.current.controls.update();
        threeObjs.current.renderer.render(scene, camera);
        obj.raf = requestAnimationFrame(animate);
      };
      animate();

      await rebuild3D();
    })();

    return ()=>{
      mounted=false;
      const obj = threeObjs.current;
      if (!obj) return;
      if (obj.raf!=null) cancelAnimationFrame(obj.raf);
      try{ obj.ro?.disconnect(); }catch{}
      for(const a of obj.arrows){
        try{
          if (a.material) a.material.dispose?.();
          if (a.geometry) a.geometry.dispose?.();
          obj.scene.remove(a);
        }catch{}
      }
      obj.arrows.length = 0;
      try{
        obj.renderer.dispose?.();
        obj.renderer.forceContextLoss?.();
        obj.renderer.domElement?.remove?.();
      }catch{}
      threeObjs.current = null;
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [s.dim]);

  // 3Dオブジェクト再構築
  const rebuild3D = useCallback(async ()=>{
    if(s.dim!=='3d' || !threeObjs.current) return;
    await ensureThree();
    const { scene, arrows } = threeObjs.current;
    for(const a of arrows){ scene.remove(a); }
    arrows.length = 0;

    const mkArrow = (origin:V3, dir:V3, color:number)=>{
      const v = new THREE.Vector3(dir.x, dir.y, dir.z);
      const L = v.length();
      if (L < 1e-9) return null;
      v.normalize();
      const arrow = new THREE.ArrowHelper(v, new THREE.Vector3(origin.x,origin.y,origin.z), L, color, 0.25, 0.15);
      scene.add(arrow);
      arrows.push(arrow);
      return { arrow, length: L, dir: v, origin: new THREE.Vector3(origin.x,origin.y,origin.z) };
    };

    const makeTextSprite = (text:string, color='#111827', bg='rgba(255,255,255,0.85)')=>{
      const pad = 6;
      const font = '12px -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Helvetica, Arial';
      const c = document.createElement('canvas');
      const ctx = c.getContext('2d')!;
      ctx.font = font;
      const tw = Math.ceil(ctx.measureText(text).width);
      const th = 16;
      c.width = tw + pad*2;
      c.height = th + pad*2;
      ctx.font = font;
      ctx.fillStyle = bg;
      ctx.fillRect(0,0,c.width,c.height);
      ctx.fillStyle = color;
      ctx.textBaseline = 'middle';
      ctx.fillText(text, pad, c.height/2);
      const tex = new THREE.CanvasTexture(c);
      tex.needsUpdate = true;
      const mat = new THREE.SpriteMaterial({ map: tex, transparent: true });
      const sp = new THREE.Sprite(mat);
      const s = 0.8;
      sp.scale.set((c.width/100)*s, (c.height/100)*s, 1);
      return sp;
    };
    const addLabel = (text:string, pos:{x:number;y:number;z:number}, color='#111827')=>{
      const sp = makeTextSprite(text, color);
      sp.position.set(pos.x, pos.y, pos.z);
      scene.add(sp);
      arrows.push(sp);
      return sp;
    };

    const { u3, v3, alpha3, beta3, showPlane3D, showNormal3D } = s;
    const lin = add3(mul3(alpha3,u3), mul3(beta3,v3));
    const crs = cross3(u3,v3);

    const au = mkArrow({x:0,y:0,z:0}, u3, 0x0ea5e9);
    const av = mkArrow({x:0,y:0,z:0}, v3, 0x22c55e);
    const al = mkArrow({x:0,y:0,z:0}, lin, 0x111827);
    let ac:any = null;
    if (showNormal3D && len3(crs)>1e-9){
      ac = mkArrow({x:0,y:0,z:0}, crs, (crs.z>=0)?0xf97316:0xef4444);
    }

    // plane: O, u, u+v, v の半透明メッシュ
    if (showPlane3D){
      const g = new THREE.BufferGeometry();
      const p0 = new THREE.Vector3(0,0,0);
      const p1 = new THREE.Vector3(u3.x,u3.y,u3.z);
      const p2 = new THREE.Vector3(u3.x+v3.x,u3.y+v3.y,u3.z+v3.z);
      const p3 = new THREE.Vector3(v3.x,v3.y,v3.z);
      const verts = new Float32Array([
        p0.x,p0.y,p0.z,  p1.x,p1.y,p1.z,  p2.x,p2.y,p2.z,
        p0.x,p0.y,p0.z,  p2.x,p2.y,p2.z,  p3.x,p3.y,p3.z,
      ]);
      g.setAttribute('position', new THREE.BufferAttribute(verts, 3));
      g.computeVertexNormals();
      const m = new THREE.MeshBasicMaterial({ color: 0x60a5fa, transparent: true, opacity: 0.15, side: THREE.DoubleSide });
      const mesh = new THREE.Mesh(g,m);
      scene.add(mesh);
      arrows.push(mesh);
    }

    // 軸ラベル
    addLabel('x', {x: 3.2, y: 0.0, z: 0.0}, '#64748b');
    addLabel('y', {x: 0.0, y: 3.2, z: 0.0}, '#64748b');
    addLabel('z', {x: 0.0, y: 0.0, z: 3.2}, '#64748b');

    const shift = new THREE.Vector3(0, 0.12, 0);
    const tipLabel = (h:any, name:string, color:string)=>{
      if (!h) return;
      const tip = h.origin.clone().add(h.dir.clone().multiplyScalar(h.length)).add(shift);
      addLabel(name, {x: tip.x, y: tip.y, z: tip.z}, color);
    };
    tipLabel(au, 'u',    '#0ea5e9');
    tipLabel(av, 'v',    '#22c55e');
    tipLabel(al, 'αu+βv','#111827');
    if (ac) tipLabel(ac, 'u×v', (crs.z>=0)?'#f97316':'#ef4444');
  }, [s]);

  useEffect(()=>{ if(s.dim==='3d'){ rebuild3D(); } }, [rebuild3D, s.dim]);

  /* ====================== Stepper ====================== */
  return (
    <StepperBase<UIState>
      key={s.dim}
      title="ベクトル（2D / 3D 切替）"
      state={s}
      setState={set}
      renderControls={()=>(
        <div className="space-y-3">
          {/* 次元切替 */}
          <div className="flex flex-wrap gap-2">
            <button className={`px-3 py-1 rounded border ${s.dim==='2d'?'bg-gray-900 text-white':'bg-white'}`} onClick={()=>set({dim:'2d'})}>2D</button>
            <button className={`px-3 py-1 rounded border ${s.dim==='3d'?'bg-gray-900 text-white':'bg-white'}`} onClick={()=>set({dim:'3d'})}>3D</button>
          </div>

          {/* モード & 入力 */}
          {s.dim==='2d' ? (
            <>
              <div className="flex flex-wrap gap-2">
                {(['projection','decompose','dotangle','sumdiff','scalar'] as const).map(m=>(
                  <button key={m} className={`px-3 py-1 rounded border ${s.mode2d===m?'bg-gray-900 text-white':'bg-white'}`} onClick={()=>set({mode2d:m})}>
                    {m==='projection'?'射影':m==='decompose'?'直交分解':m==='dotangle'?'内積・角度':m==='sumdiff'?'和・差':'一次結合'}
                  </button>
                ))}
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                <label className="text-sm"><span className="block mb-1 text-gray-600">uₓ</span><NumInput value={s.u2.x} onChange={(x)=>set({u2:{...s.u2,x}})}/></label>
                <label className="text-sm"><span className="block mb-1 text-gray-600">uᵧ</span><NumInput value={s.u2.y} onChange={(y)=>set({u2:{...s.u2,y}})}/></label>
                <label className="text-sm"><span className="block mb-1 text-gray-600">vₓ</span><NumInput value={s.v2.x} onChange={(x)=>set({v2:{...s.v2,x}})}/></label>
                <label className="text-sm"><span className="block mb-1 text-gray-600">vᵧ</span><NumInput value={s.v2.y} onChange={(y)=>set({v2:{...s.v2,y}})}/></label>
                {s.mode2d==='scalar' && (
                  <>
                    <label className="text-sm"><span className="block mb-1 text-gray-600">α</span><NumInput value={s.alpha2} onChange={(alpha2)=>set({alpha2})}/></label>
                    <label className="text-sm"><span className="block mb-1 text-gray-600">β</span><NumInput value={s.beta2} onChange={(beta2)=>set({beta2})}/></label>
                  </>
                )}
              </div>
              {/* 2D 表示オプション */}
              <div className="flex flex-wrap gap-4 items-center">
                <label className="text-sm flex items-center gap-2">
                  <input type="checkbox" checked={s.showLabels2D} onChange={e=>set({showLabels2D:e.target.checked})}/>
                  <span>ラベル表示（u, v, αu+βv）</span>
                </label>
                <label className="text-sm flex items-center gap-2">
                  <input type="checkbox" checked={s.showParallelogram2D} onChange={e=>set({showParallelogram2D:e.target.checked})}/>
                  <span>平行四辺形を塗る（scalar時）</span>
                </label>
              </div>
            </>
          ) : (
            <>
              <div className="flex flex-wrap gap-2">
                {(['dotangle','cross','sumdiff','scalar'] as const).map(m=>(
                  <button key={m} className={`px-3 py-1 rounded border ${s.mode3d===m?'bg-gray-900 text-white':'bg-white'}`} onClick={()=>set({mode3d:m})}>
                    {m==='dotangle'?'内積・角度':m==='cross'?'外積':m==='sumdiff'?'和・差':'一次結合'}
                  </button>
                ))}
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-6 gap-3">
                <label className="text-sm"><span className="block mb-1 text-gray-600">uₓ</span><NumInput value={s.u3.x} onChange={(x)=>set({u3:{...s.u3,x}})}/></label>
                <label className="text-sm"><span className="block mb-1 text-gray-600">uᵧ</span><NumInput value={s.u3.y} onChange={(y)=>set({u3:{...s.u3,y}})}/></label>
                <label className="text-sm"><span className="block mb-1 text-gray-600">u_z</span><NumInput value={s.u3.z} onChange={(z)=>set({u3:{...s.u3,z}})}/></label>
                <label className="text-sm"><span className="block mb-1 text-gray-600">vₓ</span><NumInput value={s.v3.x} onChange={(x)=>set({v3:{...s.v3,x}})}/></label>
                <label className="text-sm"><span className="block mb-1 text-gray-600">vᵧ</span><NumInput value={s.v3.y} onChange={(y)=>set({v3:{...s.v3,y}})}/></label>
                <label className="text-sm"><span className="block mb-1 text-gray-600">v_z</span><NumInput value={s.v3.z} onChange={(z)=>set({v3:{...s.v3,z}})}/></label>
                {s.mode3d==='scalar' && (
                  <>
                    <label className="text-sm"><span className="block mb-1 text-gray-600">α</span><NumInput value={s.alpha3} onChange={(alpha3)=>set({alpha3})}/></label>
                    <label className="text-sm"><span className="block mb-1 text-gray-600">β</span><NumInput value={s.beta3} onChange={(beta3)=>set({beta3})}/></label>
                  </>
                )}
              </div>
              {/* 3D 表示オプション */}
              <div className="flex flex-wrap gap-4 items-center">
                <label className="text-sm flex items-center gap-2">
                  <input type="checkbox" checked={s.showPlane3D} onChange={e=>set({showPlane3D:e.target.checked})}/>
                  <span>投影平面（span(u,v)）</span>
                </label>
                <label className="text-sm flex items-center gap-2">
                  <input type="checkbox" checked={s.showNormal3D} onChange={e=>set({showNormal3D:e.target.checked})}/>
                  <span>面法線（u×v）</span>
                </label>
              </div>
            </>
          )}
        </div>
      )}
      /* Three.js 埋め込み領域 */
      renderGraph={s.dim==='3d' ? (()=>(
        <div ref={threeRef} className="w-full h-full" />
      )) : undefined}
      renderFormulas={()=>{
        if (s.dim==='2d'){
          const L=len2(s.u2), M=len2(s.v2), d=dot2(s.u2,s.v2);
          const cos=(L>0&&M>0)?(d/(L*M)):NaN;
          const theta=Number.isFinite(cos)?Math.acos(clamp(cos,-1,1)):NaN;
          const deg=Number.isFinite(theta)?(theta*180/Math.PI).toFixed(2):'—';
          const proj=projOn2(s.u2,s.v2), rej=rejOn2(s.u2,s.v2);
          const sum=add2(s.u2,s.v2), dif=sub2(s.u2,s.v2);
          const lin=add2(mul2(s.alpha2,s.u2), mul2(s.beta2,s.v2));
          return (
            <div className="space-y-3">
              <KaTeXBlock tex={String.raw`\vec{u}=${texVec2(s.u2)}\ ,\ \vec{v}=${texVec2(s.v2)}`} />
              {s.mode2d==='projection' && (<>
                <div className="text-sm text-gray-500">射影</div>
                <KaTeXBlock tex={String.raw`\mathrm{proj}_{\vec{v}}\vec{u}=\dfrac{\vec{u}\cdot\vec{v}}{\|\vec{v}\|^2}\,\vec{v}\ =\ ${texVec2(proj)}`}/>
              </>)}
              {s.mode2d==='decompose' && (<>
                <div className="text-sm text-gray-500">直交分解</div>
                <KaTeXBlock tex={String.raw`\vec{u}=\mathrm{proj}_{\vec{v}}\vec{u}+(\vec{u}-\mathrm{proj}_{\vec{v}}\vec{u})\ ,\ \ \vec{u}-\mathrm{proj}_{\vec{v}}\vec{u}=${texVec2(rej)}`}/>
              </>)}
              {s.mode2d==='dotangle' && (<>
                <div className="text-sm text-gray-500">内積・角度</div>
                <KaTeXBlock tex={String.raw`\vec{u}\cdot\vec{v}=${texNum(d)}\ ,\ \theta\approx${deg}^\circ`}/>
              </>)}
              {s.mode2d==='sumdiff' && (<>
                <div className="text-sm text-gray-500">和・差</div>
                <KaTeXBlock tex={String.raw`\vec{u}+\vec{v}=${texVec2(sum)}\ ,\ \vec{u}-\vec{v}=${texVec2(dif)}`}/>
              </>)}
              {s.mode2d==='scalar' && (<>
                <div className="text-sm text-gray-500">一次結合（現在値）</div>
                <KaTeXBlock tex={String.raw`\alpha=${texNum(s.alpha2)},\ \beta=${texNum(s.beta2)}\quad\Rightarrow\quad \alpha\vec{u}+\beta\vec{v}=${texVec2(lin)}`} />
              </>)}
            </div>
          );
        } else {
          const d=dot3(s.u3,s.v3); const L=len3(s.u3), M=len3(s.v3);
          const cos=(L>0&&M>0)?(d/(L*M)):NaN;
          const theta=Number.isFinite(cos)?Math.acos(clamp(cos,-1,1)):NaN;
          const deg=Number.isFinite(theta)?(theta*180/Math.PI).toFixed(2):'—';
          const sum=add3(s.u3,s.v3), dif=sub3(s.u3,s.v3);
          const lin=add3(mul3(s.alpha3,s.u3), mul3(s.beta3,s.v3));
          const crs=cross3(s.u3,s.v3);
          return (
            <div className="space-y-3">
              <KaTeXBlock tex={String.raw`\vec{u}=${texVec3(s.u3)}\ ,\ \vec{v}=${texVec3(s.v3)}`} />
              {s.mode3d==='dotangle'&&(<>
                <div className="text-sm text-gray-500">内積・角度（3D）</div>
                <KaTeXBlock tex={String.raw`\vec{u}\cdot\vec{v}=${texNum(d)}\ ,\ \theta\approx${deg}^\circ`}/>
              </>)}
              {s.mode3d==='cross'&&(<>
                <div className="text-sm text-gray-500">外積</div>
                <KaTeXBlock tex={String.raw`\vec{u}\times\vec{v}=${texVec3(crs)}\ ,\ \|\vec{u}\times\vec{v}\|=${texNum(len3(crs))}`}/>
              </>)}
              {s.mode3d==='sumdiff'&&(<>
                <div className="text-sm text-gray-500">和・差（3D）</div>
                <KaTeXBlock tex={String.raw`\vec{u}+\vec{v}=${texVec3(sum)}\ ,\ \vec{u}-\vec{v}=${texVec3(dif)}`}/>
              </>)}
              {s.mode3d==='scalar'&&(<>
                <div className="text-sm text-gray-500">一次結合（3D）</div>
                <KaTeXBlock tex={String.raw`\alpha=${texNum(s.alpha3)},\ \beta=${texNum(s.beta3)}\quad\Rightarrow\quad \alpha\vec{u}+\beta\vec{v}=${texVec3(lin)}`}/>
              </>)}
            </div>
          );
        }
      }}
      draw={(_brd, st, ctx)=>{
        if (st.dim==='3d'){
          return { xs: [-1,1], ys: [-1,1] };
        }

        // ===== 2D JXG描画 =====
        const arrow = (A:[number,number], B:[number,number], color:string, thick=2)=>{
          const seg = ctx.create('segment', [A,B], { strokeColor:color, strokeWidth:thick, linecap:'round', highlight:false, fixed:true, layer:4 });
          const dx=B[0]-A[0], dy=B[1]-A[1], L=Math.hypot(dx,dy)||1;
          const ux=dx/L, uy=dy/L; const headL=Math.min(0.18,0.08*L), headW=headL*0.45;
          const left:[number,number]=[B[0]-ux*headL+uy*headW, B[1]-uy*headL-ux*headW];
          const right:[number,number]=[B[0]-ux*headL-uy*headW, B[1]-uy*headL+ux*headW];
          ctx.create('segment',[B,left],{ strokeColor:color, strokeWidth:thick, fixed:true, highlight:false, layer:4 });
          ctx.create('segment',[B,right],{ strokeColor:color, strokeWidth:thick, fixed:true, highlight:false, layer:4 });
          ctx.add(seg);
        };
        const label = (P:[number,number], text:string, color='#111')=>{
          return ctx.create('text',[P[0],P[1],text],{ anchorX:'left', anchorY:'bottom', fontSize:11, strokeColor:color, highlight:false, layer:6, fixed:true, cssClass:'select-none' });
        };

        const xs:number[]=[0,st.u2.x,st.v2.x], ys:number[]=[0,st.u2.y,st.v2.y];
        const O:[number,number]=[0,0];
        const lin=add2(mul2(st.alpha2,st.u2), mul2(st.beta2,st.v2));

        // 平行四辺形（scalar の時のみ & オプションON）
        if (st.mode2d==='scalar' && st.showParallelogram2D){
          const U:[number,number]=[st.u2.x,st.u2.y];
          const V:[number,number]=[st.v2.x,st.v2.y];
          const UV:[number,number]=[U[0]+V[0], U[1]+V[1]];
          const poly = ctx.create('polygon', [O, U, UV, V], {
            borders:{ strokeColor:'#94a3b8', strokeWidth:1, highlight:false },
            fillColor:'#60a5fa', fillOpacity:0.12, highlight:false, fixed:true, layer:2,
            vertices: { visible:false, size:0, strokeOpacity:0, fillOpacity:0, fixed:true, highlight:false }
          });
          ctx.add(poly);
          xs.push(U[0],V[0],UV[0]); ys.push(U[1],V[1],UV[1]);
        }

        // 矢印
        arrow(O,[st.u2.x,st.u2.y],'#0ea5e9',2);
        arrow(O,[st.v2.x,st.v2.y],'#22c55e',2);

        if (st.mode2d==='projection' || st.mode2d==='decompose'){
          const p = projOn2(st.u2,st.v2);
          arrow(O,[p.x,p.y],'#f59e0b',2);
          arrow([p.x,p.y],[st.u2.x,st.u2.y],'#f59e0b',1.4);
          xs.push(p.x); ys.push(p.y);
          if (st.showLabels2D){
            label([st.u2.x,st.u2.y],'u','#0ea5e9');
            label([st.v2.x,st.v2.y],'v','#22c55e');
            label([p.x,p.y],'proj','#f59e0b');
          }
        }

        if (st.mode2d==='sumdiff'){
          const S = add2(st.u2,st.v2), D = sub2(st.u2,st.v2);
          arrow(O,[S.x,S.y],'#9333ea',2);
          arrow(O,[D.x,D.y],'#ef4444',2);
          xs.push(S.x,D.x); ys.push(S.y,D.y);
          if (st.showLabels2D){
            label([st.u2.x,st.u2.y],'u','#0ea5e9');
            label([st.v2.x,st.v2.y],'v','#22c55e');
            label([S.x,S.y],'u+v','#9333ea');
            label([D.x,D.y],'u−v','#ef4444');
          }
        }

        if (st.mode2d==='scalar'){
          arrow(O,[lin.x,lin.y],'#111827',2);
          xs.push(lin.x); ys.push(lin.y);
          if (st.showLabels2D){
            label([st.u2.x,st.u2.y],'u','#0ea5e9');
            label([st.v2.x,st.v2.y],'v','#22c55e');
            label([lin.x,lin.y],'αu+βv','#111827');
          }
        }

        if (st.mode2d==='dotangle' && st.showLabels2D){
          label([st.u2.x,st.u2.y],'u','#0ea5e9');
          label([st.v2.x,st.v2.y],'v','#22c55e');
        }

        return { xs, ys } as DrawResult;
      }}
    />
  );
}
