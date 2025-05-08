"use client";

import { CTAButton } from "./ui/cta-button";
import { useAccount, useConnect } from "wagmi";
import { disconnect } from "@wagmi/core";
import { useEffect } from "react";
import { wagmiConfig } from "@/config";

function AuthButton() {
  const { isConnected } = useAccount();
  const { connect, connectors, error, isPending, status } = useConnect();
  console.log("connectors", connectors);
  console.log("isConnected", isConnected);

  const handleRequestConnect = () => {
    console.log("HomePage: Received REQUEST_WALLET_CONNECT event.");
    if (connectors?.length > 0 && !isPending && !isConnected) {
      console.log("HomePage: Triggering connect logic...");
      connect({ connector: connectors[0] });
    } else {
      console.warn("HomePage: Cannot connect.", {
        hasConnectors: connectors && connectors.length > 0,
        isPending,
        isConnected,
      });
    }
  };
  return !isConnected ? (
    <CTAButton onClick={() => handleRequestConnect()} title="Login" />
  ) : (
    <></>
  );
}

export default AuthButton;
