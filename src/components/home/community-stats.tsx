"use client";
import { motion } from "framer-motion";
import Link from "next/link";
import { CTAButton } from "@/components/ui/cta-button";
import { useGameStats } from "@/hooks/use-game-stats";
import { formatEther } from "viem";
import { SectionHeader } from "@/components/ui/section-header";
import { useCreateCharacter } from "@/hooks/use-create-character";
import { BarChart, ScrollText, Trophy } from "lucide-react";
import { useAccount } from "wagmi";

export function CommunityStats() {
  const { stats: gameStats, isLoading } = useGameStats();
  const { createCharacter, isCreatingCharacter } = useCreateCharacter();
  const { isConnected } = useAccount();
  
  const stats = [
    {
      label: "Active Users",
      value: gameStats?.uniqueOwnersCount,
      icon: "👥",
    },
    { label: "Duels Completed", value: gameStats?.totalDuels, icon: "⚔️" },
    {
      label: "Players Created",
      value: gameStats?.totalFightersCount,
      icon: "🎲",
    },
    {
      label: "Total Wagers",
      value: `${formatEther(BigInt(gameStats?.totalWageredAmount || 0))} ETH`,
      icon: "💰",
    },
  ];

  // Primary Action
  const createAction = {
    id: "create",
    label: "Create Your Warrior",
    action: isConnected ? createCharacter : () => {},
    disabled: isCreatingCharacter,
  };

  // Secondary Navigation Links with Icons
  const secondaryLinks = [
    {
      id: "archives",
      href: "/battle-archives",
      label: "Battle Archives",
      icon: <ScrollText className="mr-1 h-3 w-3" />,
    },
    {
      id: "leaderboards",
      href: "/leaderboards",
      label: "Leaderboards",
      icon: <Trophy className="mr-1 h-3 w-3" />,
    },
    {
      id: "stats",
      href: "/stats",
      label: "Game Statistics",
      icon: <BarChart className="mr-1 h-3 w-3" />,
    },
  ];

  return (
    <section className="relative py-8 md:py-12 mt-4 md:mt-6">
      {/* Background and borders */}
      <div className="absolute inset-0 bg-stone-900/60" />
      <div className="absolute inset-0 shadow-[inset_0_0_100px_rgba(30,20,10,0.6)]" />
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-amber-700/30 via-yellow-500/50 to-amber-700/30" />
      <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-amber-700/30 via-yellow-500/50 to-amber-700/30" />

      <div className="relative max-w-7xl mx-auto px-3 sm:px-4 lg:px-6">
        <SectionHeader
          title="Realm Statistics"
          subtitle="Welcome to Early Access on Shape Network"
          className="mb-5 md:mb-6"
        />

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-4">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="bg-gradient-to-b from-amber-800/10 to-stone-900/40 backdrop-blur-sm rounded-md border border-yellow-600/20 p-2.5 text-center"
            >
              <div className="text-xl md:text-2xl mb-1">{stat.icon}</div>
              <div className="text-yellow-400 text-lg md:text-xl font-bold mb-0.5">
                {stat.value}
              </div>
              <div className="text-stone-300 text-xs uppercase tracking-wider">
                {stat.label}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Exploration Section */}
        <motion.div
          className="mt-8 md:mt-10 text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.7, delay: 0.4 }}
        >
          <p className="text-stone-200 italic mb-4 text-xs md:text-sm">
            Join the ranks of warriors from across the realms
          </p>

          <div className="mb-5 md:mb-6">
            <CTAButton
              key={createAction.id}
              title={createAction.label}
              onClick={() => {
                if (isConnected) {
                  createCharacter("male");
                } else {
                  console.log("Not connected");
                }
              }}
              size="sm"
            />
          </div>

          <div className="flex justify-center items-center flex-wrap gap-3 md:gap-6">
            {secondaryLinks.map((link) => (
              <Link
                key={link.id}
                href={link.href}
                className="group inline-flex items-center text-xs text-stone-300 hover:text-yellow-400 transition-colors uppercase tracking-wider font-medium font-bokor"
              >
                {link.icon}
                <span className="group-hover:underline decoration-yellow-500/70 underline-offset-2">
                  {link.label}
                </span>
              </Link>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
