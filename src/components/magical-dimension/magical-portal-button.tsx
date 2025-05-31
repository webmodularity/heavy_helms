"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Star } from "lucide-react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

interface MagicalPortalButtonProps {
  isVisible: boolean;
  selectedCharacterId?: string;
}

export function MagicalPortalButton({
  isVisible,
  selectedCharacterId,
}: MagicalPortalButtonProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [isNavigating, setIsNavigating] = useState(false);
  const router = useRouter();

  // Prefetch the route for instant navigation
  useEffect(() => {
    if (selectedCharacterId) {
      const targetRoute = `/challenge/friends?characterId=${selectedCharacterId}`;
      router.prefetch(targetRoute);
    }
  }, [selectedCharacterId, router]);

  const handleClick = () => {
    if (selectedCharacterId && !isNavigating) {
      setIsNavigating(true);
      // Now this will be instant since it's prefetched
      router.push(`/challenge/friends?characterId=${selectedCharacterId}`);
    }
  };

  if (!isVisible) return null;

  return (
    <motion.div
      className="fixed bottom-24 right-8 z-[100]"
      initial={{ opacity: 0, scale: 0, rotate: -180, y: 100 }}
      animate={{ 
        opacity: isNavigating ? 0 : 1, 
        scale: isNavigating ? 0.8 : 1, 
        rotate: 0, 
        y: 0 
      }}
      exit={{ opacity: 0, scale: 0, rotate: 180, y: 100 }}
      transition={{
        type: "spring",
        stiffness: 200,
        damping: 20,
        duration: isNavigating ? 0.3 : 1.2,
        delay: isNavigating ? 0 : 0.3,
      }}
    >
      {/* Consistent amber/golden magical aura */}
      <motion.div
        className="absolute inset-0 rounded-full pointer-events-none"
        style={{
          background: "radial-gradient(circle, rgba(255, 215, 0, 0.4) 0%, rgba(255, 165, 0, 0.3) 30%, rgba(245, 158, 11, 0.2) 60%, transparent 80%)",
          filter: "blur(12px)",
        }}
        animate={{
          scale: isHovered ? [1, 1.4, 1.2] : [1, 1.2, 1],
          opacity: isNavigating ? 0 : isHovered ? [0.4, 0.8, 0.6] : [0.3, 0.6, 0.3],
          rotate: [0, 360],
        }}
        transition={{
          scale: { duration: 2, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" },
          opacity: { duration: isNavigating ? 0.3 : 2, repeat: isNavigating ? 0 : Number.POSITIVE_INFINITY, ease: "easeInOut" },
          rotate: { duration: 8, repeat: Number.POSITIVE_INFINITY, ease: "linear" },
        }}
      />

      {/* Main button */}
      <motion.button
        onClick={handleClick}
        onHoverStart={() => setIsHovered(true)}
        onHoverEnd={() => setIsHovered(false)}
        className="relative w-16 h-16 bg-gradient-to-br from-amber-500/20 to-orange-600/20 
                   border-2 border-yellow-400/50 rounded-full backdrop-blur-sm
                   flex items-center justify-center overflow-hidden
                   hover:border-yellow-300 transition-all duration-300
                   shadow-lg hover:shadow-yellow-400/30 cursor-pointer
                   touch-manipulation"
        disabled={isNavigating}
        whileHover={{ scale: isNavigating ? 1 : 1.15 }}
        whileTap={{ scale: isNavigating ? 1 : 0.9 }}
        animate={{
          boxShadow: isNavigating 
            ? "0 0 15px rgba(255, 215, 0, 0.2)"
            : [
                "0 0 20px rgba(255, 215, 0, 0.3)",
                "0 0 30px rgba(255, 165, 0, 0.5)",
                "0 0 20px rgba(255, 215, 0, 0.3)",
              ],
        }}
        transition={{
          boxShadow: { 
            duration: isNavigating ? 0.3 : 2, 
            repeat: isNavigating ? 0 : Number.POSITIVE_INFINITY, 
            ease: "easeInOut" 
          },
        }}
      >
        {/* Enhanced sparkles icon */}
        <motion.div
          className="relative z-10 pointer-events-none"
          animate={{
            rotate: isNavigating 
              ? [0, 180] 
              : isHovered ? [0, 15, -15, 0] : [0, 5, -5, 0],
            scale: isNavigating 
              ? [1, 0.8] 
              : isHovered ? [1, 1.1, 1] : 1,
          }}
          transition={{
            duration: isNavigating ? 0.3 : isHovered ? 0.4 : 2,
            repeat: isNavigating ? 0 : Number.POSITIVE_INFINITY,
          }}
        >
          <Sparkles className="w-8 h-8 text-yellow-200" />
        </motion.div>

        {/* Simplified floating particles */}
        {!isNavigating && [...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 rounded-full pointer-events-none"
            style={{
              left: "50%",
              top: "50%",
              background: i % 2 === 0 ? "#FCD34D" : "#F59E0B",
            }}
            animate={{
              x: [0, Math.cos((i * 60 * Math.PI) / 180) * (25 + i * 2)],
              y: [0, Math.sin((i * 60 * Math.PI) / 180) * (25 + i * 2)],
              opacity: [0, 1, 0.7, 0],
              scale: [0, 1.2, 1, 0],
            }}
            transition={{
              duration: 2.5,
              repeat: Number.POSITIVE_INFINITY,
              delay: i * 0.2,
              ease: "easeOut",
            }}
          />
        ))}

        {/* Hover stars */}
        <AnimatePresence>
          {isHovered && !isNavigating &&
            [...Array(4)].map((_, i) => (
              <motion.div
                key={`star-${i}`}
                className="absolute pointer-events-none"
                style={{ left: "50%", top: "50%" }}
                initial={{ opacity: 0, scale: 0 }}
                animate={{
                  opacity: [0, 1, 0],
                  scale: [0, 1, 0],
                  x: [0, Math.cos((i * 90 * Math.PI) / 180) * 35],
                  y: [0, Math.sin((i * 90 * Math.PI) / 180) * 35],
                }}
                exit={{ opacity: 0, scale: 0 }}
                transition={{
                  duration: 1,
                  repeat: Number.POSITIVE_INFINITY,
                  delay: i * 0.2,
                }}
              >
                <Star className="w-3 h-3 text-yellow-300" />
              </motion.div>
            ))}
        </AnimatePresence>
      </motion.button>

      {/* Enhanced tooltip */}
      <motion.div
        className="absolute -top-16 left-1/2 transform -translate-x-1/2 
                   bg-gradient-to-r from-stone-900/95 to-stone-800/95 
                   border border-yellow-400/40 rounded-lg px-4 py-2
                   text-yellow-300 text-xs whitespace-nowrap backdrop-blur-sm
                   shadow-lg pointer-events-none"
        initial={{ opacity: 0, y: 10, scale: 0.8 }}
        animate={{
          opacity: isHovered && !isNavigating ? 1 : 0,
          y: isHovered && !isNavigating ? 0 : 10,
          scale: isHovered && !isNavigating ? 1 : 0.8,
        }}
        transition={{ duration: 0.3, ease: "easeOut" }}
      >
        <span className="drop-shadow-sm">
          {isNavigating ? "Opening portal..." : "Enter your Inner Circle"}
        </span>
      </motion.div>
    </motion.div>
  );
}
