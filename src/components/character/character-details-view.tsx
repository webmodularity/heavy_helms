"use client";

import { usePlayerById } from "@/hooks/use-player-by-id";
import { useRetirePlayer } from "@/hooks/use-retire-player";
import { SectionHeader } from "@/components/ui/section-header";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import {
  ArrowLeft,
  Shield,
  Swords,
  Trophy,
  HeartPulse,
  Zap,
  Dices,
  Dumbbell,
  Ruler,
  ChevronLeft,
  Flame,
  Flag,
  Trash2,
} from "lucide-react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { RetirementConfirmationDialog } from "../dialogs/retirement-confirmation-dialog";

interface CharacterDetailsViewProps {
  characterId: string;
}

export function CharacterDetailsView({
  characterId,
}: CharacterDetailsViewProps) {
  const { data: character, isLoading, error } = usePlayerById(characterId);
  const router = useRouter();
  const { retirePlayer, isRetiring, txHash } = useRetirePlayer(characterId);
  const [showConfirm, setShowConfirm] = useState(false);

  // Handle the retirement process
  const handleRetirement = async () => {
    const result = await retirePlayer();

    if (result.success) {
      // Redirect to home after successful retirement
      setTimeout(() => {
        router.push("/");
      }, 2000);
    }
  };

  if (isLoading) {
    return <CharacterDetailsSkeleton />;
  }

  if (error) {
    return <CharacterError error={error} />;
  }

  if (!character) {
    return <CharacterNotFound />;
  }

  return (
    <>
      <Button
        variant="ghost"
        size="sm"
        className="mb-6 text-yellow-500 hover:text-yellow-400 hover:bg-yellow-900/20 relative z-10"
        onClick={() => router.back()}
      >
        <ChevronLeft className="mr-1 h-4 w-4" />
        Back to Warriors
      </Button>

      {/* Hero Section with animated gradient background */}
      <motion.div
        className="relative rounded-lg overflow-hidden mb-12 border border-yellow-600/20"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.7 }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-amber-900/30 via-stone-900/70 to-amber-900/30 z-0 animate-gradient-x" />
        <div className="absolute inset-0 bg-[conic-gradient(from_0deg_at_50%_50%,rgba(251,191,36,0.05)_0deg,rgba(41,37,36,0.1)_120deg,rgba(251,191,36,0.05)_240deg,rgba(41,37,36,0.05)_360deg)] opacity-30 z-0" />

        <div className="relative z-10 p-8 md:p-12">
          <SectionHeader
            title={character.name.fullName || "Warrior Details"}
            subtitle={character.id}
          />

          <p className="text-yellow-400/70 max-w-2xl mt-4 text-center md:text-left">
            A {character.isImmortal ? "immortal" : "mortal"} warrior with a
            legacy of {character.record.wins} victories in the arena. Known for
            exceptional{" "}
            {character.attributes.strength > 7
              ? "strength"
              : character.attributes.agility > 7
                ? "agility"
                : "balanced skills"}{" "}
            and tactical prowess.
          </p>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
        {/* Character Image - Now with animated glow effect */}
        <motion.div
          className="col-span-1 aspect-square rounded-lg overflow-hidden border border-yellow-600/40 bg-gradient-to-b from-amber-900/20 to-stone-900/40 relative"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div
            className="absolute inset-0 bg-gradient-to-tr from-yellow-600/0 via-yellow-500/10 to-yellow-600/0 z-0 animate-pulse"
            style={{ animationDuration: "4s" }}
          />
          <Image
            src={character.currentSkin.imageURL}
            alt={character.name.fullName || "Character"}
            width={600}
            height={600}
            className="object-cover w-full h-full relative z-10"
            priority
          />
          <div className="absolute inset-0 border-4 border-transparent border-b-yellow-600/20 border-r-yellow-600/20 z-20" />
        </motion.div>

        {/* Character Details */}
        <motion.div
          className="col-span-1 md:col-span-2 space-y-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          {/* Warrior Info - Enhanced with decorative elements */}
          <div className="bg-gradient-to-b from-amber-900/10 to-stone-900/40 rounded-lg border border-yellow-600/20 p-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-yellow-600/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl" />
            <h3 className="text-xl font-semibold text-yellow-500 mb-4 flex items-center relative z-10">
              <Flag className="mr-2 h-5 w-5" />
              Warrior Identity
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 relative z-10">
              <InfoItem
                label="First Name"
                value={character.name.firstName}
                icon={null}
              />
              <InfoItem
                label="Surname"
                value={character.name.surname}
                icon={null}
              />
              <InfoItem
                label="Status"
                value={character.isRetired ? "Retired" : "Active"}
                className={
                  character.isRetired ? "text-red-400" : "text-green-400"
                }
                icon={null}
              />
              <InfoItem
                label="Immortal"
                value={character.isImmortal ? "Yes" : "No"}
                className={
                  character.isImmortal ? "text-yellow-400" : "text-stone-400"
                }
                icon={null}
              />
            </div>
          </div>

          {/* Battle Record - Now with animated stats */}
          <div className="bg-gradient-to-b from-amber-900/10 to-stone-900/40 rounded-lg border border-yellow-600/20 p-6 relative overflow-hidden">
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-amber-700/5 rounded-full translate-y-1/2 -translate-x-1/2 blur-2xl" />
            <h3 className="text-xl font-semibold text-yellow-500 mb-4 flex items-center relative z-10">
              <Trophy className="mr-2 h-5 w-5" />
              Battle Legacy
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 relative z-10">
              <StatBox
                label="Wins"
                value={character.record.wins.toString()}
                className="text-green-400"
              />
              <StatBox
                label="Losses"
                value={character.record.losses.toString()}
                className="text-red-400"
              />
              <StatBox
                label="Kills"
                value={character.record.kills.toString()}
                className="text-yellow-400"
              />
            </div>
          </div>
        </motion.div>
      </div>

      {/* Attributes Section - Now with hover effects */}
      <motion.div
        className="mb-12"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <h3 className="text-2xl font-semibold text-yellow-500 mb-6 flex items-center">
          <Dumbbell className="mr-2 h-5 w-5" />
          Attributes
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          <AttributeCard
            label="Strength"
            value={character.attributes.strength}
            description="Determines attack power"
            icon={<Swords className="h-5 w-5" />}
          />
          <AttributeCard
            label="Constitution"
            value={character.attributes.constitution}
            description="Affects health and resilience"
            icon={<HeartPulse className="h-5 w-5" />}
          />
          <AttributeCard
            label="Size"
            value={character.attributes.size}
            description="Affects damage and defense"
            icon={<Ruler className="h-5 w-5" />}
          />
          <AttributeCard
            label="Agility"
            value={character.attributes.agility}
            description="Affects dodge and speed"
            icon={<ArrowLeft className="h-5 w-5 transform -rotate-45" />}
          />
          <AttributeCard
            label="Stamina"
            value={character.attributes.stamina}
            description="Determines endurance in battle"
            icon={<Zap className="h-5 w-5" />}
          />
          <AttributeCard
            label="Luck"
            value={character.attributes.luck}
            description="Affects critical hits and special events"
            icon={<Dices className="h-5 w-5" />}
          />
        </div>
      </motion.div>

      {/* Equipment Section - Now with highlight effects */}
      <motion.div
        className="mb-12"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
      >
        <h3 className="text-2xl font-semibold text-yellow-500 mb-6 flex items-center">
          <Shield className="mr-2 h-5 w-5" />
          Equipment
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <EquipmentCard
            title="Weapon"
            value={String(character.currentSkin.weapon || "Standard Weapon")}
            icon={<Swords className="h-5 w-5" />}
          />

          <EquipmentCard
            title="Armor"
            value={String(character.currentSkin.armor || "Standard Armor")}
            icon={<Shield className="h-5 w-5" />}
          />

          <EquipmentCard
            title="Fighting Style"
            value={String(character.currentSkin.stance || "Balanced")}
            icon={<Flame className="h-5 w-5" />}
          />
        </div>
      </motion.div>

      {/* Action Buttons - Now with enhanced hover effects */}
      <motion.div
        className="flex flex-wrap gap-4 justify-center md:justify-start"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
      >
        {/* Add retirement button */}
        <Button
          variant="outline"
          className="border-red-700/40 hover:border-red-700 hover:bg-red-900/20 text-red-400 transition-all duration-300"
          onClick={() => setShowConfirm(true)}
        >
          <Trash2 className="mr-1 h-4 w-4" />
          Retire Warrior
        </Button>
      </motion.div>

      {/* Use the new dialog component */}
      <RetirementConfirmationDialog
        open={showConfirm}
        onOpenChange={setShowConfirm}
        characterName={character.name.fullName || ""}
        onConfirm={handleRetirement}
        isRetiring={isRetiring}
        txHash={txHash}
      />
    </>
  );
}

