"use client";

import { motion } from "framer-motion";

interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg";
  text?: string;
  fullScreen?: boolean;
}

export function LoadingSpinner({ 
  size = "md", 
  text, 
  fullScreen = false 
}: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: "w-8 h-8",
    md: "w-16 h-16",
    lg: "w-24 h-24",
  };

  const spinnerContent = (
    <div className="flex flex-col items-center justify-center space-y-4 text-center">
      <div className={`relative ${sizeClasses[size]}`}>
        <div className="absolute inset-0 rounded-full border-t-2 border-yellow-500 animate-spin" />
        <div className="absolute inset-2 rounded-full border-t-2 border-yellow-300 animate-spin-slow" />
      </div>
      {text && (
        <motion.p 
          className="text-yellow-500 font-medieval mt-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          {text}
        </motion.p>
      )}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-black/60 z-50">
        {spinnerContent}
      </div>
    );
  }

  return spinnerContent;
}
