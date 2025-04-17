// src/components/home/game-introduction.tsx
"use client";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { SectionHeader } from "@/components/ui/section-header";

export function GameIntroduction() {
  const [activeStep, setActiveStep] = useState(0);
  const stepIntervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Auto-rotate through steps
    stepIntervalRef.current = setInterval(() => {
      setActiveStep((prev) => (prev + 1) % gameSteps.length);
    }, 5000);

    return () => {
      if (stepIntervalRef.current) clearInterval(stepIntervalRef.current);
    };
  }, []);

  // Updated game steps/instructions
  const gameSteps = [
    {
      title: "🎲 Roll Your Warrior",
      description:
        "Get a randomly generated warrior with VRF stats — no rerolls, no pay-to-win. Everyone starts fair.",
      imageUrl: "/images/intro/select-warrior.jpg",
    },
    {
      title: "🛡️ Equip Smart, Not Flashy",
      description:
        "NFT armor and weapons equipped as skins actually change how your warrior performs. Strategy > drip.",
      imageUrl: "/images/intro/skins.jpg",
    },
    {
      title: "👑 Climb the Leaderboard",
      description:
        "Challenge your friends or duel anons. Place wagers, watch replays, and fight your way to the top.",
      imageUrl: "/images/intro/combat.jpg",
    },
  ];

  const handleStepClick = (index: number) => {
    setActiveStep(index);
    // Reset the auto-rotation timer
    if (stepIntervalRef.current) clearInterval(stepIntervalRef.current);
    stepIntervalRef.current = setInterval(() => {
      setActiveStep((prev) => (prev + 1) % gameSteps.length);
    }, 5000);
  };

  return (
    // Outer section: Handles spacing, relative positioning (Matches CommunityStats)
    <section className="relative mt-8 md:mt-12 py-16">
      {/* Background, Shadow, Borders - Placed directly inside, NO Z-INDEX */}
      <div className="absolute inset-0 bg-stone-900/60" />
      <div className="absolute inset-0 shadow-[inset_0_0_100px_rgba(30,20,10,0.6)]" />
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-700/30 via-yellow-500/50 to-amber-700/30" />
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-700/30 via-yellow-500/50 to-amber-700/30" />

      {/* Single Inner container: Constrains width, adds padding, holds ALL content */}
      {/* Added relative positioning (Matches CommunityStats) */}
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* SectionHeader is INSIDE this constrained, relative container */}
        <SectionHeader
          title="Enter The Arena"
          subtitle="The fully on-chain strategy auto battler where bragging rights are on the line."
          className="mb-12"
        />

        {/* The actual content flex container */}
        <div
          className="
            flex flex-col md:flex-row gap-8 items-center
          "
        >
          {/* Left side: Image showcase */}
          <motion.div
            className="w-full md:w-1/2 aspect-video relative rounded-md overflow-hidden bg-stone-900"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7 }}
          >
            {/* Use Next/Image component */}
            {gameSteps.map((step, index) => (
              <motion.div
                key={step.title}
                className="absolute inset-0"
                initial={{ opacity: 0 }}
                animate={{ opacity: activeStep === index ? 1 : 0 }}
                transition={{ duration: 0.7 }}
                style={{
                  pointerEvents: activeStep === index ? "auto" : "none",
                }}
              >
                <Image
                  src={step.imageUrl}
                  alt={step.title}
                  fill
                  style={{ objectFit: "cover" }}
                  priority={index === 0}
                  unoptimized
                />
                <div className="absolute inset-0 bg-gradient-to-t from-stone-900/90 to-transparent z-10" />
              </motion.div>
            ))}

            {/* Step title overlay */}
            <div className="absolute bottom-0 left-0 right-0 p-4 z-20">
              <div className="min-h-[6rem] flex flex-col justify-end">
                <h3 className="text-2xl font-bold text-yellow-400 mb-1">
                  {gameSteps[activeStep].title}
                </h3>
                <p className="text-stone-200 text-sm min-h-[2.5rem]">
                  {gameSteps[activeStep].description}
                </p>
              </div>
            </div>
          </motion.div>

          {/* Right side: Features/Steps */}
          <motion.div
            className="w-full md:w-1/2"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7 }}
          >
            <div className="space-y-6">
              {gameSteps.map((step) => (
                <motion.div
                  key={`step-${step.title}`}
                  className={`p-4 rounded-md cursor-pointer transition-all duration-300 border ${
                    activeStep === gameSteps.indexOf(step)
                      ? "bg-gradient-to-r from-amber-900/30 to-stone-900/70 border-yellow-600/30"
                      : "border-transparent hover:bg-stone-800/50 hover:border-yellow-600/10"
                  }`}
                  onClick={() => handleStepClick(gameSteps.indexOf(step))}
                  whileHover={{ scale: 1.02 }}
                >
                  <div className="flex items-start">
                    <div
                      className={`
                      w-10 h-10 flex items-center justify-center rounded-full text-xl border transition-all duration-300
                      ${
                        activeStep === gameSteps.indexOf(step)
                          ? "bg-yellow-600 text-stone-900 border-transparent"
                          : "bg-stone-900/40 text-yellow-400 border-yellow-600/30 hover:bg-stone-800/60"
                      }
                    `}
                    >
                      {gameSteps.indexOf(step) + 1}
                    </div>
                    <div className="ml-4">
                      <h3
                        className={`font-bold text-lg ${
                          activeStep === gameSteps.indexOf(step)
                            ? "text-yellow-400"
                            : "text-stone-200"
                        }`}
                      >
                        {step.title}
                      </h3>
                      <p
                        className={`${
                          activeStep === gameSteps.indexOf(step)
                            ? "text-stone-200"
                            : "text-stone-400"
                        }`}
                      >
                        {step.description}
                      </p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Step indicators */}
            <div className="flex justify-center mt-8 space-x-2">
              {gameSteps.map((step) => (
                <Button
                  key={`indicator-${step.title}`}
                  onClick={() => handleStepClick(gameSteps.indexOf(step))}
                  className={`w-3 h-3 rounded-full transition-colors ${
                    activeStep === gameSteps.indexOf(step)
                      ? "bg-yellow-500"
                      : "bg-stone-700 hover:bg-stone-600"
                  }`}
                  aria-label={`Go to step ${gameSteps.indexOf(step) + 1}`}
                />
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
