import Link from "next/link";
// Import icons needed for navigation links (assuming they are same as header)
import { Trophy, Scroll, Shield, ListOrdered, HelpCircle } from "lucide-react";

export function Footer() {
  // Re-define navigation items here for the footer, or import from a shared config
  const navigationItems = [
    { label: "Warrior's Hall", path: "/", icon: Shield },
    { label: "Battle Archives", path: "/battle-archives", icon: Trophy },
    { label: "Leaderboards", path: "/leaderboards", icon: ListOrdered },
    { label: "Game Statistics", path: "/stats", icon: Scroll },
    { label: "FAQ", path: "/faq", icon: HelpCircle },
  ];

  return (
    <footer className="relative mt-20">
      {/* Dark overlay with stone base - matching banner background */}
      <div className="absolute inset-0 bg-stone-900/75" />

      <div className="relative max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* About Section - Definition List Style */}
          <div className="bg-gradient-to-b from-stone-800/60 to-stone-900/60 backdrop-blur-sm p-6 rounded border border-stone-600/30 shadow-lg transform transition-transform hover:scale-[1.01]">
            <h3 className="text-yellow-400/80 text-lg font-bold mb-4 uppercase tracking-widest">
              About Heavy Helms
            </h3>
            {/* Changed to definition list (dl, dt, dd) */}
            <dl className="space-y-3 text-stone-300 text-sm leading-relaxed">
              <div>
                <dt className="font-semibold text-yellow-500/90 mb-0.5">
                  Web3 Native Auto-Battler:
                </dt>
                <dd className="pl-2 text-stone-300/90">
                  {" "}
                  {/* Indent definition slightly */}
                  Where VRF guides the hand of fate!
                </dd>
              </div>
              <div>
                <dt className="font-semibold text-yellow-500/90 mb-0.5">
                  Fair Combat:
                </dt>
                <dd className="pl-2 text-stone-300/90">
                  Equal stats, victory forged by strategy, not coin (No P2W!).
                </dd>
              </div>
              <div>
                <dt className="font-semibold text-yellow-500/90 mb-0.5">
                  {" "}
                  {/* Corrected 3rd point */}
                  Modular & Open:
                </dt>
                <dd className="pl-2 text-stone-300/90">
                  Game engine is onchain and open source.
                </dd>
              </div>
            </dl>
          </div>

          {/* Navigation Links - Removed "Powered by" link */}
          <div className="bg-gradient-to-b from-stone-800/60 to-stone-900/60 backdrop-blur-sm p-6 rounded border border-stone-600/30 shadow-lg transform transition-transform hover:scale-[1.01]">
            <h3 className="text-yellow-400/80 text-lg font-bold mb-4 uppercase tracking-widest">
              Navigation
            </h3>
            <ul className="space-y-3">
              {navigationItems.map((item) => {
                // Assign the icon component to a variable for easier use
                const IconComponent = item.icon;
                return (
                  <li key={item.path} className="flex items-center group">
                    {/* Keep the dot */}
                    <div className="w-1.5 h-1.5 rounded-full bg-stone-600/50 mr-2 group-hover:bg-yellow-400 transition-colors" />
                    <Link
                      href={item.path}
                      className="text-stone-200 text-sm hover:text-yellow-400 transition-colors flex items-center"
                    >
                      {/* Render the icon before the label */}
                      <IconComponent className="mr-1.5 h-4 w-4 text-stone-400 group-hover:text-yellow-400 transition-colors" />
                      {item.label}
                      {/* Keep the arrow SVG */}
                      <svg
                        className="w-4 h-4 ml-1 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all text-yellow-400"
                        viewBox="0 0 24 24"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                        aria-label="Arrow icon"
                      >
                        <path
                          d="M5 12H19M19 12L12 5M19 12L12 19"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </Link>
                  </li>
                );
              })}
              {/* REMOVED "Powered by Shape Network" link and divider */}
            </ul>
          </div>

          {/* Smart Contracts */}
          <div className="bg-gradient-to-b from-stone-800/60 to-stone-900/60 backdrop-blur-sm p-6 rounded border border-stone-600/30 shadow-lg transform transition-transform hover:scale-[1.01]">
            <h3 className="text-yellow-400/80 text-lg font-bold mb-4 uppercase tracking-widest">
              Smart Contracts
            </h3>
            <ul className="space-y-3">
              <li className="flex items-center group">
                <div className="w-1.5 h-1.5 rounded-full bg-stone-600/50 mr-2 group-hover:bg-yellow-400 transition-colors"></div>
                <a
                  href={
                    "https://sepolia.basescan.org/address/0x0006A67Ca3F41885f42A42799406ea848c67f33f"
                  }
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-stone-200 text-sm hover:text-yellow-400 transition-colors flex items-center"
                >
                  Player Contract
                  <svg
                    className="w-4 h-4 ml-1 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all text-yellow-400"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M5 12H19M19 12L12 5M19 12L12 19"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </a>
              </li>
              <li className="flex items-center group">
                <div className="w-1.5 h-1.5 rounded-full bg-stone-600/50 mr-2 group-hover:bg-yellow-400 transition-colors" />
                <a
                  href={
                    "https://sepolia.basescan.org/address/0xB37c539d86e0C627f8AD13E4DddC201cf1d8ea0C"
                  }
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-stone-200 text-sm hover:text-yellow-400 transition-colors flex items-center"
                >
                  Game Engine Contract (v0.22)
                  <svg
                    className="w-4 h-4 ml-1 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all text-yellow-400"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M5 12H19M19 12L12 5M19 12L12 19"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </a>
              </li>
              <li className="flex items-center group">
                <div className="w-1.5 h-1.5 rounded-full bg-stone-600/50 mr-2 group-hover:bg-yellow-400 transition-colors" />
                <a
                  href={
                    "https://sepolia.basescan.org/address/0xe8CBD0015453addb322DD97994c89DC7C17B1afF"
                  }
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-stone-200 text-sm hover:text-yellow-400 transition-colors flex items-center"
                >
                  Practice Game Contract
                  <svg
                    className="w-4 h-4 ml-1 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all text-yellow-400"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M5 12H19M19 12L12 5M19 12L12 19"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </a>
              </li>
              <li className="flex items-center group">
                <div className="w-1.5 h-1.5 rounded-full bg-stone-600/50 mr-2 group-hover:bg-yellow-400 transition-colors" />
                <a
                  href={
                    "https://sepolia.basescan.org/address/0xD50f3Ac0E0AC9b1356301a153a777dF1A985E42e"
                  }
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-stone-200 text-sm hover:text-yellow-400 transition-colors flex items-center"
                >
                  Duel Game Contract
                  <svg
                    className="w-4 h-4 ml-1 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all text-yellow-400"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M5 12H19M19 12L12 5M19 12L12 19"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Social Links */}
        <div className="mt-8 pt-8 border-t border-stone-600/30">
          <div className="flex justify-center space-x-6">
            <a
              href="https://x.com/HeavyHelms"
              target="_blank"
              rel="noopener noreferrer"
              className="group"
              aria-label="Heavy Helms on X (formerly Twitter)"
            >
              <div className="bg-gradient-to-b from-stone-800/60 to-stone-900/60 backdrop-blur-sm p-3 rounded-full transform transition-all duration-200 hover:scale-110 border border-stone-600/30 shadow-lg">
                <svg
                  className="h-6 w-6 text-stone-400 group-hover:text-yellow-400 transition-colors"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <title>X (formerly Twitter)</title>
                  <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                </svg>
              </div>
            </a>
            <a
              href="https://shape.network/"
              target="_blank"
              rel="noopener noreferrer"
              className="group"
              aria-label="Shape Network"
            >
              <div className="bg-gradient-to-b from-stone-800/60 to-stone-900/60 backdrop-blur-sm p-3 rounded-full transform transition-all duration-200 hover:scale-110 border border-stone-600/30 shadow-lg">
                <svg
                  className="h-6 w-6 text-stone-400 group-hover:text-yellow-400 transition-colors"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <title>Shape Network</title>
                  <circle cx="12" cy="12" r="10" />
                </svg>
              </div>
            </a>
            <a
              href="https://github.com/warlock-forge/heavy-helms-contracts"
              target="_blank"
              rel="noopener noreferrer"
              className="group"
              aria-label="Heavy Helms Contracts on GitHub"
            >
              <div className="bg-gradient-to-b from-stone-800/60 to-stone-900/60 backdrop-blur-sm p-3 rounded-full transform transition-all duration-200 hover:scale-110 border border-stone-600/30 shadow-lg">
                <svg
                  className="h-6 w-6 text-stone-400 group-hover:text-yellow-400 transition-colors"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <title>GitHub</title>
                  <path
                    fillRule="evenodd"
                    d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
