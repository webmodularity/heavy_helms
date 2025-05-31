import * as React from "react";
import { type VariantProps, cva } from "class-variance-authority";
import { cn } from "@/lib/utils";

const retroInputVariants = cva(
  "flex min-w-0 w-full font-pixeloid text-base bg-transparent transition-all duration-200 outline-none disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 pixel-perfect",
  {
    variants: {
      variant: {
        default:
          "border border-input bg-input/20 text-foreground placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/50",
        arcade:
          "border-2 border-primary bg-arcade-screen text-primary placeholder:text-primary/50 focus-visible:border-primary-glow focus-visible:shadow-retro",
        medieval:
          "border-2 border-medieval-bronze bg-medieval-stone/20 text-foreground placeholder:text-muted-foreground focus-visible:border-medieval-gold focus-visible:ring-2 focus-visible:ring-medieval-gold/50",
        pixel:
          "border border-primary bg-card text-foreground placeholder:text-muted-foreground shadow-pixel focus-visible:shadow-pixel-lg focus-visible:border-primary-glow",
        neon:
          "border-2 border-primary bg-transparent text-primary placeholder:text-primary/40 focus-visible:border-primary-glow focus-visible:shadow-[0_0_10px_var(--color-primary)]",
        ghost:
          "border border-transparent bg-muted/30 text-foreground placeholder:text-muted-foreground focus-visible:border-primary focus-visible:bg-muted/50",
      },
      size: {
        sm: "h-8 px-3 py-1 text-sm rounded-pixel-sm",
        default: "h-10 px-3 py-2 text-base rounded-pixel-md",
        lg: "h-12 px-4 py-2 text-lg rounded-retro",
      },
      rounded: {
        none: "rounded-none",
        pixel: "rounded-pixel",
        retro: "rounded-retro",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
      rounded: "pixel",
    },
  }
);

export interface RetroInputProps
  extends React.InputHTMLAttributes<HTMLInputElement>,
    VariantProps<typeof retroInputVariants> {
  withGlow?: boolean;
  withScanlines?: boolean;
}

const RetroInput = React.forwardRef<HTMLInputElement, RetroInputProps>(
  ({ className, variant, size, rounded, withGlow, withScanlines, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          retroInputVariants({ variant, size, rounded }),
          withGlow && "focus-visible:shadow-retro",
          withScanlines && "scanlines",
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);

RetroInput.displayName = "RetroInput";

export { RetroInput, retroInputVariants }; 