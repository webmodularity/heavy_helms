// src/hooks/use-farcaster.ts
"use client";

import { FarcasterContext } from "@/store/farcaster-context";
import { useContext } from "react";

export function useFarcaster() {
  const context = useContext(FarcasterContext);

  if (context === undefined) {
    throw new Error("useFarcaster must be used within a FarcasterProvider");
  }

  return context;
}