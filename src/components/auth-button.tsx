"use client";

import { usePrivy } from "@privy-io/react-auth";
import { CTAButton } from "./ui/cta-button";

function AuthButton() {
  const { login, logout, authenticated } = usePrivy();

  return authenticated ? (
    <CTAButton onClick={() => logout()} title="Logout" />
  ) : (
    <CTAButton onClick={() => login()} title="Login" />
  );
}

export default AuthButton;
