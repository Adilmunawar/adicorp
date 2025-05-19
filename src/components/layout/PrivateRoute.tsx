
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Loader2 } from "lucide-react";
import { useEffect } from "react";
import { toast } from "sonner";

export const PrivateRoute = () => {
  const { user, loading } = useAuth();
  const location = useLocation();

  useEffect(() => {
    if (!loading && !user) {
      toast.error("Authentication required", {
        description: "Please log in to access this page"
      });
    }
  }, [loading, user]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-adicorp-dark">
        <Loader2 className="h-8 w-8 animate-spin text-adicorp-purple" />
      </div>
    );
  }

  return user ? <Outlet /> : <Navigate to="/auth" state={{ from: location }} />;
};
