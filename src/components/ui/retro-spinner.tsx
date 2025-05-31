import * as React from "react";
import { type VariantProps, cva } from "class-variance-authority";
import { cn } from "@/lib/utils";

const retroSpinnerVariants = cva(
  "animate-spin pixel-perfect",
  {
    variants: {
      variant: {
        default: "border-2 border-muted border-t-primary rounded-full",
        arcade: "border-2 border-arcade-bezel border-t-primary rounded-full shadow-retro",
        pixel: "border border-muted border-t-primary rounded-none shadow-pixel",
        neon: "border-2 border-transparent border-t-primary rounded-full shadow-[0_0_10px_var(--color-primary)]",
        medieval: "border-2 border-medieval-bronze border-t-medieval-gold rounded-full",
        dots: "border-none bg-transparent",
      },
      size: {
        xs: "size-3 border",
        sm: "size-4 border",
        default: "size-6 border-2",
        lg: "size-8 border-2",
        xl: "size-12 border-2",
      },
      speed: {
        slow: "animate-[spin_2s_linear_infinite]",
        normal: "animate-[spin_1s_linear_infinite]",
        fast: "animate-[spin_0.5s_linear_infinite]",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
      speed: "normal",
    },
  }
);

export interface RetroSpinnerProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof retroSpinnerVariants> {
  withGlow?: boolean;
}

const RetroSpinner = React.forwardRef<HTMLDivElement, RetroSpinnerProps>(
  ({ className, variant, size, speed, withGlow, ...props }, ref) => {
    if (variant === "dots") {
      return (
        <div
          ref={ref}
          className={cn(
            "flex gap-1",
            size === "xs" && "gap-0.5",
            size === "sm" && "gap-0.5",
            size === "lg" && "gap-1.5",
            size === "xl" && "gap-2",
            className
          )}
          {...props}
        >
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className={cn(
                "bg-primary rounded-pixel animate-pulse pixel-perfect",
                size === "xs" && "size-1",
                size === "sm" && "size-1.5",
                size === "default" && "size-2",
                size === "lg" && "size-2.5",
                size === "xl" && "size-3",
                withGlow && "shadow-retro",
                speed === "slow" && "animate-[pulse_2s_infinite]",
                speed === "normal" && "animate-[pulse_1.5s_infinite]",
                speed === "fast" && "animate-[pulse_1s_infinite]",
              )}
              style={{
                animationDelay: `${i * 0.2}s`,
              }}
            />
          ))}
        </div>
      );
    }

    return (
      <div
        ref={ref}
        className={cn(
          retroSpinnerVariants({ variant, size, speed }),
          withGlow && "shadow-retro",
          className
        )}
        {...props}
      />
    );
  }
);

RetroSpinner.displayName = "RetroSpinner";

export { RetroSpinner, retroSpinnerVariants }; 