"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { AlertCircle, RefreshCw, Settings } from "lucide-react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error("Critical Application Error:", error);
  }, [error]);

  const isConfigError = 
    error.message?.includes("Configuración") || 
    error.message?.includes("NEXT_PUBLIC_SUPABASE_URL") ||
    error.digest === "2870027380";

  return (
    <div className="min-h-screen bg-[#0F0F0F] flex items-center justify-center p-6">
      <div className="max-w-md w-full bg-[#1A1A1A] border border-white/5 rounded-[32px] p-8 text-center shadow-2xl">
        <div className="w-16 h-16 bg-red-500/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
          <AlertCircle className="w-8 h-8 text-red-500" />
        </div>
        
        <h1 className="text-2xl font-black text-white mb-4 tracking-tight italic">
          ¡Ups! Algo no salió bien
        </h1>
        
        <p className="text-white/60 mb-8 text-sm leading-relaxed">
          {isConfigError 
            ? "Parece que faltan algunas llaves de configuración (Variables de Entorno) en tu despliegue de Vercel. Asegúrate de haber completado la configuración de Supabase."
            : "Ha ocurrido un error inesperado en el servidor. Estamos trabajando para solucionarlo."}
        </p>

        <div className="flex flex-col gap-3">
          <Button 
            onClick={() => reset()}
            className="w-full bg-white text-black hover:bg-white/90 h-12 rounded-2xl font-bold flex items-center justify-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            Reintentar
          </Button>
          
          <Button 
            variant="outline"
            onClick={() => window.location.href = "/"}
            className="w-full border-white/10 text-white hover:bg-white/5 h-12 rounded-2xl font-bold"
          >
            Ir al Inicio
          </Button>
        </div>

        {error.digest && (
          <p className="mt-8 text-[10px] text-white/20 font-mono uppercase tracking-widest">
            Error ID: {error.digest}
          </p>
        )}
      </div>
    </div>
  );
}
