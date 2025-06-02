"use client";

import { motion } from "framer-motion";
import { type VariantProps, cva } from "class-variance-authority";
import { cn } from "@/lib/utils";

const retroAttributeBarVariants = cva(
  "space-y-0.5",
  {
    variants: {
      size: {
        xs: "space-y-0.5",
        sm: "space-y-0.5", 
        default: "space-y-1",
        lg: "space-y-1.5",
      },
    },
    defaultVariants: {
      size: "default",
    },
  }
);

interface RetroAttributeBarProps
  extends VariantProps<typeof retroAttributeBarVariants> {
  label: string;
  value: number;
  maxValue?: number;
  minValue?: number;
  icon?: React.ReactNode;
  isActive?: boolean;
  showValue?: boolean;
  variant?: "default" | "primary" | "success" | "warning" | "destructive";
  className?: string;
  valueFormatter?: (value: number) => string;
  colorThreshold?: {
    high?: number;
    medium?: number;
    low?: number;
  };
  segments?: number;
}

export function RetroAttributeBar({
  label,
  value,
  maxValue = 21,
  minValue = 3,
  icon,
  isActive = false,
  showValue = true,
  variant,
  size = "default",
  className,
  valueFormatter = (v) => v.toString(),
  colorThreshold = { high: 15, medium: 10, low: 5 },
  segments = 10,
}: RetroAttributeBarProps) {
  const percentage = ((value - minValue) / (maxValue - minValue)) * 100;
  const filledSegments = Math.floor((percentage / 100) * segments);
  
  // Auto-determine variant based on value if not provided
  const autoVariant = variant || (
    value >= (colorThreshold.high || 15) ? "warning" :
    value >= (colorThreshold.medium || 10) ? "success" :
    value >= (colorThreshold.low || 5) ? "primary" :
    "default"
  );

  // Get colors based on variant
  const getSegmentColor = (variant: string, filled: boolean) => {
    if (!filled) return "bg-black/60 border-primary/10";
    
    switch (variant) {
      case "success":
        return "bg-success border-success/60 shadow-[0_0_2px_rgb(var(--color-success))]";
      case "warning":
        return "bg-warning border-warning/60 shadow-[0_0_2px_rgb(var(--color-warning))]";
      case "destructive":
        return "bg-destructive border-destructive/60 shadow-[0_0_2px_rgb(var(--color-destructive))]";
      default:
        return "bg-primary border-primary/60 shadow-[0_0_2px_rgb(var(--color-primary))]";
    }
  };

  const labelSize = size === "xs" || size === "sm" ? "text-pixel-xs" : "text-pixel-xs";
  const valueSize = size === "xs" ? "text-pixel-xs" : size === "sm" ? "text-pixel-sm" : "text-pixel-sm";
  const segmentHeight = size === "xs" ? "h-1.5" : size === "sm" ? "h-2" : "h-2.5";
  const segmentGap = size === "xs" ? "gap-[1px]" : "gap-0.5";

  return (
    <div className={cn(retroAttributeBarVariants({ size }), className)}>
      <div className="flex justify-between items-center">
        <span
          className={cn(
            "flex items-center font-pixel gap-0.5",
            labelSize,
            isActive ? "text-primary" : "text-primary/70",
          )}
        >
          {icon && (
            <span className={cn(isActive ? "text-primary" : "text-primary/60")}>
              {icon}
            </span>
          )}
          {label}
        </span>
        
        {showValue && (
          <span
            className={cn(
              "font-pixel font-bold",
              valueSize,
              isActive ? "text-primary" : "text-foreground",
            )}
          >
            {valueFormatter(value)}
          </span>
        )}
      </div>
      
      <div className={cn("flex w-full pixel-perfect", segmentGap)}>
        {Array.from({ length: segments }, (_, index) => {
          const isFilled = index < filledSegments;
          return (
            <motion.div
              key={index}
              className={cn(
                "flex-1 border pixel-perfect",
                segmentHeight,
                getSegmentColor(autoVariant, isFilled)
              )}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ 
                opacity: 1, 
                scale: 1,
                boxShadow: isFilled && isActive ? "0 0 4px currentColor" : undefined
              }}
              transition={{ 
                duration: 0.2, 
                delay: index * 0.05 
              }}
            />
          );
        })}
      </div>
    </div>
  );
} 