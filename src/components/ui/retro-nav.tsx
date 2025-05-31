import * as React from "react";
import { type VariantProps, cva } from "class-variance-authority";
import { cn } from "@/lib/utils";

const retroNavVariants = cva(
  "flex font-pixel pixel-perfect",
  {
    variants: {
      variant: {
        arcade: "bg-arcade-screen border-2 border-primary shadow-arcade",
        medieval: "bg-gradient-to-r from-medieval-stone to-medieval-bronze border-2 border-medieval-gold",
        pixel: "bg-card border border-primary shadow-pixel",
        neon: "bg-transparent border-2 border-primary shadow-retro",
        crt: "bg-arcade-screen border-2 border-primary shadow-crt crt-container",
      },
      orientation: {
        horizontal: "flex-row",
        vertical: "flex-col",
      },
      size: {
        sm: "p-1 gap-1",
        default: "p-2 gap-2",
        lg: "p-3 gap-3",
      },
      rounded: {
        none: "rounded-none",
        pixel: "rounded-pixel-md",
        retro: "rounded-retro",
        large: "rounded-retro-lg",
      },
    },
    defaultVariants: {
      variant: "arcade",
      orientation: "horizontal",
      size: "default",
      rounded: "retro",
    },
  }
);

const retroNavItemVariants = cva(
  "inline-flex items-center justify-center font-pixel text-pixel-sm font-medium transition-all duration-200 disabled:pointer-events-none disabled:opacity-50 outline-none pixel-perfect relative",
  {
    variants: {
      variant: {
        arcade: "text-primary hover:text-primary-glow hover:bg-primary/10 active:bg-primary/20",
        medieval: "text-medieval-gold hover:text-yellow-300 hover:bg-medieval-gold/10 active:bg-medieval-gold/20",
        pixel: "text-foreground hover:text-primary hover:bg-primary/10 active:bg-primary/20",
        neon: "text-primary hover:text-primary-glow hover:shadow-[0_0_8px_var(--color-primary)] active:shadow-[0_0_12px_var(--color-primary)]",
        crt: "text-primary hover:text-primary-glow hover:bg-primary/5 active:bg-primary/10",
      },
      state: {
        default: "",
        active: "bg-primary text-primary-foreground shadow-retro",
        disabled: "opacity-50 cursor-not-allowed",
      },
      size: {
        sm: "h-8 px-3 text-pixel-xs rounded-pixel-sm",
        default: "h-10 px-4 text-pixel-sm rounded-pixel-md",
        lg: "h-12 px-6 text-pixel-base rounded-retro",
      },
    },
    defaultVariants: {
      variant: "arcade",
      state: "default",
      size: "default",
    },
  }
);

export interface RetroNavProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof retroNavVariants> {
  withScanlines?: boolean;
}

export interface RetroNavItemProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof retroNavItemVariants> {
  asChild?: boolean;
  isActive?: boolean;
}

const RetroNav = React.forwardRef<HTMLDivElement, RetroNavProps>(
  ({ className, variant, orientation, size, rounded, withScanlines, ...props }, ref) => (
    <nav
      ref={ref}
      className={cn(
        retroNavVariants({ variant, orientation, size, rounded }),
        withScanlines && "scanlines",
        className
      )}
      {...props}
    />
  )
);

const RetroNavItem = React.forwardRef<HTMLButtonElement, RetroNavItemProps>(
  ({ className, variant, state, size, isActive, asChild = false, ...props }, ref) => {
    const Comp = asChild ? "span" : "button";
    return (
      <Comp
        ref={ref}
        className={cn(
          retroNavItemVariants({ 
            variant, 
            state: isActive ? "active" : state, 
            size 
          }),
          className
        )}
        {...props}
      />
    );
  }
);

RetroNav.displayName = "RetroNav";
RetroNavItem.displayName = "RetroNavItem";

export { RetroNav, RetroNavItem, retroNavVariants, retroNavItemVariants }; 