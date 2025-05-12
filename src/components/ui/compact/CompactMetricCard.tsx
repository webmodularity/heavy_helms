import { cn } from "@/lib/utils";

interface CompactMetricCardProps {
  value: string | number;
  label: string;
  icon?: React.ReactNode;
  valueClassName?: string;
}

export function CompactMetricCard({
  value,
  label,
  icon,
  valueClassName,
}: CompactMetricCardProps) {
  return (
    <div className="text-center">
      <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-stone-900/50 mb-1">
        {icon ? (
          icon
        ) : (
          <div className={cn("font-bold text-sm", valueClassName)}>{value}</div>
        )}
      </div>
      <div className={cn("text-lg font-bold", valueClassName)}>
        {icon ? value : null}
      </div>
      <div className="text-[10px] text-stone-400 mt-0.5">{label}</div>
    </div>
  );
}
