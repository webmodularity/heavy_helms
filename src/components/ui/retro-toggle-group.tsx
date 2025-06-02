"use client";

import * as React from "react";
import * as ToggleGroupPrimitive from "@radix-ui/react-toggle-group";
import { type VariantProps, cva } from "class-variance-authority";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

const retroToggleGroupVariants = cva(
  "flex w-fit items-center rounded-pixel bg-card/60 border border-primary/20 p-1 pixel-perfect relative",
  {
    variants: {
      variant: {
        arcade: "bg-arcade-screen/80 border-primary/50 retro-glow",
        pixel: "bg-card/40 border-primary/30",
      },
      size: {
        sm: "p-0.5 gap-0.5",
        default: "p-1 gap-1",
        lg: "p-1.5 gap-1.5",
      },
    },
    defaultVariants: {
      variant: "arcade",
      size: "default",
    },
  }
);

const retroToggleGroupItemVariants = cva(
  "font-pixel transition-all duration-200 pixel-perfect flex flex-col items-center gap-0.5 rounded-pixel-sm cursor-pointer relative z-10 border border-transparent",
  {
    variants: {
      variant: {
        arcade: [
          "data-[state=on]:text-background data-[state=on]:font-bold",
          "data-[state=off]:text-foreground/70 data-[state=off]:hover:text-foreground",
        ],
        pixel: [
          "data-[state=on]:text-primary-foreground data-[state=on]:font-bold",
          "data-[state=off]:text-foreground/70 data-[state=off]:hover:text-foreground",
        ],
      },
      size: {
        sm: "py-1 px-1 text-pixel-xs min-w-[2.5rem]",
        default: "py-1.5 px-1.5 text-pixel-xs min-w-[3rem]", 
        lg: "py-2 px-2 text-pixel-sm min-w-[3.5rem]",
      },
    },
    defaultVariants: {
      variant: "arcade",
      size: "default",
    },
  }
);

interface RetroToggleGroupProps
  extends Omit<React.ComponentProps<typeof ToggleGroupPrimitive.Root>, "type">,
    VariantProps<typeof retroToggleGroupVariants> {
  type: "single";
}

function RetroToggleGroup({
  className,
  variant = "arcade",
  size = "default",
  children,
  value,
  onValueChange,
  ...props
}: RetroToggleGroupProps) {
  console.log("RetroToggleGroup value:", value); // Debug log

  return (
    <ToggleGroupPrimitive.Root
      type="single"
      className={cn(retroToggleGroupVariants({ variant, size }), className)}
      value={value}
      onValueChange={(newValue) => {
        console.log("ToggleGroup onValueChange:", newValue); // Debug log
        if (newValue && onValueChange) {
          onValueChange(newValue);
        }
      }}
      {...props}
    >
      {React.Children.map(children, (child) => {
        if (React.isValidElement(child)) {
          return React.cloneElement(child, {
            variant,
            size,
            isSelected: child.props.value === value,
          } as any);
        }
        return child;
      })}
    </ToggleGroupPrimitive.Root>
  );
}

interface RetroToggleGroupItemProps
  extends React.ComponentProps<typeof ToggleGroupPrimitive.Item>,
    VariantProps<typeof retroToggleGroupItemVariants> {
  icon?: React.ReactNode;
  label: string;
  isSelected?: boolean;
}

function RetroToggleGroupItem({
  className,
  children,
  variant = "arcade",
  size = "default",
  icon,
  label,
  value,
  isSelected = false,
  ...props
}: RetroToggleGroupItemProps) {
  console.log(`RetroToggleGroupItem ${value} isSelected:`, isSelected); // Debug log

  return (
    <ToggleGroupPrimitive.Item
      className={cn(
        retroToggleGroupItemVariants({ variant, size }),
        className
      )}
      value={value}
      {...props}
    >
      {/* Animated selection background */}
      <AnimatePresence>
        {isSelected && (
          <motion.div
            className={cn(
              "absolute inset-0 rounded-pixel-sm z-0",
              variant === "arcade" 
                ? "bg-gradient-to-b from-primary/80 to-primary border border-primary/50 retro-glow" 
                : "bg-primary border border-primary"
            )}
            layoutId="retro-stance-selection" // Unique layoutId
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{
              type: "spring",
              stiffness: 400,
              damping: 30,
              duration: 0.3,
            }}
          />
        )}
      </AnimatePresence>

      {/* Scanlines effect for selected */}
      <AnimatePresence>
        {isSelected && (
          <motion.div
            className="absolute inset-0 bg-[linear-gradient(transparent_50%,rgba(255,255,255,0.05)_50%)] bg-[length:100%_2px] pointer-events-none rounded-pixel-sm z-1"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2, delay: 0.1 }}
          />
        )}
      </AnimatePresence>

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center gap-0.5">
        {icon && (
          <span className="transition-colors duration-200">
            {icon}
          </span>
        )}
        <span className="font-bold uppercase tracking-wider">
          {label}
        </span>
        {children}
      </div>
    </ToggleGroupPrimitive.Item>
  );
}

export { RetroToggleGroup, RetroToggleGroupItem }; 