"use client";

import { useDuelActions, useDuelLoadingState } from "@/stores/duel-store";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { ArrowLeft, Swords } from "lucide-react";
import { useSearchParams } from "next/navigation";

export default function DuelLoadingPage() {
  const { isListening, isTimeout, duelTxHash } = useDuelLoadingState();
  const { clearState } = useDuelActions();
  const router = useRouter();
  const [isNavigating, setIsNavigating] = useState(false);
  const player1Id = useSearchParams().get("player1Id") ?? undefined;

  useEffect(() => {
    if (duelTxHash && !isNavigating) {
      setIsNavigating(true);
      router.push(`/duel?txId=${duelTxHash}&player1Id=${player1Id}`);
    }
  }, [duelTxHash, isNavigating, router, player1Id]);

  useEffect(() => {
    if (!isListening && !duelTxHash && !isTimeout) {
      router.push("/");
    }
  }, [isListening, duelTxHash, router, isTimeout]);

  const handleCancel = () => {
    clearState();
    router.push("/");
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-gradient-to-b from-black via-gray-900 to-black flex flex-col items-center justify-center overflow-hidden z-50"
    >
      {/* Gradient Background */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-radial from-gray-900 via-black to-black opacity-80" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-yellow-900/10 via-transparent to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-b from-black via-transparent to-black" />

        {/* Animated "stars" effect */}
        <div className="absolute inset-0 overflow-hidden">
          {[...Array(12)].map((_, i) => (
            <motion.div
              // biome-ignore lint/suspicious/noArrayIndexKey: <explanation>
              key={i}
              className="absolute h-0.5 w-0.5 sm:h-1 sm:w-1 bg-yellow-500/30 rounded-full"
              style={{
                top: `${Math.random() * 100}%`,
                left: `${Math.random() * 100}%`,
              }}
              animate={{
                opacity: [0.1, 0.5, 0.1],
                scale: [1, 1.5, 1],
              }}
              transition={{
                duration: Math.random() * 3 + 2,
                repeat: Number.POSITIVE_INFINITY,
                delay: Math.random() * 5,
              }}
            />
          ))}
        </div>
      </div>

      {/* Pulsing Circle */}
      <motion.div
        className="absolute z-10"
        initial={{ opacity: 0.5, scale: 0.8 }}
        animate={{
          opacity: [0.3, 0.8, 0.3],
          scale: [0.8, 1.2, 0.8],
        }}
        transition={{
          duration: 3,
          repeat: Number.POSITIVE_INFINITY,
          ease: "easeInOut",
        }}
      >
        <div className="w-48 h-48 sm:w-72 sm:h-72 rounded-full border-2 sm:border-4 border-yellow-500/20 blur-sm" />
      </motion.div>

      {/* Central Content */}
      <motion.div
        className="z-20 text-center px-3 sm:px-4 max-w-xs sm:max-w-md"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        {isTimeout ? (
          <TimeoutContent onReturn={handleCancel} />
        ) : isNavigating ? (
          <CompletedContent />
        ) : (
          <LoadingContent onCancel={handleCancel} />
        )}
      </motion.div>
    </motion.div>
  );
}

// Loading State Component
function LoadingContent({ onCancel }: { onCancel: () => void }) {
  return (
    <>
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="mb-4 flex justify-center"
      >
        <BattleAnimatedIcon />
      </motion.div>

      <motion.h1
        className="text-xl sm:text-2xl font-bold text-white mb-2"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.6 }}
      >
        Preparing for Battle
      </motion.h1>

      <motion.p
        className="text-gray-300 mb-2 text-sm"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.7 }}
      >
        Challenge accepted! Waiting for the blockchain to process the duel.
      </motion.p>

      <motion.p
        className="text-gray-400 mb-4 text-xs"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.8 }}
      >
        This usually takes less than a minute.
      </motion.p>
    </>
  );
}

