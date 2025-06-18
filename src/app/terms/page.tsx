import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Terms of Service - Heavy Helms",
  description: "Terms of Service for Heavy Helms game.",
};

export default function TermsPage() {
  return (
    <div className="space-y-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-yellow-500">
              Terms of Service
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
              Welcome to Heavy Helms ("the Game," "we," "our," or "us"). By
              using or accessing Heavy Helms, you agree to the following terms:
            </p>

            <h2 className="text-2xl font-bold text-yellow-400 tracking-wide mt-8 mb-4">
              1. Eligibility
            </h2>
            <ul className="list-disc pl-6 space-y-2">
              <li>
                You must be at least 13 years old to use Heavy Helms. By using
                the Game, you represent that you are at least 13 years old.
              </li>
              <li>
                You are responsible for ensuring that your access to and use of
                Heavy Helms is permitted and legal in your jurisdiction. By
                using the Game, you confirm that you are not prohibited from
                participating by any applicable laws or regulations in your
                country, state, or locality.
              </li>
              <li>
                We reserve the right to update or change the minimum age
                requirement at any time, for any reason (including changes in
                law, platform requirements, or the addition of new features).
              </li>
            </ul>

            <h2 className="text-2xl font-bold text-yellow-400 tracking-wide mt-8 mb-4">
              2. Fees and Payments
            </h2>
            <ul className="list-disc pl-6 space-y-2">
              <li>
                Some features of the Game require payment of blockchain/network
                service fees (such as gas, VRF, and storage costs).
              </li>
              <li>
                All service fees are non-refundable and are{" "}
                <span className="font-semibold text-yellow-300">not</span> entry
                fees for contests or wagers. These fees are solely to cover
                backend costs and are not used for prize pools or distributed as
                prizes.
              </li>
              <li>
                Creating a new player may require a one-time fee, which is also
                non-refundable.
              </li>
            </ul>

            <h2 className="text-2xl font-bold text-yellow-400 tracking-wide mt-8 mb-4">
              3. Game Play, Prizes, and NFTs
            </h2>
            <ul className="list-disc pl-6 space-y-2">
              <li>
                Paid game actions (such as duels and gauntlets) do{" "}
                <span className="font-semibold text-yellow-300">not</span> award
                tradeable prizes, cash, or cryptocurrency.
              </li>
              <li>
                Prizes, such as tradeable NFTs or collectibles, are only awarded
                in free-entry tournaments or game modes where no entry fee is
                charged.
              </li>
              <li>
                Leaderboard status or win count is for recognition only and does
                not entitle you to any monetary or tradeable reward.
              </li>
              <li>
                NFTs awarded as prizes are digital collectibles. If a player
                chooses to sell or trade an NFT on a third-party marketplace
                (such as OpenSea), they are solely responsible for complying
                with the terms and age requirements of that platform. Heavy
                Helms is not responsible for third-party marketplace activity.
              </li>
            </ul>

            <h2 className="text-2xl font-bold text-yellow-400 tracking-wide mt-8 mb-4">
              4. User Conduct
            </h2>
            <ul className="list-disc pl-6 space-y-2">
              <li>
                You agree not to use the Game for any unlawful purpose or to
                attempt to exploit the system.
              </li>
              <li>
                You are responsible for your wallet and private keys. We cannot
                recover lost accounts or assets.
              </li>
            </ul>

            <h2 className="text-2xl font-bold text-yellow-400 tracking-wide mt-8 mb-4">
              5. Updates and Availability
            </h2>
            <ul className="list-disc pl-6 space-y-2">
              <li>
                The Game, its features, or rules may be updated, modified, or
                discontinued at any time, without notice.
              </li>
            </ul>

            <h2 className="text-2xl font-bold text-yellow-400 tracking-wide mt-8 mb-4">
              6. No Warranty
            </h2>
            <p>
              Heavy Helms is provided "as is" and "as available" without any
              warranties or guarantees of any kind. Use at your own risk.
            </p>

            <h2 className="text-2xl font-bold text-yellow-400 tracking-wide mt-8 mb-4">
              7. Limitation of Liability
            </h2>
            <p>
              To the fullest extent allowed by law, Heavy Helms, its creators,
              and affiliates are not liable for any damages or losses arising
              from your use of the Game.
            </p>

            <h2 className="text-2xl font-bold text-yellow-400 tracking-wide mt-8 mb-4">
              8. Privacy
            </h2>
            <p>
              See our{" "}
              <Link
                href="/privacy"
                className="text-yellow-300 hover:text-yellow-400 underline"
              >
                Privacy Policy
              </Link>{" "}
              for information on how we handle your data.
            </p>

            <h2 className="text-2xl font-bold text-yellow-400 tracking-wide mt-8 mb-4">
              9. Changes to These Terms
            </h2>
            <p>
              We may update these Terms of Service from time to time. Changes
              will be posted on this page with an updated date.
            </p>

            <h2 className="text-2xl font-bold text-yellow-400 tracking-wide mt-8 mb-4">
              10. Contact
            </h2>
            <p>
              If you have any questions about these terms, please contact us at{" "}
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
