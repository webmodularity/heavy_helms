"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Button } from "./button"; // Reusing the base Button component

export function BackButton() {
  const router = useRouter();

  const handleBack = () => {
    router.back();
  };

  return (
    <Button
      size="sm" // Using 'sm' for a smaller size
      onClick={handleBack}
      // Added margin-bottom for spacing
      className="mb-4 bg-transparent text-yellow-400 hover:bg-[#f9c846] hover:text-secondary-foreground font-bold" // Apply custom yellow bg and appropriate text color on hover
    >
      <ArrowLeft className="mr-2 size-4" />
      Back
    </Button>
  );
}
