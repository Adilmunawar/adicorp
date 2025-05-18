
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import AuthForm from "@/components/auth/AuthForm";

const Index = () => {
  const navigate = useNavigate();
  
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-adicorp-dark p-4">
      <div className="mb-8 animate-fade-in">
        <div className="flex items-center justify-center mb-4">
          <div className="w-12 h-12 rounded-lg bg-adicorp-purple flex items-center justify-center">
            <span className="text-white font-bold text-xl">AC</span>
          </div>
        </div>
        <h1 className="text-4xl font-bold text-white mb-2 text-center">
          AdiCorp
        </h1>
        <p className="text-white/70 text-center max-w-md mx-auto">
          A modern employee management platform for forward-thinking companies
        </p>
      </div>
      
      <div className="animate-fade-in" style={{ animationDelay: "150ms" }}>
        <AuthForm />
      </div>
    </div>
  );
};

export default Index;
