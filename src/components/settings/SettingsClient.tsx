"use client";

import React, { useState, useEffect } from 'react';
import {
  Sun, Moon, Monitor, Globe, Coins, Clock, Bell, Mail,
  Smartphone, Zap, MessageCircle, Send, Download, Trash2,
  Loader2, ShieldAlert, Settings2, ChevronRight, Wifi, WifiOff
} from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from "@/lib/utils";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Dialog, DialogContent, DialogDescription,
  DialogHeader, DialogTitle, DialogTrigger, DialogFooter
} from "@/components/ui/dialog";
import { updateUserSettings, updateNotificationSettings, deleteAccount } from "@/app/settings/actions";

interface SettingsClientProps {
  userSettings: any;
  notificationSettings: any;
  userEmail: string;
}

function Toggle({ enabled, onToggle }: { enabled: boolean; onToggle: () => void }) {
  return (
    <button
      onClick={onToggle}
      className={cn(
        "relative h-7 w-12 rounded-full transition-all duration-300 border-none cursor-pointer shrink-0",
        enabled ? "bg-blue-500" : "bg-[var(--bg-elevated)]"
      )}
    >
      <div className={cn(
        "absolute top-1 h-5 w-5 rounded-full bg-white shadow-md transition-all duration-300",
        enabled ? "left-6" : "left-1"
      )} />
    </button>
  );
}

function SectionCard({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn(
      "rounded-2xl bg-[var(--bg-card)] border border-[var(--border-color)] overflow-hidden",
      className
    )}>
      {children}
    </div>
  );
}

function SectionHeader({ icon: Icon, label, color }: { icon: any; label: string; color: string }) {
  return (
    <div className="flex items-center gap-3 px-5 pt-5 pb-4">
      <div className={cn("h-9 w-9 rounded-xl flex items-center justify-center shrink-0", color)}>
        <Icon className="w-4 h-4 text-white" />
      </div>
      <span className="text-sm font-black uppercase tracking-widest text-[var(--text-primary)] opacity-90">{label}</span>
    </div>
  );
}

function Divider() {
  return <div className="h-px bg-[var(--border-color)] mx-5 opacity-40" />;
}

function SettingRow({ label, sub, children }: { label: string; sub?: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4 px-5 py-4">
      <div className="min-w-0">
        <p className="text-sm font-semibold text-[var(--text-primary)] opacity-90 leading-tight">{label}</p>
        {sub && <p className="text-xs text-[var(--text-muted)] mt-0.5 leading-tight">{sub}</p>}
      </div>
      <div className="shrink-0">{children}</div>
    </div>
  );
}

