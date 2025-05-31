import { Slot } from "@radix-ui/react-slot";
import { type VariantProps, cva } from "class-variance-authority";
import * as React from "react";

import { cn } from "@/lib/utils";

const retroButtonVariants = cva(
  "inline-flex items-center justify-center gap-1.5 whitespace-nowrap font-pixeloid text-sm font-medium transition-all duration-200 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-3 [&_svg]:shrink-0 outline-none pixel-perfect relative overflow-hidden",
  {
    variants: {
      variant: {
        primary:
          "bg-primary text-primary-foreground border border-primary hover:bg-primary-glow hover:shadow-retro focus-visible:ring-1 focus-visible:ring-primary/50",
        secondary:
          "bg-secondary text-secondary-foreground border border-secondary hover:bg-secondary-glow hover:shadow-[0_0_6px_var(--color-secondary)] focus-visible:ring-1 focus-visible:ring-secondary/50",
        pixel:
          "bg-card text-foreground border border-primary hover:bg-primary hover:text-primary-foreground shadow-pixel hover:shadow-pixel-lg",
        medieval:
          "bg-medieval-gold text-background border border-medieval-bronze hover:bg-medieval-bronze hover:shadow-[0_0_8px_var(--color-medieval-gold)] font-bokor",
        arcade:
          "bg-arcade-screen text-primary border border-primary shadow-arcade hover:shadow-retro-lg relative",
        destructive:
          "bg-destructive text-destructive-foreground border border-destructive hover:bg-red-600 hover:shadow-[0_0_6px_var(--color-destructive)]",
        ghost:
          "text-foreground border border-transparent hover:bg-muted hover:border-primary",
        outline:
          "border border-primary text-primary bg-transparent hover:bg-primary hover:text-primary-foreground",
      },
      size: {
        xs: "h-5 px-1.5 text-xs rounded-pixel",
        sm: "h-6 px-2 text-sm rounded-pixel-sm",
        default: "h-7 px-3 text-base rounded-pixel-md",
        lg: "h-8 px-4 text-lg rounded-pixel-lg",
        xl: "h-10 px-5 text-xl rounded-retro",
        icon: "size-7 rounded-pixel-md",
        "icon-sm": "size-6 rounded-pixel-sm",
        "icon-lg": "size-8 rounded-pixel-lg",
      },
      glow: {
        none: "",
        subtle: "hover:shadow-retro",
        medium: "shadow-retro hover:shadow-retro-lg",
        intense: "shadow-retro-lg hover:shadow-[0_0_18px_var(--color-primary),0_0_24px_var(--color-primary)]",
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