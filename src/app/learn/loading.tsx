import { HeroSkeleton, CardSkeleton } from "@/components/ui/page-skeleton";

export default function LearnLoading() {
  return (
    <div className="flex-1 min-h-screen bg-[var(--bg-secondary)] pb-24">
      <HeroSkeleton />
      <div className="max-w-4xl mx-auto p-6 space-y-6">
        <div className="skeleton-shimmer h-28 w-full rounded-2xl" />
        <CardSkeleton count={6} />
      </div>
    </div>
  );
}
