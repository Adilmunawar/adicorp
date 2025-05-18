
import { useState } from "react";
import { Bell, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function Header({ title }: { title: string }) {
  const [notifications] = useState(3);

  return (
    <header className="h-16 flex items-center justify-between px-6 border-b border-white/10 animate-fade-in">
      <h1 className="text-2xl font-bold">{title}</h1>
      
      <div className="flex items-center gap-4">
        <div className="relative max-w-md w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white/50" size={18} />
          <Input 
            type="text" 
            placeholder="Search..." 
            className="pl-10 bg-adicorp-dark-light border-white/10 focus:border-adicorp-purple"
          />
        </div>
        
        <div className="relative">
          <Button variant="outline" size="icon" className="rounded-full border-white/10">
            <Bell size={18} />
          </Button>
          {notifications > 0 && (
            <span className="absolute top-0 right-0 w-4 h-4 bg-adicorp-purple text-white text-xs flex items-center justify-center rounded-full">
              {notifications}
            </span>
          )}
        </div>
      </div>
    </header>
  );
}
