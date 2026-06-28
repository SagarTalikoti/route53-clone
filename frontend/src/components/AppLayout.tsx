"use client";

import { usePathname } from "next/navigation";
import { useState } from "react";
import Header from "./Header";
import Sidebar from "./Sidebar";
import { AuthProvider, useAuth } from "@/lib/AuthContext";

function LayoutContent({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { isAuthenticated } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  
  if (pathname === "/login") {
    return <>{children}</>;
  }

  if (!isAuthenticated) return null;

  return (
    <>
      <Header toggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
      <div className="flex flex-1 overflow-hidden h-[calc(100vh-48px)]">
        <Sidebar isOpen={sidebarOpen} />
        <main className="flex-1 overflow-y-auto bg-background p-6">
          {children}
        </main>
      </div>
    </>
  );
}

import { Toaster } from "react-hot-toast";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <Toaster position="top-right" />
      <LayoutContent>{children}</LayoutContent>
    </AuthProvider>
  );
}
