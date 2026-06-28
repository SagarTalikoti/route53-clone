"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { LayoutDashboard, Globe, Activity, Route, Settings2 } from "lucide-react";

const navItems = [
  { name: "Dashboard", href: "/", icon: LayoutDashboard },
  { name: "Hosted zones", href: "/hosted-zones", icon: Globe },
  { name: "Traffic policies", href: "/traffic-policies", icon: Route },
  { name: "Health checks", href: "/health-checks", icon: Activity },
  { name: "Resolver", href: "/resolver", icon: Settings2 },
];

export default function Sidebar({ isOpen = true }: { isOpen?: boolean }) {
  const pathname = usePathname();

  return (
    <aside className={cn(
      "bg-surface border-border h-full overflow-x-hidden flex-shrink-0 text-sm flex flex-col shadow-[4px_0_24px_-12px_rgba(0,0,0,0.1)] z-10 relative transition-all duration-300",
      isOpen ? "w-64 opacity-100 border-r" : "w-0 opacity-0 border-r-0"
    )}>
      <div className="w-64 flex flex-col h-full overflow-y-auto">
        <div className="p-6 pb-2">
          <h2 className="text-xs uppercase tracking-wider font-semibold text-muted mb-4">Navigation</h2>
        </div>
        <nav className="px-3 space-y-1.5 flex-1">
        {navItems.map((item) => {
          const isActive = pathname === item.href || (pathname.startsWith(item.href) && item.href !== "/");
          const Icon = item.icon;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group relative overflow-hidden",
                isActive 
                  ? "text-primary font-medium bg-primary/10" 
                  : "text-muted hover:bg-surface-hover hover:text-foreground"
              )}
            >
              {isActive && (
                <span className="absolute left-0 top-0 bottom-0 w-1 bg-primary rounded-r-full" />
              )}
              <Icon className={cn("w-4 h-4 transition-colors", isActive ? "text-primary" : "text-muted group-hover:text-primary/70")} />
              {item.name}
            </Link>
          );
        })}
      </nav>
      <div className="p-4 m-4 bg-primary/5 rounded-xl border border-primary/10">
        <div className="text-xs text-muted mb-2">Cloud Resources</div>
        <div className="text-sm font-medium text-foreground">AWS Region</div>
        <div className="text-xs text-primary mt-1 flex items-center gap-1">
          <div className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)] animate-pulse"></div>
          Global (us-east-1)
        </div>
      </div>
      </div>
    </aside>
  );
}
