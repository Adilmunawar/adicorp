
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

  // Show auth form only if not logged in
  return !user ? <AuthForm /> : null;
}
