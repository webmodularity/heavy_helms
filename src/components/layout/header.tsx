"use client";

import { AuthButton } from "@/components/auth-button";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import Link from "next/link";
import {
  Trophy,
  Scroll,
  Shield,
  ListOrdered,
  Menu,
  MessageCircleQuestion,
} from "lucide-react";
import { usePathname } from "next/navigation";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type React from "react";

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

export function Header() {
  const pathname = usePathname();
  const isActive = (href: string) => pathname === href;

  return (
    <header className="relative w-full flex flex-col items-center pt-2 sm:pt-4 pb-0">
      {/* Top right corner group */}
      <div className="absolute top-2 right-2 sm:top-4 sm:right-4 z-50 flex items-center gap-2">
        <AuthButton />
        {/* <ChainSelection /> */}

        {/* Navigation Dropdown Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            {/* Reverted Button Style */}
            <Button
              variant="outline"
              size="icon"
              className="border-yellow-700/60 bg-stone-800/80 hover:bg-yellow-600/20"
            >
              <Menu className="h-5 w-5 text-yellow-300" />
              <span className="sr-only">Toggle Menu</span>{" "}
              {/* Keep accessibility */}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            className="w-56 bg-stone-900/95 border-yellow-600/30 text-stone-200 mr-2 backdrop-blur-sm"
          >
            {navigationItems.map((item) => (
              <Link key={item.path} href={item.path} passHref>
                <DropdownMenuItem
                  className={`cursor-pointer focus:bg-yellow-600/20 focus:text-yellow-300 ${isActive(item.path) ? "bg-yellow-700/30 text-yellow-400" : "hover:bg-stone-800"}`}
                >
                  <item.icon className="mr-2 h-4 w-4" />
                  <span>{item.label}</span>
                </DropdownMenuItem>
              </Link>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Header Image wrapped in Link */}
      <Link
        href="/"
        className="w-full max-w-[600px] md:max-w-[800px] px-4 block"
      >
        <Image
          src="/heavy_helms_header_drop_shadow.png"
          alt="Heavy Helms Header"
          width={800}
          height={266}
          className="w-full opacity-100"
          priority
        />
      </Link>
      {/* Old nav is removed */}
    </header>
  );
}
