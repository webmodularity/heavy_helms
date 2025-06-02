import { type VariantProps, cva } from "class-variance-authority";
import { motion } from "framer-motion";
import * as React from "react";
import { cn } from "@/lib/utils";

const retroBattleCardVariants = cva(
  "relative bg-gradient-to-b from-card/60 to-card/90 rounded-pixel-lg border overflow-hidden pixel-perfect transition-all duration-200",
  {
    variants: {
      variant: {
        arcade: "border-primary/20 hover:border-primary/50 bg-gradient-to-b from-arcade-screen/30 to-card/90",
        pixel: "border-primary/20 hover:border-primary/40 pixel-shadow hover:pixel-shadow-lg",
        crt: "border-primary/20 hover:border-primary/40 crt-shadow",
      },
      size: {
        sm: "p-2 min-h-[120px]",
        default: "p-2.5 min-h-[140px]",
        lg: "p-3 min-h-[160px]",
      },
      interactive: {
        true: "cursor-pointer hover:scale-[1.01]",
        false: "cursor-default",
      },
    },
    defaultVariants: {
      variant: "arcade",
      size: "default",
      interactive: true,
    },
  }
);

const retroBattleCardGlowVariants = cva(
  "absolute inset-0 transition-opacity duration-400",
  {
    variants: {
      variant: {
        arcade: "bg-gradient-to-r from-primary/10 to-primary/5",
        pixel: "bg-gradient-to-r from-primary/8 to-primary/3",
        crt: "bg-gradient-to-r from-primary/12 to-primary/6",
      },
    },
    defaultVariants: {
      variant: "arcade",
    },
  }
);

export interface RetroBattleCardProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof retroBattleCardVariants> {
  isHighlighted?: boolean;
  animationDelay?: number;
  glowDelay?: number;
  loading?: boolean;
}

const RetroBattleCard = React.forwardRef<HTMLDivElement, RetroBattleCardProps>(
  ({ 
    className, 
    variant, 
    size, 
    interactive, 
    isHighlighted = false,
    animationDelay = 0,
    glowDelay = 0,
    loading = false,
    children,
    onClick,
    ...props 
  }, ref) => {
    const isClickable = interactive && !loading && onClick;

    return (
      <motion.div
        className={cn(
          retroBattleCardVariants({ variant, size, interactive }),
          loading && "opacity-70 pointer-events-none",
          className
        )}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: animationDelay }}
        whileHover={isClickable ? {
          scale: 1.01,
          borderColor: variant === "arcade" ? "rgba(rgb(var(--color-primary)), 0.5)" : undefined,
        } : {}}
        onClick={isClickable ? onClick : undefined}
        ref={ref}
        {...props}
      >
        {/* Content */}
        <div className="relative z-10 h-full flex flex-col">
          {children}
        </div>

        {/* Background glow effect */}
        <motion.div
          className={cn(retroBattleCardGlowVariants({ variant }))}
          initial={{ opacity: 0 }}
          animate={{ opacity: isHighlighted ? 0.2 : 0 }}
          transition={{ duration: 0.4, delay: glowDelay }}
        />

        {/* Scanlines for arcade variant */}
        {variant === "arcade" && (
          <div className="absolute inset-0 bg-[linear-gradient(transparent_50%,rgba(0,255,255,0.02)_50%)] bg-[length:100%_2px] pointer-events-none opacity-60" />
        )}
      </motion.div>
    );
  }
);

RetroBattleCard.displayName = "RetroBattleCard";

export { RetroBattleCard, retroBattleCardVariants }; 