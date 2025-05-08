// /dash/tare
import { AxiosResponse } from "axios";
import { baseApi } from "./baseApi";

export const tareApi = async (): Promise<AxiosResponse<any>> =>
  baseApi.post("/dash/tare");
  