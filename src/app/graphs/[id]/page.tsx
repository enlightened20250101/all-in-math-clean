// src/app/graphs/[id]/page.tsx
import GraphPageClient from './page.client';

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const numId = Number(id);
  return <GraphPageClient id={numId} />;
}
