import type { Metadata } from "next";
import { HelpCircle } from "lucide-react"; // Or another suitable icon

export const metadata: Metadata = {
  title: "FAQ - Heavy Helms",
  description: "Frequently asked questions about the Heavy Helms game.",
};

// Placeholder FAQ data
const faqData = [
  {
    question: "What is Heavy Helms?",
    answer:
      "Heavy Helms is a blockchain-based PvP combat game where players equip warriors and battle for supremacy and rewards.",
  },
  {
    question: "How do I start playing?",
    answer:
      "To start playing, you'll need a compatible cryptocurrency wallet. Connect your wallet on the homepage, acquire a warrior NFT (or use a free starter warrior if available), and head to the arena to find a match.",
  },
  {
    question: "What blockchain is Heavy Helms on?",
    answer:
      "Please check the official documentation or announcements for the specific blockchain(s) Heavy Helms currently operates on.",
  },
  {
    question: "Are there any fees to play?",
    answer:
      "Blockchain transaction fees (gas fees) may apply when performing actions like minting warriors, trading items, or claiming rewards. There might also be specific in-game fees; refer to the game's economic model details.",
  },
  {
    question: "How can I earn rewards?",
    answer:
      "Players can typically earn rewards by winning battles, participating in tournaments, completing quests, or potentially through staking or other DeFi mechanics integrated into the game.",
  },
  {
    question: "Where can I find the community?",
    answer:
      "Join our official Discord server and follow us on Twitter! Links can usually be found in the website footer or on the main page.",
  },
];

export default function FaqPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-yellow-500 flex items-center">
            <HelpCircle className="w-8 h-8 mr-3 text-yellow-600" /> {/* Icon */}
            Frequently Asked Questions
          </h1>
          <p className="text-sm text-stone-400 mt-1 pl-11">
            {" "}
            {/* Align with text */}
            Find answers to common questions about Heavy Helms.
          </p>
        </div>
        {/* Optional: Add a button here if needed, e.g., link to support */}
      </div>

      {/* FAQ List */}
      <div className="space-y-8">
        {faqData.map((faq) => (
          <div
            key={faq.question}
            className="bg-stone-900/50 p-6 rounded-lg border border-stone-800/60 shadow-md"
          >
            <h2 className="text-xl font-semibold text-yellow-400 mb-3">
              {faq.question}
            </h2>
            <p className="text-stone-300 leading-relaxed">{faq.answer}</p>
          </div>
        ))}
      </div>
      {/* Optional: Add a section for contacting support if questions aren't answered */}
      <div className="text-center mt-12">
        <p className="text-stone-400">
          Can't find the answer you're looking for?
        </p>
        <a
          href="/contact"
          className="text-yellow-500 hover:text-yellow-400 underline mt-2 inline-block"
        >
          Contact Support {/* Placeholder link */}
        </a>
      </div>
    </div>
  );
}
