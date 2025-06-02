import { type VariantProps, cva } from "class-variance-authority";
import { motion } from "framer-motion";
import { ChevronUp } from "lucide-react";
import * as React from "react";
import { cn } from "@/lib/utils";

const retroOverlayVariants = cva(
  "absolute inset-0 backdrop-blur-sm flex flex-col items-center justify-center z-10 pixel-perfect",
  {
    variants: {
      type: {
        "coming-soon": "bg-black/60",
        "select-character": "bg-black/50",
        loading: "bg-black/70",
      },
    },
    defaultVariants: {
      type: "coming-soon",
    },
  }
);

const retroOverlayBadgeVariants = cva(
  "relative px-3 py-1 bg-black rounded-pixel-md font-pixeloid text-pixel-xs font-bold text-transparent bg-clip-text",
  {
    variants: {
      type: {
        "coming-soon": "border border-primary/30 bg-gradient-to-r from-primary to-primary/80",
        "select-character": "border border-primary/30 bg-gradient-to-r from-primary to-primary/60",
        loading: "border border-muted/30 bg-gradient-to-r from-muted to-muted/80",
      },
    },
    defaultVariants: {
      type: "coming-soon",
    },
  }
);

const retroOverlayGlowVariants = cva(
  "absolute -inset-0.5 rounded-pixel-md blur-sm opacity-50",
  {
    variants: {
      type: {
        "coming-soon": "bg-gradient-to-r from-primary to-primary/80 animate-pulse",
        "select-character": "bg-gradient-to-r from-primary to-primary/60 animate-pulse",
        loading: "bg-gradient-to-r from-muted to-muted/80",
      },
    },
    defaultVariants: {
      type: "coming-soon",
    },
  }
);

export interface RetroOverlayProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof retroOverlayVariants> {
  title: string;
  description?: string;
  showIcon?: boolean;
  animationDelay?: number;
}

const RetroOverlay = React.forwardRef<HTMLDivElement, RetroOverlayProps>(
  ({ className, type, title, description, showIcon = true, animationDelay = 0, ...props }, ref) => {
    const getIconColor = () => {
      switch (type) {
        case "coming-soon":
          return "text-primary/60";
        case "select-character":
          return "text-primary/60";
        default:
          return "text-muted/60";
      }
    };

    const getDescriptionColor = () => {
      switch (type) {
        case "coming-soon":
          return "text-primary/60";
        case "select-character":
          return "text-primary/70";
        default:
          return "text-muted/60";
      }
    };

    return (
      <motion.div
        className={cn(retroOverlayVariants({ type }), className)}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4, delay: animationDelay }}
        ref={ref}
        {...props}
      >
        <div className="relative">
          <div className={cn(retroOverlayGlowVariants({ type }))} />
          <div className={cn(retroOverlayBadgeVariants({ type }))}>
            {title}
          </div>
        </div>
        
        {description && (
          <motion.p
            className={cn(
              "text-pixel-xs mt-2 max-w-[80%] text-center font-pixeloid",
              getDescriptionColor()
            )}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: animationDelay + 0.1 }}
          >
            {description}
          </motion.p>
        )}
        
        {showIcon && type === "select-character" && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: animationDelay + 0.2 }}
          >
            <ChevronUp className={cn("h-4 w-4 mt-2 animate-bounce", getIconColor())} />
          </motion.div>
        )}
      </motion.div>
    );
  }
);

RetroOverlay.displayName = "RetroOverlay";

export { RetroOverlay, retroOverlayVariants }; 