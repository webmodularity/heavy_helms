import { useQuery } from "@tanstack/react-query";
import { usersService } from "@/services/users";

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
