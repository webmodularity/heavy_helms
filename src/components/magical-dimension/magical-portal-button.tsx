"use client";

import { motion } from "framer-motion";
import { Sparkles, Star } from "lucide-react";
import { useState } from "react";

interface MagicalPortalButtonProps {
  onClick: () => void;
  isVisible: boolean;
}

export function MagicalPortalButton({
  onClick,
  isVisible,
}: MagicalPortalButtonProps) {
  const [isHovered, setIsHovered] = useState(false);

  if (!isVisible) return null;

  return (
    <motion.div
      className="fixed bottom-24 right-8 z-40"
      initial={{ opacity: 0, scale: 0, rotate: -180 }}
      animate={{ opacity: 1, scale: 1, rotate: 0 }}
      exit={{ opacity: 0, scale: 0, rotate: 180 }}
      transition={{
        type: "spring",
        stiffness: 200,
        damping: 20,
        duration: 0.8,
      }}
    >
      {/* Magical aura effect */}
      <motion.div
        className="absolute inset-0 rounded-full"
        style={{
          background:
            "radial-gradient(circle, rgba(255, 215, 0, 0.3) 0%, rgba(255, 165, 0, 0.2) 40%, transparent 70%)",
          filter: "blur(8px)",
        }}
        animate={{
          scale: isHovered ? [1, 1.2, 1] : [1, 1.1, 1],
          opacity: isHovered ? [0.3, 0.6, 0.3] : [0.2, 0.4, 0.2],
        }}
        transition={{
          duration: 2,
          repeat: Number.POSITIVE_INFINITY,
          ease: "easeInOut",
        }}
      />

      {/* Main button */}
      <motion.button
        onClick={onClick}
        onHoverStart={() => setIsHovered(true)}
        onHoverEnd={() => setIsHovered(false)}
        className="relative w-16 h-16 bg-gradient-to-br from-amber-500/20 to-orange-600/20 
                   border-2 border-yellow-400/50 rounded-full backdrop-blur-sm
                   flex items-center justify-center overflow-hidden
                   hover:border-yellow-300 transition-all duration-300
                   shadow-lg hover:shadow-yellow-400/20"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
      >
        {/* Inner magical glow */}
        <motion.div
          className="absolute inset-2 rounded-full bg-gradient-to-br from-yellow-400/30 to-orange-500/30"
          animate={{
            rotate: 360,
          }}
          transition={{
            duration: 8,
            repeat: Number.POSITIVE_INFINITY,
            ease: "linear",
          }}
        />

        {/* Sparkles icon */}
        <motion.div
          className="relative z-10"
          animate={{
            rotate: isHovered ? [0, 10, -10, 0] : 0,
          }}
          transition={{
            duration: 0.5,
            repeat: isHovered ? Number.POSITIVE_INFINITY : 0,
          }}
        >
          <Sparkles className="w-8 h-8 text-yellow-300" />
        </motion.div>

        {/* Floating particles */}
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-yellow-400 rounded-full"
            style={{
              left: "50%",
              top: "50%",
            }}
            animate={{
              x: [0, Math.cos((i * 60 * Math.PI) / 180) * 25],
              y: [0, Math.sin((i * 60 * Math.PI) / 180) * 25],
              opacity: [0, 1, 0],
              scale: [0, 1, 0],
            }}
            transition={{
              duration: 2,
              repeat: Number.POSITIVE_INFINITY,
              delay: i * 0.3,
              ease: "easeOut",
            }}
          />
        ))}
      </motion.button>

      {/* Tooltip */}
      <motion.div
        className="absolute -top-12 left-1/2 transform -translate-x-1/2 
                   bg-stone-900/90 border border-yellow-400/30 rounded-lg px-3 py-1.5
                   text-yellow-300 text-xs whitespace-nowrap backdrop-blur-sm"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: isHovered ? 1 : 0, y: isHovered ? 0 : 10 }}
        transition={{ duration: 0.2 }}
      >
        Enter the Dimension of Following
        <div
          className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 
                        w-2 h-2 bg-stone-900 border-r border-b border-yellow-400/30 
                        rotate-45"
        />
      </motion.div>
    </motion.div>
  );
}
