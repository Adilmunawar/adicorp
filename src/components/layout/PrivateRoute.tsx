
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Loader2 } from "lucide-react";
import { useEffect, ReactNode } from "react";
import { toast } from "sonner";

interface PrivateRouteProps {
  children: ReactNode;
}

export const PrivateRoute = ({ children }: PrivateRouteProps) => {
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

  console.log("PrivateRoute - Status:", { loading, user: !!user, pathname: location.pathname });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-adicorp-dark">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-adicorp-purple mx-auto" />
          <p className="mt-4 text-white/60">Loading...</p>
        </div>
      </div>
    );
  }

  return user ? <>{children}</> : <Navigate to="/auth" state={{ from: location }} replace />;
};
