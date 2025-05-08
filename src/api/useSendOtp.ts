/**
 * AdonisJS definition:
  async sendOTP({ request }: HttpContext) {
    const { number, orderId } = request.body();
    const data = await OrderingService.changeNumberAndSendOTP(number, orderId);
    return StatusResponse(data, Status.GENERIC_SUCCESS, false);
    
  }
  We should convert it to a useMutation hook
  */


import { useMutation } from '@tanstack/react-query'
import { useAxiosDash } from './useAxiosDash';
 
 

interface SendOtpParams {
  number: string;
  orderId: string;
}

export const useSendOtp = () => {
  const api = useAxiosDash()
   
  return useMutation({
    mutationFn: async (params: SendOtpParams) => {
      const { data } = await api.post('/orders/otp', params);
      return data;
    },
  });
  
};


