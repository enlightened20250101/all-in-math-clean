// src/components/attachments/AnimationAttachment.tsx
'use client';
import { AnimationSpec } from '@/components/types/animation';
import AlgebraStepper from '@/components/animations/AlgebraStepper';
import dynamic from 'next/dynamic';
const CircumcenterBoard = dynamic(()=>import('@/components/graphs/CircumcenterBoard'), { ssr:false });
export default function AnimationAttachment({ spec }: { spec: AnimationSpec }) {
  return (
    <div className="space-y-4">
      <div className="text-sm text-gray-500">{spec.title}</div>
      {spec.algebra && spec.algebra.length > 0 && (
        <div className="rounded-xl border p-3">
          <AlgebraStepper />
        </div>
      )}
      {spec.geometry && (
        <div className="rounded-xl border p-3">
          <CircumcenterBoard />
        </div>
      )}
    </div>
  );
}
