

import { useMutation } from '@tanstack/react-query'
import { useAxiosDash } from './useAxiosDash';
 
 

interface OrderIdParams {
 
  orderId: string;
  initialWeight: string | null;
  finalWeight: string | null;
}

export const useFinishOrder = () => {
  const api = useAxiosDash()
   
  return useMutation({
    mutationFn: async (params: OrderIdParams) => {
      const { data } = await api.post('/orders/finish', params);
      return data;
    },
  });
  
};


