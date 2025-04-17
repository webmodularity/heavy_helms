"use client";

import { motion } from "framer-motion";
import { LoadingSpinner } from "@/components/ui/loading-spinner";

export function GameLoading() {
  return (
    <div className="w-full flex justify-center items-center">
      <div
        className="relative bg-black w-full overflow-hidden rounded-md flex items-center justify-center"
        style={{
          maxWidth: "960px",
          aspectRatio: "16/9",
        }}
      >
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="flex flex-col items-center justify-center text-center"
        >
          <LoadingSpinner size="lg" text="Loading game..." />
        </motion.div>
      </div>
    </div>
  );
}
