

export type AvailableSlots = {

  slotId: number
  isOccupied: boolean
  orderId: number
  /**
   * These are in cm
   */
  length: number
  width: number
  height: number
}

import { useQuery } from "@tanstack/react-query";

import { IStatusResponse } from "../types/Status";
import { useAxiosDash } from "./useAxiosDash"

export function useGetAvailableSlots() {
  const axiosInstance = useAxiosDash()

  return useQuery({
    queryKey: ['availableSlots'],
    queryFn: async () => {
      const response = await axiosInstance.get<IStatusResponse<AvailableSlots[]>>('/dropper-slots')
      return response.data.data
    },
  })
}