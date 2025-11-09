
import { BrowserRouter, Routes, Route } from "react-router";
import "./App.css";

import ProtectedRoute from "./components/ProtectedRoute";
import { AuthProvider } from "./context/AuthContext";
import { Login } from "./screens/Login";
import { Toaster } from "./components/ui/sonner";
import Home from "./screens/Home";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import EditSlot from "./screens/EditSlot";
import UpsertOrder from "./screens/UpsertOrder";
import { Button } from "./components/ui/button";
import { useEffect, useState } from "react";

import DashWrap from "./components/DashWrap";
import MainScreen from "./screens/PiScreen";
import OTPPhase from "./screens/OTPPhase";
import EnterParcel from "./screens/EnterParcel";
import { ThankYou } from "./screens/ThankYou";
import MoneyDrop from "./screens/MoneyDrop";
import SlotSelectPhase from "./screens/SlotSelectPhase";
import CCTVView from "./screens/CCTVView";


const queryClient = new QueryClient({
   defaultOptions: {
      queries: {
         refetchOnWindowFocus: false,
      },
   },
});


function App() {

   const [sessionExpired, setSessionExpired] = useState(false);
   useEffect(() => {
      const onExpire = () => setSessionExpired(true);
      window.addEventListener('session-expired', onExpire as EventListener);
      return () => window.removeEventListener('session-expired', onExpire as EventListener);
   }, []);

   return (
      <BrowserRouter>
         <QueryClientProvider client={queryClient}>
            <AuthProvider>
               {sessionExpired && (
                  <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center">
                     <div className="bg-white text-black rounded shadow-lg w-full max-w-md p-6">
                        <div className="text-xl font-semibold mb-2">Session expired</div>
                        <div className="text-sm text-gray-700 mb-4">
                           Your session has expired. Please login again to continue.
                        </div>
                        <div className="flex justify-end gap-2">
                           <Button variant="outline" onClick={() => setSessionExpired(false)}>
                              Dismiss
                           </Button>
                           <Button onClick={() => {
                              localStorage.removeItem('_SPC_SSN_HASH');
                              localStorage.removeItem("_SPC_USER_ID");
                              window.location.href = '/auth/login';
                           }}>
                              Go to Login
                           </Button>
                        </div>
                     </div>
                  </div>
               )}
               <Routes>
                  <Route path="/auth/login" element={<Login />} />
                  <Route element={<ProtectedRoute />}>
                     <Route path="/" element={<Home />} />
                     <Route path="/cctv" element={<CCTVView />} />
                     <Route path="/slots/:id" element={<EditSlot />}></Route>
                     <Route path="/orders/create" element={<UpsertOrder />} />
                     <Route path="/orders/:id" element={<UpsertOrder />} />
                  </Route>

                  <Route path='/DashUIx/*' element={<DashWrap />}>
                     <Route path="o/:id" element={<OTPPhase />} />
                     <Route path="select-slot/:id" element={<SlotSelectPhase />} />
                     
                     <Route path="parcel-entry/:id" element={<EnterParcel />} />
                     <Route path="money/:id" element={<MoneyDrop />} />
                     <Route path="end/:id" element={<ThankYou />} />
                     <Route path="" element={<MainScreen />} />

                  </Route>


               </Routes>
            </AuthProvider>
            <Toaster />
         </QueryClientProvider>
      </BrowserRouter>
   );
}

export default App;