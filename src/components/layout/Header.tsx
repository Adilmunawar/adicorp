
import { useState } from "react";
import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import GlobalSearch from "./GlobalSearch";

export default function Header({ title }: { title: string }) {
  const [notifications] = useState(3);

  return (
    <header className="h-16 flex items-center justify-between px-6 border-b border-white/10 animate-fade-in">
      <h1 className="text-2xl font-bold">{title}</h1>
      
      <div className="flex items-center gap-4">
        <GlobalSearch />
        
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
