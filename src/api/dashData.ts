import { AxiosResponse } from "axios";
import { SensorData } from "../types/SensorData";
import { IStatusResponse } from "../types/Status";
 
import { useAxiosWithAuth } from "./useAxiosWithAuth";
import { useQuery } from "@tanstack/react-query";

export type DashData = {
  hasActiveSession: boolean,
  isDispensing: boolean,
  sensors: SensorData
}
 
 
export function useDashData(optUserId?: string | null) {
  const axiosInstance = useAxiosWithAuth()

  return useQuery({
    queryKey: ['dash-data'],
    queryFn: async (): Promise<DashData | null> => {
      try {
        const response: AxiosResponse<IStatusResponse<DashData>> =
          await axiosInstance.get('/dash', {
            params: {
              user: optUserId
            }
          })
        return response.data.data
      } catch (error: any) {
        throw error;
      }
    },
  })
}