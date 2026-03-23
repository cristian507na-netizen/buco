import { HeroSkeleton, ListSkeleton, StatsSkeleton } from "@/components/ui/page-skeleton";

export default function ExpensesLoading() {
  return (
    <div className="flex-1 min-h-screen bg-[var(--bg-secondary)] pb-24">
      <HeroSkeleton />
      <div className="max-w-7xl mx-auto p-6 space-y-6">
        <StatsSkeleton />
        <div className="skeleton-shimmer h-11 w-full rounded-xl" />
        <ListSkeleton count={6} />
      </div>
    </div>
  );
}
