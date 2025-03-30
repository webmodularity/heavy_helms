import { cn } from "@/lib/utils";

interface SpinnerProps {
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function Spinner({ size = "md", className }: SpinnerProps) {
  return (
    <div
      className={cn(
        "animate-spin rounded-full border-t-transparent",
        {
          "w-4 h-4 border-2": size === "sm",
          "w-8 h-8 border-4": size === "md",
          "w-12 h-12 border-4": size === "lg",
        },
        className
      )}
    />
  );
} 