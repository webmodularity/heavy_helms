"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  Trophy,
  Scroll,
  Shield,
  ListOrdered,
  HelpCircle,
  ExternalLink,
  Github,
  MessageCircle,
} from "lucide-react";
import { RetroCard, RetroCardContent } from "@/components/ui/retro-card";

export function Footer() {
  const navigationItems = [
    { label: "Warrior's Hall", path: "/", icon: Shield },
    { label: "Battle Archives", path: "/battle-archives", icon: Trophy },
    { label: "Leaderboards", path: "/leaderboards", icon: ListOrdered },
    { label: "Game Statistics", path: "/stats", icon: Scroll },
    { label: "FAQ", path: "/faq", icon: HelpCircle },
  ];

  const contractLinks = [
    {
      label: "Player Contract",
      url: "https://shapescan.xyz/address/0x75B4750D41A9a04e989FAD58544C37930AEf2e5B",
    },
    {
      label: "Game Engine (v0.22)",
      url: "https://shapescan.xyz/address/0x60567795F7a60986204A5507538600b53adeE42a",
    },
    {
      label: "Practice Game",
      url: "https://shapescan.xyz/address/0xee5Ccf602AA0E5ff1C6F78CAB3AaC0dA317aF0b3",
    },
    {
      label: "Duel Game",
      url: "https://shapescan.xyz/address/0x805b44fadbCBA7a65b37875551820593a45a8716",
    },
    {
      label: "Gauntlet Game",
      url: "https://shapescan.xyz/address/0x684055392575eF42A6f04490dB50FFdC34309681",
    },
    {
      label: "Skin Registry",
      url: "https://shapescan.xyz/address/0x70FA59BA4FbD253850c76B6d1A12a7DFaC744072",
    },
  ];

  const socialLinks = [
    {
      label: "Discord",
      url: "https://discord.gg/5XHu76FmpJ",
      icon: MessageCircle,
      description: "Join our community",
    },
    {
      label: "X (Twitter)",
      url: "https://x.com/HeavyHelms",
      icon: "twitter",
      description: "Follow for updates",
    },
    {
      label: "Shape Network",
      url: "https://shape.network/",
      icon: "shape",
      description: "Built on Shape",
    },
    {
      label: "GitHub",
      url: "https://github.com/warlock-forge/heavy-helms-contracts",
      icon: Github,
      description: "View source code",
    },
  ];

  const containerVariants = {
    initial: { opacity: 0 },
    animate: {
      opacity: 1,
      transition: {
        duration: 0.4,
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    initial: { opacity: 0, y: 20 },
    animate: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.3 },
    },
  };

  return (
    <footer className="relative mt-12">
      {/* Distinct footer background with retro elements */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-arcade-bezel to-arcade-screen" />

      {/* Retro grid pattern overlay */}
      <div
        className="absolute inset-0 opacity-20 pointer-events-none"
        style={{
          backgroundImage: `
               linear-gradient(rgba(0, 212, 255, 0.1) 1px, transparent 1px),
               linear-gradient(90deg, rgba(0, 212, 255, 0.1) 1px, transparent 1px)
             `,
          backgroundSize: "20px 20px",
        }}
      />

      {/* Scanlines effect */}
      <div
        className="absolute inset-0 opacity-30 pointer-events-none"
        style={{
          backgroundImage: `repeating-linear-gradient(
               0deg,
               transparent,
               transparent 2px,
               rgba(0, 212, 255, 0.03) 2px,
               rgba(0, 212, 255, 0.03) 4px
             )`,
        }}
      />

      {/* Top border with glow effect */}
      <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-primary to-transparent retro-box-glow" />

      {/* Decorative corner elements */}
      <div className="absolute top-4 left-4 w-8 h-8 border-l-2 border-t-2 border-primary/50 rounded-tl-pixel" />
      <div className="absolute top-4 right-4 w-8 h-8 border-r-2 border-t-2 border-primary/50 rounded-tr-pixel" />
      <div className="absolute bottom-4 left-4 w-8 h-8 border-l-2 border-b-2 border-primary/50 rounded-bl-pixel" />
      <div className="absolute bottom-4 right-4 w-8 h-8 border-r-2 border-b-2 border-primary/50 rounded-br-pixel" />

      <motion.div
        className="relative max-w-7xl mx-auto py-12 px-6"
        variants={containerVariants}
        initial="initial"
        animate="animate"
      >
        {/* Header section */}
        <motion.div variants={itemVariants} className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-2">
            <div className="w-12 h-0.5 bg-gradient-to-r from-transparent to-primary" />
            <Shield className="h-6 w-6 text-primary retro-box-glow animate-pulse" />
            <h2 className="font-pixel text-pixel-lg text-primary font-bold uppercase tracking-wider retro-text-glow">
              HEAVY HELMS ARCHIVE
            </h2>
            <Shield className="h-6 w-6 text-primary retro-box-glow animate-pulse" />
            <div className="w-12 h-0.5 bg-gradient-to-l from-transparent to-primary" />
          </div>
          <p className="font-pixel text-pixel-xs text-primary/70 uppercase">
            WEB3 AUTO-BATTLER • ONCHAIN COMBAT SYSTEM
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* About Section */}
          <motion.div variants={itemVariants}>
            <RetroCard
              variant="arcade"
              className="h-full retro-glow"
              withScanlines
            >
              <RetroCardContent className="p-4 space-y-3">
                <h3 className="font-pixel text-pixel-sm text-primary font-bold uppercase tracking-wider retro-text-glow mb-3">
                  ABOUT HEAVY HELMS
                </h3>

                <div className="space-y-3">
                  <div className="space-y-1">
                    <dt className="font-pixel text-pixel-xs text-warning font-bold uppercase">
                      WEB3 AUTO-BATTLER:
                    </dt>
                    <dd className="font-pixel text-pixel-xs text-primary/80 pl-2 border-l-2 border-primary/30">
                      Where VRF guides the hand of fate!
                    </dd>
                  </div>

                  <div className="space-y-1">
                    <dt className="font-pixel text-pixel-xs text-warning font-bold uppercase">
                      FAIR COMBAT:
                    </dt>
                    <dd className="font-pixel text-pixel-xs text-primary/80 pl-2 border-l-2 border-primary/30">
                      Equal stats, victory by strategy (No P2W!)
                    </dd>
                  </div>

                  <div className="space-y-1">
                    <dt className="font-pixel text-pixel-xs text-warning font-bold uppercase">
                      MODULAR & OPEN:
                    </dt>
                    <dd className="font-pixel text-pixel-xs text-primary/80 pl-2 border-l-2 border-primary/30">
                      Game engine is onchain and open source
                    </dd>
                  </div>
                </div>
              </RetroCardContent>
            </RetroCard>
          </motion.div>

          {/* Navigation Links */}
          <motion.div variants={itemVariants}>
            <RetroCard variant="arcade" className="h-full retro-glow">
              <RetroCardContent className="p-4">
                <h3 className="font-pixel text-pixel-sm text-primary font-bold uppercase tracking-wider retro-text-glow mb-3">
                  NAVIGATION
                </h3>

                <ul className="space-y-2">
                  {navigationItems.map((item) => {
                    const IconComponent = item.icon;
                    return (
                      <li key={item.path} className="group">
                        <Link
                          href={item.path}
                          className="flex items-center gap-2 p-1.5 rounded-pixel hover:bg-primary/10 transition-all duration-200 pixel-perfect"
                        >
                          <div className="w-1.5 h-1.5 rounded-pixel bg-primary/50 group-hover:bg-primary transition-colors flex-shrink-0" />
                          <IconComponent className="h-3 w-3 text-primary/70 group-hover:text-primary transition-colors flex-shrink-0" />
                          <span className="font-pixel text-pixel-xs text-primary/80 group-hover:text-primary transition-colors">
                            {item.label}
                          </span>
                          <ExternalLink className="h-2.5 w-2.5 text-primary/50 opacity-0 group-hover:opacity-100 transition-all ml-auto flex-shrink-0" />
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </RetroCardContent>
            </RetroCard>
          </motion.div>

          {/* Smart Contracts */}
          <motion.div variants={itemVariants}>
            <RetroCard variant="arcade" className="h-full retro-glow">
              <RetroCardContent className="p-4">
                <h3 className="font-pixel text-pixel-sm text-primary font-bold uppercase tracking-wider retro-text-glow mb-3">
                  SMART CONTRACTS
                </h3>

                <ul className="space-y-2">
                  {contractLinks.map((contract, index) => (
                    <li key={index} className="group">
                      <a
                        href={contract.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 p-1.5 rounded-pixel hover:bg-primary/10 transition-all duration-200 pixel-perfect"
                      >
                        <div className="w-1.5 h-1.5 rounded-pixel bg-primary/50 group-hover:bg-primary transition-colors flex-shrink-0" />
                        <span className="font-pixel text-pixel-xs text-primary/80 group-hover:text-primary transition-colors flex-1 min-w-0">
                          {contract.label}
                        </span>
                        <ExternalLink className="h-2.5 w-2.5 text-primary/50 opacity-0 group-hover:opacity-100 transition-all flex-shrink-0" />
                      </a>
                    </li>
                  ))}
                </ul>
              </RetroCardContent>
            </RetroCard>
          </motion.div>
        </div>

        {/* Social Links */}
        <motion.div
          variants={itemVariants}
          className="pt-6 border-t border-primary/30"
        >
          <div className="flex justify-center">
            <div className="flex items-center gap-4">
              {socialLinks.map((social) => {
                const IconComponent = social.icon;
                return (
                  <motion.a
                    key={social.label}
                    href={social.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group relative"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <div className="bg-primary/20 p-3 rounded-pixel border border-primary/30 retro-box-glow group-hover:retro-glow transition-all duration-200 pixel-perfect">
                      {typeof IconComponent === "string" ? (
                        social.icon === "twitter" ? (
                          <svg
                            className="h-4 w-4 text-primary group-hover:text-warning transition-colors"
                            fill="currentColor"
                            viewBox="0 0 24 24"
                            aria-hidden="true"
                          >
                            <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                          </svg>
                        ) : (
                          <div className="w-4 h-4 rounded-pixel bg-primary group-hover:bg-warning transition-colors" />
                        )
                      ) : (
                        <IconComponent className="h-4 w-4 text-primary group-hover:text-warning transition-colors" />
                      )}
                    </div>

                    {/* Tooltip */}
                    <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
                      <div className="bg-arcade-screen border border-primary/30 rounded-pixel px-2 py-1 pixel-perfect">
                        <span className="font-pixel text-pixel-xs text-primary whitespace-nowrap">
                          {social.description}
                        </span>
                      </div>
                    </div>
                  </motion.a>
                );
              })}
            </div>
          </div>
        </motion.div>

        {/* Copyright */}
        <motion.div variants={itemVariants} className="mt-8 text-center">
          <div className="bg-primary/10 border border-primary/20 rounded-pixel px-4 py-2 inline-block pixel-perfect retro-box-glow">
            <p className="font-pixel text-pixel-xs text-primary/60 uppercase">
              © 2024 HEAVY HELMS • BUILT ON SHAPE NETWORK
            </p>
          </div>
        </motion.div>
      </motion.div>
    </footer>
  );
}
