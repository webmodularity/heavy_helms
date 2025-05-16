// import "server-only";

import { supabaseClient } from "@/config";
import type { Database } from "@/types/supabase.types";

export type UserWithAddresses = Database["public"]["Tables"]["users"]["Row"] & {
  addresses: string[];
};

class UsersService {
  private static instance: UsersService;

  public static getInstance(): UsersService {
    if (!UsersService.instance) {
      UsersService.instance = new UsersService();
    }
    return UsersService.instance;
  }

  async getUsers() {
    const { data, error } = await supabaseClient.from("users").select("*");
    if (error) {
      console.error("Error fetching users", error);
      throw error;
    }
    return data;
  }

  async getAddressToUserMap(targetAddress?: string) {
    let query = supabaseClient.from("user_wallets").select("*, users(*)");
    console.log("targetAddress", targetAddress);
    if (targetAddress) {
      query = query.eq("address", targetAddress); // Filter by address in the database query
    }
    const { data: walletData, error: walletError } = await query;
    console.log("walletData", walletData);
    if (walletError) {
      console.error("Error fetching users with addresses", walletError);
      throw walletError;
    }
    // If a targetAddress was provided and no data was found,
    // you might want to return null or an empty object early.
    if (targetAddress && (!walletData || walletData.length === 0)) {
      return null; // Or {}
    }

    const addressToUserMap = walletData.reduce(
      (acc, userWallet) => {
        // Ensure userWallet.users is not null. If it can be null based on your DB schema, handle that.
        if (userWallet.users) {
          acc[userWallet.address] = {
            ...userWallet.users,
            addresses: [
              ...(acc[userWallet.address]?.addresses || []),
              userWallet.address,
            ],
          };
        }
        return acc;
      },
      {} as Record<string, UserWithAddresses>,
    );
    return addressToUserMap;
    // If a targetAddress was specified, return only that entry
    // if (targetAddress) {
    //   return addressToUserMap[targetAddress] || null;
    // }

    // return addressToUserMap;
  }
}

export const usersService = UsersService.getInstance();
