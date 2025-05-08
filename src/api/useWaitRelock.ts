import { useMutation } from "@tanstack/react-query"
import { useAxiosDash } from "./useAxiosDash"
import { IStatusResponse } from "../types/Status"

const t = `/wait-relock`



function useWaitRelock() {
  const api = useAxiosDash()
  return useMutation({
    mutationFn: async () => {
      const { data } = await api.post<IStatusResponse<boolean>>(t);
      return data
    },
    
  })
}

export { useWaitRelock }