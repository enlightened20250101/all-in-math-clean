// src/components/animations/TrigUnitCircleStepper.tsx
'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import KaTeXBlock from '@/components/math/KaTeXBlock';
import NumInput from '@/components/ui/NumInput';
import { normalizeTeXSigns } from '@/lib/tex/format';

const JXG = typeof window !== 'undefined' ? require('jsxgraph') : null;

/* ------------------ 小ヘルパ ------------------ */

// 連分数で有理近似（分母上限 maxDen）
function approxRational(x: number, maxDen = 64) {
  const sign = Math.sign(x);
  x = Math.abs(x);
  let h1 = 1, h0 = 0, k1 = 0, k0 = 1, b = x;
  for (let i = 0; i < 40; i++) {
    const a = Math.floor(b);
    const h2 = a * h1 + h0, k2 = a * k1 + k0;
    if (k2 > maxDen) break;
    h0 = h1; h1 = h2; k0 = k1; k1 = k2;
    const frac = b - a;
    if (frac < 1e-12) break;
    b = 1 / frac;
  }
  return { k: sign * h1, n: k1 };
}

// θ→「kπ/n」文字列（±1省略）。maxDen で近似の粒度を切替
function formatAnglePiWithMax(thetaRad: number, maxDen: number): string {
  const { k, n } = approxRational(thetaRad / Math.PI, maxDen);
  if (k === 0) return '0';
  const sgn = k < 0 ? '-' : '';
  const kk = Math.abs(k);
  if (n === 1) return kk === 1 ? `${sgn}\\pi` : `${sgn}${kk}\\pi`;
  return kk === 1 ? `${sgn}\\pi/${n}` : `${sgn}${kk}\\pi/${n}`;
}
// 表示用（見やすさ重視）… π/12 まで
const formatAnglePiPretty = (thetaRad: number) => formatAnglePiWithMax(thetaRad, 12);
// 入力欄用（できるだけ忠実）… 分母 360 まで
const formatAnglePiExact = (thetaRad: number) => formatAnglePiWithMax(thetaRad, 360);

// π式の入力（"pi/3","3pi/4","-2pi","π/3" 等）→ 数値(rad)
function parsePiExpr(input: string): number | null {
  let s = input.trim().toLowerCase();
  // 空白除去 & 代表表記へ正規化
  s = s.replace(/\s+/g, '');
  // TeXの \pi、Unicodeの π、そして 2*pi/3 のような形式も "2pi/3" に正規化
  s = s.replace(/\\pi/gi, 'pi').replace(/π/gi, 'pi').replace(/\*/g, '');
  if (s === '' || s === '0') return 0;
  if (s === 'pi') return Math.PI;
  // [sign][coef]pi[/den]  （coef は省略で1）
  const m = s.match(/^([+-]?)(?:(\d+))?pi(?:\/(\d+))?$/);
  if (!m) return null;
  const sign = m[1] === '-' ? -1 : 1;
  const num = m[2] ? parseInt(m[2], 10) : 1;
  const den = m[3] ? parseInt(m[3], 10) : 1;
  if (!Number.isFinite(den) || den <= 0) return null;
  return sign * (num * Math.PI) / den;
}

