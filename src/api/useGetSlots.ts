import { useQuery } from "@tanstack/react-query";
import { useAxiosWithAuth } from "./useAxiosWithAuth";
import Slot from "../types/Slot";
import { IStatusResponse } from "../types/Status";

export function useGetSlots() {
  const axiosInstance = useAxiosWithAuth()

  return useQuery({
    queryKey: ['slots'],
    queryFn: async () => {
      const response = await axiosInstance.get<IStatusResponse<Slot[]>>('/slots')
      return response.data.data
    },
  })
}