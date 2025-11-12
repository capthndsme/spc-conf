import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { Auth, AuthReturn } from "../types/IAuth";
 
export const AuthContext = createContext<Auth>({
   hash: null,
   setHash: () => {},
   logout: () => {},
});

AuthContext.displayName = "Auth";

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
   const [hash, setHash] = useState<AuthReturn | null | undefined>(() => {
      const preload = localStorage.getItem("_SPC_SSN_HASH");
      const userId = localStorage.getItem("_SPC_USER_ID");
      console.log("get", preload, userId)
      if (typeof preload === "string" && typeof userId === "string") return {
         token: preload,
         userId: parseInt(userId)
      }
      return null;
   }); // Add useState hook

   useEffect(() => {
      if (hash === null || hash === undefined) {
         // Clear localStorage when hash is cleared
         localStorage.removeItem("_SPC_SSN_HASH");
         localStorage.removeItem("_SPC_USER_ID");
         return;
      }
      console.log("set", hash)
      localStorage.setItem("_SPC_SSN_HASH", hash?.token ?? "");
      localStorage.setItem("_SPC_USER_ID", hash?.userId?.toString() ?? "")
   }, [hash?.token, hash?.userId]);

   const logout = () => {
      setHash(null);
      localStorage.removeItem("_SPC_SSN_HASH");
      localStorage.removeItem("_SPC_USER_ID");
   };

   const value = useMemo<Auth>(() => {
      return {
         hash,
         setHash,
         logout,
      };
   }, [hash?.token, hash?.userId]);

   return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const AuthConsumer = AuthContext.Consumer;

export const useAuth = () => {
   const auth = useContext(AuthContext);
   return auth;
};