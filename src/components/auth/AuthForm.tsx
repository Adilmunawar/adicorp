import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Link } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/components/ui/use-toast";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";

const signUpSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  confirmPassword: z.string(),
  firstName: z.string().min(2, "First name must be at least 2 characters"),
  lastName: z.string().min(2, "Last name must be at least 2 characters"),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

const signInSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

type SignUpSchemaType = z.infer<typeof signUpSchema>;
type SignInSchemaType = z.infer<typeof signInSchema>;

export default function AuthForm() {
  const [isSignUp, setIsSignUp] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const { signUp, signIn, loading } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const signUpForm = useForm<SignUpSchemaType>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      email: "",
      password: "",
      confirmPassword: "",
      firstName: "",
      lastName: "",
    },
  });

  const signInForm = useForm<SignInSchemaType>({
    resolver: zodResolver(signInSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const handleSignIn = async (values: SignInSchemaType) => {
    try {
      await signIn(values.email, values.password);
      navigate("/dashboard");
    } catch (error) {
      console.error("Sign-in error:", error);
      toast({
        title: "Sign-in Failed",
        description: "Invalid credentials. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleSignUp = async (values: SignUpSchemaType) => {
    try {
      const { confirmPassword, ...metadata } = values;
      await signUp(values.email, values.password, {
        firstName: values.firstName,
        lastName: values.lastName,
      });
      toast({
        title: "Sign-up Successful",
        description: "Please check your email to verify your account.",
      });
      setIsSignUp(false);
    } catch (error) {
      console.error("Sign-up error:", error);
      toast({
        title: "Sign-up Failed",
        description: "Failed to create account. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-adicorp-dark via-adicorp-dark-light to-adicorp-dark p-4">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="flex items-center justify-center mb-6">
            <img 
              src="/AdilMunawar-uploads/31e3e556-6bb0-44a2-bd2d-6d5fa04f0ba9.png" 
              alt="AdiCorp Logo" 
              className="w-20 h-20 rounded-full border-2 border-adicorp-purple/30 shadow-lg"
            />
          </div>
          <h2 className="text-3xl font-extrabold bg-gradient-to-r from-white to-adicorp-purple bg-clip-text text-transparent">
            Welcome to AdiCorp
          </h2>
          <p className="mt-2 text-sm text-white/70">
            {isSignUp ? 'Create your account to get started' : 'Sign in to your account'}
          </p>
        </div>

        <div className="bg-adicorp-dark-light/60 backdrop-blur-sm rounded-lg shadow-md p-6">
          {isSignUp ? (
            <form onSubmit={signUpForm.handleSubmit(handleSignUp)} className="space-y-4">
              <div>
                <Label htmlFor="firstName" className="block text-sm font-medium text-white">
                  First Name
                </Label>
                <Input
                  type="text"
                  id="firstName"
                  className="mt-1 block w-full bg-adicorp-dark border-white/20 text-white"
                  {...signUpForm.register("firstName")}
                />
                {signUpForm.formState.errors.firstName && (
                  <p className="text-red-500 text-xs mt-1">
                    {signUpForm.formState.errors.firstName.message}
                  </p>
                )}
              </div>
              <div>
                <Label htmlFor="lastName" className="block text-sm font-medium text-white">
                  Last Name
                </Label>
                <Input
                  type="text"
                  id="lastName"
                  className="mt-1 block w-full bg-adicorp-dark border-white/20 text-white"
                  {...signUpForm.register("lastName")}
                />
                {signUpForm.formState.errors.lastName && (
                  <p className="text-red-500 text-xs mt-1">
                    {signUpForm.formState.errors.lastName.message}
                  </p>
                )}
              </div>
              <div>
                <Label htmlFor="email" className="block text-sm font-medium text-white">
                  Email address
                </Label>
                <Input
                  type="email"
                  id="email"
                  className="mt-1 block w-full bg-adicorp-dark border-white/20 text-white"
                  {...signUpForm.register("email")}
                />
                {signUpForm.formState.errors.email && (
                  <p className="text-red-500 text-xs mt-1">
                    {signUpForm.formState.errors.email.message}
                  </p>
                )}
              </div>
              <div>
                <Label htmlFor="password" className="block text-sm font-medium text-white">
                  Password
                </Label>
                <div className="relative">
                  <Input
                    type={showPassword ? "text" : "password"}
                    id="password"
                    className="mt-1 block w-full bg-adicorp-dark border-white/20 text-white pr-10"
                    {...signUpForm.register("password")}
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-3 flex items-center px-2 text-gray-600 hover:text-white focus:outline-none"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
                {signUpForm.formState.errors.password && (
                  <p className="text-red-500 text-xs mt-1">
                    {signUpForm.formState.errors.password.message}
                  </p>
                )}
              </div>
              <div>
                <Label htmlFor="confirmPassword" className="block text-sm font-medium text-white">
                  Confirm Password
                </Label>
                <div className="relative">
                  <Input
                    type={showConfirmPassword ? "text" : "password"}
                    id="confirmPassword"
                    className="mt-1 block w-full bg-adicorp-dark border-white/20 text-white pr-10"
                    {...signUpForm.register("confirmPassword")}
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-3 flex items-center px-2 text-gray-600 hover:text-white focus:outline-none"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
                {signUpForm.formState.errors.confirmPassword && (
                  <p className="text-red-500 text-xs mt-1">
                    {signUpForm.formState.errors.confirmPassword.message}
                  </p>
                )}
              </div>
              <div>
                <Button
                  type="submit"
                  className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-adicorp-purple hover:bg-adicorp-purple-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-adicorp-purple"
                  disabled={loading}
                >
                  {loading ? "Creating account..." : "Create Account"}
                </Button>
              </div>
            </form>
          ) : (
            <form onSubmit={signInForm.handleSubmit(handleSignIn)} className="space-y-4">
              <div>
                <Label htmlFor="email" className="block text-sm font-medium text-white">
                  Email address
                </Label>
                <Input
                  type="email"
                  id="email"
                  className="mt-1 block w-full bg-adicorp-dark border-white/20 text-white"
                  {...signInForm.register("email")}
                />
                {signInForm.formState.errors.email && (
                  <p className="text-red-500 text-xs mt-1">
                    {signInForm.formState.errors.email.message}
                  </p>
                )}
              </div>
              <div>
                <Label htmlFor="password" className="block text-sm font-medium text-white">
                  Password
                </Label>
                <div className="relative">
                  <Input
                    type={showPassword ? "text" : "password"}
                    id="password"
                    className="mt-1 block w-full bg-adicorp-dark border-white/20 text-white pr-10"
                    {...signInForm.register("password")}
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-3 flex items-center px-2 text-gray-600 hover:text-white focus:outline-none"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
                {signInForm.formState.errors.password && (
                  <p className="text-red-500 text-xs mt-1">
                    {signInForm.formState.errors.password.message}
                  </p>
                )}
              </div>
              <div>
                <Button
                  type="submit"
                  className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-adicorp-purple hover:bg-adicorp-purple-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-adicorp-purple"
                  disabled={loading}
                >
                  {loading ? "Signing in..." : "Sign in"}
                </Button>
              </div>
            </form>
          )}

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-white/20"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-adicorp-dark-light/60 text-white/70">
                  Or continue with
                </span>
              </div>
            </div>

            <div className="mt-3 flex justify-center gap-4">
              <Link
                to="#"
                className="inline-flex items-center justify-center px-4 py-2 border border-white/20 rounded-md shadow-sm text-sm font-medium text-white bg-adicorp-dark hover:bg-adicorp-dark-light focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-adicorp-purple"
              >
                Google
              </Link>
              <Link
                to="#"
                className="inline-flex items-center justify-center px-4 py-2 border border-white/20 rounded-md shadow-sm text-sm font-medium text-white bg-adicorp-dark hover:bg-adicorp-dark-light focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-adicorp-purple"
              >
                Github
              </Link>
            </div>
          </div>
        </div>

        <div className="text-sm text-white/70 text-center">
          {isSignUp ? (
            <>
              Already have an account?{" "}
              <button
                onClick={() => setIsSignUp(false)}
                className="font-medium text-adicorp-purple hover:text-adicorp-purple-light"
              >
                Sign in
              </button>
            </>
          ) : (
            <>
              Don't have an account?{" "}
              <button
                onClick={() => setIsSignUp(true)}
                className="font-medium text-adicorp-purple hover:text-adicorp-purple-light"
              >
                Sign up
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
