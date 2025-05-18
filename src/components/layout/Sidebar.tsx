
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
  Home
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
  { name: "Settings", icon: Settings, path: "/settings" },
];

export default function Sidebar() {
  const location = useLocation();
  const { signOut, user, loading } = useAuth();
  
  const handleSignOut = () => {
    signOut();
  };
  
  return (
    <div className="w-64 h-full bg-adicorp-dark-light border-r border-white/10 fixed left-0 top-0 overflow-y-auto animate-slide-in">
      <div className="p-6">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-adicorp-purple flex items-center justify-center">
            <span className="text-white font-bold">AC</span>
          </div>
          <h1 className="text-xl font-bold text-white">AdiCorp</h1>
        </div>
      </div>
      
      <div className="px-3 py-4">
        <nav className="space-y-1">
          {navItems.map((item) => (
            <Link
              key={item.name}
              to={item.path}
              className={cn("nav-item", {
                "active": location.pathname === item.path
              })}
            >
              <item.icon size={20} />
              <span>{item.name}</span>
            </Link>
          ))}
        </nav>
      </div>
      
      <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-white/10">
        <div className="flex items-center gap-3 mb-6 px-2">
          <div className="w-10 h-10 rounded-full bg-adicorp-purple-dark flex items-center justify-center">
            {loading ? (
              <Loader2 size={18} className="animate-spin" />
            ) : (
              <UserCog size={18} />
            )}
          </div>
          <div>
            <h3 className="text-sm font-medium text-white">
              {loading ? "Loading..." : user?.email?.split('@')[0] || "Admin User"}
            </h3>
            <p className="text-xs text-white/60">Administrator</p>
          </div>
        </div>
        
        <button 
          className="nav-item w-full justify-center text-white/80 hover:text-white"
          onClick={handleSignOut}
        >
          <LogOut size={18} />
          <span>Logout</span>
        </button>
      </div>
    </div>
  );
}
