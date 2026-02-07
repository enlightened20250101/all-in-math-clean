// src/app/course/layout.tsx
import type { ReactNode } from 'react';
import AuthGate from '@/components/AuthGate';

export default function CourseLayout({ children }: { children: ReactNode }) {
  return (
    <AuthGate>
      <div className="max-w-6xl mx-auto p-4 space-y-4">
        <h1 className="text-2xl font-bold">高校数学コース</h1>
        {children}
      </div>
    </AuthGate>
  );
}