// 厳密な sin/cos/tan （kπ/12：k=0..23）
const SIN_12 = [
  '0','\\dfrac{\\sqrt{6}-\\sqrt{2}}{4}','\\dfrac{1}{2}','\\dfrac{\\sqrt{2}}{2}','\\dfrac{\\sqrt{3}}{2}','\\dfrac{\\sqrt{6}+\\sqrt{2}}{4}','1',
  '\\dfrac{\\sqrt{6}+\\sqrt{2}}{4}','\\dfrac{\\sqrt{3}}{2}','\\dfrac{\\sqrt{2}}{2}','\\dfrac{1}{2}','\\dfrac{\\sqrt{6}-\\sqrt{2}}{4}',
  '0','-\\dfrac{\\sqrt{6}-\\sqrt{2}}{4}','-\\dfrac{1}{2}','-\\dfrac{\\sqrt{2}}{2}','-\\dfrac{\\sqrt{3}}{2}','-\\dfrac{\\sqrt{6}+\\sqrt{2}}{4}','-1',
  '-\\dfrac{\\sqrt{6}+\\sqrt{2}}{4}','-\\dfrac{\\sqrt{3}}{2}','-\\dfrac{\\sqrt{2}}{2}','-\\dfrac{1}{2}','-\\dfrac{\\sqrt{6}-\\sqrt{2}}{4}',
];
const COS_12 = [
  '1','\\dfrac{\\sqrt{6}+\\sqrt{2}}{4}','\\dfrac{\\sqrt{3}}{2}','\\dfrac{\\sqrt{2}}{2}','\\dfrac{1}{2}','\\dfrac{\\sqrt{6}-\\sqrt{2}}{4}','0',
  '-\\dfrac{\\sqrt{6}-\\sqrt{2}}{4}','-\\dfrac{1}{2}','-\\dfrac{\\sqrt{2}}{2}','-\\dfrac{\\sqrt{3}}{2}','-\\dfrac{\\sqrt{6}+\\sqrt{2}}{4}',
  '-1','-\\dfrac{\\sqrt{6}+\\sqrt{2}}{4}','-\\dfrac{\\sqrt{3}}{2}','-\\dfrac{\\sqrt{2}}{2}','-\\dfrac{1}{2}','-\\dfrac{\\sqrt{6}-\\sqrt{2}}{4}','0',
  '\\dfrac{\\sqrt{6}-\\sqrt{2}}{4}','\\dfrac{1}{2}','\\dfrac{\\sqrt{2}}{2}','\\dfrac{\\sqrt{3}}{2}','\\dfrac{\\sqrt{6}+\\sqrt{2}}{4}',
];
const TAN_12 = [
  '0','2-\\sqrt{3}','\\dfrac{\\sqrt{3}}{3}','1','\\sqrt{3}','2+\\sqrt{3}','\\text{未定義}',
  '-(2+\\sqrt{3})','-\\sqrt{3}','-1','-\\dfrac{\\sqrt{3}}{3}','-(2-\\sqrt{3})',
  '0','2-\\sqrt{3}','\\dfrac{\\sqrt{3}}{3}','1','\\sqrt{3}','2+\\sqrt{3}','\\text{未定義}',
  '-(2+\\sqrt{3})','-\\sqrt{3}','-1','-\\dfrac{\\sqrt{3}}{3}','-(2-\\sqrt{3})',
];

function exactSinCosTan(theta: number): { sin?: string; cos?: string; tan?: string } {
  const { k, n } = approxRational(theta / Math.PI, 12);
  const err = Math.abs(theta - (k * Math.PI) / n);
  if (err > 1e-6) return {};
  const idx = ( (k * (12 / n)) % 24 + 24 ) % 24;
  return { sin: SIN_12[idx], cos: COS_12[idx], tan: TAN_12[idx] };
}

/* ------------------ メイン ------------------ */

