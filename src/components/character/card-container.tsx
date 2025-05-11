"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface CardContainerProps {
  children: React.ReactNode;
  index: number;
  isSelected: boolean;
}

export function CardContainer({ children, index, isSelected }: CardContainerProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className={cn(
        "rounded-lg overflow-hidden bg-stone-900/80 border border-stone-800/60",
        "shadow-lg w-[210px] shrink-0 snap-center",
        "transform transition-all duration-300",
        "group isolate flex flex-col h-auto m-auto",
        isSelected ? "ring-1 ring-yellow-500" : "hover:border-yellow-500/30"
      )}
    >
      {children}
    </motion.div>
  );
} 