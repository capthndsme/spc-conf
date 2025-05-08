import { useMutation } from "@tanstack/react-query";
import { useAxiosDash } from "./useAxiosDash";
import { IStatusResponse } from "../types/Status";

const path = '/orders/validate';
// a simple post request
 

interface VerifyOtpProps {
  orderId: string;
  otp: string;
}

const useVerifyOtp = () => {
  const api = useAxiosDash()
  return useMutation({
    mutationFn: async ({ orderId, otp }: VerifyOtpProps) => {
      const res = await api.post<IStatusResponse<boolean>>(path, { orderId, otp });
      return res.data;
    },
  });
};

export default useVerifyOtp;

