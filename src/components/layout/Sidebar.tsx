
import { Link, useLocation } from "react-router-dom";
import { 
  Calendar,
  Users,
  BarChart,
  Settings,
  Clock,
  ChartPie,
  UserCog,
  LogOut,
  Home,
  Shield,
  FileText
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/context/AuthContext";
import { Loader2 } from "lucide-react";

const navItems = [
  { name: "Dashboard", icon: Home, path: "/dashboard" },
  { name: "Employees", icon: Users, path: "/employees" },
  { name: "Attendance", icon: Clock, path: "/attendance" },
  { name: "Salary", icon: BarChart, path: "/salary" },
  { name: "Reports", icon: ChartPie, path: "/reports" },
  { name: "Working Days", icon: Calendar, path: "/working-days" },
  { name: "Events", icon: Shield, path: "/events" },
  { name: "Timeline Logs", icon: FileText, path: "/timeline-logs" },
  { name: "Settings", icon: Settings, path: "/settings" },
];

export default function Sidebar() {
  const location = useLocation();
  const { signOut, user, loading } = useAuth();
  
  const handleSignOut = () => {
    signOut();
  };
  
  return (
    <div className="w-64 h-screen bg-adicorp-dark-light border-r border-white/10 fixed left-0 top-0 overflow-y-auto animate-slide-in flex flex-col">
      {/* Header */}
      <div className="p-6 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-adicorp-purple flex items-center justify-center">
            <span className="text-white font-bold">AC</span>
          </div>
          <h1 className="text-xl font-bold text-white">AdiCorp</h1>
        </div>
      </div>
      
      {/* Navigation Menu */}
      <div className="flex-1 px-3 py-4">
        <nav className="space-y-1">
          {navItems.map((item) => (
            <Link
              key={item.name}
              to={item.path}
              className={cn(
                "flex items-center gap-3 px-3 py-3 rounded-lg text-white/70 hover:text-white hover:bg-adicorp-dark transition-all duration-200 group",
                {
                  "bg-adicorp-purple text-white shadow-lg": location.pathname === item.path
                }
              )}
            >
              <item.icon size={20} className="flex-shrink-0" />
              <span className="font-medium">{item.name}</span>
            </Link>
          ))}
        </nav>
      </div>
      
      {/* User Profile and Logout */}
      <div className="border-t border-white/10 p-4 mt-auto">
        <div className="flex items-center gap-3 mb-4 px-2">
          <div className="w-10 h-10 rounded-full bg-adicorp-purple-dark flex items-center justify-center flex-shrink-0">
            {loading ? (
              <Loader2 size={18} className="animate-spin text-white" />
            ) : (
              <UserCog size={18} className="text-white" />
            )}
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="text-sm font-medium text-white truncate">
              {loading ? "Loading..." : user?.email?.split('@')[0] || "Admin User"}
            </h3>
            <p className="text-xs text-white/60">Administrator</p>
          </div>
        </div>
        
        <button 
          className="flex items-center gap-3 px-3 py-3 rounded-lg text-white/70 hover:text-white hover:bg-red-500/20 transition-all duration-200 w-full"
          onClick={handleSignOut}
        >
          <LogOut size={18} className="flex-shrink-0" />
          <span className="font-medium">Logout</span>
        </button>
      </div>
    </div>
  );
}
