"use client";

import { usePrivy } from "@privy-io/react-auth";
import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import type { Follower } from "@neynar/nodejs-sdk/build/api";

interface FarcasterData {
  currentUserFid: number | null;
  following: Follower[];
  isLoadingFollowing: boolean;
  followingError: Error | null;
  followingFids: Set<number>;
  isFollowing: (fid: number) => boolean;
}

export function useFarcasterData(): FarcasterData {
  const { user: privyUser, authenticated } = usePrivy();

  // Extract current user's FID
  const currentUserFid = useMemo(() => {
    if (!authenticated || !privyUser?.farcaster?.fid) {
      return null;
    }
    return privyUser.farcaster.fid;
  }, [authenticated, privyUser]);

  // Fetch following data
  const {
    data: followingData,
    isLoading: isLoadingFollowing,
    error: followingError,
  } = useQuery({
    queryKey: ['farcaster-following', currentUserFid],
    queryFn: async () => {
      if (!currentUserFid) {
        throw new Error('No current user FID available');
      }

      const response = await fetch(`/api/following?fid=${currentUserFid}`);
      if (!response.ok) {
        throw new Error(`Failed to fetch following: ${response.statusText}`);
      }

      const result = await response.json();
      if (!result.success) {
        throw new Error(result.error || 'Failed to fetch following');
      }

      return result.data.following as Follower[];
    },
    enabled: !!currentUserFid,
    staleTime: 1000 * 60 * 30, // 30 minutes
    gcTime: 1000 * 60 * 60, // 1 hour
    retry: (failureCount, error) => {
      // Don't retry on 404 (user not found) or 401 (unauthorized)
      if (error instanceof Error) {
        if (error.message.includes('404') || error.message.includes('401')) {
          return false;
        }
      }
      return failureCount < 3;
    },
  });

  // Create a Set of following FIDs for fast lookup
  const followingFids = useMemo(() => {
    if (!followingData) return new Set<number>();
    return new Set(followingData.map(follower => follower.user.fid));
  }, [followingData]);

  // Helper function to check if a user is followed
  const isFollowing = useMemo(() => {
    return (fid: number) => followingFids.has(fid);
  }, [followingFids]);

  return {
    currentUserFid,
    following: followingData || [],
    isLoadingFollowing,
    followingError: followingError as Error | null,
    followingFids,
    isFollowing,
  };
} 