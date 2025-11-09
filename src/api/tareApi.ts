// /dash/tare
import { AxiosResponse } from "axios";
import { baseApi } from "./baseApi";

export const tareApi = async (sensorId: string | number = 'ALL'): Promise<AxiosResponse<any>> =>
  baseApi.post(`/dash/tare?id=${sensorId}`);
  