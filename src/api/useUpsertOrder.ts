import { useMutation } from "@tanstack/react-query";
import { useAxiosWithAuth } from "./useAxiosWithAuth";
import Order from "../types/Order";
import { IStatusResponse } from "../types/Status";

export function useUpsertOrder() {
  const axiosInstance = useAxiosWithAuth()

  const path = "/orders/upsert"

  return useMutation({
    
    mutationFn: async (order: Partial<Order>) => {
      const response = await axiosInstance.post<IStatusResponse<Order>>(path, {orderInfo: order, bindToSlot: order.slotId})
      return response.data.data
    }
  })

}