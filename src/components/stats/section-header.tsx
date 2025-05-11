import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface SectionHeaderProps {
  title: string;
  description?: string;
  icon?: ReactNode;
  className?: string;
}

export function SectionHeader({
  title,
  description,
  icon,
  className,
}: SectionHeaderProps) {
  return (
    <div className={cn("mb-3", className)}>
      <div className="flex items-center gap-1.5">
        {icon && <div className="text-yellow-500">{icon}</div>}
        <h2 className="text-lg font-bold text-yellow-500">{title}</h2>
      </div>
      {description && (
        <p className="mt-1 text-xs text-stone-400">{description}</p>
      )}
      <div className="mt-2 h-px bg-gradient-to-r from-transparent via-yellow-600/30 to-transparent" />
    </div>
  );
}
