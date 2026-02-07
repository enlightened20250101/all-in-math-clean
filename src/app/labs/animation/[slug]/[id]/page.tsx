// src/app/labs/animation/[slug]/[id]/page.tsx
'use client';
import { useMemo, useState } from 'react';
import { useParams } from 'next/navigation';
import { CATEGORIES } from '@/data/animation_catalog';
import dynamic from 'next/dynamic';
import AlgebraStepper from '@/components/animations/AlgebraStepper';
import SquareCompleteStepper from '@/components/animations/SquareCompleteStepper';
import SystemSolveStepper from '@/components/animations/SystemSolveStepper';
import { useNarration } from '@/hooks/useNarration';

const CircumcenterBoard = dynamic(()=>import('@/components/graphs/CircumcenterBoard'), { ssr:false });
const CentroidBoard = dynamic(()=>import('@/components/graphs/CentroidBoard'), { ssr:false });
const IncenterBoard = dynamic(()=>import('@/components/graphs/IncenterBoard'), { ssr:false });
const DerivativeTangent = dynamic(()=>import('@/components/animations/DerivativeTangent'), { ssr:false });
const SystemSubstitutionStepper = dynamic(()=>import('@/components/animations/SystemSubstitutionStepper'), { ssr:false });
const FactorizationStepper = dynamic(()=>import('@/components/animations/FactorizationStepper'), { ssr:false });
const RationalizeStepper = dynamic(()=>import('@/components/animations/RationalizeStepper'), { ssr:false });
const ParabolaVertexStepper = dynamic(()=>import('@/components/animations/ParabolaVertexStepper'), { ssr:false });
const ExponentLogStepper = dynamic(()=>import('@/components/animations/ExponentLogStepper'), { ssr:false });
const TrigUnitCircleStepper = dynamic(()=>import('@/components/animations/TrigUnitCircleStepper'), { ssr:false });
const SequenceStepper = dynamic(()=>import('@/components/animations/SequenceStepper'), { ssr:false });
const FunctionTransformStepper = dynamic(() => import('@/components/animations/FunctionTransformStepper'), { ssr: false });
const RiemannIntegralStepper = dynamic(() => import('@/components/animations/RiemannIntegralStepper'), { ssr: false });
const InequalityRegionStepper = dynamic(() => import('@/components/animations/InequalityRegionStepper'), { ssr: false });
const Vector2D3DStepper = dynamic(()=>import('@/components/animations/Vector2D3DStepper'), { ssr:false });
const ComplexPlaneStepper = dynamic(()=>import('@/components/animations/ComplexPlaneStepper'), { ssr:false });
const IntegrationTechStepper = dynamic(()=>import('@/components/animations/IntegrationTechStepper'), { ssr:false });
const LocusStepper = dynamic(()=>import('@/components/animations/LocusStepper'), { ssr:false });
const MeanValueRolleStepper = dynamic(()=>import('@/components/animations/MeanValueRolleStepper'), { ssr:false });
const LineCircleRelationStepper = dynamic(()=>import('@/components/animations/LineCircleRelationStepper'), { ssr:false });
const TwoCirclesRelationStepper = dynamic(()=>import('@/components/animations/TwoCirclesRelationStepper'), { ssr:false });
const AngleBisectorStepper = dynamic(()=>import('@/components/animations/AngleBisectorStepper'), { ssr:false });
const NinePointCircleStepper = dynamic(()=>import('@/components/animations/NinePointCircleStepper'), { ssr:false });
const SquareCompletionProofStepper = dynamic(() => import('@/components/animations/SquareCompletionProofStepper'),{ ssr: false });
const FactorizationACProofStepper = dynamic(() => import('@/components/animations/FactorizationACProofStepper'),{ ssr: false });
const DiffSquares_StickyTop = dynamic(() => import('@/components/animations/DiffSquares_StickyTop'), { ssr:false });
const CubesSumDiff_StickyTop = dynamic(() => import('@/components/animations/CubesSumDiff_StickyTop'), { ssr:false });
const CommonFactor_StickyTop = dynamic(()=>import('@/components/animations/CommonFactor_StickyTop'), { ssr:false });
const PerfectSquare_StickyTop = dynamic(()=>import('@/components/animations/PerfectSquare_StickyTop'), { ssr:false });



