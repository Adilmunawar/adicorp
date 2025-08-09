import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import AuthForm from "@/components/auth/AuthForm";
import { useAuth } from "@/context/AuthContext";
export default function Auth() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, loading } = useAuth();
  const from = location.state?.from?.pathname || "/dashboard";
  useEffect(() => {
    if (!loading && user) {
      console.log("Auth - User logged in, redirecting to:", from);
      navigate(from, { replace: true });
    }
  }, [user, loading, navigate, from]);
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-adicorp-dark">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-adicorp-purple border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="mt-4 text-white/60">Checking authentication...</p>
        </div>
      </div>
    );
  }
  return user ? null : <AuthForm />;
}
