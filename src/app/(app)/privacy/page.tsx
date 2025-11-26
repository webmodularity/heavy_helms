import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy - Heavy Helms",
  description: "Privacy Policy for Heavy Helms game.",
};

export default function PrivacyPage() {
  return (
    <div className="space-y-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-yellow-500">
              Privacy Policy
            </h1>
            <p className="text-sm text-yellow-300 mt-1">
              Last Updated: June 17, 2025
            </p>
          </div>
        </div>
      </div>

      <div className="relative mt-8">
        <div className="absolute inset-0 bg-stone-900/60" />
        <div className="absolute inset-0 shadow-[inset_0_0_100px_rgba(30,20,10,0.6)]" />
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-700/30 via-yellow-500/50 to-amber-700/30" />
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-700/30 via-yellow-500/50 to-amber-700/30" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-12">
          <div className="prose prose-invert max-w-none">
            <p>
              Heavy Helms ("we," "our," or "us") is committed to protecting your
              privacy. This Privacy Policy explains what information we collect,
              how we use it, and your rights regarding your data.
            </p>

            <h2 className="text-2xl font-bold text-yellow-400 tracking-wide mt-8 mb-4">
              1. Information We Collect
            </h2>
            <ul className="list-disc pl-6 space-y-2">
              <li>
                <span className="font-semibold text-yellow-300">
                  Wallet Address:
                </span>{" "}
                When you connect to the game or interact with smart contracts,
                we may collect your public blockchain wallet address.
              </li>
              <li>
                <span className="font-semibold text-yellow-300">
                  Usage Data:
                </span>{" "}
                We may collect non-personal information such as device/browser
                type, interactions, and in-game activity for analytics and to
                improve the game.
              </li>
              <li>
                <span className="font-semibold text-yellow-300">
                  No Personal Identification:
                </span>{" "}
                We do not require or collect personal information such as your
                real name, address, or email for normal gameplay.
              </li>
            </ul>

            <h2 className="text-2xl font-bold text-yellow-400 tracking-wide mt-8 mb-4">
              2. How We Use Your Information
            </h2>
            <ul className="list-disc pl-6 space-y-2">
              <li>
                To operate, maintain, and improve the game and its features.
              </li>
              <li>
                To analyze gameplay and user trends (for balancing, updates,
                etc.).
              </li>
              <li>
                To respond to support requests or feedback (if you contact us
                directly).
              </li>
            </ul>

            <h2 className="text-2xl font-bold text-yellow-400 tracking-wide mt-8 mb-4">
              3. How We Share Your Information
            </h2>
            <ul className="list-disc pl-6 space-y-2">
              <li>
                <span className="font-semibold text-yellow-300">
                  We do <span className="uppercase">not</span> sell or rent your
                  information to third parties.
                </span>
              </li>
              <li>
                We may share information with service providers (e.g.,
                analytics, hosting) only as needed to operate the game.
              </li>
            </ul>

            <h2 className="text-2xl font-bold text-yellow-400 tracking-wide mt-8 mb-4">
              4. Children's Privacy
            </h2>
            <ul className="list-disc pl-6 space-y-2">
              <li>
                <span className="font-semibold text-yellow-300">
                  Heavy Helms is not intended for children under the age of 13.
                </span>
              </li>
              <li>
                We do not knowingly collect or solicit personal information from
                anyone under 13.
              </li>
              <li>
                If you are under 13, please do not use the game or send any
                information about yourself to us.
              </li>
              <li>
                If we learn we have collected personal information from a child
                under 13, we will delete that information as quickly as
                possible.
              </li>
            </ul>

            <h2 className="text-2xl font-bold text-yellow-400 tracking-wide mt-8 mb-4">
              5. Data Security
            </h2>
            <p>
              We use reasonable measures to protect your information, but cannot
              guarantee absolute security of blockchain or internet data.
            </p>

            <h2 className="text-2xl font-bold text-yellow-400 tracking-wide mt-8 mb-4">
              6. Your Rights and Choices
            </h2>
            <ul className="list-disc pl-6 space-y-2">
              <li>You may disconnect your wallet at any time.</li>
              <li>
                If you have questions or requests about your data, contact us at{" "}
                <span className="text-yellow-300 font-semibold">
                  heavyhelms@warlockforge.xyz
                </span>
                .
              </li>
            </ul>

            <h2 className="text-2xl font-bold text-yellow-400 tracking-wide mt-8 mb-4">
              7. Changes to This Policy
            </h2>
            <p>
              We may update this Privacy Policy from time to time. Changes will
              be posted on this page with an updated date.
            </p>

            <h2 className="text-2xl font-bold text-yellow-400 tracking-wide mt-8 mb-4">
              8. Contact Us
            </h2>
            <p>
              If you have any questions about this Privacy Policy, please
              contact us at{" "}
              <span className="text-yellow-300 font-semibold">
                heavyhelms@warlockforge.xyz
              </span>
              .
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