// Completion State Component
function CompletedContent() {
  return (
    <>
      <motion.div
        initial={{ scale: 0.9, rotate: 0, opacity: 0 }}
        animate={{ scale: 1, rotate: 360, opacity: 1 }}
        transition={{
          duration: 0.8,
          delay: 0.5,
          ease: "easeOut",
        }}
        className="mb-4 flex justify-center"
      >
        <div className="h-14 w-14 sm:h-16 sm:w-16 relative">
          <motion.div
            className="absolute inset-0 rounded-full bg-yellow-500/20 backdrop-blur-sm"
            animate={{
              scale: [1, 1.2, 1],
              opacity: [1, 0.8, 1],
            }}
            transition={{
              duration: 2,
              repeat: Number.POSITIVE_INFINITY,
              ease: "easeInOut",
            }}
          />
          <Swords className="h-8 w-8 sm:h-10 sm:w-10 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-yellow-500" />
        </div>
      </motion.div>

      <motion.h1
        className="text-xl sm:text-2xl font-bold text-white mb-2"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.6 }}
      >
        Duel Complete!
      </motion.h1>

      <motion.div
        className="space-y-2"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.7 }}
      >
        <p className="text-gray-300 text-sm">Preparing visualization...</p>
        <AnimatedDots />
        <p className="text-gray-400 text-xs">Redirecting in a few seconds...</p>
      </motion.div>
    </>
  );
}

// Timeout State Component
function TimeoutContent({ onReturn }: { onReturn: () => void }) {
  return (
    <>
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="mb-4 flex justify-center"
      >
        <div className="h-14 w-14 sm:h-16 sm:w-16 relative">
          <div className="absolute inset-0 rounded-full bg-orange-500/20 backdrop-blur-sm" />
          {/* biome-ignore lint/a11y/noSvgWithoutTitle: <explanation> */}
          <svg
            className="h-8 w-8 sm:h-10 sm:w-10 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-orange-500"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </div>
      </motion.div>

      <motion.h1
        className="text-xl sm:text-2xl font-bold text-white mb-2"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.6 }}
      >
        Taking Longer Than Expected
      </motion.h1>

      <motion.p
        className="text-gray-300 mb-2 text-sm"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.7 }}
      >
        Duel is taking longer due to network congestion.
      </motion.p>

      <motion.p
        className="text-gray-400 mb-4 text-xs"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.8 }}
      >
        The duel will still be processed by the blockchain.
      </motion.p>

      <motion.div
        className="flex flex-row gap-2 justify-center"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.9 }}
      >
        <Button
          onClick={onReturn}
          variant="outline"
          size="sm"
          className="bg-transparent hover:bg-yellow-500/20 text-yellow-500 border-yellow-500/30 hover:border-yellow-500/50 h-8 text-xs"
        >
          <ArrowLeft className="mr-1.5 h-3 w-3" />
          Return
        </Button>

        <Button
          onClick={() => window.location.reload()}
          size="sm"
          className="bg-yellow-500/20 hover:bg-yellow-500/30 text-yellow-500 border border-yellow-500/30 h-8 text-xs"
        >
          Try Again
        </Button>
      </motion.div>
    </>
  );
}

// Animated dots for "loading" indication
function AnimatedDots() {
  return (
    <div className="flex justify-center space-x-1.5">
      {[0, 1, 2].map((dot) => (
        <motion.div
          key={dot}
          className="h-1.5 w-1.5 bg-yellow-500 rounded-full"
          initial={{ opacity: 0.3 }}
          animate={{ opacity: [0.3, 1, 0.3] }}
          transition={{
            duration: 1.5,
            repeat: Number.POSITIVE_INFINITY,
            delay: dot * 0.3,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  );
}

// Battle icon animation
function BattleAnimatedIcon() {
  return (
    <div className="relative h-16 w-16 sm:h-20 sm:w-20">
      {/* Pulsing background */}
      <motion.div
        className="absolute inset-0 rounded-full bg-yellow-500/10"
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.5, 0.3, 0.5],
        }}
        transition={{
          duration: 2,
          repeat: Number.POSITIVE_INFINITY,
          ease: "easeInOut",
        }}
      />

      {/* Middle circle */}
      <motion.div
        className="absolute inset-2 rounded-full bg-yellow-500/20 backdrop-blur-sm"
        animate={{
          rotate: [0, 360],
        }}
        transition={{
          duration: 20,
          repeat: Number.POSITIVE_INFINITY,
          ease: "linear",
        }}
      >
        {/* Create some decorative dots */}
        {[0, 60, 120, 180, 240, 300].map((angle) => (
          <motion.div
            key={angle}
            className="absolute h-1 w-1 rounded-full bg-yellow-500/80"
            style={{
              top: "calc(50% - 2px)",
              left: "calc(50% - 2px)",
              transform: `rotate(${angle}deg) translateX(22px)`,
            }}
          />
        ))}
      </motion.div>

      {/* Center element */}
      <div className="absolute inset-0 flex items-center justify-center">
        <Swords className="h-6 w-6 text-yellow-500 z-10" />
      </div>
    </div>
  );
}
