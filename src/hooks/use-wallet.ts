"use client";
import { WalletContext } from "@/store/wallet-context";
import { useContext } from "react";

export function useWallet() {
  const context = useContext(WalletContext);

  if (context === undefined) {
    throw new Error("useWallet must be used within a WalletProvider");
  }

  return context;
}
