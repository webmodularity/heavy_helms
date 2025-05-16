import { useQuery } from "@tanstack/react-query";
import { usersService } from "@/services/users";
import { getAddress } from "viem";

export const useSupabasePlayers = () => {
  const { data, isLoading, error } = useQuery({
    queryKey: ["supabase-players"],
    queryFn: async () => {
      const users = await usersService.getUsers();
      return users;
    },
  });

  return { data, isLoading, error };
};

export const useSupabaseAddressToUserMap = () => {
  const { data, isLoading, error } = useQuery({
    queryKey: ["supabase-address-to-user-map"],
    queryFn: async () => {
      const addressToUserMap = await usersService.getAddressToUserMap();
      return addressToUserMap;
    },
  });

  return { data, isLoading, error };
};

export const useSupabaseSingleAddressToUserMap = (address: string) => {
  const _address = getAddress(address);
  const { data, isLoading, error } = useQuery({
    queryKey: ["supabase-address-to-user-map", _address],
    queryFn: async () => {
      console.log("will be executing query");
      const addressToUserMap = await usersService.getAddressToUserMap(_address);
      return addressToUserMap?.[_address];
    },
  });

  return { data, isLoading, error };
};
