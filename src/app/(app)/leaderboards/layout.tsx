// src/app/leaderboards/layout.tsx
"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";

export default function LeaderboardsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  // Determine active tab from pathname - handle deeper paths
  const getActiveTab = () => {
    if (pathname.includes("/leaderboards/skins")) return "skins";
    if (pathname.includes("/leaderboards/warriors")) return "warriors";
    return "warriors"; // default
  };

  const activeTab = getActiveTab();

  return (
    <div>
      {/* Header */}
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 py-2 md:py-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-yellow-500">
              Leaderboards
            </h1>
            <p className="text-xs md:text-sm text-stone-400 mt-1">
              Rankings of the mightiest warriors.
            </p>
          </div>
        </div>

        {/* Navigation */}
        <div className="flex justify-center items-center gap-8 mt-4">
          <Link
            href="/leaderboards/warriors"
            className="text-base md:text-lg transition-colors hover:text-yellow-400"
            style={{
              color: activeTab === "warriors" ? "#eab308" : "#d6d3d1",
            }}
          >
            Warriors
          </Link>
          <Link
            href="/leaderboards/skins"
            className="text-base md:text-lg transition-colors hover:text-yellow-400"
            style={{
              color: activeTab === "skins" ? "#eab308" : "#d6d3d1",
            }}
          >
            Skins
          </Link>
        </div>
      </div>

      {/* Content section - reduced spacing */}
      <div className="mt-4">{children}</div>
    </div>
  );
}
