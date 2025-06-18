// Add this component to src/components/home/community-stats.tsx
"use client";
import { motion } from "framer-motion";
import Link from "next/link";
import { CTAButton } from "@/components/ui/cta-button";
import { useGameStats } from "@/hooks/use-game-stats";
import { formatEther } from "viem";
import { SectionHeader } from "@/components/ui/section-header";
import { useCreateCharacter } from "@/hooks/use-create-character";
import { usePrivy } from "@privy-io/react-auth";
import { BarChart, ScrollText, Trophy } from "lucide-react";

export function CommunityStats() {
  const { stats: gameStats, isLoading } = useGameStats();
  const { createCharacter, isCreatingCharacter } = useCreateCharacter();
  const { login, authenticated } = usePrivy();

  // Hardcoded values for now
  const stats = [
    {
      label: "Active Players",
      value: gameStats?.uniqueOwnersCount,
      icon: "👥",
    },
    {
      label: "Fighters Created",
      value: gameStats?.totalFightersCount,
      icon: "🎲",
    },
    { label: "Total Fights", value: gameStats?.totalWins, icon: "⚔️" },
    {
      label: "Total Gauntlets",
      value: gameStats?.totalGauntletsCompleted,
      icon: "🏰",
    },
  ];

  // Primary Action
  const createAction = {
    id: "create",
    label: "Create Your Warrior",
    action: authenticated ? createCharacter : login,
    disabled: isCreatingCharacter,
  };

  // Secondary Navigation Links with Icons
  const secondaryLinks = [
    {
      id: "archives",
      href: "/battle-archives",
      label: "Battle Archives",
      icon: <ScrollText className="mr-1 h-4 w-4" />,
    },
    {
      id: "leaderboards",
      href: "/leaderboards",
      label: "Leaderboards",
      icon: <Trophy className="mr-1 h-4 w-4" />,
    },
    {
      id: "stats",
      href: "/stats",
      label: "Game Statistics",
      icon: <BarChart className="mr-1 h-4 w-4" />,
    },
  ];

  return (
    <section className="relative py-16 mt-8">
      {/* Use similar border decoration as CharacterGallery */}
      <div className="absolute inset-0 bg-stone-900/60" />
      <div className="absolute inset-0 shadow-[inset_0_0_100px_rgba(30,20,10,0.6)]" />

      {/* Top and bottom borders */}
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-amber-700/30 via-yellow-500/50 to-amber-700/30" />
      <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-amber-700/30 via-yellow-500/50 to-amber-700/30" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeader
          title="Realm Statistics"
          subtitle="Welcome to Early Access on Shape Network"
          className="mb-10"
        />

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="bg-gradient-to-b from-amber-800/10 to-stone-900/40 backdrop-blur-sm rounded-md border border-yellow-600/20 p-4 text-center"
            >
              <div className="text-3xl mb-2">{stat.icon}</div>
              <div className="text-yellow-400 text-2xl md:text-3xl font-bold mb-1">
                {stat.value}
              </div>
              <div className="text-stone-300 text-sm uppercase tracking-wider">
                {stat.label}
              </div>
            </motion.div>
          ))}
        </div>

        {/* --- Exploration Section --- */}
        <motion.div
          className="mt-16 text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.7, delay: 0.4 }}
        >
          <p className="text-stone-200 italic mb-8">
            Join the ranks of warriors from across the realms
          </p>

          <div className="mb-10">
            <CTAButton
              key={createAction.id}
              title={createAction.label}
              onClick={() => {
                if (authenticated) {
                  createCharacter("male");
                } else {
                  login();
                }
              }}
              size="lg"
            />
          </div>

          <div className="flex justify-center items-center flex-wrap gap-6 sm:gap-10">
            {secondaryLinks.map((link) => (
              <Link
                key={link.id}
                href={link.href}
                className="group inline-flex items-center text-sm text-stone-200 italic hover:text-yellow-400 transition-colors font-medium"
              >
                {link.icon}
                <span className="group-hover:underline decoration-yellow-500/70 underline-offset-4">
                  {link.label}
                </span>
              </Link>
            ))}
          </div>
        </motion.div>
        {/* --- End Exploration Section --- */}
      </div>
    </section>
  );
}
