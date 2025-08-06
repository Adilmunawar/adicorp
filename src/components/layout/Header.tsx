
import GlobalSearch from "./GlobalSearch";
import NotificationDropdown from "./NotificationDropdown";

export default function Header({ title }: { title: string }) {
  return (
    <header className="h-16 flex items-center justify-between px-6 border-b border-white/10 animate-fade-in bg-adicorp-dark/80 backdrop-blur-sm">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-3">
          <img 
            src="/AdilMunawar-uploads/31e3e556-6bb0-44a2-bd2d-6d5fa04f0ba9.png" 
            alt="AdiCorp Logo" 
            className="w-8 h-8 rounded-full"
          />
          <h1 className="text-2xl font-bold bg-gradient-to-r from-white to-adicorp-purple bg-clip-text text-transparent">
            {title}
          </h1>
        </div>
      </div>
      
      <div className="flex items-center gap-4">
        <GlobalSearch />
        <NotificationDropdown />
      </div>
    </header>
  );
}
