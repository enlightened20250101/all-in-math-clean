'use client';

import { AnimationDockProvider } from '@/components/animations/AnimationDock';

export default function LearnClientShell({ children }: { children: React.ReactNode }) {
  return (
    <AnimationDockProvider>
      {children}
    </AnimationDockProvider>
  );
}
