"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";

export default function BattleArchivesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  // Determine active tab from pathname
  const getActiveTab = () => {
    if (pathname.includes("/duels")) return "duels";
    if (pathname.includes("/challenges")) return "challenges";
    if (pathname.includes("/gauntlets")) return "gauntlets";
    return "gauntlets"; // default
  };

  const activeTab = getActiveTab();

  return (
    <div>
      {/* Header */}
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 py-2 md:py-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-yellow-500">
              Battle Archives
            </h1>
            <p className="text-xs md:text-sm text-stone-400 mt-1">
              Chronicles of combat and glory.
            </p>
          </div>
        </div>

        {/* Navigation */}
        <div className="flex justify-center items-center gap-8 mt-4">
          <Link
            href="/battle-archives/gauntlets"
            className="text-base md:text-lg transition-colors hover:text-yellow-400"
            style={{
              color: activeTab === "gauntlets" ? "#eab308" : "#d6d3d1",
            }}
          >
            Gauntlets
          </Link>
          <Link
            href="/battle-archives/duels"
            className="text-base md:text-lg transition-colors hover:text-yellow-400"
            style={{
              color: activeTab === "duels" ? "#eab308" : "#d6d3d1",
            }}
          >
            Duels
          </Link>
          <Link
            href="/battle-archives/challenges"
            className="text-base md:text-lg transition-colors hover:text-yellow-400"
            style={{
              color: activeTab === "challenges" ? "#eab308" : "#d6d3d1",
            }}
          >
            Challenges
          </Link>
        </div>
      </div>

      {/* Content section - reduced spacing */}
      <div className="mt-4">{children}</div>
    </div>
  );
}