// Helper Components

interface InfoItemProps {
  label: string;
  value: string;
  icon?: React.ReactNode | null;
  className?: string;
}

function InfoItem({ label, value, icon, className = "" }: InfoItemProps) {
  return (
    <div className="flex justify-between group">
      <span className="text-stone-400 group-hover:text-stone-300 transition-colors duration-300">
        {label}
      </span>
      <span
        className={`font-medium ${className || "text-stone-200"} group-hover:text-white transition-colors duration-300`}
      >
        {icon && <span className="mr-1">{icon}</span>}
        {value}
      </span>
    </div>
  );
}

interface StatBoxProps {
  label: string;
  value: string;
  className?: string;
}

function StatBox({ label, value, className = "" }: StatBoxProps) {
  return (
    <motion.div
      className="text-center p-4 bg-stone-800/30 rounded-lg border border-yellow-600/10 relative overflow-hidden group hover:border-yellow-600/20 transition-all duration-300"
      whileHover={{ y: -5, transition: { duration: 0.2 } }}
    >
      <div className="absolute inset-0 bg-gradient-to-t from-yellow-600/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      <motion.div
        className={`text-2xl font-bold ${className} relative z-10`}
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        {value}
      </motion.div>
      <div className="text-stone-400 text-sm mt-1 relative z-10 group-hover:text-stone-300 transition-colors duration-300">
        {label}
      </div>
    </motion.div>
  );
}

