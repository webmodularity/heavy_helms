"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Star, Users } from "lucide-react";
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
      className="fixed bottom-4 right-4 z-[90]"
      initial={{ opacity: 0, scale: 0, rotate: -180, y: 50 }}
      animate={{
        opacity: isNavigating ? 0 : 1,
        scale: isNavigating ? 0.7 : 1,
        rotate: 0,
        y: 0,
      }}
      exit={{ opacity: 0, scale: 0, rotate: 180, y: 50 }}
      transition={{
        type: "spring",
        stiffness: 200,
        damping: 20,
        duration: isNavigating ? 0.3 : 1.0,
        delay: isNavigating ? 0 : 0.5,
      }}
    >
      {/* Reduced magical aura */}
      <motion.div
        className="absolute inset-0 rounded-full pointer-events-none"
        style={{
          background:
            "radial-gradient(circle, rgba(255, 215, 0, 0.3) 0%, rgba(255, 165, 0, 0.2) 30%, rgba(245, 158, 11, 0.1) 60%, transparent 80%)",
          filter: "blur(8px)",
        }}
        animate={{
          scale: isHovered ? [1, 1.3, 1.1] : [1, 1.1, 1],
          opacity: isNavigating
            ? 0
            : isHovered
              ? [0.3, 0.6, 0.4]
              : [0.2, 0.4, 0.2],
          rotate: [0, 360],
        }}
        transition={{
          scale: {
            duration: 2.5,
            repeat: Number.POSITIVE_INFINITY,
            ease: "easeInOut",
          },
          opacity: {
            duration: isNavigating ? 0.3 : 2.5,
            repeat: isNavigating ? 0 : Number.POSITIVE_INFINITY,
            ease: "easeInOut",
          },
          rotate: {
            duration: 10,
            repeat: Number.POSITIVE_INFINITY,
            ease: "linear",
          },
        }}
      />

      {/* Smaller main button */}
      <motion.button
        onClick={handleClick}
        onHoverStart={() => setIsHovered(true)}
        onHoverEnd={() => setIsHovered(false)}
        className="relative w-12 h-12 bg-gradient-to-br from-amber-500/15 to-orange-600/15 
                   border border-yellow-400/40 rounded-full backdrop-blur-sm
                   flex items-center justify-center overflow-hidden
                   hover:border-yellow-300/60 transition-all duration-300
                   shadow-md hover:shadow-yellow-400/20 cursor-pointer
                   touch-manipulation"
        disabled={isNavigating}
        whileHover={{ scale: isNavigating ? 1 : 1.1 }}
        whileTap={{ scale: isNavigating ? 1 : 0.85 }}
        animate={{
          boxShadow: isNavigating
            ? "0 0 10px rgba(255, 215, 0, 0.1)"
            : [
                "0 0 15px rgba(255, 215, 0, 0.2)",
                "0 0 20px rgba(255, 165, 0, 0.3)",
                "0 0 15px rgba(255, 215, 0, 0.2)",
              ],
        }}
        transition={{
          boxShadow: {
            duration: isNavigating ? 0.3 : 3,
            repeat: isNavigating ? 0 : Number.POSITIVE_INFINITY,
            ease: "easeInOut",
          },
        }}
      >
        {/* Smaller sparkles icon */}
        <motion.div
          className="relative z-10 pointer-events-none"
          animate={{
            rotate: isNavigating
              ? [0, 180]
              : isHovered
                ? [0, 10, -10, 0]
                : [0, 3, -3, 0],
            scale: isNavigating ? [1, 0.7] : isHovered ? [1, 1.05, 1] : 1,
          }}
          transition={{
            duration: isNavigating ? 0.3 : isHovered ? 0.5 : 3,
            repeat: isNavigating ? 0 : Number.POSITIVE_INFINITY,
          }}
        >
          <Users className="w-5 h-5 text-yellow-200/80" />
        </motion.div>

        {/* Reduced floating particles */}
        {!isNavigating &&
          [...Array(3)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-0.5 h-0.5 rounded-full pointer-events-none"
              style={{
                left: "50%",
                top: "50%",
                background: i % 2 === 0 ? "#FCD34D" : "#F59E0B",
              }}
              animate={{
                x: [0, Math.cos((i * 120 * Math.PI) / 180) * (15 + i * 1)],
                y: [0, Math.sin((i * 120 * Math.PI) / 180) * (15 + i * 1)],
                opacity: [0, 0.8, 0.5, 0],
                scale: [0, 1, 0.8, 0],
              }}
              transition={{
                duration: 3,
                repeat: Number.POSITIVE_INFINITY,
                delay: i * 0.3,
                ease: "easeOut",
              }}
            />
          ))}

        {/* Smaller hover stars */}
        <AnimatePresence>
          {isHovered &&
            !isNavigating &&
            [...Array(2)].map((_, i) => (
              <motion.div
                key={`star-${i}`}
                className="absolute pointer-events-none"
                style={{ left: "50%", top: "50%" }}
                initial={{ opacity: 0, scale: 0 }}
                animate={{
                  opacity: [0, 1, 0],
                  scale: [0, 0.8, 0],
                  x: [0, Math.cos((i * 180 * Math.PI) / 180) * 20],
                  y: [0, Math.sin((i * 180 * Math.PI) / 180) * 20],
                }}
                exit={{ opacity: 0, scale: 0 }}
                transition={{
                  duration: 1.2,
                  repeat: Number.POSITIVE_INFINITY,
                  delay: i * 0.3,
                }}
              >
                <Star className="w-2 h-2 text-yellow-300/70" />
              </motion.div>
            ))}
        </AnimatePresence>
      </motion.button>

      {/* Smaller tooltip */}
      <motion.div
        className="absolute -top-12 left-1/2 transform -translate-x-1/2 
                   bg-gradient-to-r from-stone-900/90 to-stone-800/90 
                   border border-yellow-400/30 rounded-md px-2 py-1
                   text-yellow-300/90 text-[10px] whitespace-nowrap backdrop-blur-sm
                   shadow-md pointer-events-none"
        initial={{ opacity: 0, y: 5, scale: 0.8 }}
        animate={{
          opacity: isHovered && !isNavigating ? 1 : 0,
          y: isHovered && !isNavigating ? 0 : 5,
          scale: isHovered && !isNavigating ? 1 : 0.8,
        }}
        transition={{ duration: 0.2, ease: "easeOut" }}
      >
        <span className="drop-shadow-sm">
          {isNavigating ? "Opening..." : "Inner Circle"}
        </span>
      </motion.div>
    </motion.div>
  );
}
