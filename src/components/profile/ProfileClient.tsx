"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Check, Lock, Target, ChevronRight, MessageCircle, Send,
  Settings, Bell, Download, LogOut, Plus, CreditCard,
  Zap, Clock, Wallet
} from 'lucide-react';
import { calculateGoalProgress, calculateRealAmount } from '@/lib/goalProgress';
import { signOut } from '@/app/auth/actions';
import { cn } from '@/lib/utils';
import { ProfileHero } from './ProfileHero';
import { PlansModal } from './PlansModal';
import { NotificationsModal } from '@/components/modals/NotificationsModal';
import { updateNotificationPreferences } from '@/app/notifications/actions';
import { updateWhatsAppNumber } from '@/app/profile/actions';

interface ProfileClientProps {
  profile: any;
  userEmail: string;
  activeGoals: any[];
}

export function ProfileClient({ profile, userEmail, activeGoals }: ProfileClientProps) {
  const router = useRouter();
  const [isPlansModalOpen, setIsPlansModalOpen] = useState(false);
  const [preferences, setPreferences] = useState<any>(
    profile?.notification_preferences ?? { budget: true, reminder: true, goal: true, balance: true, card: true }
  );
  const [whatsappPhone, setWhatsappPhone] = useState(profile?.whatsapp_numero || "");
  const [isSavingWhatsapp, setIsSavingWhatsapp] = useState(false);
  const [whatsappError, setWhatsappError] = useState("");
  const [successToast, setSuccessToast] = useState<string | null>(null);

  const showSuccessToast = (msg: string) => {
    setSuccessToast(msg);
    setTimeout(() => setSuccessToast(null), 3000);
  };

  React.useEffect(() => {
    if (profile?.notification_preferences) setPreferences(profile.notification_preferences);
  }, [profile]);

  const handleTogglePreference = async (key: string) => {
    const next = { ...preferences, [key]: !preferences[key] };
    setPreferences(next);
    await updateNotificationPreferences(next);
  };

  const handleSaveWhatsApp = async () => {
    setWhatsappError("");
    const cleaned = whatsappPhone.replace(/[^\d+]/g, '');
    const digitCount = cleaned.replace(/\D/g, '').length;
    
    if (digitCount < 8 || digitCount > 15) {
      setWhatsappError("Ingresa un número válido con código de país.");
      return;
    }

    setIsSavingWhatsapp(true);
    const res = await updateWhatsAppNumber(cleaned);
    setIsSavingWhatsapp(false);

    if (res.error) {
      setWhatsappError(res.error);
    } else {
      showSuccessToast("Número de WhatsApp guardado correctamente.");
      router.refresh();
    }
  };

  const totalSaved = activeGoals.reduce((acc, g) => acc + Number(g.current_amount || 0), 0);
  const stats = [
    { label: "Racha actual", value: profile?.streak_days > 0 ? `${profile.streak_days}` : "0", sub: "🔥", note: "días seguidos", color: "text-orange-500", bg: "bg-orange-500/10" },
    { label: "Días activo", value: `${profile?.total_active_days || 0}`, sub: "📅", note: "días en total", color: "text-blue-500", bg: "bg-blue-500/10" },
    { label: "Ahorro en metas", value: `$${totalSaved.toLocaleString()}`, sub: "💰", note: "total acumulado", color: "text-emerald-500", bg: "bg-emerald-500/10" },
  ];

  const quickActions = [
    { label: "Configuración", icon: Settings, href: "/settings" },
    { label: "Notificaciones y alertas", icon: Bell, href: "/notifications" },
    { label: "Exportar mis datos", icon: Download, href: "/api/export" },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-[var(--bg-global)] pb-32 page-transition">
      {/* Success toast */}
      {successToast && (
        <div className="fixed top-5 left-1/2 -translate-x-1/2 z-[9999] bg-emerald-500 text-white text-xs font-black px-5 py-3 rounded-2xl shadow-2xl shadow-emerald-500/30 flex items-center gap-2 pointer-events-none">
          <Check className="w-4 h-4" />
          {successToast}
        </div>
      )}

      {/* Hero */}
      <div className="buco-bg rounded-b-[40px] shadow-xl overflow-hidden">
        <ProfileHero profile={profile} userEmail={userEmail} />
      </div>

      <div className="max-w-2xl mx-auto w-full px-4 mt-6 space-y-4">

        {/* Stats Row */}
        <div className="grid grid-cols-3 gap-3">
          {stats.map((s, i) => (
            <div key={i} className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-2xl p-3 flex flex-col items-center text-center gap-1 shadow-sm">
              <span className="text-xl">{s.sub}</span>
              <p className={cn("text-lg font-black leading-none tracking-tighter", s.color)}>{s.value}</p>
              <p className="text-[9px] font-black text-[var(--text-muted)] uppercase tracking-widest leading-none">{s.label}</p>
            </div>
          ))}
        </div>

        {/* WhatsApp Registration */}
        <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-3xl overflow-hidden shadow-sm">
          <div className="p-5 border-b border-[var(--border-color)] flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-[#25D366]/10 flex items-center justify-center">
                <MessageCircle className="w-5 h-5 text-[#25D366]" />
              </div>
              <div>
                <h3 className="text-sm font-black text-[var(--text-primary)] leading-none uppercase tracking-tight">Registro de WhatsApp</h3>
                <p className="text-[10px] text-[var(--text-muted)] font-bold uppercase tracking-widest mt-1">Conecta tu cuenta</p>
              </div>
            </div>
            <div className={cn(
              "px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest",
              profile?.whatsapp_connected ? "bg-emerald-500/10 text-emerald-500" : "bg-[var(--bg-secondary)] text-[var(--text-muted)]"
            )}>
              {profile?.whatsapp_connected ? "Conectado" : "Sin conectar"}
            </div>
          </div>
          
          <div className="p-5 space-y-3">
            <div className="flex gap-2">
              <div className="relative flex-1">
                <input
                  type="text"
                  placeholder="50712345678"
                  value={whatsappPhone}
                  onChange={(e) => setWhatsappPhone(e.target.value)}
                  className={cn(
                    "w-full bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-xl px-4 py-3 text-sm font-bold text-[var(--text-primary)] outline-none focus:border-blue-500/50 transition-all placeholder:font-normal",
                    whatsappError && "border-red-500/50"
                  )}
                />
              </div>
              <button
                onClick={handleSaveWhatsApp}
                disabled={isSavingWhatsapp}
                className="h-[46px] w-[46px] rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white flex items-center justify-center transition-all shadow-lg shadow-blue-500/20"
              >
                {isSavingWhatsapp ? <Clock className="w-5 h-5 animate-spin" /> : <Check className="w-5 h-5" />}
              </button>
            </div>
            
            {whatsappError && <p className="text-[10px] font-bold text-red-500 uppercase tracking-wide">{whatsappError}</p>}
            
            <p className="text-[10px] text-[var(--text-muted)] font-bold italic leading-relaxed">
              Registra tu número de WhatsApp para poder registrar gastos enviando un mensaje.
              <br />
              <span className="text-blue-500/80">Uso: Código de país + número (ej: 50765657899). Sin espacios ni símbolos (+).</span>
            </p>
          </div>
        </div>

        {/* Plan Card */}
        <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-3xl overflow-hidden shadow-sm">
          <div className="p-5 flex items-center justify-between border-b border-[var(--border-color)]">
            <div className="flex items-center gap-3">
              <div className={cn(
                "h-10 w-10 rounded-xl flex items-center justify-center text-xl",
                profile?.plan === 'pro' ? "bg-purple-500/10" :
                profile?.plan === 'premium' ? "bg-amber-500/10" : "bg-[var(--bg-secondary)]"
              )}>
                {profile?.plan === 'pro' ? '👑' : profile?.plan === 'premium' ? '⭐' : '🌱'}
              </div>
              <div>
                <h3 className="text-sm font-black text-[var(--text-primary)] leading-none uppercase tracking-tight">
                  {profile?.plan === 'pro' ? 'Plan Pro' : profile?.plan === 'premium' ? 'Plan Premium' : 'Plan Free'}
                </h3>
                <p className="text-[10px] text-[var(--text-muted)] font-bold uppercase tracking-widest mt-0.5">
                  {profile?.plan === 'free' ? 'Plan actual' : 'Activo'}
                </p>
              </div>
            </div>
            {profile?.plan === 'free' ? (
              <button
                onClick={() => setIsPlansModalOpen(true)}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-colors"
              >
                Mejorar
              </button>
            ) : (
              <div className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500/10 rounded-lg">
                <Check className="w-3 h-3 text-emerald-500" />
                <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">Activo</span>
              </div>
            )}
          </div>

          <div className="p-5 grid grid-cols-1 sm:grid-cols-2 gap-3">
            {profile?.plan === 'pro' ? (<>
              <Benefit icon={Check} label="Metas y Cuentas ilimitadas" active />
              <Benefit icon={Check} label="Chat IA: 500 msgs / mes" active />
              <Benefit icon={Check} label="Reportes IA ilimitados" active />
              <Benefit icon={Check} label="Tendencias y Predicciones" active />
              <Benefit icon={Check} label="Exportación Excel/CSV" active />
              <Benefit icon={Check} label="Soporte VIP 24/7" active />
            </>) : profile?.plan === 'premium' ? (<>
              <Benefit icon={Check} label="Metas ilimitadas" active />
              <Benefit icon={Check} label="Hasta 10 cuentas" active />
              <Benefit icon={Check} label="3 reportes IA / mes" active />
              <Benefit icon={Check} label="50 mensajes IA / mes" active />
              <Benefit icon={Check} label="WhatsApp & Telegram" active />
              <Benefit icon={Check} label="Exportar PDF" active />
            </>) : (<>
              <Benefit icon={Check} label="Gastos ilimitados" active />
              <Benefit icon={Check} label="Hasta 4 metas activas" active />
              <Benefit icon={Check} label="Hasta 5 cuentas" active />
              <Benefit icon={Check} label="5 msgs IA / mes" active />
              <Benefit icon={Check} label="WhatsApp & Telegram" active />
              <Benefit icon={Lock} label="Análisis IA avanzado" active={false} />
            </>)}
          </div>

          <div className="px-5 pb-4">
            <button
              onClick={() => setIsPlansModalOpen(true)}
              className="text-[10px] text-blue-500 font-black uppercase tracking-widest hover:text-blue-400 transition-colors"
            >
              Ver todos los planes →
            </button>
          </div>
        </div>

        {/* Goals Preview */}
        <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-3xl overflow-hidden shadow-sm">
          <div className="px-5 py-4 flex items-center justify-between border-b border-[var(--border-color)]">
            <div>
              <h3 className="text-sm font-black text-[var(--text-primary)] uppercase tracking-tight leading-none">Mis Metas</h3>
              <p className="text-[10px] text-[var(--text-muted)] font-bold uppercase tracking-widest mt-0.5">Progreso actual</p>
            </div>
            <Link href="/goals" className="text-blue-500 text-[10px] font-black uppercase tracking-widest flex items-center gap-1 hover:gap-2 transition-all">
              Ver todas <ChevronRight className="w-3 h-3" />
            </Link>
          </div>

          <div className="p-4">
            {activeGoals.length > 0 ? (
              <div className="space-y-3">
                {activeGoals.slice(0, 3).map((goal, i) => {
                  const realAmount = calculateRealAmount(goal, [], []);
                  const progress = calculateGoalProgress(realAmount, Number(goal.target_amount));
                  const typeColor = goal.type === 'ahorro' ? 'bg-emerald-500' : goal.type === 'gastos' ? 'bg-orange-500' : 'bg-blue-500';
                  return (
                    <div
                      key={goal.id}
                      onClick={() => router.push(`/goals/${goal.id}`)}
                      className="flex items-center gap-3 p-3 rounded-2xl hover:bg-[var(--bg-secondary)] cursor-pointer transition-colors group"
                    >
                      <div className={cn("h-9 w-9 rounded-xl flex items-center justify-center text-white text-base shrink-0 group-hover:scale-110 transition-transform", typeColor)}>
                        {goal.icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1.5">
                          <p className="text-xs font-black text-[var(--text-primary)] uppercase tracking-tight truncate group-hover:text-blue-500 transition-colors">{goal.name}</p>
                          <span className="text-[10px] font-black text-[var(--text-muted)] ml-2 shrink-0">{progress}%</span>
                        </div>
                        <div className="h-1.5 w-full bg-[var(--bg-secondary)] rounded-full overflow-hidden">
                          <div className={cn("h-full rounded-full transition-all duration-700", typeColor)} style={{ width: `${progress}%` }} />
                        </div>
                      </div>
                      <ChevronRight className="w-3.5 h-3.5 text-[var(--text-muted)] group-hover:text-blue-500 shrink-0 transition-colors" />
                    </div>
                  );
                })}
              </div>
            ) : (
              <Link href="/goals" className="flex flex-col items-center justify-center py-8 text-center hover:bg-[var(--bg-secondary)] rounded-2xl transition-colors group">
                <div className="h-12 w-12 bg-[var(--bg-secondary)] rounded-full flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                  <Plus className="w-6 h-6 text-[var(--text-muted)]" />
                </div>
                <p className="text-xs font-black text-[var(--text-muted)] uppercase tracking-tight">Crea tu primera meta 🎯</p>
              </Link>
            )}
          </div>
        </div>

        {/* Connections */}
        <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-3xl overflow-hidden shadow-sm">
          <div className="px-5 py-4 border-b border-[var(--border-color)]">
            <h3 className="text-sm font-black text-[var(--text-primary)] uppercase tracking-tight leading-none">Conexiones</h3>
            <p className="text-[10px] text-[var(--text-muted)] font-bold uppercase tracking-widest mt-0.5">Integraciones activas</p>
          </div>
          <div className="p-4 flex items-center gap-4">
            <div className="flex-1 flex gap-6">
              <ConnectionBadge
                icon={MessageCircle}
                label="WhatsApp"
                color="#25D366"
                connected={profile?.whatsapp_connected}
              />
              <ConnectionBadge
                icon={Send}
                label="Telegram"
                color="#0088cc"
                connected={profile?.telegram_connected}
              />
            </div>
            <Link href="/settings" className="px-4 py-2 bg-[var(--bg-secondary)] hover:bg-[var(--bg-elevated)] border border-[var(--border-color)] rounded-xl text-[10px] font-black uppercase tracking-widest text-[var(--text-primary)] transition-colors">
              Gestionar
            </Link>
          </div>
        </div>

        {/* Notification Preferences */}
        <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-3xl overflow-hidden shadow-sm">
          <div className="px-5 py-4 border-b border-[var(--border-color)]">
            <h3 className="text-sm font-black text-[var(--text-primary)] uppercase tracking-tight leading-none">Alertas</h3>
            <p className="text-[10px] text-[var(--text-muted)] font-bold uppercase tracking-widest mt-0.5">Preferencias de notificación</p>
          </div>
          <div className="px-5 py-2 divide-y divide-[var(--border-color)]">
            <ProfileToggle icon={Zap} label="Límites de Presupuesto" checked={preferences.budget} onChange={() => handleTogglePreference('budget')} />
            <ProfileToggle icon={Clock} label="Recordatorios de Pago" checked={preferences.reminder} onChange={() => handleTogglePreference('reminder')} />
            <ProfileToggle icon={Target} label="Avance de Metas" checked={preferences.goal} onChange={() => handleTogglePreference('goal')} />
            <ProfileToggle icon={Wallet} label="Alertas de Saldo" checked={preferences.balance} onChange={() => handleTogglePreference('balance')} />
            <ProfileToggle icon={CreditCard} label="Tarjetas de Crédito" checked={preferences.card} onChange={() => handleTogglePreference('card')} />
          </div>
        </div>

        {/* Settings */}
        <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-3xl overflow-hidden shadow-sm">
          <div className="px-5 py-4 border-b border-[var(--border-color)]">
            <h3 className="text-sm font-black text-[var(--text-primary)] uppercase tracking-tight leading-none">Ajustes</h3>
          </div>
          <div className="py-1">
            {quickActions.map((action, idx) => {
              if (action.label === "Notificaciones y alertas" && profile?.id) {
                return (
                  <NotificationsModal
                    key={idx}
                    userId={profile.id}
                    trigger={
                      <div className="flex items-center justify-between px-5 py-3.5 hover:bg-[var(--bg-secondary)] transition-colors group cursor-pointer">
                        <div className="flex items-center gap-3">
                          <div className="h-8 w-8 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-color)] flex items-center justify-center transition-colors group-hover:border-blue-500/30">
                            <action.icon className="w-4 h-4 text-[var(--text-muted)]" />
                          </div>
                          <span className="text-sm font-bold text-[var(--text-primary)]">{action.label}</span>
                        </div>
                        <ChevronRight className="w-4 h-4 text-[var(--text-muted)] group-hover:text-blue-500 group-hover:translate-x-0.5 transition-all" />
                      </div>
                    }
                  />
                );
              }
              return (
                <Link
                  key={idx}
                  href={action.href}
                  className="flex items-center justify-between px-5 py-3.5 hover:bg-[var(--bg-secondary)] transition-colors group"
                >
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-color)] flex items-center justify-center transition-colors group-hover:border-blue-500/30">
                      <action.icon className="w-4 h-4 text-[var(--text-muted)]" />
                    </div>
                    <span className="text-sm font-bold text-[var(--text-primary)]">{action.label}</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-[var(--text-muted)] group-hover:text-blue-500 group-hover:translate-x-0.5 transition-all" />
                </Link>
              );
            })}

            <div className="h-px bg-[var(--border-color)] mx-4" />

            <form action={signOut}>
              <button
                type="submit"
                className="w-full flex items-center justify-between px-5 py-3.5 hover:bg-red-500/5 transition-colors group border-none bg-transparent cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center">
                    <LogOut className="w-4 h-4 text-red-500" />
                  </div>
                  <span className="text-sm font-black text-red-500">Cerrar sesión</span>
                </div>
                <ChevronRight className="w-4 h-4 text-red-300 group-hover:text-red-500 group-hover:translate-x-0.5 transition-all" />
              </button>
            </form>
          </div>
        </div>

        <p className="text-center text-[9px] text-[var(--text-muted)] font-bold uppercase tracking-[0.4em] pt-2 pb-4 opacity-50">
          Versión 2.1.0 • Buco Finance
        </p>
      </div>

      <PlansModal
        isOpen={isPlansModalOpen}
        onClose={() => setIsPlansModalOpen(false)}
        currentPlan={profile?.plan || 'free'}
      />
    </div>
  );
}

