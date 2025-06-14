
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Search, Users, Calendar, Settings, DollarSign, Clock, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";

interface SearchResult {
  id: string;
  title: string;
  subtitle?: string;
  type: 'employee' | 'page' | 'feature';
  action: () => void;
  icon: React.ComponentType<any>;
}

export default function GlobalSearch() {
  const [open, setOpen] = useState(false);
  const [employees, setEmployees] = useState<any[]>([]);
  const { userProfile } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };

    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  useEffect(() => {
    if (open && userProfile?.company_id) {
      fetchEmployees();
    }
  }, [open, userProfile?.company_id]);

  const fetchEmployees = async () => {
    if (!userProfile?.company_id) return;

    try {
      const { data, error } = await supabase
        .from('employees')
        .select('id, name, rank, status')
        .eq('company_id', userProfile.company_id)
        .eq('status', 'active')
        .limit(10);

      if (error) throw error;
      setEmployees(data || []);
    } catch (error) {
      console.error('Error fetching employees for search:', error);
    }
  };

  const navigationItems: SearchResult[] = [
    {
      id: 'dashboard',
      title: 'Dashboard',
      subtitle: 'Overview and statistics',
      type: 'page',
      action: () => navigate('/'),
      icon: TrendingUp,
    },
    {
      id: 'employees',
      title: 'Employees',
      subtitle: 'Manage employee data',
      type: 'page',
      action: () => navigate('/employees'),
      icon: Users,
    },
    {
      id: 'attendance',
      title: 'Attendance',
      subtitle: 'Track daily attendance',
      type: 'page',
      action: () => navigate('/attendance'),
      icon: Clock,
    },
    {
      id: 'salary',
      title: 'Salary Management',
      subtitle: 'Calculate and manage payroll',
      type: 'page',
      action: () => navigate('/salary'),
      icon: DollarSign,
    },
    {
      id: 'events',
      title: 'Events & Holidays',
      subtitle: 'Manage company events',
      type: 'page',
      action: () => navigate('/events'),
      icon: Calendar,
    },
    {
      id: 'working-days',
      title: 'Working Days',
      subtitle: 'Configure work schedules',
      type: 'page',
      action: () => navigate('/working-days'),
      icon: Calendar,
    },
    {
      id: 'settings',
      title: 'Settings',
      subtitle: 'Application preferences',
      type: 'page',
      action: () => navigate('/settings'),
      icon: Settings,
    },
  ];

  const employeeResults: SearchResult[] = employees.map(emp => ({
    id: emp.id,
    title: emp.name,
    subtitle: emp.rank,
    type: 'employee' as const,
    action: () => navigate('/employees'),
    icon: Users,
  }));

  const allResults = [...navigationItems, ...employeeResults];

  return (
    <>
      <Button
        variant="outline"
        className="relative w-64 justify-start text-sm text-white/60 bg-adicorp-dark-light border-white/10 hover:bg-adicorp-dark"
        onClick={() => setOpen(true)}
      >
        <Search className="mr-2 h-4 w-4" />
        Search...
        <kbd className="pointer-events-none absolute right-1.5 top-1.5 hidden h-5 select-none items-center gap-1 rounded border border-white/10 bg-white/10 px-1.5 font-mono text-[10px] font-medium text-white/60 opacity-100 sm:flex">
          <span className="text-xs">⌘</span>K
        </kbd>
      </Button>
      
      <CommandDialog open={open} onOpenChange={setOpen}>
        <div className="bg-adicorp-dark border-white/10">
          <CommandInput 
            placeholder="Search employees, pages, or features..." 
            className="text-white placeholder:text-white/60"
          />
          <CommandList className="bg-adicorp-dark">
            <CommandEmpty className="text-white/60">No results found.</CommandEmpty>
            
            <CommandGroup heading="Navigation" className="text-white/80">
              {navigationItems.map((item) => (
                <CommandItem
                  key={item.id}
                  onSelect={() => {
                    item.action();
                    setOpen(false);
                  }}
                  className="text-white hover:bg-adicorp-dark-light cursor-pointer"
                >
                  <item.icon className="mr-2 h-4 w-4 text-adicorp-purple" />
                  <div>
                    <div className="font-medium">{item.title}</div>
                    <div className="text-xs text-white/60">{item.subtitle}</div>
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>

            {employeeResults.length > 0 && (
              <CommandGroup heading="Employees" className="text-white/80">
                {employeeResults.map((item) => (
                  <CommandItem
                    key={item.id}
                    onSelect={() => {
                      item.action();
                      setOpen(false);
                    }}
                    className="text-white hover:bg-adicorp-dark-light cursor-pointer"
                  >
                    <Users className="mr-2 h-4 w-4 text-green-400" />
                    <div>
                      <div className="font-medium">{item.title}</div>
                      <div className="text-xs text-white/60">{item.subtitle}</div>
                    </div>
                  </CommandItem>
                ))}
              </CommandGroup>
            )}
          </CommandList>
        </div>
      </CommandDialog>
    </>
  );
}
