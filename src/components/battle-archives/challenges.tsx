"use client";

import { Scroll, ChevronDown } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { OpenChallenges } from "./open-challenges";
import { ExpiredChallenges } from "./expired-challenges";

type ChallengeType = "open" | "expired";

interface ChallengeOption {
  value: ChallengeType;
  label: string;
  description: string;
}

const CHALLENGE_OPTIONS: ChallengeOption[] = [
  {
    value: "open",
    label: "Open Challenges",
    description: "Awaiting acceptance",
  },
  {
    value: "expired",
    label: "Expired Challenges",
    description: "No longer active",
  },
];

interface ChallengesProps {
  filterBy?: string;
}

export function Challenges({
  filterBy: urlFilterBy = "open",
}: ChallengesProps) {
  const router = useRouter();
  const challengeType = urlFilterBy as ChallengeType;

  const getCurrentOption = () => {
    return (
      CHALLENGE_OPTIONS.find((opt) => opt.value === challengeType) ||
      CHALLENGE_OPTIONS[0]
    );
  };

  return (
    <div className="bg-stone-900 border border-yellow-600/20 rounded-lg overflow-hidden">
      <div className="p-3 md:p-4 bg-gradient-to-r from-amber-900/50 to-stone-900 border-b border-yellow-600/20">
        <div className="text-center">
          <div className="flex items-center justify-center mb-3">
            <Scroll className="h-5 w-5 text-yellow-500 mr-2" />
            <h2 className="text-xl font-bold text-yellow-400">Challenges</h2>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                size="sm"
                className="border-yellow-600/20 hover:bg-yellow-500/10 hover:text-yellow-400 text-yellow-500"
              >
                <span>{getCurrentOption().label}</span>
                <ChevronDown className="ml-2 h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="center"
              className="w-56 bg-stone-900 border-yellow-600/20 text-stone-200"
            >
              {CHALLENGE_OPTIONS.map((option) => (
                <DropdownMenuItem
                  key={option.value}
                  onClick={() => router.push(`/battle-archives/challenges/${option.value}`)}
                  className={`flex items-center gap-2 hover:bg-yellow-500/20 hover:text-yellow-300 focus:bg-yellow-500/20 focus:text-yellow-300 ${
                    challengeType === option.value
                      ? "bg-yellow-500/10 text-yellow-400"
                      : "text-stone-300"
                  }`}
                >
                  <div>
                    <div className="font-medium">{option.label}</div>
                    <div className="text-xs text-stone-500">
                      {option.description}
                    </div>
                  </div>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <div className="p-0">
        {challengeType === "open" ? (
          <div className="border-0 rounded-none bg-transparent overflow-visible">
            <OpenChallenges />
          </div>
        ) : (
          <div className="border-0 rounded-none bg-transparent overflow-visible">
            <ExpiredChallenges />
          </div>
        )}
      </div>
    </div>
  );
}
