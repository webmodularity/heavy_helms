"use client";

import { motion } from "framer-motion";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface SectionHeaderProps {
  title: string;
  subtitle: string | ReactNode;
  icon?: ReactNode;
  className?: string;
}

export function SectionHeader({
  title,
  subtitle,
  icon,
  className,
}: SectionHeaderProps) {
  return (
    <div className={cn("text-center mb-8", className)}>
      {icon && <div className="flex justify-center mb-2">{icon}</div>}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 0.2 }}
      >
        <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-amber-600 uppercase tracking-widest mb-1">
          {title}
        </h2>
        <div className="flex items-center justify-center mb-3">
          <div className="h-[1px] w-12 bg-yellow-600/40" />
          <div className="mx-4">
            {typeof subtitle === "string" ? (
              <span className="text-yellow-400/90 text-sm font-medium tracking-widest">
                {subtitle}
              </span>
            ) : (
              subtitle
            )}
          </div>
          <div className="h-[1px] w-12 bg-yellow-600/40" />
        </div>
      </motion.div>
    </div>
  );
}
