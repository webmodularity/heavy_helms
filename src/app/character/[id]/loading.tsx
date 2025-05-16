import { CardContainer } from "@/components/character/card-container";
import { Skeleton } from "@/components/ui/skeleton"; // Assuming you have a skeleton component

export default function CharacterDetailsLoading() {
  return (
    <div className="container mx-auto p-4">
      <div className="w-full max-w-4xl mx-auto">
        {/* Header skeleton */}
        <div className="flex items-center justify-between mb-6">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-10 w-28" />
        </div>

        {/* Character card skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Main character image */}
          <div className="md:col-span-1">
            <CardContainer index={0} isSelected={false}>
              <div className="aspect-square bg-stone-800/50 animate-pulse" />
              <div className="p-4 space-y-4">
                <Skeleton className="h-6 w-full" />
                <div className="space-y-2">
                  {Array(6)
                    .fill(0)
                    .map((_, i) => (
                      // biome-ignore lint/suspicious/noArrayIndexKey: <explanation>
                      <div key={i} className="space-y-1">
                        <div className="flex justify-between">
                          <Skeleton className="h-3 w-24" />
                          <Skeleton className="h-3 w-8" />
                        </div>
                        <Skeleton className="h-2 w-full" />
                      </div>
                    ))}
                </div>
              </div>
            </CardContainer>
          </div>

          {/* Details section */}
          <div className="md:col-span-2 space-y-6">
            <div className="bg-stone-800/20 p-4 rounded-md">
              <Skeleton className="h-6 w-32 mb-4" />
              <div className="space-y-2">
                {Array(4)
                  .fill(0)
                  .map((_, i) => (
                    // biome-ignore lint/suspicious/noArrayIndexKey: <explanation>
                    <Skeleton key={i} className="h-4 w-full" />
                  ))}
              </div>
            </div>

            <div className="bg-stone-800/20 p-4 rounded-md">
              <Skeleton className="h-6 w-40 mb-4" />
              <div className="grid grid-cols-2 gap-4">
                {Array(4)
                  .fill(0)
                  .map((_, i) => (
                    // biome-ignore lint/suspicious/noArrayIndexKey: <explanation>
                    <Skeleton key={i} className="h-16 w-full" />
                  ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
