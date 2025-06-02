import { type VariantProps, cva } from "class-variance-authority";
import { motion } from "framer-motion";
import * as React from "react";
import { cn } from "@/lib/utils";

const retroFormCardVariants = cva(
  "h-full bg-gradient-to-b from-card/80 to-card/95 rounded-pixel-lg border border-primary/30 overflow-hidden pixel-perfect",
  {
    variants: {
      formType: {
        challenge: "retro-glow",
        gauntlet: "retro-glow",
        custom: "",
      },
      size: {
        sm: "p-2",
        default: "p-2.5", 
        lg: "p-3",
      },
    },
    defaultVariants: {
      formType: "challenge",
      size: "default",
    },
  }
);

export interface RetroFormCardProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof retroFormCardVariants> {
  animationDelay?: number;
}

const RetroFormCard = React.forwardRef<HTMLDivElement, RetroFormCardProps>(
  ({ className, formType, size, animationDelay = 0, children, ...props }, ref) => {
    return (
      <motion.div
        className={cn(retroFormCardVariants({ formType, size }), className)}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 20 }}
        transition={{ 
          duration: 0.4, 
          delay: animationDelay,
          exit: { duration: 0.2 }
        }}
        ref={ref}
        {...props}
      >
        {children}
      </motion.div>
    );
  }
);

RetroFormCard.displayName = "RetroFormCard";

export { RetroFormCard, retroFormCardVariants }; 