function Benefit({ icon: Icon, label, active }: { icon: any; label: string; active: boolean }) {
  return (
    <div className="flex items-center gap-2.5">
      <div className={cn(
        "h-5 w-5 rounded-full flex items-center justify-center shrink-0",
        active ? "bg-emerald-500/10 text-emerald-600" : "bg-[var(--bg-secondary)] text-[var(--text-muted)]"
      )}>
        <Icon className="w-3 h-3" />
      </div>
      <span className={cn("text-xs font-bold", active ? "text-[var(--text-primary)]" : "text-[var(--text-muted)]")}>
        {label}
      </span>
    </div>
  );
}

function ConnectionBadge({ icon: Icon, label, color, connected }: { icon: any; label: string; color: string; connected?: boolean }) {
  return (
    <div className="flex items-center gap-2.5">
      <div className="h-9 w-9 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${color}15` }}>
        <Icon className="w-4.5 h-4.5" style={{ color }} />
      </div>
      <div>
        <p className="text-xs font-black uppercase tracking-widest" style={{ color }}>{label}</p>
        <div className="flex items-center gap-1 mt-0.5">
          <div className={cn("h-1.5 w-1.5 rounded-full", connected ? "bg-emerald-500" : "bg-[var(--text-muted)]")} />
          <span className={cn("text-[9px] font-bold uppercase tracking-wide", connected ? "text-emerald-500" : "text-[var(--text-muted)]")}>
            {connected ? "Conectado" : "Desconectado"}
          </span>
        </div>
      </div>
    </div>
  );
}

function ProfileToggle({ icon: Icon, label, checked, onChange }: { icon: any; label: string; checked: boolean; onChange: () => void }) {
  return (
    <div className="flex items-center justify-between py-3">
      <div className="flex items-center gap-3">
        <div className="h-8 w-8 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-color)] flex items-center justify-center">
          <Icon className="w-4 h-4 text-[var(--text-muted)]" />
        </div>
        <span className="text-xs font-bold text-[var(--text-primary)] uppercase tracking-tight">{label}</span>
      </div>
      <button
        onClick={onChange}
        className={cn(
          "w-10 h-5.5 rounded-full relative transition-all duration-300 border-none cursor-pointer",
          checked ? "bg-blue-600" : "bg-[var(--bg-secondary)] border border-[var(--border-color)]"
        )}
        style={{ height: '1.375rem', width: '2.5rem' }}
      >
        <div className={cn(
          "absolute top-[3px] w-3.5 h-3.5 rounded-full bg-white transition-all duration-300 shadow-sm",
          checked ? "right-[3px]" : "left-[3px]"
        )} />
      </button>
    </div>
  );
}
