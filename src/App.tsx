
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Index from "./pages/Index";
import Dashboard from "./pages/Dashboard";
import Employees from "./pages/Employees";
import Attendance from "./pages/Attendance";
import Salary from "./pages/Salary";
import Reports from "./pages/Reports";
import Settings from "./pages/Settings";
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";
import { AuthProvider } from "./context/AuthContext";
import { PrivateRoute } from "./components/layout/PrivateRoute";
import CompanySetupModal from "./components/company/CompanySetupModal";
import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

// Create a client with default options
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 30000,
    },
  },
});

// Function to ensure storage bucket exists for logo uploads
const ensureStorageBuckets = async () => {
  try {
    // Check if logos bucket exists, create if not
    const { data: bucketData } = await supabase.storage.getBucket('logos');
    if (!bucketData) {
      console.log("Creating logos storage bucket");
      await supabase.storage.createBucket('logos', {
        public: true,
        fileSizeLimit: 2097152, // 2MB limit
      });
    }
  } catch (error) {
    console.log("Creating logos bucket");
    await supabase.storage.createBucket('logos', {
      public: true,
      fileSizeLimit: 2097152, // 2MB limit
    });
  }
};

const App = () => {
  // Ensure storage buckets exist on app load
  useEffect(() => {
    ensureStorageBuckets();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/auth" element={<Auth />} />
              
              {/* Protected Routes */}
              <Route element={<PrivateRoute />}>
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/employees" element={<Employees />} />
                <Route path="/attendance" element={<Attendance />} />
                <Route path="/salary" element={<Salary />} />
                <Route path="/reports" element={<Reports />} />
                <Route path="/settings" element={<Settings />} />
              </Route>
              
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
            <CompanySetupModal />
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
};

export default App;
