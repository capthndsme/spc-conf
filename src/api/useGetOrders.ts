import { useQuery } from "@tanstack/react-query";
import { useAxiosWithAuth } from "./useAxiosWithAuth";
 
import { IStatusResponse } from "../types/Status";
import Order from "../types/Order";

export function useGetOrders() {
  const axiosInstance = useAxiosWithAuth()

  return useQuery({
    queryKey: ['orders'],
    queryFn: async () => {
      const response = await axiosInstance.get<IStatusResponse<Order[]>>(`/orders`)
      return response.data.data
    },
  })
}