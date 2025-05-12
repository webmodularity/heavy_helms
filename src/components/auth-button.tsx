"use client";

import { CTAButton } from "./ui/cta-button";
import { useAccount, useConnect } from "wagmi";

function AuthButton() {
  const { isConnected } = useAccount();
  const { connect, connectors, isPending } = useConnect();

  // useEffect(() => {
  //   if (isConnected) {

  //     disconnect(wagmiConfig);
  //   }
  // }, [isConnected]);
  const handleRequestConnect = () => {
    if (connectors?.length > 0 && !isPending && !isConnected) {
      connect({ connector: connectors[0] });
    }
  };
  return !isConnected ? (
    <CTAButton onClick={() => handleRequestConnect()} title="Login" />
  ) : (
    <></>
  );
}

export default AuthButton;
