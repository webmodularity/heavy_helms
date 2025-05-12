import { cn } from "@/lib/utils";

interface CompactStatsCardProps {
  title: string;
  value: string | number;
  icon?: React.ReactNode;
  description?: string;
  className?: string;
  valueClassName?: string;
}

export function CompactStatsCard({
  title,
  value,
  icon,
  description,
  className,
  valueClassName,
}: CompactStatsCardProps) {
  return (
    <div
      className={cn(
        "bg-stone-900/80 border border-stone-800/60 rounded-lg p-2.5 shadow-md flex flex-col hover:border-yellow-500/30 transition-all",
        className,
      )}
    >
      <div className="flex justify-between items-start">
        <h3 className="text-xs font-medium text-stone-400">{title}</h3>
        {icon && <div className="text-yellow-500">{icon}</div>}
      </div>

      <div className="mt-1.5 flex items-baseline">
        <span
          className={cn(
            "text-lg font-semibold text-yellow-500",
            valueClassName,
          )}
        >
          {value}
        </span>
      </div>

      {description && (
        <p className="mt-1 text-[10px] text-stone-500">{description}</p>
      )}
    </div>
  );
}
