import { Skeleton } from "@/components/ui/skeleton";

const sectionKeys = ["fighters", "combat", "gauntlet", "duel", "skin"];

const cardKeys = ["a", "b", "c", "d"];

export function StatsPageSkeleton() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <Skeleton className="h-10 w-1/3 mb-4" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {sectionKeys.map((section) => (
          <div
            key={section}
            className="bg-stone-900/20 border border-stone-800/30 rounded-lg p-6"
          >
            <Skeleton className="h-6 w-1/2 mb-4" />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
              {cardKeys.map((card) => (
                <Skeleton key={section + card} className="h-12 w-full" />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
