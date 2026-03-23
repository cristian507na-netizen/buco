import { HeroSkeleton, CardSkeleton } from "@/components/ui/page-skeleton";

export default function GoalsLoading() {
  return (
    <div className="flex-1 min-h-screen bg-[var(--bg-secondary)] pb-24">
      <HeroSkeleton />
      <div className="max-w-7xl mx-auto p-6 space-y-6">
        <div className="skeleton-shimmer h-11 w-full rounded-xl" />
        <CardSkeleton count={3} />
      </div>
    </div>
  );
}
