"use client";

import { Suspense, useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { motion, useMotionValue, useTransform, AnimatePresence } from "framer-motion";
import { Eye, EyeOff, AlertCircle, ShieldCheck } from "lucide-react";
import { signup } from "@/app/auth/actions";
import { SubmitButton } from "@/components/auth/submit-button";

function SignupContent() {
  const searchParams = useSearchParams();
  const message = searchParams.get("message");
  const [showPassword, setShowPassword] = useState(false);
  const [visible, setVisible] = useState(false);

  useEffect(() => { setVisible(true); }, []);

  const cardRef = useRef<HTMLDivElement>(null);
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const rotateX = useTransform(mouseY, [-0.5, 0.5], [6, -6]);
  const rotateY = useTransform(mouseX, [-0.5, 0.5], [-6, 6]);

  function handleMouseMove(e: React.MouseEvent<HTMLDivElement>) {
    const rect = cardRef.current?.getBoundingClientRect();
    if (!rect) return;
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    mouseX.set(x);
    mouseY.set(y);
  }

  function handleMouseLeave() {
    mouseX.set(0);
    mouseY.set(0);
  }

  return (
    <div className="min-h-screen w-full flex items-center justify-center relative overflow-hidden bg-[#060913] pt-24 pb-12 px-4 md:py-12">
      {/* Background gradients */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-blue-600/20 rounded-full blur-[120px]" />
        <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-blue-500/15 rounded-full blur-[120px]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-700/8 rounded-full blur-[180px]" />
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)",
            backgroundSize: "50px 50px",
          }}
        />
      </div>
 
      {/* Logo */}
      <div className="absolute top-6 left-0 right-0 md:left-8 md:right-auto md:top-8 z-50 flex justify-center md:justify-start">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={visible ? { opacity: 1, y: 0 } : { opacity: 0, y: -20 }}
          transition={{ duration: 0.5 }}
        >
          <Link href="/welcome" className="flex items-center gap-2 group">
            <div className="h-9 w-9 rounded-xl bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-600/40 group-hover:scale-110 transition-transform">
              <span className="text-white font-black italic text-lg">B</span>
            </div>
            <span className="text-white font-bold text-lg tracking-tight">Buco</span>
          </Link>
        </motion.div>
      </div>

      {/* Card */}
      <motion.div
        ref={cardRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        style={{ rotateX, rotateY, transformPerspective: 1200 }}
        initial={{ opacity: 0, y: 40 }}
        animate={visible ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }}
        transition={{ duration: 0.6, ease: [0.23, 1, 0.32, 1] }}
        className="relative w-full max-w-sm"
      >
        {/* Animated border light beams */}
        <div className="absolute inset-0 rounded-[28px] overflow-hidden pointer-events-none">
          <motion.div
            className="absolute w-24 h-[2px] bg-gradient-to-r from-transparent via-blue-400 to-transparent opacity-70"
            animate={{ left: ["-10%", "110%"], top: ["0%", "0%"] }}
            transition={{ duration: 2.8, repeat: Infinity, repeatDelay: 1.5, ease: "easeInOut" }}
          />
          <motion.div
            className="absolute h-24 w-[2px] bg-gradient-to-b from-transparent via-blue-400 to-transparent opacity-70"
            animate={{ top: ["-10%", "110%"], right: ["0%", "0%"] }}
            transition={{ duration: 2.8, repeat: Infinity, repeatDelay: 1.5, delay: 1.4, ease: "easeInOut" }}
          />
          <motion.div
            className="absolute w-24 h-[2px] bg-gradient-to-r from-transparent via-blue-300 to-transparent opacity-50"
            animate={{ right: ["-10%", "110%"], bottom: ["0%", "0%"] }}
            transition={{ duration: 2.8, repeat: Infinity, repeatDelay: 1.5, delay: 0.7, ease: "easeInOut" }}
          />
          <motion.div
            className="absolute h-24 w-[2px] bg-gradient-to-b from-transparent via-blue-400 to-transparent opacity-60"
            animate={{ bottom: ["-10%", "110%"], left: ["0%", "0%"] }}
            transition={{ duration: 2.8, repeat: Infinity, repeatDelay: 1.5, delay: 2.1, ease: "easeInOut" }}
          />
        </div>

        {/* Corner glows */}
        <motion.div
          className="absolute -top-1 -left-1 w-16 h-16 bg-blue-500/30 rounded-full blur-xl pointer-events-none"
          animate={{ opacity: [0.3, 0.7, 0.3], scale: [0.9, 1.1, 0.9] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute -bottom-1 -right-1 w-16 h-16 bg-blue-400/20 rounded-full blur-xl pointer-events-none"
          animate={{ opacity: [0.2, 0.5, 0.2], scale: [1, 1.2, 1] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut", delay: 1.5 }}
        />

        {/* Card body */}
        <div className="relative bg-black/40 backdrop-blur-xl border border-white/10 rounded-[28px] p-8 shadow-2xl shadow-black/60">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-2xl font-black text-white tracking-tight">Crear Cuenta</h1>
            <p className="text-gray-400 text-sm mt-1 font-medium">Únete a la nueva era financiera</p>
          </div>

          <form action={signup} className="flex flex-col gap-4">
            <AnimatePresence>
              {message && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm px-4 py-3 rounded-2xl flex items-center gap-3"
                >
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <span className="font-semibold">{message}</span>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Full name */}
            <div className="flex flex-col gap-1.5">
              <label htmlFor="full_name" className="text-xs font-black uppercase tracking-widest text-gray-400 pl-1">
                Nombre Completo
              </label>
              <input
                id="full_name"
                name="full_name"
                type="text"
                placeholder="Carlos Pérez"
                required
                className="h-12 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-gray-600 px-4 text-sm focus:outline-none focus:border-blue-500/60 focus:ring-2 focus:ring-blue-500/20 transition-all"
              />
            </div>

            {/* Email */}
            <div className="flex flex-col gap-1.5">
              <label htmlFor="email" className="text-xs font-black uppercase tracking-widest text-gray-400 pl-1">
                Correo Electrónico
              </label>
              <input
                id="email"
                name="email"
                type="email"
                placeholder="tu@email.com"
                required
                className="h-12 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-gray-600 px-4 text-sm focus:outline-none focus:border-blue-500/60 focus:ring-2 focus:ring-blue-500/20 transition-all"
              />
            </div>

            {/* Password */}
            <div className="flex flex-col gap-1.5">
              <label htmlFor="password" className="text-xs font-black uppercase tracking-widest text-gray-400 pl-1">
                Contraseña
              </label>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  required
                  className="w-full h-12 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-gray-600 px-4 pr-11 text-sm focus:outline-none focus:border-blue-500/60 focus:ring-2 focus:ring-blue-500/20 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {/* Security note */}
            <div className="flex items-start gap-3 p-3.5 rounded-xl bg-blue-600/8 border border-blue-500/20">
              <ShieldCheck className="h-4 w-4 text-blue-400 shrink-0 mt-0.5" />
              <p className="text-[10px] text-gray-400 font-medium leading-relaxed uppercase tracking-tight">
                Tus datos financieros están 100% seguros con encriptación de grado bancario.
              </p>
            </div>

            {/* Submit */}
            <SubmitButton
              className="w-full h-12 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm mt-1 transition-all active:scale-[0.98] shadow-lg shadow-blue-600/30"
              loadingText="Creando tu cuenta..."
            >
              Empezar Ahora
            </SubmitButton>
          </form>

          <p className="mt-6 text-center text-sm text-gray-400">
            ¿Ya tienes cuenta?{" "}
            <Link href="/login" className="font-bold text-blue-400 hover:text-blue-300 transition-colors underline underline-offset-4">
              Inicia sesión
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}

export default function SignupPage() {
  return (
    <Suspense
      fallback={
        <div className="flex h-screen w-screen items-center justify-center bg-[#060913]">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-500 border-t-transparent" />
        </div>
      }
    >
      <SignupContent />
    </Suspense>
  );
}
