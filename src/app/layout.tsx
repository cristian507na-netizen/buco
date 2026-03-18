import type { Metadata, Viewport } from "next";
import { Inter, Geist } from "next/font/google";
import "./globals.css";
import { Sidebar } from "@/components/layout/sidebar";
import { BottomTabs } from "@/components/layout/bottom-tabs";
import { Header } from "@/components/layout/header";
import { cn } from "@/lib/utils";

const geist = Geist({subsets:['latin'],variable:'--font-sans'});

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Buco - Finanzas Personales",
  description: "Tu asistente financiero inteligente",
  manifest: "/manifest.json",
};

export const viewport: Viewport = {
  themeColor: "#0F0F0F",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className={cn("dark", "font-sans", geist.variable)}>
      <body className={`${inter.className} bg-background text-foreground antialiased`}>
        <div className="flex h-screen overflow-hidden">
          {/* Desktop Sidebar */}
          <Sidebar />

          <div className="flex flex-1 flex-col overflow-hidden">
            {/* Global Header */}
            <Header />

            {/* Main scrollable area */}
            <main className="flex-1 overflow-y-auto pb-20 lg:pb-0 scroll-smooth">
              <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
                {children}
              </div>
            </main>
          </div>

          {/* Mobile Bottom Tabs */}
          <BottomTabs />
        </div>
      </body>
    </html>
  );
}
