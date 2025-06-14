import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import DashboardPage from "./pages/Dashboard";
import EmployeesPage from "./pages/Employees";
import AttendancePage from "./pages/Attendance";
import SalaryPage from "./pages/Salary";
import ReportsPage from "./pages/Reports";
import SettingsPage from "./pages/Settings";
import AuthPage from "./pages/Auth";
import NotFound from "./pages/NotFound";
import { AuthProvider } from "./context/AuthContext";
import { PrivateRoute } from "./components/layout/PrivateRoute";
import CompanySetupModal from "./components/company/CompanySetupModal";
import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 30000,
    },
  },
});

function App() {
  useEffect(() => {
    console.log("App - Application initialized successfully");
  }, []);

  return (
    <QueryClient client={queryClient}>
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/auth" element={<AuthPage />} />
            <Route 
              path="/dashboard" 
              element={
                <PrivateRoute>
                  <DashboardPage />
                </PrivateRoute>
              } 
            />
            <Route 
              path="/employees" 
              element={
                <PrivateRoute>
                  <EmployeesPage />
                </PrivateRoute>
              } 
            />
            <Route 
              path="/attendance" 
              element={
                <PrivateRoute>
                  <AttendancePage />
                </PrivateRoute>
              } 
            />
            <Route 
              path="/salary" 
              element={
                <PrivateRoute>
                  <SalaryPage />
                </PrivateRoute>
              } 
            />
            <Route 
              path="/reports" 
              element={
                <PrivateRoute>
                  <ReportsPage />
                </PrivateRoute>
              } 
            />
            <Route 
              path="/events" 
              element={
                <PrivateRoute>
                  <EventsPage />
                </PrivateRoute>
              } 
            />
            <Route 
              path="/working-days" 
              element={
                <PrivateRoute>
                  <WorkingDaysPage />
                </PrivateRoute>
              } 
            />
            <Route 
              path="/settings" 
              element={
                <PrivateRoute>
                  <SettingsPage />
                </PrivateRoute>
              } 
            />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </QueryClient>
  );
}

export default App;
