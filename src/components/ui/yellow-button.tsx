import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type YellowButtonProps = React.ComponentProps<typeof Button>;

export function YellowButton({
  className,
  variant = "outline",
  size = "sm",
  ...props
}: YellowButtonProps) {
  return (
    <Button
      variant={variant}
      size={size}
      className={cn(
        "text-yellow-500 border-yellow-500/50 hover:bg-yellow-500/10 hover:text-yellow-400 hover:border-yellow-400",
        className,
      )}
      {...props}
    />
  );
}
