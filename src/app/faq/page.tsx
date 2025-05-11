import type { Metadata } from "next";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import React from "react";

export const metadata: Metadata = {
  title: "FAQ - Heavy Helms",
  description: "Frequently asked questions about the Heavy Helms game.",
};

// Define a specific interface for the requirements object
interface EquipmentReqs {
  str?: number;
  con?: number;
  siz?: number;
  agi?: number;
  sta?: number;
  luc?: number;
}

// Update the function signature to use the specific interface
function formatReqs(reqs: EquipmentReqs): React.ReactNode {
  // Filter out undefined values before mapping
  const parts = Object.entries(reqs)
    .filter(([, value]) => value !== undefined && value > 0)
    .map(([key, value]) => `${key.toUpperCase()}: ${value}`);

  if (parts.length === 0) {
    return <span className="italic text-stone-400">None</span>;
  }
  return (
    <span className="inline-block">
      {parts.map((part, index) => (
        // biome-ignore lint/suspicious/noArrayIndexKey: <explanation>
        <span key={index} className="mr-2 whitespace-nowrap last:mr-0 text-[10px] sm:text-xs">
          {part}
        </span>
      ))}
    </span>
  );
}

// Extracted Requirements Data
const equipmentRequirements = {
  weapons: [
    { name: "Arming Sword & Kite Shield", reqs: { str: 12, siz: 5, sta: 5 } },
    { name: "Mace & Tower Shield", reqs: { str: 12, siz: 12, sta: 8 } },
    { name: "Rapier & Buckler", reqs: { agi: 14 } },
    { name: "Greatsword", reqs: { str: 14, siz: 10 } },
    { name: "Battleaxe", reqs: { str: 16, siz: 12 } },
    { name: "Quarterstaff", reqs: {} },
    { name: "Spear", reqs: { str: 6, siz: 12, agi: 10 } },
    { name: "Shortsword & Buckler", reqs: {} },
    { name: "Shortsword & Tower Shield", reqs: { str: 6, siz: 12, sta: 8 } },
    { name: "Dual Daggers", reqs: { agi: 8 } },
    { name: "Rapier & Dagger", reqs: { agi: 16 } },
    { name: "Scimitar & Buckler", reqs: { str: 8, agi: 8 } },
    { name: "Axe & Kite Shield", reqs: { str: 10, siz: 5, sta: 5 } },
    { name: "Axe & Tower Shield", reqs: { str: 12, siz: 12, sta: 8 } },
    { name: "Dual Scimitars", reqs: { str: 8, agi: 14 } },
    { name: "Flail & Buckler", reqs: { str: 10, agi: 10 } },
    { name: "Mace & Kite Shield", reqs: { str: 10, siz: 5, sta: 5 } },
    { name: "Club & Tower Shield", reqs: { str: 8, siz: 12, sta: 8 } },
    { name: "Dual Clubs", reqs: {} },
    { name: "Arming Sword & Shortsword", reqs: { str: 14, agi: 12 } },
    { name: "Scimitar & Dagger", reqs: { str: 8, agi: 16 } },
    { name: "Arming Sword & Club", reqs: { str: 14, agi: 8 } },
    { name: "Axe & Mace", reqs: { str: 16, agi: 8 } },
    { name: "Flail & Dagger", reqs: { str: 12, agi: 14 } },
    { name: "Mace & Shortsword", reqs: { str: 14, agi: 10 } },
    { name: "Maul", reqs: { str: 18, siz: 12 } },
    { name: "Trident", reqs: { str: 12, siz: 12, agi: 10 } },
  ],
  armors: [
    { name: "Cloth Armor", reqs: {} },
    { name: "Leather Armor", reqs: { str: 5 } },
    { name: "Chain Armor", reqs: { str: 8, con: 6, sta: 6 } },
    { name: "Plate Armor", reqs: { str: 10, con: 8, sta: 8 } },
  ],
};

