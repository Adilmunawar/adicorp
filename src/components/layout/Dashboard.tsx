
import { ReactNode } from "react";
import Sidebar from "@/components/layout/Sidebar";
import Header from "@/components/layout/Header";

interface DashboardProps {
  children: ReactNode;
  title: string;
}

export default function Dashboard({ children, title }: DashboardProps) {
  return (
    <div className="min-h-screen flex bg-adicorp-dark">
      <Sidebar />
      
      <div className="flex-1 ml-64">
        <Header title={title} />
        
        <main className="p-6">
          <div className="animate-fade-in">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
