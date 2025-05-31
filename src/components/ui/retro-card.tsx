import * as React from "react";
import { type VariantProps, cva } from "class-variance-authority";
import { cn } from "@/lib/utils";

const retroCardVariants = cva(
  "rounded-retro border bg-card text-card-foreground pixel-perfect relative overflow-hidden",
  {
    variants: {
      variant: {
        default: "border-border shadow-lg",
        arcade: "border-2 border-primary bg-arcade-screen shadow-arcade",
        medieval: "border-2 border-medieval-bronze bg-gradient-to-b from-medieval-stone to-card shadow-lg",
        pixel: "border border-primary shadow-pixel bg-card",
        crt: "border-2 border-primary bg-arcade-screen shadow-crt",
        glow: "border-2 border-primary shadow-retro bg-card",
      },
      size: {
        sm: "p-3",
        default: "p-4",
        lg: "p-6",
        xl: "p-8",
      },
      rounded: {
        none: "rounded-none",
        pixel: "rounded-pixel-md",
        retro: "rounded-retro",
        large: "rounded-retro-lg",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
      rounded: "retro",
    },
  }
);

const retroCardHeaderVariants = cva(
  "flex flex-col space-y-1.5",
  {
    variants: {
      variant: {
        default: "pb-4",
        arcade: "pb-3 border-b border-primary/30",
        medieval: "pb-3 border-b border-medieval-bronze/50",
        pixel: "pb-3",
        crt: "pb-3 border-b border-primary/20",
        glow: "pb-4",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

const retroCardTitleVariants = cva(
  "font-semibold leading-none tracking-tight",
  {
    variants: {
      variant: {
        default: "font-pixel text-pixel-lg",
        arcade: "font-pixel text-pixel-lg retro-glow",
        medieval: "font-bokor text-lg text-medieval-gold",
        pixel: "font-pixel text-pixel-lg",
        crt: "font-pixel text-pixel-lg text-primary",
        glow: "font-pixel text-pixel-lg retro-glow",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

const retroCardDescriptionVariants = cva(
  "text-muted-foreground",
  {
    variants: {
      variant: {
        default: "text-pixel-sm font-pixel",
        arcade: "text-pixel-sm font-pixel text-primary/80",
        medieval: "text-sm font-medieval text-muted-foreground",
        pixel: "text-pixel-sm font-pixel",
        crt: "text-pixel-sm font-pixel text-primary/70",
        glow: "text-pixel-sm font-pixel",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface RetroCardProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof retroCardVariants> {
  withScanlines?: boolean;
  withCrtEffect?: boolean;
}

const RetroCard = React.forwardRef<HTMLDivElement, RetroCardProps>(
  ({ className, variant, size, rounded, withScanlines, withCrtEffect, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        retroCardVariants({ variant, size, rounded }),
        withScanlines && "scanlines",
        withCrtEffect && "crt-container",
        className
      )}
      {...props}
    />
  )
);

const RetroCardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & VariantProps<typeof retroCardHeaderVariants>
>(({ className, variant, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(retroCardHeaderVariants({ variant }), className)}
    {...props}
  />
));

const RetroCardTitle = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & VariantProps<typeof retroCardTitleVariants>
>(({ className, variant, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(retroCardTitleVariants({ variant }), className)}
    {...props}
  />
));

const RetroCardDescription = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & VariantProps<typeof retroCardDescriptionVariants>
>(({ className, variant, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(retroCardDescriptionVariants({ variant }), className)}
    {...props}
  />
));

const RetroCardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("text-pixel-sm font-pixel", className)} {...props} />
));

const RetroCardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex items-center pt-4", className)}
    {...props}
  />
));

RetroCard.displayName = "RetroCard";
RetroCardHeader.displayName = "RetroCardHeader";
RetroCardTitle.displayName = "RetroCardTitle";
RetroCardDescription.displayName = "RetroCardDescription";
RetroCardContent.displayName = "RetroCardContent";
RetroCardFooter.displayName = "RetroCardFooter";

export {
  RetroCard,
  RetroCardHeader,
  RetroCardTitle,
  RetroCardDescription,
  RetroCardContent,
  RetroCardFooter,
}; 