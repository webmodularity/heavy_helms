import { cn } from "@/lib/utils";

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  shimmer?: boolean;
}

export function Skeleton({ 
  className, 
  shimmer = true, 
  ...props 
}: SkeletonProps) {
  return (
    <div
      className={cn(
        "relative animate-pulse rounded-md bg-yellow-900/20 overflow-hidden",
        shimmer && "before:absolute before:inset-0 before:-translate-x-full before:animate-shimmer before:bg-gradient-to-r before:from-transparent before:via-yellow-100/10 before:to-transparent",
        className
      )}
      {...props}
    />
  );
} 