// Updated FAQ data from README
const faqDataCategorized = {
  "Costs & Limits": [
    {
      question: "How much does it cost to create a player?",
      answer:
        "During early access we have set the cost of creating a new player to 0.002 ETH",
    },
    {
      question: "How much does it cost to duel?",
      answer:
        "The cost for a duel is 0.0002 ETH per duel. If a wager is made we collect an aditional 2% of the wager amount.",
    },
    {
      question: "How many players can I manage?",
      answer:
        "We are currently limiting the amount of active warriors each user can own to five during early access. You will be able to purchase additional active warrior slots in the future. In the meantime you can retire warriors that you aren't attached to and free up a slot.",
    },
  ],
  "General Gameplay": [
    {
      question: "What is an auto battler?",
      answer:
        "An auto battler (also known as an auto chess or auto-combat game) is a competitive strategy game genre where players build a team of characters that then fight automatically against other players' teams without direct input during the combat phase.",
    },
    {
      question: "What makes Heavy Helms combat fair?",
      answer:
        "All players have the same total attribute points, just distributed differently. Skins determine weapon and armor, offering strategic choices with strengths and weaknesses, but do not provide a pay-to-win advantage.",
    },
    {
      question: "What types of skins are there and what do they do?",
      answer:
        "All skins are NFTs. There are game-owned skins that any player can always equip without owing any NFTs. There are also skins that require NFT ownership to equip that can be purchased from a marketplace. The equipped skin determines your Weapon and Armor, influencing strategy and combat modifiers.",
    },
    {
      question: "Do you plan to release more skins?",
      answer:
        "Yes! During early access we will be releasing several new skins on a weekly basis. We are also working with artists to bring you some 1 of 1 custom skins.",
    },
  ],
  "Equipment & Attributes": [
    {
      question: "What are the attribute requirements for equipment?",
      answer: (
        <div className="space-y-4">
          <div>
            <h4 className="text-base font-semibold text-yellow-300 mb-2 border-b border-stone-700 pb-0.5">
              Weapons
            </h4>
            <div className="grid grid-cols-[1fr_auto] gap-x-2 text-xs">
              {equipmentRequirements.weapons.map((item) => (
                <React.Fragment key={item.name}>
                  <div className="text-stone-100 font-medium pt-1 pb-1">
                    {item.name}
                  </div>
                  <div className="text-stone-300 pt-1 pb-1 text-right">
                    {formatReqs(item.reqs)}
                  </div>
                  <div className="col-span-2 border-b border-stone-700/50" />
                </React.Fragment>
              ))}
            </div>
          </div>
          <div>
            <h4 className="text-base font-semibold text-yellow-300 mb-2 border-b border-stone-700 pb-0.5">
              Armor
            </h4>
            <div className="grid grid-cols-[1fr_auto] gap-x-2 text-xs">
              {equipmentRequirements.armors.map((item) => (
                <React.Fragment key={item.name}>
                  <div className="text-stone-100 font-medium pt-1 pb-1">
                    {item.name}
                  </div>
                  <div className="text-stone-300 pt-1 pb-1 text-right">
                    {formatReqs(item.reqs)}
                  </div>
                  <div className="col-span-2 border-b border-stone-700/50" />
                </React.Fragment>
              ))}
            </div>
          </div>
        </div>
      ),
    },
    {
      question: "How do attributes and skins affect gameplay?",
      answer:
        "Your player's base attributes (Strength, Constitution, Size, Agility, Stamina, and Luck) calculate stats like Max Health, Hit Chance, and Crit Chance. The onchain Game Engine combines these base stats with modifiers based on your equipped skin's weapon and armor and your chosen stance to determine combat outcomes.",
    },
  ],
  "Web3 & Technical": [
    {
      question: "What network does Heavy Helms run on?",
      answer: (
        <>
          We are on{" "}
          <a
            href="https://shape.network/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-yellow-500 hover:text-yellow-400 underline"
          >
            Shape Network
          </a>{" "}
          - an L2 OP Superchain.
        </>
      ),
    },
    {
      question: "Is this really a web3 game?",
      answer:
        "Yes, Heavy Helms is a web3 native game. The game engine was written in Solidity and we encourage you to check out the contracts linked in the footer.",
    },
    {
      question: "What happens if the game engine needs updates or balancing?",
      answer:
        "The Game Engine is modular and versioned. Updates can be deployed without affecting player contracts. Game modes can specify which engine version they use, and the game client can interpret different combat result versions.",
    },
    {
      question: "Where can I find the community and contract details?",
      answer:
        "Join our official Discord (link in footer) and follow us on X/Twitter. Deployed contract addresses for Shape Mainnet can be found in the project's README on GitHub.",
    },
  ],
  "Development & Future": [
    {
      question: "What does early access mean?",
      answer:
        "It simply means that we are still tweaking balance as well as adding new game modes and features. Your players will NOT be lost when we leave early access and all skins acquired will still be available. Basically you can expect some aggressive balance changes as well as some updates to the look and feel of the game.",
    },
    {
      question: "When do you plan to leave early access?",
      answer:
        "We plan to leave early access after the tournament mode is launched. You can follow us on twitter or check out our roadmap for more details.",
    },
    {
      question: "What game modes are currently available?",
      answer:
        "Currently, there are two modes: Practice Game (free, uses block entropy for pseudo-random outcomes, no permanent record) and Duel Game (records Wins/Losses onchain, uses VRF for randomness, logs results publicly, allows optional ETH wagers).",
    },
    {
      question: "Are new game modes planned?",
      answer:
        "Yes! The contracts are modular. A tournament mode is planned, and the permission system allows other approved game contracts to modify player state (like records or granting rewards) in the future.",
    },
  ],
};

