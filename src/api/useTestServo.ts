import { useMutation } from "@tanstack/react-query"
import { useAxiosWithAuth } from "./useAxiosWithAuth"

/**
 * useMutation
 */
const path = (id: string) => `/servo/${id}`

 
 
export const useTestServo = () => {
  const api = useAxiosWithAuth();
  return useMutation({
    mutationFn: async (id: string) => {
      const { data } = await api.post(path(id))
      return data
    },
    
  })
}
