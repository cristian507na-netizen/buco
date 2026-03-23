import { HeroSkeleton, StatsSkeleton, ListSkeleton } from "@/components/ui/page-skeleton";

export default function DashboardLoading() {
  return (
    <div className="flex-1 min-h-screen bg-[var(--bg-secondary)] pb-24">
      <HeroSkeleton />
      <div className="max-w-7xl mx-auto p-6 space-y-6">
        <StatsSkeleton />
        <div className="skeleton-shimmer h-6 w-40" />
        <ListSkeleton count={4} />
      </div>
    </div>
  );
}