interface AttributeCardProps {
  label: string;
  value: number;
  description: string;
  icon: React.ReactNode;
}

function AttributeCard({
  label,
  value,
  description,
  icon,
}: AttributeCardProps) {
  // Generate a dynamic color based on the attribute value
  const getValueColor = (val: number) => {
    if (val >= 8) return "text-yellow-400";
    if (val >= 6) return "text-green-400";
    if (val >= 4) return "text-blue-400";
    return "text-stone-400";
  };

  return (
    <motion.div
      className="bg-gradient-to-b from-amber-900/10 to-stone-900/40 rounded-lg border border-yellow-600/20 p-6 relative overflow-hidden group hover:border-yellow-600/30 transition-all duration-300"
      whileHover={{ scale: 1.02, transition: { duration: 0.2 } }}
    >
      <div className="absolute inset-0 bg-gradient-to-tr from-yellow-600/0 via-yellow-500/5 to-yellow-600/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      <div className="flex justify-between items-center mb-2 relative z-10">
        <h4 className="font-medium text-yellow-400 flex items-center group-hover:text-yellow-300 transition-colors duration-300">
          <span className="mr-2 text-yellow-500 group-hover:text-yellow-400 transition-colors duration-300">
            {icon}
          </span>
          {label}
        </h4>
        <span className={`text-2xl font-bold ${getValueColor(value)}`}>
          {value}
        </span>
      </div>
      <p className="text-stone-400 text-sm relative z-10 group-hover:text-stone-300 transition-colors duration-300">
        {description}
      </p>

      {/* Progress bar visualization */}
      <div className="mt-3 h-1 w-full bg-stone-700/50 rounded-full overflow-hidden">
        <motion.div
          className="h-full bg-gradient-to-r from-amber-700 to-yellow-500 rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${(value / 10) * 100}%` }}
          transition={{ duration: 1, delay: 0.5 }}
        />
      </div>
    </motion.div>
  );
}

