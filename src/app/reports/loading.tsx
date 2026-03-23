import { HeroSkeleton, StatsSkeleton, CardSkeleton } from "@/components/ui/page-skeleton";

export default function ReportsLoading() {
  return (
    <div className="flex-1 min-h-screen bg-[var(--bg-secondary)] pb-24">
      <HeroSkeleton />
      <div className="max-w-7xl mx-auto p-6 space-y-6">
        <StatsSkeleton />
        <div className="skeleton-shimmer h-48 w-full rounded-2xl" />
        <CardSkeleton count={2} />
      </div>
    </div>
  );
}
