'use client';
import { useBalance } from './useBalance';

export default function LowBalanceBanner() {
  const { balance, loading } = useBalance();
  const threshold = Number(process.env.NEXT_PUBLIC_LOW_BALANCE_THRESHOLD ?? 100);

  if (loading) return null;
  const credits = balance?.credits ?? 0;
  if (credits > threshold) return null;

  return (
    <div className="fixed top-4 right-4 z-50 bg-amber-100 border border-amber-300 text-amber-900 px-3 py-2 rounded shadow-md">
      残高が少なくなっています（あと <span className="font-semibold">{credits}</span> pt）
      <a href="/billing" className="ml-3 underline text-blue-600">チャージする</a>
    </div>
  );
}
