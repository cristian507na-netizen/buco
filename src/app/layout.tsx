import type { Metadata, Viewport } from "next";
import { Outfit } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/layout/header";
import { LayoutShell } from "@/components/layout/LayoutShell";
import { cn } from "@/lib/utils";
import { createClient } from "@/utils/supabase/server";

const outfit = Outfit({ 
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800", "900"],
  variable: '--font-outfit',
});

export const metadata: Metadata = {
  title: "Buco - Finanzas Personales",
  description: "Tu asistente financiero inteligente",
  manifest: "/manifest.json",
  icons: {
    icon: "/icon.png",
    apple: "/icon.png",
  },
};

export const viewport: Viewport = {
  themeColor: "#0F0F0F",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const supabase = createClient();
  let user = null;
  let settings = null;
  let profile = null;
  let accounts = [];

  try {
    const { data: userData } = await supabase.auth.getUser();
    user = userData?.user || null;

    if (user) {
      const [settingsRes, profileRes, accountsRes] = await Promise.all([
        supabase.from('user_settings').select('theme').eq('user_id', user.id).single(),
        supabase.from('profiles').select('*').eq('id', user.id).single(),
        supabase.from('bank_accounts').select('*').eq('user_id', user.id)
      ]);

      settings = settingsRes.data;
      profile = profileRes.data;
      accounts = accountsRes.data || [];
    }
  } catch (error) {
    console.error("Error in RootLayout data fetching:", error);
  }
  
  const userTheme = settings?.theme || 'system';

  return (
    <html lang="es" className={cn(outfit.variable)} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: `
          (function() {
            try {
              var stored = localStorage.getItem('buco-theme');
              var theme = stored || '${userTheme === 'light' ? 'light' : 'dark'}';
              if (theme === 'system') {
                theme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'dark';
              }
              if (theme === 'dark') {
                document.documentElement.classList.add('dark');
              } else {
                document.documentElement.classList.remove('dark');
              }
            } catch (e) {}
          })();
        `}} />
        <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200" rel="stylesheet" />
      </head>
      <body className={cn(outfit.className, "bg-background text-foreground antialiased selection:bg-primary/10")}>
        <LayoutShell user={user} profile={profile}>
          {children}
        </LayoutShell>
      </body>
    </html>
  );
}
