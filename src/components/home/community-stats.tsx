// Add this component to src/components/home/community-stats.tsx
"use client";
import { motion } from "framer-motion";

export function CommunityStats() {
  // Hardcoded values for now
  const stats = [
    { label: "Active Players", value: "3,721", icon: "👥" },
    { label: "Battles Completed", value: "27,834", icon: "⚔️" },
    { label: "Characters Minted", value: "12,408", icon: "🛡️" },
    { label: "Total Wagers", value: "142 ETH", icon: "💰" },
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
        {/* Section Header */}
        <div className="text-center mb-10">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
          >
            <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-amber-600 uppercase tracking-widest mb-2">
              Realm Statistics
            </h2>
            <div className="flex items-center justify-center mb-3">
              <div className="h-[1px] w-12 bg-yellow-600/40" />
              <div className="mx-4">
                <span className="text-yellow-400/90 text-sm font-medium tracking-widest">
                  THE SAGA UNFOLDS
                </span>
              </div>
              <div className="h-[1px] w-12 bg-yellow-600/40" />
            </div>
          </motion.div>
        </div>

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

        {/* Community call to action */}
        <div className="mt-10 text-center">
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.7, delay: 0.5 }}
            className="text-stone-200 italic"
          >
            Join the ranks of warriors from across the realms
          </motion.p>
        </div>
      </div>
    </section>
  );
}
