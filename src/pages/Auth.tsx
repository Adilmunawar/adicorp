
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
    // If user is already logged in, redirect to dashboard or the page they came from
    if (user && !loading) {
      console.log("Auth - User already logged in, redirecting to:", from);
      navigate(from, { replace: true });
    }
  }, [user, loading, navigate, from]);

  // Show loading while checking auth state
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

  // Show auth form only if not logged in
  return !user ? <AuthForm /> : null;
}
