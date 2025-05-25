'server-only';
import { NeynarAPIClient, Configuration } from "@neynar/nodejs-sdk";
import type { Follower } from "@neynar/nodejs-sdk/build/api";

const config = new Configuration({
  apiKey: process.env.NEYNAR_API_KEY || "",
});

// make sure to set your NEYNAR_API_KEY .env
// for testing purposes, you can insert your key as a string param into NeynarAPIClient
const client = new NeynarAPIClient(config);

class FarcasterService {
  private static instance: FarcasterService;

  public static getInstance(): FarcasterService {
    if (!FarcasterService.instance) {
      FarcasterService.instance = new FarcasterService();
    }
    return FarcasterService.instance;
  }

  async getUserFollowing(fid: number) {
    const response = await client.fetchUserFollowing({ fid, sortType: "algorithmic" });
    let cursor = response.next.cursor;
    const following: Follower[] = response.users;
    while (cursor) {
      const nextResponse = await client.fetchUserFollowing({ fid, sortType: "algorithmic", cursor });
      cursor = nextResponse.next.cursor;
      following.push(...nextResponse.users);
    }
    return following;
  }
}

export const farcasterService = FarcasterService.getInstance();