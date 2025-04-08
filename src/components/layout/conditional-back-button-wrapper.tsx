"use client";

import { usePathname } from "next/navigation";
import { BackButton } from "@/components/ui/back-button";
import React from "react";

export function ConditionalBackButtonWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const showBackButton = pathname !== "/";

  return (
    <>
      {/* Conditionally render the BackButton based on the path */}
      {showBackButton && (
        <div className="w-full">
          {/* Optional wrapper for positioning */}
          <BackButton />
        </div>
      )}
      {children}
    </>
  );
}
