export function HeroSkeleton() {
  return (
    <div className="section-hero h-[160px]" style={{ borderBottomLeftRadius: 40, borderBottomRightRadius: 40 }}>
      <div className="max-w-7xl mx-auto w-full px-6 py-8 space-y-3">
        <div className="skeleton-shimmer h-3 w-24 rounded-full" />
        <div className="skeleton-shimmer h-7 w-48" />
        <div className="skeleton-shimmer h-4 w-64" />
      </div>
    </div>
  );
}

export function CardSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="rounded-2xl bg-[var(--bg-card)] border border-[var(--border-color)] p-5 space-y-3">
          <div className="flex justify-between items-start">
            <div className="skeleton-shimmer h-10 w-10 rounded-xl" />
            <div className="skeleton-shimmer h-5 w-16 rounded-full" />
          </div>
          <div className="skeleton-shimmer h-5 w-3/4" />
          <div className="skeleton-shimmer h-4 w-1/2" />
          <div className="skeleton-shimmer h-2 w-full rounded-full" />
        </div>
      ))}
    </div>
  );
}

export function ListSkeleton({ count = 5 }: { count?: number }) {
  return (
    <div className="space-y-2">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="flex items-center gap-4 p-4 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-color)]">
          <div className="skeleton-shimmer h-10 w-10 rounded-xl shrink-0" />
          <div className="flex-1 space-y-2">
            <div className="skeleton-shimmer h-4 w-3/4" />
            <div className="skeleton-shimmer h-3 w-1/3" />
          </div>
          <div className="skeleton-shimmer h-5 w-16" />
        </div>
      ))}
    </div>
  );
}

export function StatsSkeleton() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="rounded-2xl bg-[var(--bg-card)] border border-[var(--border-color)] p-4 space-y-2">
          <div className="skeleton-shimmer h-3 w-20" />
          <div className="skeleton-shimmer h-8 w-28" />
          <div className="skeleton-shimmer h-3 w-16" />
        </div>
      ))}
    </div>
  );
}