export default function TemplatePlayer() {
  const [audio, setAudio] = useState(false);
  const { speak } = useNarration(audio);
  const params = useParams<{ slug: string; id: string }>();

  const { cat, tpl } = useMemo(() => {
    const slug = params?.slug;
    const id = params?.id;
    const cat = CATEGORIES.find(c => c.slug === slug);
    const tpl = cat?.templates.find(t => t.id === id);
    return { cat, tpl };
  }, [params?.slug, params?.id]);

  if (!cat || !tpl) return <div className="space-y-4"><p>テンプレが見つかりません。</p></div>;

  return (
    <div className="space-y-6">
      <header className="flex items-center justify-between">
        <div>
          <div className="text-xs text-gray-500">{cat.title}</div>
          <h1 className="text-xl font-bold">{tpl.title}</h1>
        </div>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={audio} onChange={e => setAudio(e.target.checked)} />
          音声ナレーションを有効化
        </label>
      </header>

      {/* Algebra */}
      {tpl.kind==='algebra' && tpl.id==='linear-equation' && (
        <AlgebraStepper a={tpl.params?.a ?? 2} b={tpl.params?.b ?? 3} c={tpl.params?.c ?? 11} />
      )}
      {tpl.kind==='algebra' && tpl.id==='square-completion' && (
        <SquareCompleteStepper b={tpl.params?.b ?? 6} c={tpl.params?.c ?? 5} />
      )}
      {tpl.kind==='algebra' && tpl.id==='system-2x2' && (
        <SystemSolveStepper />
      )}
      {tpl.kind==='algebra' && tpl.id==='system-substitution' && (<SystemSubstitutionStepper />)}
      {tpl.kind==='algebra' && tpl.id==='factorization' && (<FactorizationStepper />)}
      {tpl.kind==='algebra' && tpl.id==='rationalization' && (<RationalizeStepper />)}
      {tpl.kind==='algebra' && tpl.id==='parabola-vertex' && (<ParabolaVertexStepper />)}
      {tpl.kind==='algebra' && tpl.id==='exp-log-basics' && (<ExponentLogStepper />)}
      {tpl.kind==='algebra' && tpl.id==='trig-unit' && (<TrigUnitCircleStepper />)}
      {tpl.kind==='algebra' && tpl.id==='sequence-basics' && (<SequenceStepper />)}
      {tpl.kind==='algebra' && tpl.id==='function-transform' && (<FunctionTransformStepper />)}
      {tpl.kind==='algebra' && tpl.id==='inequality-region' && (<InequalityRegionStepper />)}
      {tpl.kind==='algebra' && tpl.id==='complex-plane' && (<ComplexPlaneStepper />)}
      {tpl.kind==='algebra' && tpl.id==='square-completion-proof' && (<SquareCompletionProofStepper b={tpl.params?.b} c={tpl.params?.c} goal={tpl.params?.goal} initialStep={tpl.params?.step} />)}
      {tpl.kind==='algebra' && tpl.id==='factorization-ac-proof' && (<FactorizationACProofStepper a={tpl.params?.a} b={tpl.params?.b} c={tpl.params?.c} initialStep={tpl.params?.step} />)}
      {tpl.kind==='algebra' && tpl.id==='diff-squares' && (<DiffSquares_StickyTop />)}
      {tpl.kind==='algebra' && tpl.id==='cubes-sumdiff' && (<CubesSumDiff_StickyTop />)}
      {tpl.kind==='algebra' && tpl.id==='common-factor' && (<CommonFactor_StickyTop />)}
      {tpl.kind==='algebra' && tpl.id==='perfect-square' && (<PerfectSquare_StickyTop />)}




      

      {/* Geometry */}
      {tpl.kind==='geometry' && tpl.id==='circumcenter' && (<CircumcenterBoard speak={speak} />)}
      {tpl.kind==='geometry' && tpl.id==='centroid' && (<CentroidBoard speak={speak} />)}
      {tpl.kind==='geometry' && tpl.id==='incenter' && (<IncenterBoard speak={speak} />)}
      {tpl.kind==='geometry' && tpl.id==='line-circle-relation' && (<LineCircleRelationStepper />)}
      {tpl.kind==='geometry' && tpl.id==='two-circles-relation' && (<TwoCirclesRelationStepper />)}
      {tpl.kind==='geometry' && tpl.id==='angle-bisector' && (<AngleBisectorStepper />)}
      {tpl.kind==='geometry' && tpl.id==='nine-point-circle' && (<NinePointCircleStepper />)}
      {tpl.kind==='geometry' && tpl.id==='vector-2d-3d' && (<Vector2D3DStepper />)}
      {tpl.kind==='geometry' && tpl.id==='locus-lab' && (<LocusStepper />)}

      {/* Calculus */}
      {tpl.kind==='calculus' && tpl.id==='tangent-slope' && (
        <DerivativeTangent a={tpl.params?.a ?? 1} b={tpl.params?.b ?? 0} c={tpl.params?.c ?? 0} x0={tpl.params?.x0 ?? 1} h={tpl.params?.h ?? 1} speak={speak} />
      )}
      {tpl.kind==='calculus' && tpl.id==='mean-value-rolle' && (<MeanValueRolleStepper />)}
      {tpl.kind==='calculus' && tpl.id==='riemann-integral' && (
        <RiemannIntegralStepper />
      )}
      {tpl.kind==='calculus' && tpl.id==='integration-tech' && (<IntegrationTechStepper />)}
    </div>
  );
}
