// (Removed inline declare module statement; will add a .d.ts file instead)

import romanize from "romanize";

export const GAUNTLET_BASE_PHRASES = [
  "Emberstone",
  "Frostwind",
  "Shadow Citadel",
  "Dragon's Tooth",
  "Valor's Proving",
  "Sunken Armory",
  "Whispering Labyrinth",
  "Ironclad",
  "Serpent's Coil",
  "Celestial",
  "Obsidian Crucible",
  "Twin Moons",
  "Ancient Arena",
  "Gilded Cage",
  "Winter's Bite", // 15 base phrases
];

// Roman numeral suffix generator (always Roman numerals, blank for first instance)
function getRomanSuffix(numeralIndex: number): string {
  if (numeralIndex === 0) return ""; // No suffix for the first instance
  // Add a space and the Roman numeral (e.g., ' II', ' III', ...)
  return ` ${romanize(numeralIndex + 1)}`;
}

/**
 * Generates a fantasy-themed gauntlet name based on an ID number.
 * @param idNumber - The numerical ID or sequence number of the gauntlet.
 * @param basePhrases - An array of base phrases to use for naming.
 * @returns The generated gauntlet name, e.g., "Emberstone Gauntlet II".
 */
export function getFantasyGauntletName(
  idNumber: number,
  basePhrases: string[] = GAUNTLET_BASE_PHRASES, // Default to the exported list
): string {
  const listLength = basePhrases.length;
  if (listLength === 0) return `Gauntlet #${idNumber + 1}`; // Fallback

  const phraseIndex = idNumber % listLength;
  const numeralIndex = Math.floor(idNumber / listLength); // 0 for first cycle, 1 for second, etc.

  const romanSuffix = getRomanSuffix(numeralIndex);

  return `${basePhrases[phraseIndex]} Gauntlet${romanSuffix}`;
}
