import { type VariantProps, cva } from "class-variance-authority";
import { motion } from "framer-motion";
import * as React from "react";
import { cn } from "@/lib/utils";

const retroActionButtonVariants = cva(
  "w-full relative overflow-hidden font-pixeloid font-bold uppercase tracking-wider pixel-perfect transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed group",
  {
    variants: {
      variant: {
        primary: [
          "bg-gradient-to-b from-primary/60 to-primary/90",
          "border-2 border-primary",
          "text-background shadow-pixel",
          "hover:from-primary/80 hover:to-primary",
          "hover:shadow-retro-lg hover:border-primary/80",
          "active:shadow-pixel active:scale-[0.98]",
          "before:absolute before:inset-0 before:bg-gradient-to-r before:from-transparent before:via-white/20 before:to-transparent before:translate-x-[-100%] hover:before:translate-x-[100%] before:transition-transform before:duration-500",
        ],
        secondary: [
          "bg-gradient-to-b from-secondary/60 to-secondary/90", 
          "border-2 border-secondary",
          "text-background shadow-pixel",
          "hover:from-secondary/80 hover:to-secondary",
          "hover:shadow-[0_0_15px_var(--color-secondary)] hover:border-secondary/80",
          "active:shadow-pixel active:scale-[0.98]",
        ],
        coming: [
          "bg-gradient-to-b from-muted/30 to-muted/50",
          "border border-muted/40",
          "text-muted/70 cursor-default",
          "relative overflow-hidden",
          "before:absolute before:inset-0 before:bg-[linear-gradient(45deg,transparent_25%,rgba(255,255,255,0.1)_50%,transparent_75%)] before:bg-[length:20px_20px] before:animate-pulse",
        ],
        pixel: [
          "bg-card border-2 border-primary text-primary",
          "hover:bg-primary hover:text-primary-foreground",
          "pixel-shadow hover:pixel-shadow-lg hover:retro-glow",
          "active:scale-[0.98]",
        ],
        arcade: [
          "bg-gradient-to-b from-primary/20 to-primary/40",
          "border-2 border-primary",
          "text-primary retro-glow",
          "hover:from-primary/40 hover:to-primary/60",
          "hover:retro-glow-lg hover:text-background",
          "active:shadow-arcade active:scale-[0.98]",
          "before:absolute before:inset-0 before:bg-[linear-gradient(transparent_50%,rgba(0,255,255,0.1)_50%)] before:bg-[length:100%_2px]",
        ],
      },
      size: {
        xs: "py-1 px-2 text-pixel-xs rounded-pixel-sm min-h-[20px]",
        sm: "py-1.5 px-2.5 text-pixel-xs rounded-pixel-md min-h-[24px]",
        default: "py-2 px-3 text-pixel-sm rounded-pixel-md min-h-[28px]",
        lg: "py-2.5 px-4 text-pixel-base rounded-pixel-lg min-h-[32px]",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "default",
    },
  }
);

export interface RetroActionButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof retroActionButtonVariants> {
  loading?: boolean;
  withShimmer?: boolean;
  withPulse?: boolean;
}

const RetroActionButton = React.forwardRef<HTMLButtonElement, RetroActionButtonProps>(
  ({ 
    className, 
    variant, 
    size, 
    loading = false, 
    withShimmer = true, 
    withPulse = false,
    children, 
    disabled, 
    ...props 
  }, ref) => {
    const isDisabled = disabled || loading || variant === "coming";

    return (
      <motion.button
        className={cn(retroActionButtonVariants({ variant, size }), className)}
        whileHover={!isDisabled ? { 
          scale: 1.02,
          boxShadow: variant === "primary" 
            ? "0 0 20px rgb(var(--color-primary)), 0 0 30px rgb(var(--color-primary))"
            : undefined
        } : {}}
        whileTap={!isDisabled ? { scale: 0.96 } : {}}
        disabled={isDisabled}
        ref={ref}
        {...props}
      >
        {/* Animated border glow for primary variant */}
        {variant === "primary" && !isDisabled && (
          <motion.div
            className="absolute inset-0 rounded-pixel-md border-2 border-primary/50"
            animate={{
              borderColor: [
                "rgba(rgb(var(--color-primary)), 0.3)",
                "rgba(rgb(var(--color-primary)), 0.8)",
                "rgba(rgb(var(--color-primary)), 0.3)",
              ],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        )}

        {/* Enhanced shimmer effect */}
        {withShimmer && variant !== "coming" && !isDisabled && (
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent transform translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 ease-out" />
        )}

        {/* Pulse effect for critical actions */}
        {withPulse && variant === "primary" && !isDisabled && (
          <motion.div
            className="absolute inset-0 bg-primary/20 rounded-pixel-md"
            animate={{
              opacity: [0, 0.3, 0],
              scale: [1, 1.05, 1],
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        )}

        {/* Loading spinner */}
        {loading && (
          <motion.div
            className="absolute inset-0 flex items-center justify-center bg-primary/80 rounded-pixel-md"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.2 }}
          >
            <div className="w-3 h-3 border border-background border-t-transparent rounded-full animate-spin" />
          </motion.div>
        )}

        {/* Content with enhanced typography */}
        <span className={cn(
          "relative z-10 flex items-center justify-center gap-1.5 transition-all duration-200",
          loading && "opacity-0"
        )}>
          {variant === "primary" && !isDisabled && (
            <motion.span
              className="text-pixel-xs"
              animate={{ opacity: [0.7, 1, 0.7] }}
              transition={{ duration: 1, repeat: Infinity }}
            >
              ►
            </motion.span>
          )}
          
          <span className="tracking-wider">
            {children}
          </span>
          
          {variant === "primary" && !isDisabled && (
            <motion.span
              className="text-pixel-xs"
              animate={{ opacity: [0.7, 1, 0.7] }}
              transition={{ duration: 1, repeat: Infinity, delay: 0.5 }}
            >
              ◄
            </motion.span>
          )}
        </span>

        {/* Special effects overlay for arcade variant */}
        {variant === "arcade" && !isDisabled && (
          <div className="absolute inset-0 bg-[linear-gradient(transparent_50%,rgba(0,255,255,0.05)_50%)] bg-[length:100%_2px] pointer-events-none" />
        )}

        {/* Coming soon pattern */}
        {variant === "coming" && (
          <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(255,255,255,0.05)_50%,transparent_75%)] bg-[length:12px_12px] animate-pulse pointer-events-none" />
        )}
      </motion.button>
    );
  }
);

RetroActionButton.displayName = "RetroActionButton";

export { RetroActionButton, retroActionButtonVariants }; 