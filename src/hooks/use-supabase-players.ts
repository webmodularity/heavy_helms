import { useQuery } from "@tanstack/react-query";
import { usersService } from "@/services/users";
import { getAddress } from "viem";

// Use a consistent query key structure with arrays
const userKeys = {
  all: ["users"] as const,
  addressMap: () => [...userKeys.all, "address-map"] as const,
  addressRecord: (address: string) =>
    [...userKeys.addressMap(), address] as const,
};

export function useSupabaseAddressToUserMap() {
  return useQuery({
    queryKey: userKeys.addressMap(),
    queryFn: async () => {
      const addressToUserMap = await usersService.getAddressToUserMap();
      return addressToUserMap;
    },
    staleTime: 5 * 60 * 1000, // Data stays fresh for 5 minutes
  });
}

export function useSupabaseSingleAddressToUserMap(address: string) {
  const normalizedAddress = address ? getAddress(address) : null;
  const addressMapQuery = useSupabaseAddressToUserMap();

  return useQuery({
    queryKey: userKeys.addressRecord(normalizedAddress as string),
    queryFn: async () => {
      // Only fetch individually if we don't already have the data
      // biome-ignore lint/style/noNonNullAssertion: <explanation>
      if (addressMapQuery.data && normalizedAddress! in addressMapQuery.data) {
        return addressMapQuery.data[normalizedAddress as string];
      }
      const addressToUserMap = await usersService.getAddressToUserMap(
        normalizedAddress as string,
      );
      return addressToUserMap?.[normalizedAddress as string];
    },
    enabled: !!normalizedAddress,
    staleTime: 5 * 60 * 1000,
  });
}
