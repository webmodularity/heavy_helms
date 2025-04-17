"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { GameWrapper } from "@/components/game/game-wrapper";
import { LoadingSpinner } from "@/components/ui/loading-spinner";

export function GameContainer() {
  const [showLoader, setShowLoader] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowLoader(false);
    }, 2500);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="relative w-full flex justify-center">
      {/* Always render the game wrapper */}
      <div className="w-full">
        <GameWrapper />
      </div>

      {/* Overlay with animated loader */}
    </div>
  );
}
