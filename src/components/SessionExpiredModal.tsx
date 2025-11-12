import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { Button } from "./ui/button";
import { useAuth } from "../context/AuthContext";

export const SessionExpiredModal = () => {
   const [sessionExpired, setSessionExpired] = useState(false);
   const navigate = useNavigate();
   const { logout } = useAuth();

   useEffect(() => {
      const onExpire = () => {
         setSessionExpired(true);
         // Automatically clear auth state when session expires
         logout();
      };
      
      window.addEventListener('session-expired', onExpire as EventListener);
      return () => window.removeEventListener('session-expired', onExpire as EventListener);
   }, [logout]);

   if (!sessionExpired) return null;

   const handleGoToLogin = () => {
      setSessionExpired(false);
      navigate('/auth/login', { replace: true });
   };

   return (
      <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center backdrop-blur-sm">
         <div className="bg-white text-black rounded-lg shadow-xl w-full max-w-md p-6 animate-in fade-in zoom-in duration-200">
            <div className="text-xl font-semibold mb-2">Session Expired</div>
            <div className="text-sm text-gray-700 mb-4">
               Your session has expired. Please log in again to continue.
            </div>
            <div className="flex justify-end">
               <Button onClick={handleGoToLogin} className="w-full sm:w-auto">
                  Go to Login
               </Button>
            </div>
         </div>
      </div>
   );
};

