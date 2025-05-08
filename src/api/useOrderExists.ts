import { useMutation } from "@tanstack/react-query";
import { useAxiosDash } from "./useAxiosDash";
import Order from "../types/Order";
import { IStatusResponse } from "../types/Status";

 

export const useOrderExists = () => {
  const api = useAxiosDash()
  /**
   * Mutation-based GET ORDER
   * (if it exists)
   */
  return useMutation ({
    mutationFn: async (orderId: string) => {
      console.log(orderId)
      const response = await api.get<IStatusResponse<Order>>(`/orders/${orderId}`);
      return response.data.data;
    },
 
  })
};
