import { Link, useNavigate } from "react-router";
import { useAuth } from "../context/AuthContext";
import { Button } from "./ui/button";
import { LogOut } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import authApi from "../api/authApi";

const NavBar = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [loggingOut, setLoggingOut] = useState(false);

  const handleLogout = async () => {
    try {
      setLoggingOut(true);
      // Try to call logout endpoint, but don't block on it
      await authApi.logout().catch(() => {
        // Silently fail - we'll logout locally anyway
      });
      
      logout();
      toast.success("Logged out successfully");
      navigate('/auth/login', { replace: true });
    } catch (error) {
      // Even if the API call fails, we still logout locally
      logout();
      navigate('/auth/login', { replace: true });
    } finally {
      setLoggingOut(false);
    }
  };

  return <div className="sticky top-0 left-0 w-full bg-gray-700 z-10  ">
    <div className="max-w-5xl w-full mx-auto p-4 flex items-center justify-between">
      <div className="font-semibold">Project Safedrop</div>
      <div className="flex items-center space-x-4">
        <Link to="/" className="text-blue-300 hover:text-gray-300 transition-colors">Home</Link>
        <Link to="/cctv" className="text-blue-300 hover:text-gray-300 transition-colors">CCTV</Link>
        <Link to="/orders" className="text-blue-300 hover:text-gray-300 transition-colors">Orders</Link>
        <Link to="/history" className="text-blue-300 hover:text-gray-300 transition-colors">Settings</Link>
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={handleLogout}
          disabled={loggingOut}
          className="text-red-300 hover:text-red-200 hover:bg-gray-600"
        >
          <LogOut className="w-4 h-4 mr-2" />
          {loggingOut ? "Logging out..." : "Logout"}
        </Button>
      </div>
    </div>
  </div>
}

export default NavBar;