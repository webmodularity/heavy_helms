// Install these packages:
// @privy-io/react-auth
// @privy-io/react-auth/farcaster
// @farcaster/frame-sdk

import { useEffect } from "react";
import { usePrivy } from "@privy-io/react-auth";
import { useLoginToFrame } from "@privy-io/react-auth/farcaster";
import frameSdk from "@farcaster/frame-sdk";
import { CTAButton } from "./ui/cta-button";
import { useAccount, useConnect } from "wagmi";
import { useFarcaster } from "@/hooks/use-farcaster";

function AuthButton() {
  const { ready, authenticated, user, connectWallet } = usePrivy();
  // const { farcasterUser, authStatus, viewProfile } = useFarcaster();
  const { connect, connectors, error, isPending, status } = useConnect();

  const { address } = useAccount();
  // const { connect, connectors, isPending } = useConnect();
  // Link wallet after Farcaster authentication
  const handleConnectWallet = async () => {
    // await connectWallet();
  };

  // Show button depending on state
  const showConnectButton = !authenticated || !address;

  if (!ready) return null;

  return showConnectButton ? (
    <CTAButton
      onClick={handleConnectWallet}
      title={!authenticated ? "Sign in with Farcaster" : "Connect Wallet"}
      // disabled={isPending}
    />
  ) : (
    <></>
  );
}

export default AuthButton;
