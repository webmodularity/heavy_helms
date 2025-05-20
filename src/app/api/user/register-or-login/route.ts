import { NextResponse, type NextRequest } from "next/server";
import { PrivyClient } from "@privy-io/server-auth";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

// Environment Variables
const privyAppId = process.env.NEXT_PUBLIC_PRIVY_APP_ID;
const privyAppSecret = process.env.PRIVY_APP_SECRET;
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

type LinkedAccount = {
  type: "farcaster" | "wallet";
  fid?: number;
  address?: string;
  chainId?: string;
  ownerAddress?: string;
  latestVerifiedAt: string;
  username?: string;
  chainType?: "ethereum";
};

// biome-ignore lint/style/noNonNullAssertion: <explanation>
const privyClient = new PrivyClient(privyAppId!, privyAppSecret!);
console.log("MODULE LOAD: PrivyClient initialized successfully.");

let supabase: SupabaseClient | null = null;
// biome-ignore lint/style/noNonNullAssertion: <explanation>
supabase = createClient(supabaseUrl!, supabaseServiceRoleKey!);

export async function POST(request: NextRequest) {
  if (!privyClient) {
    console.error(
      "API ERROR: PrivyClient is not initialized. Check server start logs for 'MODULE LOAD' errors. Credentials missing or invalid at startup?",
    );
    return NextResponse.json(
      {
        message:
          "Server configuration error: Privy authentication service not available.",
      },
      { status: 500 },
    );
  }
  if (!supabase) {
    console.error(
      "API ERROR: Supabase client is not initialized. Check server start logs for 'MODULE LOAD' errors. Credentials missing or invalid at startup?",
    );
    return NextResponse.json(
      {
        message: "Server configuration error: Database service not available.",
      },
      { status: 500 },
    );
  }

  try {
    const authorizationHeader = request.headers.get("Authorization");
    if (!authorizationHeader || !authorizationHeader.startsWith("Bearer ")) {
      return NextResponse.json(
        { message: "Unauthorized: Missing or invalid token" },
        { status: 401 },
      );
    }
    const idToken = authorizationHeader.split("Bearer ")[1];

    if (!idToken) {
      return NextResponse.json(
        { message: "Unauthorized: Token not found" },
        { status: 401 },
      );
    }

    const privyUser = await privyClient.getUser({ idToken });

    if (!privyUser || !privyUser.id) {
      console.warn(
        "API WARN: Privy user not found or ID missing after token verification.",
      );
      return NextResponse.json(
        { message: "Invalid token or user not found via Privy" },
        { status: 401 },
      );
    }

    // const { fid: farcasterFid, username, displayName, pfp } = farcasterAccount;
    const privyDid = privyUser.id;

    const { data: userData, error: userError } = await supabase
      .from("users")
      .upsert(
        {
          privy_did: privyDid,
          // biome-ignore lint/style/noNonNullAssertion: <explanation>
          farcaster_fid: privyUser.farcaster?.fid!,
          // biome-ignore lint/style/noNonNullAssertion: <explanation>
          username: privyUser.farcaster?.username!,
          // biome-ignore lint/style/noNonNullAssertion: <explanation>
          display_name: privyUser.farcaster?.username!,
          pfp_url: null,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "privy_did", ignoreDuplicates: false },
      )
      .select()
      .single();

    if (userError) {
      console.error("API ERROR: Supabase user upsert error:", userError);
      throw new Error(`Supabase user upsert failed: ${userError.message}`);
    }

    const walletUpserts = (
      privyUser.linkedAccounts as unknown as LinkedAccount[]
    )
      .filter((acc) => !!acc.address)
      .map((acc) => {
        return {
          privy_did: privyDid,
          // biome-ignore lint/style/noNonNullAssertion: <explanation>
          address: acc.address!,
          chain_id: "8543",
          wallet_type: acc.type,
          is_primary: false, // Set is_primary based on the active wallet sent from frontend
          // Or use your existing logic for is_primary if it's different
        };
      });

    if (walletUpserts.length > 0) {
      const { error: walletError } = await supabase
        .from("user_wallets")
        .upsert(walletUpserts, {
          onConflict: "privy_did, address",
          ignoreDuplicates: false,
        });
      if (walletError) {
        console.error("API ERROR: Supabase wallet upsert error:", walletError);
        // Not throwing here, as user upsert might be more critical
      }
    }

    // If activeWalletAddressFromBody was provided but wasn't found in linkedAccounts,
    // you might want to add it separately or handle it.
    // For instance, if it's an EOA connected via a non-Privy client that Privy's server-auth might not list in linkedAccounts
    // but is known to the frontend via useWallets(). This scenario needs careful consideration.
    // For now, we only mark 'is_primary' if it's ALREADY in linkedAccounts.

    return NextResponse.json(
      {
        message: "User registered/logged in successfully",
        userId: userData?.privy_did,
        farcasterFid: userData?.farcaster_fid,
      },
      { status: 200 },
    );
    // biome-ignore lint/suspicious/noExplicitAny: <explanation>
  } catch (error: any) {
    return NextResponse.json(
      {
        message: error.message || "Internal Server Error",
        details: error.toString(),
      },
      { status: 500 },
    );
  }
}
