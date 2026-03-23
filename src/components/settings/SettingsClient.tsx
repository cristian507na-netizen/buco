"use client";

import React, { useState } from 'react';
import { 
  Sun, Moon, Monitor, 
  Globe, 
  Coins, 
  Clock, 
  Bell, 
  Mail, 
  Smartphone, 
  Zap,
  MessageCircle, 
  Send, 
  AtSign,
  Download, 
  Trash2,
  ChevronRight,
  Check,
  Plus,
  Loader2,
  X,
  ShieldAlert
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { updateUserSettings, updateNotificationSettings, deleteAccount } from "@/app/settings/actions";
// Removed toast to avoid dependency issues if not installed
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger,
  DialogFooter
} from "@/components/ui/dialog";

interface SettingsClientProps {
  userSettings: any;
  notificationSettings: any;
  userEmail: string;
}

export function SettingsClient({ userSettings, notificationSettings, userEmail }: SettingsClientProps) {
  const [theme, setTheme] = useState(userSettings?.theme || 'system');
  const [language, setLanguage] = useState(userSettings?.language || 'es');
  const [currency, setCurrency] = useState(userSettings?.currency || 'MXN');
  const [timezone, setTimezone] = useState(userSettings?.timezone || 'America/Mexico_City');
  
  const [notifications, setNotifications] = useState(notificationSettings || {});
  const [loading, setLoading] = useState<string | null>(null);

  const [deleteConfirmText, setDeleteConfirmText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  const [activeDialog, setActiveDialog] = useState<string | null>(null);

  const handleUpdateUserSetting = async (key: string, value: any) => {
    setLoading(key);
    const result = await updateUserSettings({ [key]: value });
    setLoading(null);
    if (result.success) {
      if (key === 'theme') {
         document.documentElement.classList.toggle('dark', value === 'dark' || (value === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches));
      }
    }
  };

  const handleToggleNotification = async (key: string) => {
    const newValue = !notifications[key];
    setNotifications({ ...notifications, [key]: newValue });
    const result = await updateNotificationSettings({ [key]: newValue });
    if (!result.success) {
      setNotifications({ ...notifications, [key]: !newValue });
    }
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirmText !== "ELIMINAR") return;
    setIsDeleting(true);
    await deleteAccount();
  };

  return (
    <div className="min-h-screen bg-background pb-32 page-transition">
       {/* 🚀 Header */}
       <div className="section-hero">
          <div className="absolute inset-0 bg-white/5 backdrop-blur-[1px]" />
          <div className="max-w-4xl mx-auto relative z-10">
             <h1 className="text-4xl font-black text-white tracking-tight italic uppercase">Configuración</h1>
             <p className="text-white/60 font-bold uppercase tracking-widest text-[10px]">Personaliza tu experiencia Buco</p>
          </div>
       </div>

       <div className="px-6 -mt-12 z-20 max-w-4xl mx-auto w-full space-y-6">
          
          {/* GRUPO 1 — APARIENCIA */}
          <section className="buco-card bg-card p-8 shadow-2xl border-none space-y-8">
             <div className="flex items-center gap-3 border-b border-gray-100 pb-4">
                <div className="h-10 w-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
                   <Sun className="w-5 h-5" />
                </div>
                <h2 className="text-xl font-black uppercase tracking-tighter italic">Apariencia</h2>
             </div>

             <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Tema */}
                <div className="space-y-3">
                   <Label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Tema</Label>
                   <div className="grid grid-cols-3 gap-2 bg-gray-50 p-1 rounded-2xl border border-gray-100">
                      {[
                        { id: 'light', icon: Sun, label: 'Claro' },
                        { id: 'dark', icon: Moon, label: 'Oscuro' },
                        { id: 'system', icon: Monitor, label: 'Sistema' }
                      ].map((t) => (
                        <button
                          key={t.id}
                          onClick={() => { setTheme(t.id); handleUpdateUserSetting('theme', t.id); }}
                          className={cn(
                            "flex flex-col items-center justify-center py-3 rounded-xl transition-all border-none cursor-pointer",
                            theme === t.id 
                              ? "bg-white text-primary shadow-sm" 
                              : "text-gray-400 hover:text-gray-600 bg-transparent"
                          )}
                        >
                           <t.icon className={cn("w-4 h-4 mb-1", theme === t.id && "animate-pulse")} />
                           <span className="text-[9px] font-black uppercase tracking-widest">{t.label}</span>
                        </button>
                      ))}
                   </div>
                </div>

                {/* Idioma */}
                <div className="space-y-3">
                   <Label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Idioma</Label>
                   <Select value={language} onValueChange={(v) => { setLanguage(v); handleUpdateUserSetting('language', v); }}>
                      <SelectTrigger className="h-14 rounded-2xl border-gray-100 bg-gray-50 font-bold">
                         <SelectValue placeholder="Seleccionar idioma" />
                      </SelectTrigger>
                      <SelectContent>
                         <SelectItem value="es">Español 🇲🇽</SelectItem>
                         <SelectItem value="en">English 🇺🇸</SelectItem>
                      </SelectContent>
                   </Select>
                </div>

                {/* Moneda */}
                <div className="space-y-3">
                   <Label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Moneda Principal</Label>
                   <Select value={currency} onValueChange={(v) => { setCurrency(v); handleUpdateUserSetting('currency', v); }}>
                      <SelectTrigger className="h-14 rounded-2xl border-gray-100 bg-gray-50 font-bold">
                         <SelectValue placeholder="Seleccionar moneda" />
                      </SelectTrigger>
                      <SelectContent>
                         <SelectItem value="MXN">🇲🇽 MXN - Peso Mexicano</SelectItem>
                         <SelectItem value="USD">🇺🇸 USD - Dólar Estadounidense</SelectItem>
                         <SelectItem value="EUR">🇪🇺 EUR - Euro</SelectItem>
                         <SelectItem value="COP">🇨🇴 COP - Peso Colombiano</SelectItem>
                         <SelectItem value="ARS">🇦🇷 ARS - Peso Argentino</SelectItem>
                      </SelectContent>
                   </Select>
                </div>

                {/* Zona Horaria */}
                <div className="space-y-3">
                   <Label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Zona Horaria</Label>
                   <Select value={timezone} onValueChange={(v) => { setTimezone(v); handleUpdateUserSetting('timezone', v); }}>
                      <SelectTrigger className="h-14 rounded-2xl border-gray-100 bg-gray-50 font-bold">
                         <SelectValue placeholder="Seleccionar zona horaria" />
                      </SelectTrigger>
                      <SelectContent>
                         <SelectItem value="America/Mexico_City">Mexico City (CST)</SelectItem>
                         <SelectItem value="America/Bogota">Bogotá (EST)</SelectItem>
                         <SelectItem value="America/Argentina/Buenos_Aires">Buenos Aires (ART)</SelectItem>
                         <SelectItem value="America/New_York">New York (EST)</SelectItem>
                         <SelectItem value="Europe/Madrid">Madrid (CET)</SelectItem>
                      </SelectContent>
                   </Select>
                </div>
             </div>
          </section>

          {/* GRUPO 2 — NOTIFICACIONES Y ALERTAS */}
          <section className="buco-card bg-card p-8 shadow-2xl border-none space-y-6">
             <div className="flex items-center gap-3 border-b border-gray-100 pb-4">
                <div className="h-10 w-10 rounded-xl bg-orange-50 flex items-center justify-center text-orange-600">
                   <Bell className="w-5 h-5" />
                </div>
                <h2 className="text-xl font-black uppercase tracking-tighter italic">Notificaciones y Alertas</h2>
             </div>

             <div className="space-y-8">
                {/* Email Group */}
                <div className="space-y-4">
                   <h3 className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.2em] text-gray-400 italic">
                      <Mail className="w-3 h-3" /> E-mail
                   </h3>
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {[
                        { id: 'email_weekly', label: 'Resumen semanal de finanzas' },
                        { id: 'email_cut_date', label: 'Alerta fecha corte tarjeta' },
                        { id: 'email_pay_date', label: 'Alerta fecha límite de pago' },
                        { id: 'email_goal_complete', label: 'Meta completada' },
                        { id: 'email_limit_exceeded', label: 'Gastos superan límite' }
                      ].map((opt) => (
                        <div key={opt.id} className="flex items-center justify-between p-4 rounded-2xl bg-gray-50 border border-gray-100">
                           <span className="text-xs font-bold text-gray-700">{opt.label}</span>
                           <button 
                             onClick={() => handleToggleNotification(opt.id)}
                             className={cn(
                               "h-6 w-11 rounded-full p-1 transition-all border-none cursor-pointer",
                               notifications[opt.id] ? "bg-emerald-500" : "bg-gray-200"
                             )}
                           >
                              <div className={cn("h-4 w-4 rounded-full bg-white transition-all transform", notifications[opt.id] ? "translate-x-5" : "translate-x-0")} />
                           </button>
                        </div>
                      ))}
                   </div>
                </div>

                {/* Push group */}
                <div className="space-y-4">
                   <h3 className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.2em] text-gray-400 italic">
                      <Smartphone className="w-3 h-3" /> Push & Instantáneas
                   </h3>
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {[
                        { id: 'push_reminders', label: 'Recordatorios de pago' },
                        { id: 'push_whatsapp_confirm', label: 'Confirmación WhatsApp/Telegram' },
                        { id: 'push_goal_risk', label: 'Alertas de metas en riesgo' }
                      ].map((opt) => (
                        <div key={opt.id} className="flex items-center justify-between p-4 rounded-2xl bg-gray-50 border border-gray-100">
                           <span className="text-xs font-bold text-gray-700">{opt.label}</span>
                           <button 
                             onClick={() => handleToggleNotification(opt.id)}
                             className={cn(
                               "h-6 w-11 rounded-full p-1 transition-all border-none cursor-pointer",
                               notifications[opt.id] ? "bg-emerald-500" : "bg-gray-200"
                             )}
                           >
                              <div className={cn("h-4 w-4 rounded-full bg-white transition-all transform", notifications[opt.id] ? "translate-x-5" : "translate-x-0")} />
                           </button>
                        </div>
                      ))}
                   </div>
                </div>

                {/* Smart group */}
                <div className="space-y-4">
                   <h3 className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.2em] text-gray-400 italic">
                      <Zap className="w-3 h-3" /> Alertas Inteligentes (IA)
                   </h3>
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {[
                        { id: 'alert_unusual_expense', label: 'Detección de gasto inusual' },
                        { id: 'alert_monthly_summary', label: 'Resumen mensual con IA' },
                        { id: 'alert_low_balance', label: 'Alerta balance bajo $0' }
                      ].map((opt) => (
                        <div key={opt.id} className="flex items-center justify-between p-4 rounded-2xl bg-gray-50 border border-gray-100">
                           <span className="text-xs font-bold text-gray-700">{opt.label}</span>
                           <button 
                             onClick={() => handleToggleNotification(opt.id)}
                             className={cn(
                               "h-6 w-11 rounded-full p-1 transition-all border-none cursor-pointer",
                               notifications[opt.id] ? "bg-emerald-500" : "bg-gray-200"
                             )}
                           >
                              <div className={cn("h-4 w-4 rounded-full bg-white transition-all transform", notifications[opt.id] ? "translate-x-5" : "translate-x-0")} />
                           </button>
                        </div>
                      ))}
                   </div>
                </div>
             </div>
          </section>

          {/* GRUPO 3 — CONEXIONES */}
          <section className="buco-card bg-card p-8 shadow-2xl border-none space-y-6">
             <div className="flex items-center gap-3 border-b border-gray-100 pb-4">
                <div className="h-10 w-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600">
                   <MessageCircle className="w-5 h-5" />
                </div>
                <h2 className="text-xl font-black uppercase tracking-tighter italic">Conexiones</h2>
             </div>

             <div className="space-y-4">
                {/* WhatsApp */}
                <div className="buco-card bg-gray-50 p-6 flex flex-col md:flex-row md:items-center justify-between gap-6 border border-gray-100 shadow-none">
                   <div className="flex items-center gap-4">
                      <div className="h-12 w-12 rounded-2xl bg-[#25D366] flex items-center justify-center text-white shadow-lg shadow-emerald-500/20">
                         <MessageCircle className="w-6 h-6" />
                      </div>
                      <div>
                         <h3 className="font-black text-sm uppercase">WhatsApp Messenger</h3>
                         <div className="flex items-center gap-1.5 pt-0.5">
                            <div className={cn("h-2 w-2 rounded-full", userSettings?.whatsapp_connected ? "bg-emerald-500" : "bg-gray-300")} />
                            <span className="text-[10px] font-black uppercase text-gray-400 tracking-widest">{userSettings?.whatsapp_connected ? "Conectado" : "Desconectado"}</span>
                         </div>
                      </div>
                   </div>
                   
                   <Dialog open={activeDialog === 'whatsapp'} onOpenChange={(o) => setActiveDialog(o ? 'whatsapp' : null)}>
                      <DialogTrigger>
                         <Button variant={userSettings?.whatsapp_connected ? "outline" : "default"} className={cn("rounded-xl font-black text-[10px] uppercase tracking-widest h-12 px-6", !userSettings?.whatsapp_connected && "bg-emerald-500 hover:bg-emerald-600")}>
                            {userSettings?.whatsapp_connected ? "Desconectar" : "Conectar WhatsApp"}
                         </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-md rounded-[2rem] border-none shadow-2xl">
                         <DialogHeader>
                            <DialogTitle className="text-2xl font-black italic uppercase">Vincular WhatsApp</DialogTitle>
                            <DialogDescription className="font-bold text-gray-500">Sigue estos pasos para registrar gastos con tu voz o texto:</DialogDescription>
                         </DialogHeader>
                         <div className="space-y-4 py-4">
                            {[
                               "Agrega este número: +1 (555) 012-3411",
                               "Manda 'Hola Buco' para activar tu cuenta",
                               "Registra gastos así: 'gasté $150 en comida'",
                               "Buco confirmará cada registro automáticamente"
                            ].map((step, i) => (
                               <div key={i} className="flex gap-3">
                                  <div className="h-6 w-6 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center text-[10px] font-black shrink-0">{i+1}</div>
                                  <p className="text-xs font-bold text-gray-600">{step}</p>
                               </div>
                            ))}
                         </div>
                      </DialogContent>
                   </Dialog>
                </div>

                {/* Telegram */}
                <div className="buco-card bg-gray-50 p-6 flex flex-col md:flex-row md:items-center justify-between gap-6 border border-gray-100 shadow-none">
                   <div className="flex items-center gap-4">
                      <div className="h-12 w-12 rounded-2xl bg-[#0088cc] flex items-center justify-center text-white shadow-lg shadow-blue-500/20">
                         <Send className="w-6 h-6" />
                      </div>
                      <div>
                         <h3 className="font-black text-sm uppercase">Telegram Bot</h3>
                         <div className="flex items-center gap-1.5 pt-0.5">
                            <div className={cn("h-2 w-2 rounded-full", userSettings?.telegram_connected ? "bg-emerald-500" : "bg-gray-300")} />
                            <span className="text-[10px] font-black uppercase text-gray-400 tracking-widest">{userSettings?.telegram_connected ? "Conectado" : "Desconectado"}</span>
                         </div>
                      </div>
                   </div>
                   
                   <Dialog open={activeDialog === 'telegram'} onOpenChange={(o) => setActiveDialog(o ? 'telegram' : null)}>
                      <DialogTrigger>
                         <Button variant={userSettings?.telegram_connected ? "outline" : "default"} className={cn("rounded-xl font-black text-[10px] uppercase tracking-widest h-12 px-6", !userSettings?.telegram_connected && "bg-[#0088cc] hover:bg-[#0077b5]")}>
                            {userSettings?.telegram_connected ? "Desconectar" : "Conectar Telegram"}
                         </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-md rounded-[2rem] border-none shadow-2xl">
                         <DialogHeader>
                            <DialogTitle className="text-2xl font-black italic uppercase">Vincular Telegram</DialogTitle>
                         </DialogHeader>
                         <div className="space-y-4 py-4 text-center">
                            <p className="text-xs font-bold text-gray-500">Busca <span className="text-[#0088cc]">@BucoFinanzasBot</span> y envía este código:</p>
                            <div className="p-6 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200 text-3xl font-black tracking-widest text-primary font-mono select-all">
                               BC-9921
                            </div>
                            <p className="text-[10px] font-bold text-gray-400 uppercase">El bot confirmará la vinculación al instante</p>
                         </div>
                      </DialogContent>
                   </Dialog>
                </div>
             </div>
          </section>

          {/* GRUPO 4 — FINANZAS */}
          <section className="buco-card bg-card p-8 shadow-2xl border-none space-y-6">
             <div className="flex items-center gap-3 border-b border-gray-100 pb-4">
                <div className="h-10 w-10 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600">
                   <Coins className="w-5 h-5" />
                </div>
                <h2 className="text-xl font-black uppercase tracking-tighter italic">Finanzas</h2>
             </div>

             <div className="flex items-center justify-between p-4 rounded-2xl bg-gray-50 border border-gray-100">
                <div className="flex flex-col gap-1">
                   <span className="text-xs font-bold text-gray-700">Incluir crédito en balance total</span>
                   <span className="text-[10px] text-gray-400 font-medium">Suma el crédito disponible al saldo disponible general</span>
                </div>
                <button 
                  onClick={() => handleUpdateUserSetting('include_credit_in_balance', !userSettings?.include_credit_in_balance)}
                  className={cn(
                    "h-6 w-11 rounded-full p-1 transition-all border-none cursor-pointer",
                    userSettings?.include_credit_in_balance ? "bg-indigo-500" : "bg-gray-200"
                  )}
                >
                   <div className={cn("h-4 w-4 rounded-full bg-white transition-all transform", userSettings?.include_credit_in_balance ? "translate-x-5" : "translate-x-0")} />
                </button>
             </div>
          </section>

          {/* GRUPO 5 — PRIVACIDAD Y DATOS */}
          <section className="buco-card bg-card p-8 shadow-2xl border-none space-y-6">
             <div className="flex items-center gap-3 border-b border-gray-100 pb-4">
                <div className="h-10 w-10 rounded-xl bg-gray-50 flex items-center justify-center text-gray-600">
                   <ShieldAlert className="w-5 h-5" />
                </div>
                <h2 className="text-xl font-black uppercase tracking-tighter italic">Privacidad y Datos</h2>
             </div>

             <div className="flex flex-col md:flex-row gap-4">
                <Button className="flex-1 bg-gray-900 hover:bg-black text-white rounded-2xl h-16 font-black uppercase text-[10px] tracking-widest group shadow-xl">
                   <Download className="w-4 h-4 mr-2 group-hover:animate-bounce" /> Exportar todos mis datos
                </Button>

                <Dialog open={activeDialog === 'delete'} onOpenChange={(o) => setActiveDialog(o ? 'delete' : null)}>
                   <DialogTrigger>
                      <Button variant="outline" className="flex-1 border-red-100 text-red-500 hover:bg-red-50 hover:text-red-600 rounded-2xl h-16 font-black uppercase text-[10px] tracking-widest">
                         <Trash2 className="w-4 h-4 mr-2" /> Eliminar mi cuenta
                      </Button>
                   </DialogTrigger>
                   <DialogContent className="max-w-md rounded-[2rem] border-none shadow-2xl">
                      <DialogHeader>
                         <DialogTitle className="text-2xl font-black italic uppercase text-red-600">Acción Irreversible</DialogTitle>
                         <DialogDescription className="font-bold">¿Estás seguro de que quieres eliminar tu cuenta? Todos tus datos se borrarán permanentemente.</DialogDescription>
                      </DialogHeader>
                      <div className="py-4 space-y-3 text-center">
                         <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Escribe <span className="text-red-500">ELIMINAR</span> para confirmar:</p>
                         <Input 
                           value={deleteConfirmText} 
                           onChange={(e) => setDeleteConfirmText(e.target.value.toUpperCase())}
                           className="text-center h-14 rounded-2xl font-black text-xl tracking-widest border-red-200 focus:border-red-500"
                           placeholder="ELIMINAR"
                         />
                      </div>
                      <DialogFooter>
                         <Button 
                           variant="destructive" 
                           onClick={handleDeleteAccount}
                           disabled={deleteConfirmText !== "ELIMINAR" || isDeleting}
                           className="w-full rounded-2xl h-14 font-black uppercase tracking-widest"
                         >
                            {isDeleting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Trash2 className="w-4 h-4 mr-2" />}
                            Confirmar Eliminación Total
                         </Button>
                      </DialogFooter>
                   </DialogContent>
                </Dialog>
             </div>
          </section>

       </div>

       <style jsx global>{`
        .section-hero {
          background: var(--buco-gradient);
          border-bottom-left-radius: 40px;
          border-bottom-right-radius: 40px;
        }
        .buco-card { border-radius: 2rem; border: 1px solid rgba(0,0,0,0.05); }
        .dark .buco-card { border: 1px solid rgba(255,255,255,0.1); }
      `}</style>
    </div>
  );
}
