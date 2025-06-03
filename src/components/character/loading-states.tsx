"use client";

import { RetroButton } from "@/components/ui/retro-button";
import { RetroCard, RetroCardContent } from "@/components/ui/retro-card";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { AlertTriangle, Search, Home, Loader2 } from "lucide-react";

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

  // Skeleton animation variants
  const skeletonVariants = {
    initial: { opacity: 0.3 },
    animate: {
      opacity: [0.3, 0.6, 0.3],
      transition: {
        duration: 1.5,
        repeat: Number.POSITIVE_INFINITY,
        ease: "easeInOut",
      },
    },
  };

  const containerVariants = {
    initial: { opacity: 0 },
    animate: {
      opacity: 1,
      transition: {
        duration: 0.3,
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    initial: { opacity: 0, y: 10 },
    animate: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.3 },
    },
  };

  return (
    <motion.div
      className="space-y-6"
      variants={containerVariants}
      initial="initial"
      animate="animate"
    >
      {/* Hero section skeleton */}
      <motion.div variants={itemVariants} className="text-center space-y-2">
        <motion.div
          className="h-12 w-64 bg-primary/20 rounded-pixel mx-auto border border-primary/30 pixel-perfect"
          variants={skeletonVariants}
          initial="initial"
          animate="animate"
        />
        <motion.div
          className="h-4 w-32 bg-primary/10 rounded-pixel mx-auto border border-primary/20 pixel-perfect"
          variants={skeletonVariants}
          initial="initial"
          animate="animate"
        />
      </motion.div>

      {/* Profile section skeleton */}
      <motion.div variants={itemVariants}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Character image skeleton */}
          <motion.div
            className="aspect-square bg-arcade-screen/30 rounded-pixel border border-primary/30 pixel-perfect retro-box-glow"
            variants={skeletonVariants}
            initial="initial"
            animate="animate"
          />

          {/* Details skeleton */}
          <div className="col-span-1 md:col-span-2 space-y-4">
            <RetroCard variant="pixel" className="h-48">
              <RetroCardContent className="p-4 space-y-3">
                {[...Array(3)].map((_, i) => (
                  <motion.div
                    key={`detail-${i}`}
                    className="h-4 bg-primary/20 rounded-pixel border border-primary/20 pixel-perfect"
                    variants={skeletonVariants}
                    initial="initial"
                    animate="animate"
                    style={{ animationDelay: `${i * 0.2}s` }}
                  />
                ))}
              </RetroCardContent>
            </RetroCard>

            <RetroCard variant="pixel" className="h-32">
              <RetroCardContent className="p-4 space-y-2">
                {[...Array(2)].map((_, i) => (
                  <motion.div
                    key={`loadout-${i}`}
                    className="h-3 bg-primary/20 rounded-pixel border border-primary/20 pixel-perfect"
                    variants={skeletonVariants}
                    initial="initial"
                    animate="animate"
                    style={{ animationDelay: `${i * 0.3}s` }}
                  />
                ))}
              </RetroCardContent>
            </RetroCard>
          </div>
        </div>
      </motion.div>

      {/* Attributes section skeleton */}
      <motion.div variants={itemVariants} className="space-y-4">
        <motion.div
          className="h-8 w-48 bg-primary/20 rounded-pixel border border-primary/30 pixel-perfect"
          variants={skeletonVariants}
          initial="initial"
          animate="animate"
        />
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {attributeItems.map((key, index) => (
            <motion.div
              key={key}
              variants={itemVariants}
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <RetroCard variant="pixel" className="h-32">
                <RetroCardContent className="p-3 space-y-2">
                  <motion.div
                    className="h-3 w-20 bg-primary/20 rounded-pixel border border-primary/20 pixel-perfect"
                    variants={skeletonVariants}
                    initial="initial"
                    animate="animate"
                  />
                  <motion.div
                    className="h-6 w-12 bg-primary/30 rounded-pixel border border-primary/30 pixel-perfect"
                    variants={skeletonVariants}
                    initial="initial"
                    animate="animate"
                  />
                </RetroCardContent>
              </RetroCard>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Battle Chronicles skeleton */}
      <motion.div variants={itemVariants} className="space-y-4">
        <motion.div
          className="h-8 w-56 bg-primary/20 rounded-pixel border border-primary/30 pixel-perfect"
          variants={skeletonVariants}
          initial="initial"
          animate="animate"
        />
        <RetroCard variant="pixel" className="h-64">
          <RetroCardContent className="p-4 space-y-3">
            {[...Array(4)].map((_, i) => (
              <motion.div
                key={`chronicle-${i}`}
                className="h-12 bg-primary/15 rounded-pixel border border-primary/20 pixel-perfect"
                variants={skeletonVariants}
                initial="initial"
                animate="animate"
                style={{ animationDelay: `${i * 0.2}s` }}
              />
            ))}
          </RetroCardContent>
        </RetroCard>
      </motion.div>

      {/* Loading indicator */}
      <motion.div variants={itemVariants} className="flex justify-center pt-4">
        <div className="flex items-center gap-2">
          <Loader2 className="h-4 w-4 text-primary animate-spin retro-box-glow" />
          <span className="font-pixel text-pixel-sm text-primary retro-text-glow">
            LOADING WARRIOR DATA...
          </span>
        </div>
      </motion.div>
    </motion.div>
  );
}

