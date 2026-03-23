"use client";

import { usePathname } from "next/navigation";
import { Sidebar } from "@/components/layout/sidebar";
import { BottomTabs } from "@/components/layout/bottom-tabs";
import { AIAssistantWidget } from "@/components/AIAssistantWidget";

const PUBLIC_ROUTES = ['/welcome', '/login', '/signup', '/auth'];

function isPublicPath(pathname: string) {
  return PUBLIC_ROUTES.some(
    route => pathname === route || pathname.startsWith(route + '/')
  );
}

export function LayoutShell({
  children,
  user,
  profile,
}: {
  children: React.ReactNode;
  user: any;
  profile: any;
}) {
  const pathname = usePathname();

  if (!user || isPublicPath(pathname)) {
    return <>{children}</>;
  }

  return (
    <>
      <div className="flex h-screen overflow-hidden bg-background">
        <Sidebar profile={profile} />
        <div className="flex flex-1 flex-col overflow-hidden relative">
          <main className="flex-1 overflow-y-auto pb-24 lg:pb-0 scroll-smooth">
            {children}
          </main>
        </div>
        <BottomTabs userId={user.id} />
      </div>
      <AIAssistantWidget userId={user.id} />
    </>
  );
}
