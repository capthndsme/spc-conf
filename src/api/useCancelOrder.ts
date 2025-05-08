

import { useMutation } from '@tanstack/react-query'
import { useAxiosDash } from './useAxiosDash';
 
 

interface OrderIdParams {
 
  orderId: string;
}

export const useCancelOrder = () => {
  const api = useAxiosDash()
   
  return useMutation({
    mutationFn: async (params: OrderIdParams) => {
      const { data } = await api.post('/orders/cancel', params);
      return data;
    },
  });
  
};


