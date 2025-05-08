import { AxiosResponse } from "axios";
import { SensorData } from "../types/SensorData";
import { IStatusResponse } from "../types/Status";
  
import { useMutation } from "@tanstack/react-query";
import { useAxiosDash } from "./useAxiosDash";

export type DashData = {
  hasActiveSession: boolean,
  isDispensing: boolean,
  sensors: SensorData
}
 
 
export function useDashData() {
  const axiosInstance = useAxiosDash()

  /**
   * convert this to usemutation
   */
  return useMutation({
 
    mutationFn: async (): Promise<DashData | null> => {
      try {
        const response: AxiosResponse<IStatusResponse<DashData>> =
          await axiosInstance.get('/dash', {
 
          })
        return response.data.data
      } catch (error: any) {
        throw error;
      }
    },
  })
  
}