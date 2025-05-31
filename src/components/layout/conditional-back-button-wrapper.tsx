"use client";

import { usePathname } from "next/navigation";
import { RetroBackButton } from "@/components/ui/retro-back-button";

interface ConditionalBackButtonWrapperProps {
  children: React.ReactNode;
}

export function ConditionalBackButtonWrapper({ 
  children 
}: ConditionalBackButtonWrapperProps) {
  const pathname = usePathname();
  
  // Pages where we should show the back button
  const showBackButton = pathname !== "/" && !pathname.startsWith("/auth");

  return (
    <>
      {showBackButton && (
        <div className="mb-4 flex justify-start">
          <RetroBackButton 
            variant="arcade"
            size="sm"
            className="mb-2"
          />
        </div>
      )}
      {children}
    </>
  );
}
