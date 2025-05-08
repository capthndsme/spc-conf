import { useQuery } from "@tanstack/react-query";
import { useAxiosWithAuth } from "./useAxiosWithAuth";
 
import { IStatusResponse } from "../types/Status";
import { Log } from "../types/Log";
 

export function useGetLog() {
  const axiosInstance = useAxiosWithAuth()

  return useQuery({
    queryKey: ['logs'],
    queryFn: async () => {
      const response = await axiosInstance.get<IStatusResponse<Log[]>>(`/logs`)
      return response.data.data
    },
  })
}