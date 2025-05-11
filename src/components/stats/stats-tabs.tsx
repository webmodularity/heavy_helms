"use client";

import { useState, useEffect } from "react";
import { Shield, Swords, CircleDollarSign, Palette, User } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatsTabsProps {
  activeSection: string;
  onSectionChange: (section: string) => void;
}

export function StatsTabs({ activeSection, onSectionChange }: StatsTabsProps) {
  const [mounted, setMounted] = useState(false);

  // Prevent hydration issues
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const tabs = [
    {
      id: "owners",
      label: "Owners",
      icon: <User className="h-3 w-3" />,
    },
    {
      id: "fighters",
      label: "Fighters",
      icon: <Shield className="h-3 w-3" />,
    },
    {
      id: "combat",
      label: "Combat",
      icon: <Swords className="h-3 w-3" />,
    },
    {
      id: "duels",
      label: "Duels",
      icon: <Swords className="h-3 w-3" />,
    },
    {
      id: "wagers",
      label: "Wagers",
      icon: <CircleDollarSign className="h-3 w-3" />,
    },
    {
      id: "skins",
      label: "Skins",
      icon: <Palette className="h-3 w-3" />,
    },
  ];

  return (
    <div className="flex flex-wrap gap-1.5 justify-center md:justify-start">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          type="button"
          onClick={() => onSectionChange(tab.id)}
          className={cn(
            "inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium transition-colors",
            activeSection === tab.id
              ? "bg-yellow-500 text-black"
              : "bg-stone-800 text-stone-300 hover:bg-stone-700 hover:text-stone-100",
          )}
        >
          {tab.icon}
          {tab.label}
        </button>
      ))}
    </div>
  );
}
