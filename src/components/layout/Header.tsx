
import GlobalSearch from "./GlobalSearch";
import NotificationDropdown from "./NotificationDropdown";

export default function Header({ title }: { title: string }) {
  return (
    <header className="h-16 flex items-center justify-between px-6 border-b border-white/10 animate-fade-in">
      <h1 className="text-2xl font-bold">{title}</h1>
      
      <div className="flex items-center gap-4">
        <GlobalSearch />
        <NotificationDropdown />
      </div>
    </header>
  );
}
