import AuthGate from "@/components/AuthGate";
import SummaryClient from "./SummaryClient";

export default async function SummaryPage({
  searchParams,
}: {
  searchParams: Promise<{ r?: string }>;
}) {
  const sp = await searchParams;
  return (
    <AuthGate>
      <div className="max-w-3xl mx-auto p-3 sm:p-4 space-y-5 sm:space-y-6">
        <div className="relative overflow-hidden rounded-[28px] border chalkboard text-white p-4 sm:p-7 shadow-xl ring-1 ring-white/10">
          <div className="absolute -top-16 -right-12 h-40 w-40 rounded-full bg-indigo-400/20 blur-3xl" />
          <div className="absolute -bottom-24 -left-8 h-52 w-52 rounded-full bg-white/5 blur-3xl" />
          <div className="relative z-10">
            <div className="text-[10px] uppercase tracking-[0.28em] text-white/80">Summary</div>
            <h2 className="mt-2 text-xl sm:text-2xl font-semibold">診断結果</h2>
            <p className="text-[10px] sm:text-sm text-white/85 mt-2">
              まずは復習 → その後におすすめトピックへ進むのが効率的です
            </p>
          </div>
        </div>
        <div className="rounded-[32px] bg-gradient-to-br from-slate-50 via-white to-sky-50 p-[1px] shadow-[0_18px_50px_-32px_rgba(15,23,42,0.25)]">
          <div className="rounded-[31px] bg-white/90 p-1.5">
            <SummaryClient r={sp.r ?? ""} />
          </div>
        </div>
      </div>
    </AuthGate>
  );
}
