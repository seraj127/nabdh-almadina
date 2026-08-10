'use client';

export function ProductCardSkeleton() {
  return (
    <div className="bg-white dark:bg-[#151D2E] rounded-2xl overflow-hidden border border-gray-100 dark:border-[#1E2A42]" aria-hidden="true">
      <div className="h-40 bg-gray-100 dark:bg-[#1A2540] shimmer" />
      <div className="p-3 space-y-2.5">
        <div className="h-3.5 bg-gray-100 dark:bg-[#1A2540] rounded-full w-3/4 shimmer" />
        <div className="h-3 bg-gray-100 dark:bg-[#1A2540] rounded-full w-1/2 shimmer" />
        <div className="flex items-center justify-between mt-2">
          <div className="h-5 bg-gray-100 dark:bg-[#1A2540] rounded-full w-16 shimmer" />
          <div className="h-7 w-20 bg-gray-100 dark:bg-[#1A2540] rounded-lg shimmer" />
        </div>
      </div>
    </div>
  );
}

export function CategorySkeleton() {
  return (
    <div className="flex flex-col items-center min-w-[64px]" aria-hidden="true">
      <div className="w-14 h-14 rounded-2xl bg-gray-100 dark:bg-[#1A2540] shimmer" />
      <div className="h-2.5 bg-gray-100 dark:bg-[#1A2540] rounded-full w-12 mt-2 shimmer" />
    </div>
  );
}

export function CartItemSkeleton() {
  return (
    <div className="bg-white dark:bg-[#151D2E] rounded-xl p-3 flex gap-3 border border-gray-100 dark:border-[#1E2A42]" aria-hidden="true">
      <div className="w-16 h-16 rounded-lg bg-gray-100 dark:bg-[#1A2540] shimmer flex-shrink-0" />
      <div className="flex-1 space-y-2">
        <div className="h-3.5 bg-gray-100 dark:bg-[#1A2540] rounded-full w-3/4 shimmer" />
        <div className="h-4 bg-gray-100 dark:bg-[#1A2540] rounded-full w-1/3 shimmer" />
        <div className="flex gap-2 mt-2">
          <div className="h-7 w-7 bg-gray-100 dark:bg-[#1A2540] rounded-lg shimmer" />
          <div className="h-7 w-6 bg-gray-100 dark:bg-[#1A2540] rounded shimmer" />
          <div className="h-7 w-7 bg-gray-100 dark:bg-[#1A2540] rounded-lg shimmer" />
        </div>
      </div>
    </div>
  );
}

export function HomeScreenSkeleton() {
  return (
    <div className="pb-4">
      {/* Header skeleton */}
      <div className="bg-gray-100 dark:bg-[#151D2E] px-5 pt-10 pb-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gray-200 dark:bg-[#1A2540] shimmer" />
            <div className="space-y-1.5">
              <div className="h-4 bg-gray-200 dark:bg-[#1A2540] rounded-full w-24 shimmer" />
              <div className="h-2.5 bg-gray-200 dark:bg-[#1A2540] rounded-full w-32 shimmer" />
            </div>
          </div>
          <div className="flex gap-2">
            <div className="w-9 h-9 rounded-full bg-gray-200 dark:bg-[#1A2540] shimmer" />
            <div className="w-9 h-9 rounded-full bg-gray-200 dark:bg-[#1A2540] shimmer" />
          </div>
        </div>
        <div className="h-10 bg-gray-200 dark:bg-[#1A2540] rounded-xl shimmer" />
      </div>
      {/* Categories skeleton */}
      <div className="px-4 mt-4">
        <div className="flex gap-3">
          {Array.from({ length: 6 }).map((_, i) => <CategorySkeleton key={i} />)}
        </div>
      </div>
      {/* Products skeleton */}
      <div className="px-4 mt-5">
        <div className="grid grid-cols-2 gap-3">
          {Array.from({ length: 4 }).map((_, i) => <ProductCardSkeleton key={i} />)}
        </div>
      </div>
    </div>
  );
}