export default function TrigUnitCircleStepper() {
  // θ（内部はラジアン）
  const [theta, setTheta] = useState<number>(Math.PI / 4);
  // 入力モード：度 or ラジアン（π表記）
  const [angleMode, setAngleMode] = useState<'deg'|'rad'>('rad');
  const [radText, setRadText] = useState<string>('pi/4');
  const [radEditing, setRadEditing] = useState<boolean>(false);

  const [step, setStep] = useState(0);
  const [showTriangle, setShowTriangle] = useState(true);
  const [showProjections, setShowProjections] = useState(true);
  const [showTangent, setShowTangent] = useState(true);

  // 角度表示（π表記＋度数法）
  const angleDisplay = useMemo(() => {
    const angleTexPi = formatAnglePiPretty(theta);
    const deg = Math.round((theta * 180 / Math.PI) * 100) / 100;
    return {
      pi: normalizeTeXSigns(String.raw`\theta = ${angleTexPi}`),
      deg: normalizeTeXSigns(String.raw`\theta \approx ${deg}^\circ`)
    };
  }, [theta]);

  // sin/cos/tan の表示（π/12 刻みは √ で厳密）
  const trigText = useMemo(() => {
    const { sin, cos, tan } = exactSinCosTan(theta);
    const s = Math.sin(theta), c = Math.cos(theta);
    const tDef = Math.abs(c) > 1e-12;
    const sTex = sin ?? `${Math.round(s*1000)/1000}`;
    const cTex = cos ?? `${Math.round(c*1000)/1000}`;
    const tTex = tan ?? (tDef ? `${Math.round((s/c)*1000)/1000}` : '\\text{未定義}');
    const angleTex = formatAnglePiPretty(theta);
    return {
      sin: normalizeTeXSigns(String.raw`\sin\theta = \sin\!\left(${angleTex}\right) = ${sTex}`),
      cos: normalizeTeXSigns(String.raw`\cos\theta = \cos\!\left(${angleTex}\right) = ${cTex}`),
      tan: normalizeTeXSigns(String.raw`\tan\theta = \tan\!\left(${angleTex}\right) = ${tTex}`),
      tanDefined: tDef
    };
  }, [theta]);

  /* --------- JSXGraph --------- */
  const boardRef = useRef<any>(null);
  const objsRef  = useRef<any>({});

  // 初期化は初回のみ
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const el = document.getElementById('trig-unit-board');
    if (!el) return;

    let brd = boardRef.current;
    if (!brd) {
      brd = JXG.JSXGraph.initBoard('trig-unit-board', {
        boundingbox: [-1.6, 1.6, 1.6, -1.6],
        axis: true, showNavigation: false, keepaspectratio: true,
      });
      boardRef.current = brd;

      const O = brd.create('point', [0,0], {name:'O', size:1, fixed:true, visible:false});
      brd.create('circle', [O, 1], { strokeColor:'#111' });

      // P（円上）
      const P = brd.create('point', [Math.cos(theta), Math.sin(theta)], { name:'P', size:3, strokeColor:'#06c', fillColor:'#06c' });

      // H（射影）と三角形の3辺
      const H = brd.create('point', [()=>P.X(), 0], { name:'H', size:2, strokeColor:'#aaa', fillColor:'#fff' });
      const segOH = brd.create('segment', [O, H], { strokeColor:'#999' });
      const segPH = brd.create('segment', [P, H], { strokeColor:'#06c' });
      const segOP = brd.create('segment', [O, P], { strokeColor:'#333' });

      // 接線 x=1 と T（固定作成 → 以後は毎回 moveTo で完全連動）
      const tanLine = brd.create('line', [[1,-2],[1,2]], { strokeColor:'#c00', dash:2 });
      const T = brd.create('point', [1, 1], { name:'T', size:3, strokeColor:'#c00', fillColor:'#c00' });

      // 角度弧
      brd.create('arc', [O, [1,0], P], { strokeColor:'#0a0' });

      // Pドラッグ → θ更新（円周拘束）
      P.on('drag', () => {
        const x = P.X(), y = P.Y();
        const r = Math.hypot(x, y) || 1;
        const nx = x / r, ny = y / r;
        P.moveTo([nx, ny], 0);
        setTheta(Math.atan2(ny, nx));
      });

      objsRef.current = { P, H, segOH, segPH, segOP, tanLine, T };
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 表示・座標の更新（T は毎回 moveTo で θ に完全連動）
  useEffect(() => {
    if (!boardRef.current) return;
    const c = Math.cos(theta);
    const tDef = Math.abs(c) > 1e-12;

    const { P, H, segOH, segPH, segOP, tanLine, T } = objsRef.current;

    // P を θ に同期
    P.moveTo([Math.cos(theta), Math.sin(theta)], 0);

    segOH.setAttribute({ visible: showTriangle });
    segPH.setAttribute({ visible: showTriangle });
    segOP.setAttribute({ visible: showTriangle });
    H.setAttribute({ visible: showProjections });

    tanLine.setAttribute({ visible: showTangent });
    if (showTangent && tDef) {
      T.setAttribute({ visible: true });
      T.moveTo([1, Math.tan(theta)], 0);
    } else {
      T.setAttribute({ visible: false });
    }

    boardRef.current.update();
  }, [theta, showTriangle, showProjections, showTangent]);

  /* --------- 角度 入出力 --------- */

  // θ→入力欄（π表記）に同期（編集中は上書きしない）
  useEffect(() => {
    if (!radEditing) {
      setRadText(formatAnglePiExact(theta).replace(/\\\\/g,'\\'));
    }
  }, [theta, radEditing]);

  const onChangeDeg = (v: number) => setTheta((v * Math.PI) / 180);
  const onChangeRadText = (s: string) => { setRadEditing(true); setRadText(s); };
  const commitRadText = () => {
    const val = parsePiExpr(radText);
    if (val !== null) setTheta(val);
    setRadEditing(false);
  };

  return (
    <div className="space-y-6">
      {/* Algebra */}
      <div className="rounded-xl border p-4 bg-white">
        <div className="flex items-center justify-between mb-2 text-sm text-gray-500">
          <div>ステップ {step + 1}/3 — {['定義と点P','三角比（値）','恒等式と符号'][step]}</div>
          <div className="flex gap-2">
            <button className="px-3 py-1 rounded-lg border" onClick={()=>setStep(s=>Math.max(0,s-1))}>戻る</button>
            <button className="px-3 py-1 rounded-lg border" onClick={()=>setStep(s=>Math.min(2,s+1))}>次へ</button>
          </div>
        </div>
        <div className="relative overflow-hidden rounded-xl border bg-white p-6 min-h-[180px]">
          {[0,1,2].map(i => (
            <div key={i} className={`absolute inset-0 transition-all duration-500 ${step===i?'opacity-100':'opacity-0'}`}>
              {i===0 && (
                <>
                  <KaTeXBlock tex={normalizeTeXSigns(String.raw`\text{単位円: }x^2+y^2=1,\ \ P(\cos\theta,\ \sin\theta)`)} />
                  <div className="mt-2 flex gap-4 justify-center">
                    <KaTeXBlock tex={angleDisplay.pi} />
                    <KaTeXBlock tex={angleDisplay.deg} />
                  </div>
                </>
              )}
              {i===1 && (
                <>
                  <KaTeXBlock tex={trigText.sin} />
                  <KaTeXBlock tex={trigText.cos} />
                  <KaTeXBlock tex={trigText.tan} />
                </>
              )}
              {i===2 && (
                <div className="space-y-2">
                  <KaTeXBlock tex={normalizeTeXSigns(String.raw`\sin^2\theta+\cos^2\theta=1`)} />
                  <KaTeXBlock tex={normalizeTeXSigns(String.raw`\text{第I象限: }\sin\theta>0,\ \cos\theta>0\quad \text{第II象限: }\sin\theta>0,\ \cos\theta<0`)} />
                  <KaTeXBlock tex={normalizeTeXSigns(String.raw`\text{第III象限: }\sin\theta<0,\ \cos\theta<0\quad \text{第IV象限: }\sin\theta<0,\ \cos\theta>0`)} />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Graph */}
      <div className="rounded-xl border p-4 bg白">
        <div className="text-sm text-gray-600 mb-2">単位円（P は円周上のみドラッグ可）・接線 x=1 と T(1,\tan\theta) は連動</div>
        <div id="trig-unit-board" className="w-full aspect-square rounded-xl border bg-white" />
      </div>

      {/* Controls */}
      <div className="rounded-xl border p-4 bg-white grid md:grid-cols-6 gap-3">
        <label className="text-sm col-span-2">角度入力モード
          <select
            className="mt-1 w-full rounded-xl border p-2"
            value={angleMode}
            onChange={e=>setAngleMode(e.target.value as any)}
          >
            <option value="rad">ラジアン（π表記）</option>
            <option value="deg">度数法</option>
          </select>
        </label>

        {angleMode === 'deg' ? (
          <label className="text-sm col-span-2">θ [deg]
            <NumInput value={Math.round(theta*180/Math.PI*100)/100} onChange={onChangeDeg} />
          </label>
        ) : (
          <label className="text-sm col-span-2">θ [rad, π表記のみ]
            <input
              className="mt-1 w-full rounded-xl border p-2"
              value={radEditing ? radText : formatAnglePiExact(theta).replace(/\\\\/g,'\\')}
              onChange={e=>onChangeRadText(e.target.value)}
              onBlur={commitRadText}
              onKeyDown={e=>{ if (e.key==='Enter') commitRadText(); }}
              placeholder="例: pi/3, 3pi/4, -2pi, π/6"
            />
            <div className="mt-1 text-xs text-gray-500">
                入力例: <code>pi/3</code>, <code>3pi/4</code>, <code>-2pi</code>, <code>\pi/6</code>, <code>2*pi/3</code>（小数radは非推奨）
            </div>
          </label>
        )}

        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={showTriangle} onChange={e=>setShowTriangle(e.target.checked)} />
          直角三角形（OH・PH・OP）を表示
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={showProjections} onChange={e=>setShowProjections(e.target.checked)} />
          射影点（H）を表示
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={showTangent} onChange={e=>setShowTangent(e.target.checked)} />
          接線（x=1）と T を表示（tan）
        </label>
      </div>

      <div className="text-xs text-gray-500">
        ※ 角度は「度」または「π表記のラジアン」で入力できます（小数radは非推奨）。<br/>
        ※ sin/cos/tan は 15°刻み（π/12）等は √ で厳密表示し、それ以外は小数表示します。<br/>
        ※ T は常に P に連動し、T(1, \tan\theta) に移動します。<br/>
        ※ 三角形は OH（隣辺）/PH（対辺）/OP（斜辺）を表示します。
      </div>
    </div>
  );
}
