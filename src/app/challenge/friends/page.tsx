"use client";

import { Suspense } from "react";
import { FriendsChallengePage } from "@/components/magical-dimension/friends-challenge-page";

export default function ChallengeFriendsPage() {
  return (
    <Suspense fallback={<div>Loading magical realm...</div>}>
      <FriendsChallengePage />
    </Suspense>
  );
} 