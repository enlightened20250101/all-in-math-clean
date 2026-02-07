// app/auth/page.tsx
import { redirect } from 'next/navigation';

export default async function AuthPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const sp = await searchParams;
  const next = sp.next || '/';
  redirect(`/login?next=${encodeURIComponent(next)}`);
}
