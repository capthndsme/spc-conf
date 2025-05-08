

import { useMutation } from '@tanstack/react-query'
import { useAxiosDash } from './useAxiosDash';
 
 

interface OrderIdParams {
 
  orderId: string;
}

export const useDropMoney = () => {
  const api = useAxiosDash()
   
  return useMutation({
    mutationFn: async (params: OrderIdParams) => {
      const { data } = await api.post('/orders/drop', params);
      return data;
    },
  });
  
};


