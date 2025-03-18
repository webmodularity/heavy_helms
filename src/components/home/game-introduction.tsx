// src/components/home/game-introduction.tsx
"use client";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";

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
      title: "Choose Your Warrior",
      description:
        "Select from legendary warriors, each with unique attribute distributions that affect combat calculations.",
      imageUrl: "/images/intro/select-warrior.webp",
      icon: "🛡️",
    },
    {
      title: "Select Your Strategy",
      description:
        "Equip skins that determine your weapon, armor, and fighting stance. Each combination has unique strengths and weaknesses.",
      imageUrl: "/images/intro/combat.webp",
      icon: "⚔️",
    },
    {
      title: "Watch Battles Unfold",
      description:
        "Witness automatic turn-based combat where initiative, hit chance, blocks, and critical strikes determine the victor.",
      imageUrl: "/images/intro/victory.webp",
      icon: "👑",
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
    <section className="relative py-16">
      {/* Reuse the similar border decoration style as CharacterGallery */}
      {/* <BorderDecoration /> */}

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
          >
            <h2 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-amber-600 uppercase tracking-widest mb-1">
              Enter The Arena
            </h2>
            <div className="flex items-center justify-center mb-3">
              <div className="h-[1px] w-16 bg-yellow-600/40" />
              <div className="mx-4">
                <span className="text-yellow-400/90 text-sm font-medium tracking-widest">
                  BATTLE AWAITS
                </span>
              </div>
              <div className="h-[1px] w-16 bg-yellow-600/40" />
            </div>
          </motion.div>
        </div>

        <div className="flex flex-col md:flex-row gap-8 items-center">
          {/* Left side: Image showcase */}
          <motion.div
            className="w-full md:w-1/2 aspect-video relative rounded-md overflow-hidden border border-yellow-600/20"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7 }}
          >
            {/* Placeholder for gameplay images/videos */}
            {gameSteps.map((step) => (
              <div
                key={`slide-${step.title}`}
                className={`absolute inset-0 transition-all duration-700 ${
                  activeStep === gameSteps.indexOf(step)
                    ? "opacity-100"
                    : "opacity-0 pointer-events-none"
                }`}
              >
                {/* You can use actual Images here once you have them */}
                <div className="absolute inset-0 bg-gradient-to-t from-stone-900/90 to-transparent z-10" />
                <div className="w-full h-full bg-stone-800 flex items-center justify-center text-7xl">
                  {step.icon}
                </div>
              </div>
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

// Reusing the BorderDecoration component to maintain style consistency
function BorderDecoration() {
  return (
    <>
      {/* Dark overlay with textured base */}
      <div className="absolute inset-0 bg-stone-900/60" />

      {/* Inner glow effect */}
      <div className="absolute inset-0 shadow-[inset_0_0_100px_rgba(30,20,10,0.6)]" />

      {/* Decorative top border */}
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-amber-700/30 via-yellow-500/50 to-amber-700/30" />
      <div className="absolute top-1 left-0 w-full h-3 bg-gradient-to-r from-amber-800/20 via-yellow-600/30 to-amber-800/20" />
      <div className="absolute top-4 left-0 w-full h-0.5 bg-amber-600/10" />

      {/* Decorative bottom border */}
      <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-amber-700/30 via-yellow-500/50 to-amber-700/30" />
      <div className="absolute bottom-1 left-0 w-full h-3 bg-gradient-to-r from-amber-800/20 via-yellow-600/30 to-amber-800/20" />
      <div className="absolute bottom-4 left-0 w-full h-0.5 bg-amber-600/10" />

      {/* Corner decorations (simplified version) */}
      <div className="absolute top-0 left-0 w-16 h-16 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-0 w-[2px] h-12 bg-gradient-to-b from-yellow-500/70 to-transparent" />
        <div className="absolute top-0 left-0 h-[2px] w-12 bg-gradient-to-r from-yellow-500/70 to-transparent" />
        <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-yellow-500/30 rounded-tl-sm" />
      </div>

      <div className="absolute top-0 right-0 w-16 h-16 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-[2px] h-12 bg-gradient-to-b from-yellow-500/70 to-transparent" />
        <div className="absolute top-0 right-0 h-[2px] w-12 bg-gradient-to-r from-transparent to-yellow-500/70" />
        <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-yellow-500/30 rounded-tr-sm" />
      </div>

      <div className="absolute bottom-0 left-0 w-16 h-16 overflow-hidden pointer-events-none">
        <div className="absolute bottom-0 left-0 w-[2px] h-12 bg-gradient-to-t from-yellow-500/70 to-transparent" />
        <div className="absolute bottom-0 left-0 h-[2px] w-12 bg-gradient-to-r from-yellow-500/70 to-transparent" />
        <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-yellow-500/30 rounded-bl-sm" />
      </div>

      <div className="absolute bottom-0 right-0 w-16 h-16 overflow-hidden pointer-events-none">
        <div className="absolute bottom-0 right-0 w-[2px] h-12 bg-gradient-to-t from-yellow-500/70 to-transparent" />
        <div className="absolute bottom-0 right-0 h-[2px] w-12 bg-gradient-to-r from-transparent to-yellow-500/70" />
        <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-yellow-500/30 rounded-br-sm" />
      </div>
    </>
  );
}
