"use client";

import AuthButton from "@/components/auth-button";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { ChainSelection } from "./chain-selection";
import Link from "next/link";
import { ChartBar, Trophy, Home } from "lucide-react";
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';

export function Header() {
  const pathname = usePathname();

  const isActive = (href: string) => pathname === href;

  const navButtonBaseClasses = "group border-2 transition-all duration-200 ease-in-out shadow-md hover:shadow-lg backdrop-blur-sm px-4 py-1 sm:px-6 sm:py-2 text-sm sm:text-base font-semibold tracking-wide flex items-center justify-center rounded-lg";
  
  const navButtonInactiveClasses = "bg-stone-800/80 border-yellow-700/60 text-yellow-300 hover:bg-yellow-600 hover:text-stone-900 hover:border-yellow-500";
  
  const navButtonActiveClasses = "bg-yellow-600 border-yellow-400 text-stone-900 shadow-lg scale-105";

  return (
    <header className="relative w-full flex flex-col items-center py-2 sm:py-4">
      <div className="absolute top-2 right-2 sm:top-4 sm:right-4 z-50 flex justify-end gap-2 items-center">
        <AuthButton />
        <ChainSelection />
      </div>

      <div className="w-full max-w-[600px] md:max-w-[800px] px-4">
        <Image
          src="/heavy_helms_header_drop_shadow.png"
          alt="Heavy Helms Header"
          width={800}
          height={266}
          className="w-full opacity-100"
          priority
        />
      </div>

      <nav className="mt-2 sm:mt-4 flex flex-wrap justify-center items-center gap-2 sm:gap-4 px-2">
        <motion.div
           whileHover={{ scale: 1.05, y: -2 }}
           whileTap={{ scale: 0.95 }}
           transition={{ type: "spring", stiffness: 400, damping: 17 }}
        >
          <Link href="/">
            <Button
              variant="outline"
              className={`${navButtonBaseClasses} ${
                isActive('/') ? navButtonActiveClasses : navButtonInactiveClasses
              }`}
              style={{ padding: '' }}
            >
              <Home className="mr-1.5 h-4 w-4 sm:mr-2 sm:h-5 sm:w-5 transition-transform group-hover:scale-110" />
              Home
            </Button>
          </Link>
        </motion.div>

        <motion.div
           whileHover={{ scale: 1.05, y: -2 }}
           whileTap={{ scale: 0.95 }}
           transition={{ type: "spring", stiffness: 400, damping: 17 }}
        >
          <Link href="/stats">
            <Button
              variant="outline"
              className={`${navButtonBaseClasses} ${
                isActive('/stats') ? navButtonActiveClasses : navButtonInactiveClasses
              }`}
              style={{ padding: '' }}
            >
              <ChartBar className="mr-1.5 h-4 w-4 sm:mr-2 sm:h-5 sm:w-5 transition-transform group-hover:scale-110" />
              Statistics
            </Button>
          </Link>
        </motion.div>

        <motion.div
           whileHover={{ scale: 1.05, y: -2 }}
           whileTap={{ scale: 0.95 }}
           transition={{ type: "spring", stiffness: 400, damping: 17 }}
        >
          <Link href="/leaderboards">
            <Button
              variant="outline"
              className={`${navButtonBaseClasses} ${
                isActive('/leaderboards') ? navButtonActiveClasses : navButtonInactiveClasses
              }`}
               style={{ padding: '' }}
            >
              <Trophy className="mr-1.5 h-4 w-4 sm:mr-2 sm:h-5 sm:w-5 transition-transform group-hover:scale-110" />
              Leaderboards
            </Button>
          </Link>
        </motion.div>
      </nav>
    </header>
  );
}
