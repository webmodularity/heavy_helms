"use client";

import { CardContainer } from "@/components/character/card-container";
import { Skeleton } from "../skeleton";

interface CharacterCardSkeletonProps {
  index: number;
}

export function CharacterCardSkeleton({ index }: CharacterCardSkeletonProps) {
  return (
    <CardContainer index={index}>
      {/* Image skeleton */}
      <Skeleton 
        className="aspect-square relative bg-gradient-to-b from-stone-800/30 to-stone-900/30" 
      />

      {/* Content skeleton */}
      <div className="p-3 space-y-3">
        {/* Name skeleton */}
        <Skeleton 
          className="h-5 w-3/4 mx-auto" 
        />

        {/* Stats skeleton */}
        <div className="space-y-2 mt-2">
          <div className="flex justify-between text-xs">
            <Skeleton className="h-3 w-1/4" />
            <Skeleton className="h-3 w-1/4" />
          </div>
          <div className="flex justify-between text-xs">
            <Skeleton className="h-3 w-1/3" />
            <Skeleton className="h-3 w-1/3" />
          </div>
          <div className="flex justify-between text-xs">
            <Skeleton className="h-3 w-1/4" />
            <Skeleton className="h-3 w-1/4" />
          </div>
        </div>

        {/* Button skeleton */}
        <Skeleton className="mt-3 h-8" />
      </div>
    </CardContainer>
  );
} 