import * as React from "react";
import { type VariantProps, cva } from "class-variance-authority";
import { cn } from "@/lib/utils";

const retroCardVariants = cva(
  "rounded-retro border bg-card text-card-foreground pixel-perfect relative overflow-hidden",
  {
    variants: {
      variant: {
        default: "border-border shadow-lg",
        arcade: "border border-primary bg-arcade-screen shadow-arcade",
        medieval: "border border-medieval-bronze bg-gradient-to-b from-medieval-stone to-card shadow-lg",
        pixel: "border border-primary shadow-pixel bg-card",
        crt: "border border-primary bg-arcade-screen shadow-crt",
        glow: "border border-primary shadow-retro bg-card",
      },
      size: {
        sm: "p-2",
        default: "p-2.5",
        lg: "p-3",
        xl: "p-4",
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
  "flex flex-col space-y-1",
  {
    variants: {
      variant: {
        default: "pb-2",
        arcade: "pb-2 border-b border-primary/30",
        medieval: "pb-2 border-b border-medieval-bronze/50",
        pixel: "pb-2",
        crt: "pb-2 border-b border-primary/20",
        glow: "pb-2",
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
        default: "font-pixeloid text-base",
        arcade: "font-pixeloid text-base retro-glow",
        medieval: "font-bokor text-base text-medieval-gold",
        pixel: "font-pixeloid text-base",
        crt: "font-pixeloid text-base text-primary",
        glow: "font-pixeloid text-base retro-glow",
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
        default: "text-xs font-pixeloid",
        arcade: "text-xs font-pixeloid text-primary/80",
        medieval: "text-xs font-medieval text-muted-foreground",
        pixel: "text-xs font-pixeloid",
        crt: "text-xs font-pixeloid text-primary/70",
        glow: "text-xs font-pixeloid",
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
  <div ref={ref} className={cn("text-xs font-pixeloid", className)} {...props} />
));

const RetroCardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex items-center pt-2", className)}
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