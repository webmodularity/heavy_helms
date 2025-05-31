import { Slot } from "@radix-ui/react-slot";
import { type VariantProps, cva } from "class-variance-authority";
import * as React from "react";

import { cn } from "@/lib/utils";

const retroButtonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap font-pixel text-pixel-sm font-medium transition-all duration-200 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 [&_svg]:shrink-0 outline-none pixel-perfect relative overflow-hidden",
  {
    variants: {
      variant: {
        primary:
          "bg-primary text-primary-foreground border-2 border-primary hover:bg-primary-glow hover:shadow-retro focus-visible:ring-2 focus-visible:ring-primary/50",
        secondary:
          "bg-secondary text-secondary-foreground border-2 border-secondary hover:bg-secondary-glow hover:shadow-[0_0_10px_var(--color-secondary)] focus-visible:ring-2 focus-visible:ring-secondary/50",
        pixel:
          "bg-card text-foreground border border-primary hover:bg-primary hover:text-primary-foreground shadow-pixel hover:shadow-pixel-lg",
        medieval:
          "bg-medieval-gold text-background border-2 border-medieval-bronze hover:bg-medieval-bronze hover:shadow-[0_0_15px_var(--color-medieval-gold)] font-bokor",
        arcade:
          "bg-arcade-screen text-primary border-2 border-primary shadow-arcade hover:shadow-retro-lg relative",
        destructive:
          "bg-destructive text-destructive-foreground border-2 border-destructive hover:bg-red-600 hover:shadow-[0_0_10px_var(--color-destructive)]",
        ghost:
          "text-foreground border border-transparent hover:bg-muted hover:border-primary",
        outline:
          "border-2 border-primary text-primary bg-transparent hover:bg-primary hover:text-primary-foreground",
      },
      size: {
        xs: "h-6 px-2 text-pixel-xs rounded-pixel",
        sm: "h-8 px-3 text-pixel-sm rounded-pixel-sm",
        default: "h-10 px-4 text-pixel-base rounded-pixel-md",
        lg: "h-12 px-6 text-pixel-lg rounded-pixel-lg",
        xl: "h-14 px-8 text-pixel-xl rounded-retro",
        icon: "size-10 rounded-pixel-md",
        "icon-sm": "size-8 rounded-pixel-sm",
        "icon-lg": "size-12 rounded-pixel-lg",
      },
      glow: {
        none: "",
        subtle: "hover:shadow-retro",
        medium: "shadow-retro hover:shadow-retro-lg",
        intense: "shadow-retro-lg hover:shadow-[0_0_30px_var(--color-primary),0_0_50px_var(--color-primary)]",
      },
      pixelBorder: {
        true: "border-style-[solid] image-rendering-[pixelated]",
        false: "",
      }
    },
    defaultVariants: {
      variant: "primary",
      size: "default",
      glow: "none",
      pixelBorder: true,
    },
  },
);

// Add scan line effect for arcade variant
const scanlineVariants = cva("", {
  variants: {
    variant: {
      arcade: "before:absolute before:inset-0 before:bg-[linear-gradient(transparent_50%,rgba(0,255,255,0.03)_50%)] before:bg-[length:100%_2px] before:pointer-events-none",
      default: "",
    },
  },
  defaultVariants: {
    variant: "default",
  },
});

export interface RetroButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof retroButtonVariants> {
  asChild?: boolean;
  glow?: "none" | "subtle" | "medium" | "intense";
  pixelBorder?: boolean;
}

const RetroButton = React.forwardRef<HTMLButtonElement, RetroButtonProps>(
  ({ className, variant, size, glow, pixelBorder, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(
          retroButtonVariants({ variant, size, glow, pixelBorder }),
          scanlineVariants({ variant }),
          className
        )}
        ref={ref}
        {...props}
      />
    );
  },
);
RetroButton.displayName = "RetroButton";

export { RetroButton, retroButtonVariants }; 