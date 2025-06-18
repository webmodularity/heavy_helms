"use client";

import { useState, useEffect } from "react";
import { Shield, Swords, Trophy, Palette, Users } from "lucide-react";

const tabs = [
  {
    id: "fighters-section",
    label: "Fighters",
    icon: <Users className="h-4 w-4" />,
  },
  {
    id: "combat-section",
    label: "Combat",
    icon: <Swords className="h-4 w-4" />,
  },
  {
    id: "gauntlet-section",
    label: "Gauntlet",
    icon: <Trophy className="h-4 w-4" />,
  },
  { id: "duel-section", label: "Duels", icon: <Swords className="h-4 w-4" /> },
  {
    id: "skins-section",
    label: "Skins",
    icon: <Palette className="h-4 w-4" />,
  },
];

export default function StatsMenuBar() {
  const [activeTab, setActiveTab] = useState("fighters-section");

  useEffect(() => {
    const sectionIds = tabs.map((tab) => tab.id);
    const sections = sectionIds.map((id) => document.getElementById(id));
    if (typeof window === "undefined" || !window.IntersectionObserver) return;

    const handleIntersect = (entries: IntersectionObserverEntry[]) => {
      // Find the first section that is at least 40% visible
      const visible = entries
        .filter(
          (entry) => entry.isIntersecting && entry.intersectionRatio > 0.4,
        )
        .sort((a, b) => b.intersectionRatio - a.intersectionRatio);
      if (visible.length > 0) setActiveTab(visible[0].target.id);
    };

    const observer = new window.IntersectionObserver(handleIntersect, {
      root: null,
      rootMargin: "0px 0px -60% 0px", // triggers a bit before the section top
      threshold: [0.4, 0.6, 1],
    });
    for (const section of sections) {
      if (section) observer.observe(section);
    }
    return () => observer.disconnect();
  }, []);

  function handleTabClick(id: string) {
    setActiveTab(id);
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  return (
    <div className="sticky top-4 z-10 bg-stone-950/80 backdrop-blur-md p-4 rounded-lg border border-stone-800/60 shadow-lg mb-8">
      <div className="flex flex-wrap gap-2 justify-center md:justify-start">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => handleTabClick(tab.id)}
            className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium transition-colors ${
              activeTab === tab.id
                ? "bg-yellow-500 text-black"
                : "bg-stone-800 text-stone-300 hover:bg-stone-700 hover:text-stone-100"
            }`}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>
    </div>
  );
}
