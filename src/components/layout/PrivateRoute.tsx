
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Loader2 } from "lucide-react";

export const PrivateRoute = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-adicorp-dark">
        <Loader2 className="h-8 w-8 animate-spin text-adicorp-purple" />
      </div>
    );
  }

  return user ? <Outlet /> : <Navigate to="/auth" />;
};
