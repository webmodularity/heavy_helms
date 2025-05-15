import "server-only";

import { supabaseClient } from "@/config";

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
      throw error;
    }
    return data;
  }
}

export const usersService = UsersService.getInstance();
