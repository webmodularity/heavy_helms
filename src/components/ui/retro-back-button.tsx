"use client";

import { ArrowLeft, ChevronLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { RetroButton } from "./retro-button";
import { cn } from "@/lib/utils";

interface RetroBackButtonProps {
  variant?: "arcade" | "medieval" | "pixel" | "ghost";
  size?: "sm" | "default" | "lg";
  className?: string;
  children?: React.ReactNode;
  href?: string;
  withIcon?: boolean;
  iconVariant?: "arrow" | "chevron";
}

export function RetroBackButton({
  variant = "arcade",
  size = "default",
  className,
  children,
  href,
  withIcon = true,
  iconVariant = "arrow",
}: RetroBackButtonProps) {
  const router = useRouter();

  const handleBack = () => {
    if (href) {
      router.push(href);
    } else {
      router.back();
    }
  };

  const IconComponent = iconVariant === "arrow" ? ArrowLeft : ChevronLeft;

  return (
    <RetroButton
      variant={variant}
      size={size}
      onClick={handleBack}
      glow="subtle"
      className={cn(
        "gap-2 hover:translate-x-[-2px] active:translate-x-0 transition-transform duration-150",
        className
      )}
    >
      {withIcon && <IconComponent className="h-4 w-4" />}
      {children || (
        <span className="font-pixeloid">
          {variant === "medieval" ? "RETURN" : "BACK"}
        </span>
      )}
    </RetroButton>
  );
} 