// Error component for error state
export function CharacterError({ error }: { error: unknown }) {
  const router = useRouter();
  const errorMessage =
    error instanceof Error ? error.message : "An unexpected error occurred";

  return (
    <motion.div
      className="flex flex-col items-center justify-center py-12 space-y-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3, delay: 0.1 }}
      >
        <RetroCard
          variant="arcade"
          className="max-w-md retro-glow"
          withScanlines
        >
          <RetroCardContent className="p-6 text-center space-y-4">
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.2 }}
            >
              <div className="bg-destructive/20 p-3 rounded-pixel border border-destructive/30 w-fit mx-auto mb-4 retro-box-glow">
                <AlertTriangle className="h-8 w-8 text-destructive animate-pulse" />
              </div>
              <h2 className="font-pixel text-pixel-lg text-destructive font-bold uppercase retro-text-glow mb-2">
                ERROR LOADING WARRIOR
              </h2>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3, delay: 0.3 }}
              className="space-y-2"
            >
              <p className="font-pixel text-pixel-sm text-primary/70 uppercase">
                SYSTEM ERROR DETECTED:
              </p>
              <p className="font-pixel text-pixel-xs text-destructive bg-destructive/10 border border-destructive/30 rounded-pixel p-2 pixel-perfect max-w-sm mx-auto">
                {errorMessage}
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.4 }}
            >
              <RetroButton
                variant="arcade"
                size="default"
                onClick={() => router.push("/")}
                className="retro-glow"
                glow="medium"
              >
                <Home className="h-3 w-3 mr-1.5" />
                <span className="font-pixel text-pixel-sm">RETURN TO HOME</span>
              </RetroButton>
            </motion.div>
          </RetroCardContent>
        </RetroCard>
      </motion.div>
    </motion.div>
  );
}

// Not Found component for when character doesn't exist
export function CharacterNotFound() {
  const router = useRouter();

  return (
    <motion.div
      className="flex flex-col items-center justify-center py-12 space-y-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3, delay: 0.1 }}
      >
        <RetroCard variant="pixel" className="max-w-md retro-glow">
          <RetroCardContent className="p-6 text-center space-y-4">
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.2 }}
            >
              <div className="bg-warning/20 p-3 rounded-pixel border border-warning/30 w-fit mx-auto mb-4 retro-box-glow">
                <Search className="h-8 w-8 text-warning animate-pulse" />
              </div>
              <h2 className="font-pixel text-pixel-lg text-warning font-bold uppercase retro-text-glow mb-2">
                WARRIOR NOT FOUND
              </h2>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3, delay: 0.3 }}
            >
              <p className="font-pixel text-pixel-sm text-primary/70 uppercase mb-4">
                THE WARRIOR YOU SEEK
                <br />
                DOES NOT EXIST IN THE ARENA
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.4 }}
            >
              <RetroButton
                variant="pixel"
                size="default"
                onClick={() => router.push("/")}
                className="retro-glow"
                glow="subtle"
              >
                <Home className="h-3 w-3 mr-1.5" />
                <span className="font-pixel text-pixel-sm">RETURN TO HOME</span>
              </RetroButton>
            </motion.div>
          </RetroCardContent>
        </RetroCard>
      </motion.div>
    </motion.div>
  );
}
