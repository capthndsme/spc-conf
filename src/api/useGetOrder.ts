
// src/api/useGetOrder.ts
import { useQuery, UseQueryOptions } from "@tanstack/react-query"; // Import UseQueryOptions
import { useAxiosWithAuth } from "./useAxiosWithAuth";
import { IStatusResponse } from "../types/Status";
import Order from "../types/Order";

// Accept query options as the second argument
export function useGetOrder(id: string, options?: Omit<UseQueryOptions<Order, Error>, 'queryKey' | 'queryFn'>) { // Use Omit for type safety
  const axiosInstance = useAxiosWithAuth();

  return useQuery<Order, Error>({ // Specify QueryData and Error types
    queryKey: ['order', id],
    queryFn: async () => {
      // Only fetch if id is not an empty string (or handle appropriately)
      if (!id) {
        throw new Error("Order ID cannot be empty for fetching.");
        // Or return null/undefined if your component logic handles that
      }
      const response = await axiosInstance.get<IStatusResponse<Order>>(`/orders/${id}`);
      // Add validation or check response.data.data existence if needed
      if (!response.data.data) {
          throw new Error("Order data not found in response.");
      }
      return response.data.data;
    },
    ...options, // Spread the options here (this includes 'enabled')
  });
}