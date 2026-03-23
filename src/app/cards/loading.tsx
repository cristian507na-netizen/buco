import { HeroSkeleton, CardSkeleton } from "@/components/ui/page-skeleton";

export default function CardsLoading() {
  return (
    <div className="flex-1 min-h-screen bg-[var(--bg-secondary)] pb-24">
      <HeroSkeleton />
      <div className="max-w-7xl mx-auto p-6 space-y-6">
        {/* Cards carousel skeleton */}
        <div className="flex gap-4 overflow-hidden">
          {[1, 2].map(i => (
            <div key={i} className="flex-shrink-0 w-[300px] h-[190px] rounded-3xl skeleton-shimmer" />
          ))}
        </div>
        <CardSkeleton count={4} />
      </div>
    </div>
  );
}
