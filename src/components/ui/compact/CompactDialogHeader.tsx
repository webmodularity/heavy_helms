import { cn } from "@/lib/utils";
import { DialogDescription } from "../dialog";

import { DialogTitle } from "../dialog";

import { DialogHeader } from "../dialog";

interface CompactDialogHeaderProps {
  title: string;
  description?: string | React.ReactNode;
  className?: string;
}

export function CompactDialogHeader({
  title,
  description,
  className,
}: CompactDialogHeaderProps) {
  return (
    <DialogHeader className={cn("space-y-1", className)}>
      <DialogTitle className="text-lg font-bold text-yellow-500">
        {title}
      </DialogTitle>
      {description && (
        <DialogDescription className="text-xs text-stone-400">
          {description}
        </DialogDescription>
      )}
    </DialogHeader>
  );
}
