"use client";

import { usePathname } from "next/navigation";
import { BackButton } from "@/components/ui/back-button";

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
        <div className="w-full max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 pt-2 pb-1">
          <BackButton />
        </div>
      )}
      {children}
    </>
  );
}
