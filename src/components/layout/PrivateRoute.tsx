
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
      console.log("PrivateRoute - No authenticated user, redirecting to auth");
      toast.error("Authentication required", {
        description: "Please log in to access this page"
      });
    }
  }, [loading, user]);

  console.log("PrivateRoute - Status:", { loading, user: !!user });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-adicorp-dark">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-adicorp-purple mx-auto" />
          <p className="mt-4 text-white/60">Checking authentication...</p>
        </div>
      </div>
    );
  }

  return user ? <Outlet /> : <Navigate to="/auth" state={{ from: location }} replace />;
};
