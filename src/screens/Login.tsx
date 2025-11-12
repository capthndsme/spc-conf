import { JSX, useState } from "react";
import { AxiosError } from "axios";

import { useAuth } from "../context/AuthContext";
import authApi from "../api/authApi";
import { baseApi } from "../api/baseApi";

// ShadCN Components

import { toast } from "sonner";
import { Label } from "@radix-ui/react-label";
import { Button } from "../components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "../components/ui/card";
import { Input } from "../components/ui/input";

export const Login = (): JSX.Element => {
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [loading, setLoading] = useState(false);

  const auth = useAuth();

  // Redirect to home if already logged in
  if (auth.hash) {
    location.href = "/";
    return <></>;
  }


  const login = async () => {
    try {
      setLoading(true);
      const result = await authApi.login(username, password);
      if (result.status === 201) {
        auth.setHash(result.data);
        // No need to manually set headers anymore - interceptor handles it

        await new Promise((resolve) => setTimeout(resolve, 560));
        toast.success("Login successful")
        location.href = "/";
      }
    } catch (e) {
      if (e instanceof AxiosError) {
        if (e?.response?.status === 403) {
          toast.error("Invalid username or password.")
        } else {
          toast.error("LoginError: Unknown Error")
        }
      } else {
        toast.error("Unknown error")
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="pt-4 max-w-md mx-auto ">
      <Card className="m-auto">
        <CardHeader>
          <CardTitle>Project Safedrop</CardTitle>
          <CardDescription>Enter your credentials to login</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="username">Username</Label>
            <Input
              id="username"
              value={username}
              onChange={(v) => setUsername(v.currentTarget.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  login();
                }
              }}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password" className="text-left">Password</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(v) => setPassword(v.currentTarget.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  login();
                }
              }}
            />
          </div>
        </CardContent>
        <CardFooter>
          <Button
            onClick={login}
            disabled={loading}
            className={loading ? "opacity-70 text-white" : "text-white"}
          >
            Login
          </Button>
        </CardFooter>
      </Card>

      <Card className="mt-4">
        <CardContent>
          A Secure Parcel Storage Solution with Integrated Surveillance and Cash Payment Mechanism
        </CardContent>
      </Card>
    </div>
  );
};
