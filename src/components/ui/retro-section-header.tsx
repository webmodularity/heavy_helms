import { type VariantProps, cva } from "class-variance-authority";
import { motion, type HTMLMotionProps } from "framer-motion";
import * as React from "react";
import { cn } from "@/lib/utils";

const retroSectionHeaderVariants = cva(
  "text-center mb-4 pixel-perfect font-pixeloid",
  {
    variants: {
      variant: {
        battle: "text-primary retro-glow",
        battleFramed:
          "text-primary retro-glow border-b-2 border-primary/30 pb-2",
        activity: "text-secondary",
        default: "text-foreground",
      },
      size: {
        sm: "mb-2",
        default: "mb-4",
        lg: "mb-6",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

const retroSectionTitleVariants = cva(
  "font-bold text-transparent bg-clip-text uppercase tracking-wider",
  {
    variants: {
      variant: {
        battle: "bg-gradient-to-r from-primary to-primary/80 text-pixel-lg",
        activity:
          "bg-gradient-to-r from-secondary to-secondary/80 text-pixel-lg",
        default:
          "bg-gradient-to-r from-foreground to-foreground/80 text-pixel-lg",
        battleFramed:
          "bg-gradient-to-r from-primary to-primary/80 text-pixel-lg",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

const retroSectionSubtitleVariants = cva(
  "font-pixeloid uppercase tracking-wide text-pixel-sm",
  {
    variants: {
      variant: {
        battle: "text-primary/90 text-pixel-base",
        activity: "text-secondary/90",
        default: "text-foreground/90",
        battleFramed: "text-primary/90",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

export interface RetroSectionHeaderProps
  extends Omit<HTMLMotionProps<"div">, "children">,
    VariantProps<typeof retroSectionHeaderVariants> {
  title: string;
  subtitle?: string;
  animationDelay?: number;
}

const RetroSectionHeader = React.forwardRef<
  HTMLDivElement,
  RetroSectionHeaderProps
>(
  (
    { className, variant, size, title, subtitle, animationDelay = 0, ...props },
    ref,
  ) => {
    return (
      <motion.div
        className={cn(retroSectionHeaderVariants({ variant, size }), className)}
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: animationDelay }}
        ref={ref}
        {...props}
      >
        <h2 className={cn(retroSectionTitleVariants({ variant }))}>{title}</h2>
        {subtitle ? (
          <motion.div
            className={cn(retroSectionSubtitleVariants({ variant }))}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3, delay: animationDelay + 0.1 }}
          >
            {subtitle}
          </motion.div>
        ) : null}
      </motion.div>
    );
  },
);

RetroSectionHeader.displayName = "RetroSectionHeader";

export { RetroSectionHeader, retroSectionHeaderVariants };
