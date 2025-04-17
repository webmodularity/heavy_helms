"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { GameWrapper } from "@/components/game/game-wrapper";
import { LoadingSpinner } from "@/components/ui/loading-spinner";

export function GameContainer() {
  const [showLoader, setShowLoader] = useState(true);

  useEffect(() => {
    // Keep loader visible for a fixed time to ensure Phaser initializes
    // This is simpler and more reliable than coordinating with Phaser events
    const timer = setTimeout(() => {
      setShowLoader(false);
    }, 2500); // Adjust timing as needed

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="relative w-full">
      {/* Always render the game wrapper */}
      <div className="w-full">
        <GameWrapper />
      </div>
      
      {/* Overlay with animated loader */}
      <AnimatePresence>
        {showLoader && (
          <motion.div 
            className="absolute inset-0 bg-black flex items-center justify-center z-50"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.7 }}
          >
            <div
              className="relative w-full overflow-hidden rounded-md flex items-center justify-center"
              style={{
                maxWidth: "960px",
                aspectRatio: "16/9",
              }}
            >
              <div className="flex flex-col items-center justify-center">
                <LoadingSpinner size="lg" text="Loading game..." />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
