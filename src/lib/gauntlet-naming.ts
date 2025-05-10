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

// Simplified Roman numeral suffix generator
function getRomanSuffix(numeralIndex: number): string {
  if (numeralIndex === 0) return ""; // No suffix for the first instance
  if (numeralIndex === 1) return " II";
  if (numeralIndex === 2) return " III";
  if (numeralIndex === 3) return " IV";
  if (numeralIndex === 4) return " V";
  // For simplicity, beyond V, we'll use Arabic numbers with a space.
  if (numeralIndex > 0) return ` ${numeralIndex + 1}`;
  return "";
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