export function SettingsClient({ userSettings, notificationSettings, userEmail }: SettingsClientProps) {
  const [visible, setVisible] = useState(false);
  const [theme, setTheme] = useState(userSettings?.theme || 'system');
  const [language, setLanguage] = useState(userSettings?.language || 'es');
  const [currency, setCurrency] = useState(userSettings?.currency || 'MXN');
  const [timezone, setTimezone] = useState(userSettings?.timezone || 'America/Mexico_City');
  const [notifications, setNotifications] = useState(notificationSettings || {});
  const [deleteConfirmText, setDeleteConfirmText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [activeDialog, setActiveDialog] = useState<string | null>(null);

  useEffect(() => { setVisible(true); }, []);

  const handleUpdateSetting = async (key: string, value: any) => {
    await updateUserSettings({ [key]: value });
    if (key === 'theme') {
      localStorage.setItem('buco-theme', value);
      const isDark =
        value === 'dark' ||
        (value === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
      document.documentElement.classList.toggle('dark', isDark);
    }
  };

  const handleToggleNotification = async (key: string) => {
    const newValue = !notifications[key];
    setNotifications({ ...notifications, [key]: newValue });
    const result = await updateNotificationSettings({ [key]: newValue });
    if (!result.success) setNotifications({ ...notifications, [key]: !newValue });
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirmText !== "ELIMINAR") return;
    setIsDeleting(true);
    await deleteAccount();
  };

  const themeOptions = [
    { id: 'light', icon: Sun, label: 'Claro' },
    { id: 'dark', icon: Moon, label: 'Oscuro' },
    { id: 'system', icon: Monitor, label: 'Sistema' },
  ];

  const emailNotifs = [
    { id: 'email_weekly', label: 'Resumen semanal' },
    { id: 'email_cut_date', label: 'Alerta fecha de corte' },
    { id: 'email_pay_date', label: 'Fecha límite de pago' },
    { id: 'email_goal_complete', label: 'Meta completada' },
    { id: 'email_limit_exceeded', label: 'Gastos superan límite' },
  ];

  const pushNotifs = [
    { id: 'push_reminders', label: 'Recordatorios de pago' },
    { id: 'push_whatsapp_confirm', label: 'Confirmación WhatsApp / Telegram' },
    { id: 'push_goal_risk', label: 'Metas en riesgo' },
  ];

  const aiNotifs = [
    { id: 'alert_unusual_expense', label: 'Gasto inusual detectado' },
    { id: 'alert_monthly_summary', label: 'Resumen mensual con IA' },
    { id: 'alert_low_balance', label: 'Balance bajo $0' },
  ];

  return (
    <div className="min-h-screen bg-[var(--bg-global)] pb-32">
      {/* Background blobs decorativos */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden opacity-50 dark:opacity-100">
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-blue-600/10 rounded-full blur-[120px]" />
        <div className="absolute top-1/3 -right-40 w-80 h-80 bg-blue-500/8 rounded-full blur-[120px]" />
      </div>

      <div className="relative z-10 max-w-xl mx-auto px-4 pt-8 space-y-5">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={visible ? { opacity: 1, y: 0 } : { opacity: 0, y: 16 }}
          transition={{ duration: 0.4 }}
          className="pt-2 pb-2"
        >
          <div className="flex items-center gap-3 mb-1">
            <div className="h-10 w-10 rounded-2xl bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-600/40">
              <Settings2 className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-[var(--text-primary)] tracking-tight italic uppercase">Configuración</h1>
              <p className="text-xs text-[var(--text-muted)] font-medium">Personaliza tu experiencia Buco</p>
            </div>
          </div>
        </motion.div>

        {/* APARIENCIA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={visible ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.4, delay: 0.05 }}
        >
          <SectionCard>
            <SectionHeader icon={Sun} label="Apariencia" color="bg-blue-500" />
            <Divider />

            {/* Theme picker */}
            <div className="px-5 py-4">
              <p className="text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)] mb-3">Tema</p>
              <div className="grid grid-cols-3 gap-2 p-1.5 rounded-2xl bg-[var(--bg-secondary)] border border-[var(--border-color)]">
                {themeOptions.map((t) => {
                  const Icon = t.icon;
                  const active = theme === t.id;
                  return (
                    <button
                      key={t.id}
                      onClick={() => { setTheme(t.id); handleUpdateSetting('theme', t.id); }}
                      className={cn(
                        "flex flex-col items-center justify-center gap-1.5 py-3 rounded-xl transition-all cursor-pointer border-none",
                        active
                          ? "bg-blue-600 shadow-lg shadow-blue-600/30"
                          : "bg-transparent hover:bg-white/[0.03] dark:hover:bg-white/5"
                      )}
                    >
                      <Icon className={cn("w-4 h-4", active ? "text-white" : "text-[var(--text-muted)]")} />
                      <span className={cn("text-[10px] font-black uppercase tracking-wide", active ? "text-white" : "text-[var(--text-muted)]")}>
                        {t.label}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            <Divider />

            {/* Idioma */}
            <SettingRow label="Idioma">
              <Select value={language} onValueChange={(v) => { setLanguage(v); handleUpdateSetting('language', v); }}>
                <SelectTrigger className="h-9 w-32 rounded-xl bg-[var(--bg-secondary)] border-[var(--border-color)] text-[var(--text-primary)] text-xs font-bold">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-[var(--bg-card)] border-[var(--border-color)] text-[var(--text-primary)]">
                  <SelectItem value="es">🇲🇽 Español</SelectItem>
                  <SelectItem value="en">🇺🇸 English</SelectItem>
                </SelectContent>
              </Select>
            </SettingRow>

            <Divider />

            {/* Moneda */}
            <SettingRow label="Moneda principal">
              <Select value={currency} onValueChange={(v) => { setCurrency(v); handleUpdateSetting('currency', v); }}>
                <SelectTrigger className="h-9 w-36 rounded-xl bg-[var(--bg-secondary)] border-[var(--border-color)] text-[var(--text-primary)] text-xs font-bold">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-[var(--bg-card)] border-[var(--border-color)] text-[var(--text-primary)]">
                  <SelectItem value="MXN">🇲🇽 MXN</SelectItem>
                  <SelectItem value="USD">🇺🇸 USD</SelectItem>
                  <SelectItem value="EUR">🇪🇺 EUR</SelectItem>
                  <SelectItem value="COP">🇨🇴 COP</SelectItem>
                  <SelectItem value="ARS">🇦🇷 ARS</SelectItem>
                </SelectContent>
              </Select>
            </SettingRow>

            <Divider />

            {/* Zona horaria */}
            <SettingRow label="Zona horaria">
              <Select value={timezone} onValueChange={(v) => { setTimezone(v); handleUpdateSetting('timezone', v); }}>
                <SelectTrigger className="h-9 w-40 rounded-xl bg-[var(--bg-secondary)] border-[var(--border-color)] text-[var(--text-primary)] text-xs font-bold">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-[var(--bg-card)] border-[var(--border-color)] text-[var(--text-primary)]">
                  <SelectItem value="America/Mexico_City">Mexico City</SelectItem>
                  <SelectItem value="America/Bogota">Bogotá</SelectItem>
                  <SelectItem value="America/Argentina/Buenos_Aires">Buenos Aires</SelectItem>
                  <SelectItem value="America/New_York">New York</SelectItem>
                  <SelectItem value="Europe/Madrid">Madrid</SelectItem>
                </SelectContent>
              </Select>
            </SettingRow>
          </SectionCard>
        </motion.div>

        {/* NOTIFICACIONES */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={visible ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.4, delay: 0.1 }}
        >
          <SectionCard>
            <SectionHeader icon={Bell} label="Notificaciones" color="bg-orange-500" />

            {/* Email */}
            <div className="px-5 pb-1">
              <div className="flex items-center gap-2 mb-1">
                <Mail className="w-3 h-3 text-[var(--text-muted)]" />
                <span className="text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)]">E-mail</span>
              </div>
            </div>
            {emailNotifs.map((n, i) => (
              <React.Fragment key={n.id}>
                {i > 0 && <Divider />}
                <SettingRow label={n.label}>
                  <Toggle enabled={!!notifications[n.id]} onToggle={() => handleToggleNotification(n.id)} />
                </SettingRow>
              </React.Fragment>
            ))}

            <Divider />
            <div className="px-5 pt-4 pb-1">
              <div className="flex items-center gap-2 mb-1">
                <Smartphone className="w-3 h-3 text-[var(--text-muted)]" />
                <span className="text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)]">Push & Instantáneas</span>
              </div>
            </div>
            {pushNotifs.map((n, i) => (
              <React.Fragment key={n.id}>
                {i > 0 && <Divider />}
                <SettingRow label={n.label}>
                  <Toggle enabled={!!notifications[n.id]} onToggle={() => handleToggleNotification(n.id)} />
                </SettingRow>
              </React.Fragment>
            ))}

            <Divider />
            <div className="px-5 pt-4 pb-1">
              <div className="flex items-center gap-2 mb-1">
                <Zap className="w-3 h-3 text-[var(--text-muted)]" />
                <span className="text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)]">Alertas IA</span>
              </div>
            </div>
            {aiNotifs.map((n, i) => (
              <React.Fragment key={n.id}>
                {i > 0 && <Divider />}
                <SettingRow label={n.label}>
                  <Toggle enabled={!!notifications[n.id]} onToggle={() => handleToggleNotification(n.id)} />
                </SettingRow>
              </React.Fragment>
            ))}
            <div className="h-2" />
          </SectionCard>
        </motion.div>

        {/* CONEXIONES */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={visible ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.4, delay: 0.15 }}
        >
          <SectionCard>
            <SectionHeader icon={Wifi} label="Conexiones" color="bg-emerald-500" />
            <Divider />

            {/* WhatsApp */}
            <div className="flex items-center justify-between px-5 py-4 gap-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-[#25D366] flex items-center justify-center shadow-lg shadow-emerald-500/20 shrink-0">
                  <MessageCircle className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-sm font-bold text-[var(--text-primary)]">WhatsApp</p>
                  <div className="flex items-center gap-1.5">
                    <div className={cn("h-1.5 w-1.5 rounded-full", userSettings?.whatsapp_connected ? "bg-emerald-400" : "bg-[var(--text-muted)] opacity-30")} />
                    <span className="text-[10px] text-[var(--text-muted)] font-medium">
                      {userSettings?.whatsapp_connected ? "Conectado" : "Sin conectar"}
                    </span>
                  </div>
                </div>
              </div>
              <Dialog open={activeDialog === 'whatsapp'} onOpenChange={(o) => setActiveDialog(o ? 'whatsapp' : null)}>
                <DialogTrigger
                  render={
                    <button className={cn(
                      "text-[10px] font-black uppercase tracking-wider px-4 py-2 rounded-xl transition-all cursor-pointer border-none shadow-sm",
                      userSettings?.whatsapp_connected
                        ? "bg-[var(--bg-secondary)] text-[var(--text-muted)] hover:bg-[var(--bg-elevated)]"
                        : "bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20 border border-emerald-500/20"
                    )}>
                      {userSettings?.whatsapp_connected ? "Gestionar" : "Conectar"}
                    </button>
                  }
                />
                <DialogContent className="max-w-sm rounded-3xl bg-[var(--bg-card)] border border-[var(--border-color)] text-[var(--text-primary)]">
                  <DialogHeader>
                    <DialogTitle className="text-xl font-black text-[var(--text-primary)] uppercase italic">Vincular WhatsApp</DialogTitle>
                    <DialogDescription className="text-[var(--text-muted)]">Registra gastos con mensajes de texto</DialogDescription>
                  </DialogHeader>
                  <div className="space-y-3 py-2">
                    {[
                      "Agrega este número: +1 (555) 012-3411",
                      "Envía 'Hola Buco' para activar tu cuenta",
                      "Registra gastos: 'gasté $150 en comida'",
                      "Buco confirmará cada registro al instante"
                    ].map((step, i) => (
                      <div key={i} className="flex gap-3 items-start">
                        <div className="h-6 w-6 rounded-full bg-emerald-500/20 text-emerald-500 flex items-center justify-center text-[10px] font-black shrink-0 mt-0.5">{i + 1}</div>
                        <p className="text-sm text-[var(--text-secondary)]">{step}</p>
                      </div>
                    ))}
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            <Divider />

            {/* Telegram */}
            <div className="flex items-center justify-between px-5 py-4 gap-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-[#0088cc] flex items-center justify-center shadow-lg shadow-blue-500/20 shrink-0">
                  <Send className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-sm font-bold text-[var(--text-primary)]">Telegram</p>
                  <div className="flex items-center gap-1.5">
                    <div className={cn("h-1.5 w-1.5 rounded-full", userSettings?.telegram_connected ? "bg-emerald-400" : "bg-[var(--text-muted)] opacity-30")} />
                    <span className="text-[10px] text-[var(--text-muted)] font-medium">
                      {userSettings?.telegram_connected ? "Conectado" : "Sin conectar"}
                    </span>
                  </div>
                </div>
              </div>
              <Dialog open={activeDialog === 'telegram'} onOpenChange={(o) => setActiveDialog(o ? 'telegram' : null)}>
                <DialogTrigger
                  render={
                    <button className={cn(
                      "text-[10px] font-black uppercase tracking-wider px-4 py-2 rounded-xl transition-all cursor-pointer border-none shadow-sm",
                      userSettings?.telegram_connected
                        ? "bg-[var(--bg-secondary)] text-[var(--text-muted)] hover:bg-[var(--bg-elevated)]"
                        : "bg-blue-500/10 text-blue-500 hover:bg-blue-500/20 border border-blue-500/20"
                    )}>
                      {userSettings?.telegram_connected ? "Gestionar" : "Conectar"}
                    </button>
                  }
                />
                <DialogContent className="max-w-sm rounded-3xl bg-[var(--bg-card)] border border-[var(--border-color)] text-[var(--text-primary)]">
                  <DialogHeader>
                    <DialogTitle className="text-xl font-black text-[var(--text-primary)] uppercase italic">Vincular Telegram</DialogTitle>
                    <DialogDescription className="text-[var(--text-muted)]">Conecta el bot de Buco a tu cuenta</DialogDescription>
                  </DialogHeader>
                  <div className="py-4 text-center space-y-3">
                    <p className="text-sm text-[var(--text-secondary)]">Busca <span className="text-blue-500 font-bold">@BucoFinanzasBot</span> y envía este código:</p>
                    <div className="p-5 bg-[var(--bg-secondary)] rounded-2xl border border-[var(--border-color)] text-3xl font-black tracking-widest text-blue-500 font-mono select-all">
                      BC-9921
                    </div>
                    <p className="text-[10px] text-[var(--text-muted)] uppercase tracking-widest opacity-60">El bot confirmará al instante</p>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
            <div className="h-2" />
          </SectionCard>
        </motion.div>

        {/* FINANZAS */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={visible ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.4, delay: 0.2 }}
        >
          <SectionCard>
            <SectionHeader icon={Coins} label="Finanzas" color="bg-indigo-500" />
            <Divider />
            <SettingRow
              label="Incluir crédito en balance"
              sub="Suma el crédito disponible al saldo total"
            >
              <Toggle
                enabled={!!userSettings?.include_credit_in_balance}
                onToggle={() => handleUpdateSetting('include_credit_in_balance', !userSettings?.include_credit_in_balance)}
              />
            </SettingRow>
            <div className="h-2" />
          </SectionCard>
        </motion.div>

        {/* PRIVACIDAD */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={visible ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.4, delay: 0.25 }}
        >
          <SectionCard>
            <SectionHeader icon={ShieldAlert} label="Privacidad y Datos" color="bg-gray-600" />
            <Divider />

            {/* Exportar */}
            <button className="w-full flex items-center justify-between px-5 py-4 hover:bg-[var(--bg-secondary)] transition-all cursor-pointer group border-none bg-transparent">
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-xl bg-[var(--bg-secondary)] flex items-center justify-center border border-[var(--border-color)]">
                  <Download className="w-4 h-4 text-[var(--text-muted)]" />
                </div>
                <div className="text-left">
                  <p className="text-sm font-semibold text-[var(--text-primary)]">Exportar mis datos</p>
                  <p className="text-xs text-[var(--text-muted)]">Descarga toda tu información</p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-[var(--text-muted)] opacity-30 group-hover:opacity-60 transition-colors" />
            </button>

            <Divider />

            {/* Eliminar cuenta */}
            <Dialog open={activeDialog === 'delete'} onOpenChange={(o) => setActiveDialog(o ? 'delete' : null)}>
              <DialogTrigger
                render={
                  <button className="w-full flex items-center justify-between px-5 py-4 hover:bg-red-500/5 transition-all cursor-pointer group border-none bg-transparent">
                    <div className="flex items-center gap-3">
                      <div className="h-9 w-9 rounded-xl bg-red-500/10 flex items-center justify-center">
                        <Trash2 className="w-4 h-4 text-red-500" />
                      </div>
                      <div className="text-left">
                        <p className="text-sm font-semibold text-red-500">Eliminar mi cuenta</p>
                        <p className="text-xs text-[var(--text-muted)]">Esta acción es permanente</p>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-red-500/30 group-hover:text-red-500/60 transition-colors" />
                  </button>
                }
              />
              <DialogContent className="max-w-sm rounded-3xl bg-[var(--bg-card)] border border-[var(--border-color)] text-[var(--text-primary)]">
                <DialogHeader>
                  <DialogTitle className="text-xl font-black text-red-500 uppercase italic">Acción Irreversible</DialogTitle>
                  <DialogDescription className="text-[var(--text-muted)]">
                    Todos tus datos se borrarán permanentemente. Esta acción no se puede deshacer.
                  </DialogDescription>
                </DialogHeader>
                <div className="py-4 space-y-3 text-center">
                  <p className="text-xs text-[var(--text-muted)]">Escribe <span className="text-red-500 font-bold">ELIMINAR</span> para confirmar:</p>
                  <Input
                    value={deleteConfirmText}
                    onChange={(e) => setDeleteConfirmText(e.target.value.toUpperCase())}
                    className="text-center h-12 rounded-2xl font-black text-lg tracking-widest bg-[var(--bg-secondary)] border-[var(--border-color)] text-[var(--text-primary)] placeholder:text-[var(--text-muted)] opacity-40 focus:opacity-100 focus:border-red-500/50"
                    placeholder="ELIMINAR"
                  />
                </div>
                <DialogFooter>
                  <Button
                    variant="destructive"
                    onClick={handleDeleteAccount}
                    disabled={deleteConfirmText !== "ELIMINAR" || isDeleting}
                    className="w-full rounded-2xl h-12 font-black uppercase tracking-widest shadow-lg shadow-red-500/20"
                  >
                    {isDeleting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Trash2 className="w-4 h-4 mr-2" />}
                    Confirmar eliminación
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
            <div className="h-2" />
          </SectionCard>
        </motion.div>

        {/* Version */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={visible ? { opacity: 1 } : { opacity: 0 }}
          transition={{ duration: 0.4, delay: 0.3 }}
          className="text-center pb-4"
        >
          <p className="text-[10px] text-[var(--text-muted)] font-medium tracking-widest uppercase opacity-40">Buco v1.0 · Finanzas Personales</p>
        </motion.div>

      </div>
    </div>
  );
}
