
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

import DashWrap from "./components/DashWrap";
import MainScreen from "./screens/PiScreen";
import OTPPhase from "./screens/OTPPhase";
import EnterParcel from "./screens/EnterParcel";
import { ThankYou } from "./screens/ThankYou";
import MoneyDrop from "./screens/MoneyDrop";


const queryClient = new QueryClient({
   defaultOptions: {
      queries: {
         refetchOnWindowFocus: false,
      },
   },
});


function App() {

   return (
      <BrowserRouter>
         <QueryClientProvider client={queryClient}>
            <AuthProvider>
               <Routes>
                  <Route path="/auth/login" element={<Login />} />
                  <Route element={<ProtectedRoute />}>
                     <Route path="/" element={<Home />} />
                     <Route path="/slots/:id" element={<EditSlot />}></Route>
                     <Route path="/orders/create" element={<UpsertOrder />} />
                     <Route path="/orders/:id" element={<UpsertOrder />} />
                  </Route>

                  <Route path='/DashUIx/*' element={<DashWrap />}>
                     <Route path="o/:id" element={<OTPPhase />} />
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