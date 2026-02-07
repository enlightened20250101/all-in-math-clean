'use client';
import { Suspense } from 'react';
import GraphStudio from '@/components/graphs/GraphStudio';

export default function Page() {
  return (
    <div className="container mx-auto p-6">
      <Suspense fallback={<div className="text-sm text-gray-500">Loading...</div>}>
        <GraphStudio />
      </Suspense>
    </div>
  );
}
