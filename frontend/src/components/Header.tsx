"use client";
import { Menu, Search, Bell, Settings, User, LogOut, Moon, Sun } from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/lib/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect, useState, useRef } from "react";
import toast from "react-hot-toast";

const SEARCH_ITEMS = [
  { label: "Dashboard", href: "/" },
  { label: "Hosted zones", href: "/hosted-zones" },
  { label: "Health checks", href: "/health-checks" },
  { label: "Traffic policies", href: "/traffic-policies" },
  { label: "Resolver", href: "/resolver" }
];

export default function Header({ toggleSidebar }: { toggleSidebar?: () => void }) {
  const router = useRouter();
  const { logout } = useAuth();
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);
  
  const filteredSearch = SEARCH_ITEMS.filter(item => 
    item.label.toLowerCase().includes(searchQuery.toLowerCase())
  );

  useEffect(() => {
    // Check initial preference
    if (document.documentElement.classList.contains("dark")) {
      setIsDarkMode(true);
    } else if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
      setIsDarkMode(true);
      document.documentElement.classList.add("dark");
    }
  }, []);

  const toggleDarkMode = () => {
    setIsDarkMode(prev => {
      const next = !prev;
      if (next) {
        document.documentElement.classList.add("dark");
      } else {
        document.documentElement.classList.remove("dark");
      }
      return next;
    });
  };

  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      // Ctrl + / to focus search
      if ((e.ctrlKey || e.metaKey) && e.key === "/") {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
      // Shift + D to toggle dark mode (ignore if typing in an input)
      if (e.shiftKey && e.key.toLowerCase() === "d") {
        if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
          return;
        }
        e.preventDefault();
        toggleDarkMode();
      }
    };
    window.addEventListener("keydown", handleGlobalKeyDown);
    return () => window.removeEventListener("keydown", handleGlobalKeyDown);
  }, []);

  return (
    <header className="flex items-center justify-between glass-panel px-6 py-3 text-foreground sticky top-0 z-50">
      <div className="flex items-center gap-6">
        <button onClick={toggleSidebar} className="p-2 hover:bg-surface-hover rounded-full transition-colors text-muted hover:text-primary">
          <Menu className="w-5 h-5" />
        </button>
        <Link href="/" className="font-bold text-xl flex items-center gap-2 tracking-tight text-primary">
          <span>Route53</span>
        </Link>
        <div className="hidden md:flex items-center gap-2 ml-8 relative">
           <div className="bg-surface border border-border rounded-full flex items-center px-4 py-1.5 w-80 focus-within:ring-2 focus-within:ring-primary/30 focus-within:border-primary transition-all shadow-sm relative z-50">
              <Search className="w-4 h-4 mr-2 text-muted" />
              <input 
                type="text" 
                ref={searchInputRef}
                placeholder="Search resources, services, and features..." 
                className="bg-transparent border-none outline-none w-full text-sm placeholder:text-muted/70 text-foreground"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setIsSearchOpen(true);
                }}
                onFocus={() => setIsSearchOpen(true)}
                onBlur={() => setTimeout(() => setIsSearchOpen(false), 200)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && filteredSearch.length > 0) {
                    router.push(filteredSearch[0].href);
                    setIsSearchOpen(false);
                    setSearchQuery("");
                  }
                }}
              />
           </div>
           
           {isSearchOpen && searchQuery && (
             <div className="absolute top-full mt-2 w-80 bg-surface border border-border rounded-xl shadow-lg overflow-hidden z-50 left-0">
               {filteredSearch.length > 0 ? (
                 filteredSearch.map((item, i) => (
                   <button
                     key={i}
                     onClick={() => {
                       router.push(item.href);
                       setIsSearchOpen(false);
                       setSearchQuery("");
                     }}
                     className="w-full text-left px-4 py-3 hover:bg-surface-hover text-sm transition-colors border-b last:border-0 border-border/50 text-foreground flex items-center justify-between"
                   >
                     <span>{item.label}</span>
                     <span className="text-xs text-muted">Service</span>
                   </button>
                 ))
               ) : (
                 <div className="px-4 py-3 text-sm text-muted">
                   No matches found.
                 </div>
               )}
             </div>
           )}
        </div>
      </div>
      <div className="flex items-center gap-2">
        <button 
          onClick={toggleDarkMode}
          className="hover:bg-surface-hover p-2 rounded-full transition-colors text-muted hover:text-primary"
          title="Toggle Dark Mode"
        >
          {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
        </button>
        <button onClick={() => toast("No new notifications", { icon: "🔔" })} className="hover:bg-surface-hover p-2 rounded-full transition-colors text-muted hover:text-primary">
          <Bell className="w-5 h-5" />
        </button>
        <button onClick={() => toast.success("Settings coming soon")} className="hover:bg-surface-hover p-2 rounded-full transition-colors text-muted hover:text-primary">
          <Settings className="w-5 h-5" />
        </button>
        <div className="h-6 w-px bg-border mx-2"></div>
        <button onClick={() => toast.success("Account settings coming soon!")} className="flex items-center gap-2 hover:bg-surface-hover p-1.5 pr-3 rounded-full transition-colors border border-transparent hover:border-border">
          <div className="bg-primary/10 p-1.5 rounded-full text-primary">
            <User className="w-4 h-4" />
          </div>
          <span className="hidden sm:inline text-sm font-medium">My Account</span>
        </button>
        <button onClick={logout} title="Sign Out" className="flex items-center gap-2 hover:bg-red-500/10 p-2 rounded-full transition-colors text-red-500">
          <LogOut className="w-5 h-5" />
        </button>
      </div>
    </header>
  );
}
