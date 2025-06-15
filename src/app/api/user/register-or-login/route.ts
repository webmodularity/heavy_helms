import { NextResponse, type NextRequest } from "next/server";
import { PrivyClient } from "@privy-io/server-auth";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

// Environment Variables
const privyAppId = process.env.NEXT_PUBLIC_PRIVY_APP_ID;
const privyAppSecret = process.env.PRIVY_APP_SECRET;
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Add new type for auth addresses
type LinkedAccount = {
  type: "farcaster" | "wallet";
  fid?: number;
  address?: string;
  chainId?: string;
  ownerAddress?: string;
  latestVerifiedAt: string;
  username?: string;
  chainType?: "ethereum";
  // Auth addresses will be included in the linkedAccounts array
  // with type: "wallet" and additional metadata from Farcaster
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
    console.log("privyUser from backend", privyUser);

    if (!privyUser) {
      console.warn(
        "API WARN: Privy user not found or ID missing after token verification.",
      );
      return NextResponse.json(
        { message: "Invalid token or user not found via Privy" },
        { status: 401 },
      );
    }

    const privyDid = privyUser.id;

    // First, check if user exists and get current data
    const { data: existingUser } = await supabase
      .from("users")
      .select(`
        *,
        user_wallets (*)
      `)
      .eq("privy_did", privyDid)
      .single();

    const needsUpdate = !existingUser || 
      existingUser.farcaster_fid !== privyUser.farcaster?.fid ||
      existingUser.username !== privyUser.farcaster?.username;

    console.log("needsUpdate", needsUpdate);

    // Only upsert if needed
    if (needsUpdate) {
      const { data: userData, error: userError } = await supabase
        .from("users")
        .upsert(
          {
            privy_did: privyUser.id,
            farcaster_fid: privyUser.farcaster?.fid,
            username: privyUser.farcaster?.username,
            display_name: privyUser.farcaster?.username,
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
    }

    // Compare existing wallets with new ones
    const existingWallets = existingUser?.user_wallets || [];
    const newWallets = (privyUser.linkedAccounts as unknown as LinkedAccount[])
      .filter((acc) => !!acc.address)
      .map((acc) => ({
        privy_did: privyUser.id,
        // biome-ignore lint/style/noNonNullAssertion: <explanation>
        address: acc.address!,
        chain_id: acc.chainId || "8543",
        wallet_type: acc.type,
        is_primary: false,
        is_auth_address: acc.type === "wallet" && acc.ownerAddress === acc.address,
        verified_at: new Date().toISOString(),
      }));

    // Only upsert if wallets have changed
    const walletsChanged = JSON.stringify(existingWallets) !== JSON.stringify(newWallets);
    
    if (walletsChanged && newWallets.length > 0) {
      const { error: walletError } = await supabase
        .from("user_wallets")
        .upsert(newWallets, {
          onConflict: "privy_did, address",
          ignoreDuplicates: false,
        });
      
      if (walletError) {
        console.error("API ERROR: Supabase wallet upsert error:", walletError);
      }
    }

    return NextResponse.json(
      {
        message: "User registered/logged in successfully",
        userId: existingUser?.privy_did || privyUser.id,
        farcasterFid: existingUser?.farcaster_fid || privyUser.farcaster?.fid,
        updated: needsUpdate || walletsChanged,
      },
      { status: 200 },
    );
  // biome-ignore lint/suspicious/noExplicitAny: <explanation>
  } catch (error: any) {
    console.error("API ERROR:", error);
    return NextResponse.json(
      {
        message: error.message || "Internal Server Error",
        details: error.toString(),
      },
      { status: 500 },
    );
  }
}
