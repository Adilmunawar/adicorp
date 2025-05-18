
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";

export default function Index() {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  
  useEffect(() => {
    if (user && !loading) {
      navigate("/dashboard");
    }
  }, [user, loading, navigate]);
  
  return (
    <div className="flex min-h-screen flex-col bg-adicorp-dark">
      <header className="px-4 lg:px-6 h-14 flex items-center">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-adicorp-purple flex items-center justify-center">
            <span className="text-white font-bold">AC</span>
          </div>
          <span className="text-lg font-bold text-white">AdiCorp</span>
        </div>
        <nav className="ml-auto flex gap-4 sm:gap-6">
          <Button
            variant="ghost"
            className="text-white/70 hover:text-white hover:bg-transparent"
            onClick={() => navigate("/auth")}
          >
            Login
          </Button>
        </nav>
      </header>
      
      <main className="flex-1">
        <section className="w-full py-12 md:py-24 lg:py-32 flex items-center justify-center">
          <div className="container px-4 md:px-6 flex flex-col items-center text-center gap-6">
            <div className="space-y-4">
              <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl/none text-white">
                Manage Your Workforce Effortlessly
              </h1>
              <p className="mx-auto max-w-[800px] text-white/70 md:text-xl">
                AdiCorp is a comprehensive employee management system designed for small to medium businesses in Pakistan.
              </p>
            </div>
            <div className="space-x-4">
              <Button
                className="bg-adicorp-purple hover:bg-adicorp-purple-dark btn-glow"
                onClick={() => navigate("/auth")}
              >
                Get Started
              </Button>
              <Button 
                variant="outline" 
                className="border-white/20"
                onClick={() => window.open("https://docs.example.com", "_blank")}
              >
                Learn More
              </Button>
            </div>
          </div>
        </section>
        
        <section className="w-full py-12 md:py-24 lg:py-32 bg-adicorp-dark-light">
          <div className="container px-4 md:px-6">
            <div className="grid gap-10 sm:grid-cols-2 md:grid-cols-3 lg:gap-12">
              <div className="space-y-4">
                <div className="inline-block rounded-lg bg-adicorp-purple/20 p-3">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="h-5 w-5 text-adicorp-purple"
                  >
                    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                    <circle cx="9" cy="7" r="4" />
                    <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
                    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                  </svg>
                </div>
                <h3 className="text-lg font-bold text-white">Employee Management</h3>
                <p className="text-white/70">
                  Easily add, update, and manage employee information with our intuitive interface.
                </p>
              </div>
              
              <div className="space-y-4">
                <div className="inline-block rounded-lg bg-adicorp-purple/20 p-3">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="h-5 w-5 text-adicorp-purple"
                  >
                    <path d="M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20z" />
                    <path d="M12 6v6l4 2" />
                  </svg>
                </div>
                <h3 className="text-lg font-bold text-white">Attendance Tracking</h3>
                <p className="text-white/70">
                  Track daily attendance and generate comprehensive attendance reports.
                </p>
              </div>
              
              <div className="space-y-4">
                <div className="inline-block rounded-lg bg-adicorp-purple/20 p-3">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="h-5 w-5 text-adicorp-purple"
                  >
                    <rect width="20" height="14" x="2" y="5" rx="2" />
                    <line x1="2" x2="22" y1="10" y2="10" />
                  </svg>
                </div>
                <h3 className="text-lg font-bold text-white">Payroll Management</h3>
                <p className="text-white/70">
                  Calculate salaries based on attendance and wage rates in Pakistani Rupees.
                </p>
              </div>
            </div>
          </div>
        </section>
        
        <section className="w-full py-12 md:py-24 lg:py-32">
          <div className="container px-4 md:px-6 text-center">
            <div className="space-y-4">
              <h2 className="text-2xl font-bold tracking-tighter sm:text-3xl md:text-4xl text-white">
                Ready to streamline your business operations?
              </h2>
              <p className="mx-auto max-w-[600px] text-white/70 md:text-xl">
                Join AdiCorp today and experience the future of workforce management.
              </p>
            </div>
            <div className="mx-auto max-w-sm space-y-2 pt-6">
              <Button
                className="w-full bg-adicorp-purple hover:bg-adicorp-purple-dark btn-glow"
                size="lg"
                onClick={() => navigate("/auth")}
              >
                Get Started Now
              </Button>
            </div>
          </div>
        </section>
      </main>
      
      <footer className="flex flex-col gap-2 sm:flex-row py-6 w-full px-4 md:px-6 border-t border-white/10">
        <p className="text-xs text-white/50">
          © 2025 AdiCorp Management. All rights reserved.
        </p>
        <nav className="sm:ml-auto flex gap-4 sm:gap-6">
          <a className="text-xs hover:underline underline-offset-4 text-white/50" href="#">
            Terms of Service
          </a>
          <a className="text-xs hover:underline underline-offset-4 text-white/50" href="#">
            Privacy
          </a>
        </nav>
      </footer>
    </div>
  );
}
