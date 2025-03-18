"use client";

import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

// Character Details Skeleton component for loading state
export function CharacterDetailsSkeleton() {
  // Create array of static keys for attribute items
  const attributeItems = [
    "skeleton-strength",
    "skeleton-constitution",
    "skeleton-size",
    "skeleton-agility",
    "skeleton-stamina",
    "skeleton-luck",
  ];

  return (
    <div className="animate-pulse">
      {/* Back button skeleton */}
      <div className="h-8 w-48 bg-stone-800 rounded mb-6" />
      
      {/* Hero section skeleton */}
      <div className="h-12 w-64 bg-stone-800 rounded mb-4 mx-auto" />
      <div className="h-4 w-32 bg-stone-800 rounded mb-12 mx-auto" />

      {/* Profile section skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
        <div className="aspect-square bg-stone-800 rounded-lg" />
        <div className="col-span-1 md:col-span-2 space-y-6">
          <div className="bg-stone-800 h-48 rounded-lg" />
          <div className="bg-stone-800 h-32 rounded-lg" />
        </div>
      </div>

      {/* Attributes section skeleton */}
      <div className="h-8 w-48 bg-stone-800 rounded mb-6" />
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 mb-12">
        {attributeItems.map((key) => (
          <div key={key} className="bg-stone-800 h-32 rounded-lg" />
        ))}
      </div>
      
      {/* Equipment section skeleton */}
      <div className="h-8 w-48 bg-stone-800 rounded mb-6" />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <div className="bg-stone-800 h-24 rounded-lg" />
        <div className="bg-stone-800 h-24 rounded-lg" />
        <div className="bg-stone-800 h-24 rounded-lg" />
      </div>
    </div>
  );
}

// Error component for error state
export function CharacterError({ error }: { error: unknown }) {
  const router = useRouter();
  const errorMessage =
    error instanceof Error ? error.message : "An unexpected error occurred";

  return (
    <div className="text-center py-12">
      <h2 className="text-2xl font-bold text-red-500 mb-4">
        Error Loading Character
      </h2>
      <p className="text-stone-400 mb-2">
        We couldn't load the character data:
      </p>
      <p className="text-red-400 mb-8 max-w-md mx-auto">{errorMessage}</p>
      <Button
        onClick={() => router.push("/")}
        className="bg-yellow-600 hover:bg-yellow-700 text-stone-900"
      >
        Return to Home
      </Button>
    </div>
  );
}

// Not Found component for when character doesn't exist
export function CharacterNotFound() {
  const router = useRouter();

  return (
    <div className="text-center py-12">
      <h2 className="text-2xl font-bold text-yellow-500 mb-4">
        Character Not Found
      </h2>
      <p className="text-stone-400 mb-8">
        The warrior you're looking for doesn't exist or isn't available.
      </p>
      <Button
        onClick={() => router.push("/")}
        className="bg-yellow-600 hover:bg-yellow-700 text-stone-900"
      >
        Return to Home
      </Button>
    </div>
  );
} 