import { useMutation } from "@tanstack/react-query"
import { useAxiosDash } from "./useAxiosDash"


export const useDashPing = () => {
  const api = useAxiosDash(1000, '')
  return useMutation({
    mutationFn: async () => {
      //throw on error
      const data = await api.get('/ping')
      if (data.status !== 200) {
        throw new Error('Ping failed')
      }
      return data
      
    },
  })
}