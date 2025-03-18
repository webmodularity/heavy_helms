import Link from "next/link";

export function Footer() {
  return (
    <footer className="relative mt-20">
      {/* Dark overlay with stone base - matching banner background */}
      <div className="absolute inset-0 bg-stone-900/75" />

      <div className="relative max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* About Section */}
          <div className="bg-gradient-to-b from-stone-800/60 to-stone-900/60 backdrop-blur-sm p-6 rounded border border-stone-600/30 shadow-lg transform transition-transform hover:scale-[1.01]">
            <h3 className="text-yellow-400/80 text-lg font-bold mb-4 uppercase tracking-widest">
              About Heavy Helms
            </h3>
            <p className="text-stone-200 text-sm leading-relaxed">
              Enter the arena where medieval combat meets strategic mastery.
              Battle with unique weapons, armor, and tactics in this
              revolutionary blockchain-powered combat game.
            </p>
          </div>

          {/* Quick Links */}
          <div className="bg-gradient-to-b from-stone-800/60 to-stone-900/60 backdrop-blur-sm p-6 rounded border border-stone-600/30 shadow-lg transform transition-transform hover:scale-[1.01]">
            <h3 className="text-yellow-400/80 text-lg font-bold mb-4 uppercase tracking-widest">
              Quick Links
            </h3>
            <ul className="space-y-3">
              <li className="flex items-center group">
                <div className="w-1.5 h-1.5 rounded-full bg-stone-600/50 mr-2 group-hover:bg-yellow-400 transition-colors"></div>
                <Link
                  href="https://shape.network"
                  className="text-stone-200 text-sm hover:text-yellow-400 transition-colors flex items-center"
                >
                  Powered by Shape Network
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
                </Link>
              </li>
              <li className="flex items-center group">
                <div className="w-1.5 h-1.5 rounded-full bg-stone-600/50 mr-2 group-hover:bg-yellow-400 transition-colors"></div>
                <Link
                  href="https://shape.network/shapecraft"
                  className="text-stone-200 text-sm hover:text-yellow-400 transition-colors flex items-center"
                >
                  Shapecraft Hackathon Top Prize Winner
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
                </Link>
              </li>
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
                    "https://shapescan.xyz/address/0x4F0753e86ED2B07B61E932B9760C6A165769a07b"
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
                <div className="w-1.5 h-1.5 rounded-full bg-stone-600/50 mr-2 group-hover:bg-yellow-400 transition-colors"></div>
                <a
                  href={
                    "https://shapescan.xyz/address/0xFDcbF9831e07DDA8d0E1fdAe4a14284eBefE2DD0"
                  }
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-stone-200 text-sm hover:text-yellow-400 transition-colors flex items-center"
                >
                  Game Engine Contract (v0.7)
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
                <div className="w-1.5 h-1.5 rounded-full bg-stone-600/50 mr-2 group-hover:bg-yellow-400 transition-colors"></div>
                <a
                  href={
                    "https://shapescan.xyz/address/0x0dAe7f50082450a272FB0F7bC32dC2508EB01B77"
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
                <div className="w-1.5 h-1.5 rounded-full bg-stone-600/50 mr-2 group-hover:bg-yellow-400 transition-colors"></div>
                <a
                  href={
                    "https://shapescan.xyz/address/0x204f58d254B57eBADeaff5B6E4a842781b69010F"
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
            >
              <div className="bg-gradient-to-b from-stone-800/60 to-stone-900/60 backdrop-blur-sm p-3 rounded-full transform transition-all duration-200 hover:scale-110 border border-stone-600/30 shadow-lg">
                <svg
                  className="h-6 w-6 text-stone-400 group-hover:text-yellow-400 transition-colors"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                </svg>
              </div>
            </a>
            <a
              href="https://discord.gg/5XHu76FmpJ"
              target="_blank"
              rel="noopener noreferrer"
              className="group"
            >
              <div className="bg-gradient-to-b from-stone-800/60 to-stone-900/60 backdrop-blur-sm p-3 rounded-full transform transition-all duration-200 hover:scale-110 border border-stone-600/30 shadow-lg">
                <svg
                  className="h-6 w-6 text-stone-400 group-hover:text-yellow-400 transition-colors"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M20.317 4.492c-1.53-.69-3.17-1.2-4.885-1.49a.075.075 0 00-.079.036c-.21.369-.444.85-.608 1.23a18.566 18.566 0 00-5.487 0 12.36 12.36 0 00-.617-1.23A.077.077 0 008.562 3c-1.714.29-3.354.8-4.885 1.491a.07.07 0 00-.032.027C.533 9.093-.32 13.555.099 17.961a.08.08 0 00.031.055 20.03 20.03 0 005.993 2.98.078.078 0 00.084-.026 13.83 13.83 0 001.226-1.963.074.074 0 00-.041-.104 13.175 13.175 0 01-1.872-.878.075.075 0 01-.008-.125c.126-.093.252-.19.372-.287a.075.075 0 01.078-.01c3.927 1.764 8.18 1.764 12.061 0a.075.075 0 01.079.009c.12.098.245.195.372.288a.075.075 0 01-.006.125c-.598.344-1.22.635-1.873.877a.075.075 0 00-.041.105c.36.687.772 1.341 1.225 1.962a.077.077 0 00.084.028 19.963 19.963 0 006.002-2.981.076.076 0 00.032-.054c.5-5.094-.838-9.52-3.549-13.442a.06.06 0 00-.031-.028zM8.02 15.278c-1.182 0-2.157-1.069-2.157-2.38 0-1.312.956-2.38 2.157-2.38 1.21 0 2.176 1.077 2.157 2.38 0 1.312-.956 2.38-2.157 2.38zm7.975 0c-1.183 0-2.157-1.069-2.157-2.38 0-1.312.955-2.38 2.157-2.38 1.21 0 2.176 1.077 2.157 2.38 0 1.312-.946 2.38-2.157 2.38z" />
                </svg>
              </div>
            </a>
            <a
              href="https://github.com/webmodularity/auto_battler_game_contracts"
              target="_blank"
              rel="noopener noreferrer"
              className="group"
            >
              <div className="bg-gradient-to-b from-stone-800/60 to-stone-900/60 backdrop-blur-sm p-3 rounded-full transform transition-all duration-200 hover:scale-110 border border-stone-600/30 shadow-lg">
                <svg
                  className="h-6 w-6 text-stone-400 group-hover:text-yellow-400 transition-colors"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
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
