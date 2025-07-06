"use client";

import { Skeleton } from "../skeleton";

export function CharacterCardGridSkeleton() {
  return (
    <div className="grid grid-cols-2 gap-4 p-4">
      {Array.from({ length: 6 }).map((_, index) => (
        <div
          key={`skeleton-${index}-${Math.random()}`}
          className="aspect-square rounded-lg overflow-hidden bg-stone-900/80 border border-stone-800/60"
        >
          {/* Image skeleton */}
          <Skeleton className="aspect-square w-full" />

          {/* Content skeleton */}
          <div className="p-3 space-y-2">
            {/* Name skeleton */}
            <Skeleton className="h-4 w-3/4" />

            {/* Stats skeleton */}
            <div className="flex justify-between">
              <Skeleton className="h-3 w-8" />
              <Skeleton className="h-3 w-8" />
              <Skeleton className="h-3 w-8" />
              <Skeleton className="h-3 w-8" />
            </div>

            {/* Button skeleton */}
            <Skeleton className="h-7 w-full" />
          </div>
        </div>
      ))}
    </div>
  );
}
