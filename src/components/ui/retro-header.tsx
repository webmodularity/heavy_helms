"use client";

import { RetroButton } from "@/components/ui/retro-button";
import { RetroNav, RetroNavItem } from "@/components/ui/retro-nav";
import Image from "next/image";
import { RetroChainSelection } from "./retro-chain-selection";
import Link from "next/link";
import {
  Trophy,
  Scroll,
  Shield,
  ListOrdered,
  Menu,
  MessageCircleQuestion,
  X,
} from "lucide-react";
import { usePathname } from "next/navigation";
import { useState } from "react";
import type React from "react";
import { cn } from "@/lib/utils";

// Define the structure for a navigation item
interface NavItem {
  label: string;
  path: string;
  icon: React.ElementType;
}

// Navigation configuration array
const navigationItems: NavItem[] = [
  { label: "Warrior's Hall", path: "/", icon: Shield },
  { label: "Battle Archives", path: "/battle-archives", icon: Trophy },
  { label: "Leaderboards", path: "/leaderboards", icon: ListOrdered },
  { label: "Game Statistics", path: "/stats", icon: Scroll },
  { label: "FAQ", path: "/faq", icon: MessageCircleQuestion },
];

export function RetroHeader() {
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const isActive = (href: string) => pathname === href;

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
  const closeMenu = () => setIsMenuOpen(false);

  return (
    <header className="relative w-full flex flex-col items-center pt-2 sm:pt-4 pb-0 pixel-perfect">
      {/* Retro arcade-style border effect */}
      <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent pointer-events-none" />

      {/* Top right corner group */}
      <div className="absolute top-2 right-2 sm:top-4 sm:right-4 z-50 flex items-center gap-2">
        <RetroChainSelection />

        {/* Mobile Navigation Menu Button */}
        <RetroButton
          variant="arcade"
          size="icon-sm"
          glow="subtle"
          onClick={toggleMenu}
          className="relative overflow-hidden"
        >
          <div
            className={cn(
              "transition-transform duration-200",
              isMenuOpen ? "rotate-90 scale-75" : "rotate-0 scale-100",
            )}
          >
            {isMenuOpen ? (
              <X className="h-4 w-4" />
            ) : (
              <Menu className="h-4 w-4" />
            )}
          </div>
          <span className="sr-only">Toggle Menu</span>
        </RetroButton>
      </div>

      {/* Mobile Arcade-Style Navigation Menu */}
      <div
        className={cn(
          "fixed inset-0 z-40 transition-all duration-300 ease-in-out",
          isMenuOpen ? "pointer-events-auto" : "pointer-events-none",
        )}
      >
        {/* Backdrop with CRT effect */}
        <div
          className={cn(
            "absolute inset-0 bg-arcade-screen/95 backdrop-blur-sm transition-opacity duration-300",
            "bg-[radial-gradient(ellipse_at_center,transparent_0%,rgba(0,0,0,0.4)_100%)]",
            isMenuOpen ? "opacity-100" : "opacity-0",
          )}
          onClick={closeMenu}
        />

        {/* Menu Content */}
        <div
          className={cn(
            "absolute top-16 right-2 sm:right-4 w-72 transition-all duration-300 ease-out",
            isMenuOpen
              ? "transform translate-y-0 opacity-100 scale-100"
              : "transform -translate-y-4 opacity-0 scale-95",
          )}
        >
          <RetroNav
            variant="arcade"
            orientation="vertical"
            size="lg"
            withScanlines
            className="p-4 border-2 border-primary shadow-retro-lg bg-arcade-screen/95 backdrop-blur-md"
          >
            {/* Menu Header */}
            <div className="pb-3 border-b border-primary/30 mb-2">
              <h3 className="font-bokor text-pixel-lg text-primary retro-glow text-center">
                NAVIGATION
              </h3>
              <div className="text-center text-pixel-xs text-primary/60 font-pixel mt-1">
                SELECT DESTINATION
              </div>
            </div>

            {/* Navigation Items */}
            <div className="space-y-1">
              {navigationItems.map((item) => (
                <Link key={item.path} href={item.path} onClick={closeMenu}>
                  <RetroNavItem
                    variant="arcade"
                    size="lg"
                    isActive={isActive(item.path)}
                    className={cn(
                      "w-full justify-start gap-3 transition-all duration-200",
                      "hover:translate-x-1 active:translate-x-0.5",
                      isActive(item.path) && "shadow-retro",
                    )}
                  >
                    <item.icon className="h-4 w-4 flex-shrink-0" />
                    <span className="text-left font-pixel">{item.label}</span>
                    {isActive(item.path) && (
                      <div className="ml-auto text-pixel-xs">●</div>
                    )}
                  </RetroNavItem>
                </Link>
              ))}
            </div>

            {/* Menu Footer */}
            <div className="pt-3 border-t border-primary/30 mt-4">
              <div className="text-center text-pixel-xs text-primary/40 font-pixel">
                HEAVY HELMS v1.337
              </div>
            </div>
          </RetroNav>
        </div>
      </div>

      {/* Optional scanline effect across header */}
      <div className="absolute inset-0 scanlines opacity-20 pointer-events-none" />
    </header>
  );
}