export default function FaqPage() {
  return (
    <div className="space-y-6">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 pt-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-yellow-500">
              Frequently Asked Questions
            </h1>
            <p className="text-xs text-stone-400 mt-0.5">
              Find answers to common questions about Heavy Helms.
            </p>
          </div>
        </div>
      </div>

      <div className="relative mt-4">
        <div className="absolute inset-0 bg-stone-900/60" />
        <div className="absolute inset-0 shadow-[inset_0_0_60px_rgba(30,20,10,0.6)]" />
        <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-amber-700/30 via-yellow-500/50 to-amber-700/30" />
        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-amber-700/30 via-yellow-500/50 to-amber-700/30" />

        <div className="relative max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 py-6">
          {Object.entries(faqDataCategorized).map(
            ([category, questions], categoryIndex) => (
              <div key={category} className={categoryIndex > 0 ? "mt-6" : ""}>
                <h3 className="text-lg font-bold text-stone-100 tracking-wide mb-2 border-b border-stone-600/50 pb-1">
                  {category}
                </h3>
                <Accordion type="single" collapsible className="w-full">
                  {questions.map((faq, questionIndex) => (
                    <AccordionItem
                      key={`${categoryIndex}-${questionIndex}`}
                      value={`item-${categoryIndex}-${questionIndex}`}
                      className="border-stone-700/50"
                    >
                      <AccordionTrigger className="text-sm sm:text-base hover:no-underline text-left font-semibold text-yellow-400 py-3">
                        {faq.question}
                      </AccordionTrigger>
                      <AccordionContent className="text-stone-300 pt-1 pb-3 leading-relaxed text-xs sm:text-sm font-sans">
                        {faq.answer}
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </div>
            ),
          )}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 pb-6">
        <div className="text-center mt-4 pt-4 border-t border-stone-800/60">
          <p className="text-xs text-stone-400 mb-2">
            Can't find the answer you're looking for?
          </p>
          <a
            href="https://discord.gg/5XHu76FmpJ"
            className="text-yellow-500 hover:text-yellow-400 underline font-medium text-sm"
          >
            Join our Discord
          </a>
        </div>
      </div>
    </div>
  );
}
