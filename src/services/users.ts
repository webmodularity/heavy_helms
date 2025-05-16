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
    console.log("data", data);
    return data;
  }

  async getAddressToUserMap() {
    const { data: walletData, error: walletError } = await supabaseClient
      .from("user_wallets")
      .select("*, users(*)")
      // .eq("users.id", "user_wallets.user_id");
    if (walletError) {
      console.error("Error fetching users with addresses", walletError);
      throw walletError;
    }
    const addressToUserMap = walletData.reduce((acc, user) => {
      acc[user.address] = {
        ...user.users,
        addresses: [...(acc[user.address]?.addresses || []), user.address],
      };
      return acc;
    }, {} as Record<string, UserWithAddresses>);
    return addressToUserMap;
  }
}

export const usersService = UsersService.getInstance();
