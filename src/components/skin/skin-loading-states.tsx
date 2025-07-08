import { Skeleton } from "@/components/ui/skeleton";
import { motion } from "framer-motion";
import { AlertCircle, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

export function SkinDetailsSkeleton() {
  return (
    <div className="space-y-8">
      {/* Back Button Skeleton */}
      <Skeleton className="h-10 w-40" />

      {/* Mobile Hero Section Skeleton */}
      <div className="mb-6 md:hidden">
        <Skeleton className="h-32 w-full mb-4" />
      </div>

      {/* Main Grid Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Left Column Skeleton */}
        <div className="col-span-1 space-y-6">
          <Skeleton className="h-64 w-full" />
          <Skeleton className="h-32 w-full" />
        </div>

        {/* Right Column Skeleton */}
        <div className="col-span-1 md:col-span-2 space-y-6">
          <div className="hidden md:block">
            <Skeleton className="h-32 w-full" />
          </div>
          <Skeleton className="h-48 w-full" />
          <Skeleton className="h-48 w-full" />
        </div>
      </div>
    </div>
  );
}

export function SkinError({ error }: { error: string }) {
  const router = useRouter();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center min-h-[400px] text-center space-y-4"
    >
      <AlertCircle className="h-16 w-16 text-red-400" />
      <h2 className="text-2xl font-bold text-stone-100">
        Error Loading Skin Details
      </h2>
      <p className="text-stone-400 max-w-md">
        {error || "Something went wrong while loading the skin information."}
      </p>
      <Button
        onClick={() => router.push("/leaderboards")}
        variant="outline"
        className="mt-4"
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to Leaderboards
      </Button>
    </motion.div>
  );
}

export function SkinNotFound() {
  const router = useRouter();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center min-h-[400px] text-center space-y-4"
    >
      <div className="text-6xl mb-4">🎭</div>
      <h2 className="text-2xl font-bold text-stone-100">Skin Not Found</h2>
      <p className="text-stone-400 max-w-md">
        The skin you're looking for doesn't exist or hasn't been used in any
        battles yet.
      </p>
      <Button
        onClick={() => router.push("/leaderboards")}
        variant="outline"
        className="mt-4"
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to Leaderboards
      </Button>
    </motion.div>
  );
}
