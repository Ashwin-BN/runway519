// Reusable skeleton shimmer block
function SkeletonBlock({ className = '' }) {
  return <div className={`bg-gray-200 rounded-xl animate-pulse ${className}`} />
}

// ── Inventory list skeleton
export function InventorySkeleton() {
  return (
    <div className="space-y-3">
      {[...Array(5)].map((_, i) => (
        <div
          key={i}
          className="bg-white rounded-2xl border border-gray-100 p-3
                     flex gap-3"
        >
          <SkeletonBlock className="w-20 h-20 shrink-0" />
          <div className="flex-1 space-y-2 py-1">
            <SkeletonBlock className="h-4 w-2/3" />
            <div className="flex gap-2">
              <SkeletonBlock className="h-3 w-14" />
              <SkeletonBlock className="h-3 w-14" />
              <SkeletonBlock className="h-3 w-14" />
            </div>
            <SkeletonBlock className="h-4 w-1/4" />
          </div>
        </div>
      ))}
    </div>
  )
}

// ── Analytics skeleton
export function AnalyticsSkeleton() {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="bg-white rounded-2xl border border-gray-100
                                  p-4 space-y-3"
          >
            <SkeletonBlock className="h-3 w-3/4" />
            <SkeletonBlock className="h-7 w-1/2" />
            <SkeletonBlock className="h-3 w-2/3" />
          </div>
        ))}
      </div>
      <div className="bg-white rounded-2xl border border-gray-100 p-4">
        <SkeletonBlock className="h-4 w-1/3 mb-4" />
        <SkeletonBlock className="h-48 w-full" />
      </div>
      <div className="bg-white rounded-2xl border border-gray-100 p-4">
        <SkeletonBlock className="h-4 w-1/3 mb-4" />
        <SkeletonBlock className="h-48 w-full" />
      </div>
    </div>
  )
}

// ── User list skeleton
export function UsersSkeleton() {
  return (
    <div className="space-y-3">
      {[...Array(4)].map((_, i) => (
        <div
          key={i}
          className="bg-white rounded-2xl border border-gray-100
                                p-4 flex gap-3 items-center"
        >
          <SkeletonBlock className="w-10 h-10 rounded-full shrink-0" />
          <div className="flex-1 space-y-2">
            <SkeletonBlock className="h-4 w-1/2" />
            <SkeletonBlock className="h-3 w-2/3" />
          </div>
          <SkeletonBlock className="h-6 w-20 rounded-full" />
        </div>
      ))}
    </div>
  )
}
