// (Removed inline declare module statement; will add a .d.ts file instead)

import romanize from "romanize";

export interface GauntletTheme {
  name: string;
  backgroundImage: string;
  // Future: could add music, color scheme, etc.
}

export const GAUNTLET_THEMES: GauntletTheme[] = [
  { name: "Emberstone", backgroundImage: "/backgrounds/emberstone/emberstone.jpg" },
  { name: "Frostwind", backgroundImage: "/backgrounds/frostwind/frostwind.jpg" },
  { name: "Shadow Citadel", backgroundImage: "/backgrounds/shadow-citadel/shadow-citadel.jpg" },
  { name: "Dragon's Tooth", backgroundImage: "/backgrounds/dragons-tooth/dragons-tooth.jpg" },
  { name: "Valor's Proving", backgroundImage: "/backgrounds/valors-proving/valors-proving.jpg" },
  { name: "Sunken Armory", backgroundImage: "/backgrounds/sunken-armory/sunken-armory.jpg" },
  { name: "Whispering Labyrinth", backgroundImage: "/backgrounds/whispering-labyrinth/whispering-labyrinth.jpg" },
  { name: "Ironclad", backgroundImage: "/backgrounds/ironclad/ironclad.jpg" },
  { name: "Serpent's Coil", backgroundImage: "/backgrounds/serpents-coil/serpents-coil.jpg" },
  { name: "Celestial", backgroundImage: "/backgrounds/celestial/celestial.jpg" },
  { name: "Obsidian Crucible", backgroundImage: "/backgrounds/obsidian-crucible/obsidian-crucible.jpg" },
  { name: "Twin Moons", backgroundImage: "/backgrounds/twin-moons/twin-moons.jpg" },
  { name: "Ancient Arena", backgroundImage: "/backgrounds/ancient-arena/ancient-arena.jpg" },
  { name: "Gilded Cage", backgroundImage: "/backgrounds/gilded-cage/gilded-cage.jpg" },
  { name: "Winter's Bite", backgroundImage: "/backgrounds/winters-bite/winters-bite.jpg" },
];

// Roman numeral suffix generator (always Roman numerals, blank for first instance)
function getRomanSuffix(numeralIndex: number): string {
  if (numeralIndex === 0) return ""; // No suffix for the first instance
  // Add a space and the Roman numeral (e.g., ' II', ' III', ...)
  return ` ${romanize(numeralIndex + 1)}`;
}

/**
 * Gets the gauntlet theme (name and assets) based on an ID number.
 * @param idNumber - The numerical ID or sequence number of the gauntlet.
 * @returns The gauntlet theme with name and background image path.
 */
export function getGauntletTheme(idNumber: number): GauntletTheme & { fullName: string } {
  const listLength = GAUNTLET_THEMES.length;
  if (listLength === 0) {
    return {
      name: `Gauntlet #${idNumber + 1}`,
      backgroundImage: "/backgrounds/frostwind/frostwind.jpg", // fallback
      fullName: `Gauntlet #${idNumber + 1}`
    };
  }

  const themeIndex = idNumber % listLength;
  const numeralIndex = Math.floor(idNumber / listLength);
  const theme = GAUNTLET_THEMES[themeIndex];
  const romanSuffix = getRomanSuffix(numeralIndex);

  return {
    ...theme,
    fullName: `${theme.name} Gauntlet${romanSuffix}`
  };
}

