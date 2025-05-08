import { useMutation } from "@tanstack/react-query";
import { useAxiosWithAuth } from "./useAxiosWithAuth";
import Slot from "../types/Slot";
import { IStatusResponse } from "../types/Status";

export function useUpdateSlot() {
  const axiosInstance = useAxiosWithAuth()

  const path = "/slots/update"

  return useMutation({
    mutationFn: async (slot: Partial<Slot>) => {
      const response = await axiosInstance.post<IStatusResponse<Slot>>(path, slot)
      return response.data.data
    },
  })
  
}