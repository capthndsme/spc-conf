import { useMutation } from "@tanstack/react-query";
import { baseApi } from "./baseApi";

export function useUpdateToken() {
  const loc = `/tokens`
  return useMutation({
    mutationFn: async (arg: { token: string }) => {
      const res = await baseApi.post(loc, arg)
      return res.data
    },
    
  })
}