// New Equipment Card Component
interface EquipmentCardProps {
  title: string;
  value: string;
  icon: React.ReactNode;
}

function EquipmentCard({ title, value, icon }: EquipmentCardProps) {
  return (
    <motion.div
      className="bg-gradient-to-b from-amber-900/10 to-stone-900/40 rounded-lg border border-yellow-600/20 p-6 relative overflow-hidden group hover:border-yellow-600/30 transition-all duration-300"
      whileHover={{ y: -5, transition: { duration: 0.2 } }}
    >
      <div className="absolute inset-0 bg-gradient-to-tr from-yellow-600/0 via-yellow-500/5 to-yellow-600/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      <h4 className="font-medium text-yellow-400 mb-2 flex items-center group-hover:text-yellow-300 transition-colors duration-300">
        <span className="mr-2 text-yellow-500 group-hover:text-yellow-400 transition-colors duration-300">
          {icon}
        </span>
        {title}
      </h4>
      <p className="text-stone-200 group-hover:text-white transition-colors duration-300 relative z-10">
        {value}
      </p>
    </motion.div>
  );
}

// Loading and Error States

function CharacterDetailsSkeleton() {
  // Create array of static keys to address the linter error
  const attributeItems = [
    "skeleton-strength",
    "skeleton-constitution",
    "skeleton-size",
    "skeleton-agility",
    "skeleton-stamina",
    "skeleton-luck",
  ];

  return (
    <div className="animate-pulse">
      <div className="h-8 w-48 bg-stone-800 rounded mb-6" />
      <div className="h-12 w-64 bg-stone-800 rounded mb-4 mx-auto" />
      <div className="h-4 w-32 bg-stone-800 rounded mb-12 mx-auto" />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
        <div className="aspect-square bg-stone-800 rounded-lg" />
        <div className="col-span-1 md:col-span-2 space-y-6">
          <div className="bg-stone-800 h-48 rounded-lg" />
          <div className="bg-stone-800 h-32 rounded-lg" />
        </div>
      </div>

      <div className="h-8 w-48 bg-stone-800 rounded mb-6" />
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 mb-12">
        {attributeItems.map((key) => (
          <div key={key} className="bg-stone-800 h-32 rounded-lg" />
        ))}
      </div>
    </div>
  );
}

function CharacterError({ error }: { error: unknown }) {
  const router = useRouter();
  const errorMessage =
    error instanceof Error ? error.message : "An unexpected error occurred";

  return (
    <div className="text-center py-12">
      <h2 className="text-2xl font-bold text-red-500 mb-4">
        Error Loading Character
      </h2>
      <p className="text-stone-400 mb-2">
        We couldn't load the character data:
      </p>
      <p className="text-red-400 mb-8 max-w-md mx-auto">{errorMessage}</p>
      <Button
        onClick={() => router.push("/")}
        className="bg-yellow-600 hover:bg-yellow-700 text-stone-900"
      >
        Return to Home
      </Button>
    </div>
  );
}

function CharacterNotFound() {
  const router = useRouter();

  return (
    <div className="text-center py-12">
      <h2 className="text-2xl font-bold text-yellow-500 mb-4">
        Character Not Found
      </h2>
      <p className="text-stone-400 mb-8">
        The warrior you're looking for doesn't exist or isn't available.
      </p>
      <Button
        onClick={() => router.push("/")}
        className="bg-yellow-600 hover:bg-yellow-700 text-stone-900"
      >
        Return to Home
      </Button>
    </div>
  );
}
