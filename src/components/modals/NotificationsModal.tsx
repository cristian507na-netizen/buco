"use client";

import { useState, useEffect } from "react";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger,
  DialogClose
} from "@/components/ui/dialog";
import { 
  Bell, 
  X, 
  Target, 
  CreditCard, 
  AlertCircle,
  CheckCircle2,
  ChevronRight
} from "lucide-react";
import { cn } from "@/lib/utils";
import { createClient } from "@/utils/supabase/client";
import { useRealtime } from "@/hooks/useRealtime";
import { formatRelative } from "date-fns";
import { es } from "date-fns/locale";
import { updateNotificationPreferences } from "@/app/notifications/actions";
import { 
  Settings2,
  BellRing,
  Shield,
  Zap,
  Clock,
  Wallet
} from "lucide-react";

interface NotificationsModalProps {
  userId: string;
  trigger?: React.ReactNode;
}

export function NotificationsModal({ userId, trigger }: NotificationsModalProps) {
  const [open, setOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'alerts' | 'settings'>('alerts');
  const [notifications, setNotifications] = useState<any[]>([]);
  const [preferences, setPreferences] = useState<any>({
    budget: true,
    reminder: true,
    goal: true,
    balance: true,
    card: true
  });
  const [loadingPrefs, setLoadingPrefs] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    if (open) {
      fetchNotifications();
      fetchPreferences();
    }
  }, [open]);

  const fetchNotifications = async () => {
    const { data } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(30);

    if (data) setNotifications(data);
  };

  const fetchPreferences = async () => {
    setLoadingPrefs(true);
    const { data } = await supabase
      .from('profiles')
      .select('notification_preferences')
      .eq('id', userId)
      .single();
    
    if (data?.notification_preferences) {
      setPreferences(data.notification_preferences);
    }
    setLoadingPrefs(false);
  };

  const handleTogglePreference = async (key: string) => {
    const newPrefs = { ...preferences, [key]: !preferences[key] };
    setPreferences(newPrefs);
    await updateNotificationPreferences(newPrefs);
  };

  // Realtime
  useRealtime({
    table: 'notifications',
    filter: `user_id=eq.${userId}`,
    onInsert: (newVal) => setNotifications(prev => [newVal, ...prev]),
    onUpdate: (updated) => setNotifications(prev => prev.map(n => n.id === updated.id ? updated : n)),
    onDelete: (deleted) => setNotifications(prev => prev.filter(n => n.id !== deleted.id))
  });

  const unreadCount = notifications.filter(n => !n.leido).length;

  const markAsRead = async (id: string) => {
    await supabase.from('notifications').update({ leido: true }).eq('id', id);
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, leido: true } : n));
  };

  const markAllAsRead = async () => {
    await supabase.from('notifications').update({ leido: true }).eq('user_id', userId).eq('leido', false);
    setNotifications(prev => prev.map(n => ({ ...n, leido: true })));
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          trigger || (
            <button className="relative rounded-full p-2 text-gray-400 hover:text-white hover:bg-white/5 transition-all outline-none">
              <Bell className="h-5 w-5" />
              {unreadCount > 0 && (
                <span className="absolute top-2 right-2 flex h-2 w-2 rounded-full bg-red-500 animate-pulse" />
              )}
            </button>
          )
        }
      />
      
      <DialogContent 
        className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 p-0 border border-[var(--border-color)] bg-[var(--bg-card)] shadow-[0_20px_60px_rgba(0,0,0,0.4)] w-[380px] max-w-[92vw] max-h-[85vh] rounded-[24px] overflow-hidden flex flex-col z-[1000] focus:outline-none" 
        showCloseButton={false}
      >
        {/* HEADER */}
        <div className="p-6 border-b border-[var(--border-color)] flex justify-between items-center bg-[var(--bg-card)] sticky top-0 z-10">
           <div>
             <DialogTitle className="text-xl font-black text-[var(--text-primary)] tracking-tight italic uppercase">
               Notificaciones
             </DialogTitle>
             <p className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest leading-none mt-1">Centro de alertas</p>
           </div>
           <DialogClose onClick={() => setOpen(false)}>
              <div className="h-9 w-9 rounded-full bg-[var(--bg-secondary)] flex items-center justify-center text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-all cursor-pointer border border-[var(--border-color)]">
                <X className="w-4 h-4" />
              </div>
           </DialogClose>
        </div>
        
         {/* TABS */}
         <div className="flex p-1 bg-[var(--bg-secondary)] mx-6 mt-4 rounded-xl border border-[var(--border-color)]/50">
           <button 
             onClick={() => setActiveTab('alerts')}
             className={cn(
               "flex-1 py-2 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all",
               activeTab === 'alerts' ? "bg-[var(--bg-card)] text-primary shadow-sm" : "text-[var(--text-muted)] border-transparent"
             )}
           >
             Alertas
           </button>
           <button 
             onClick={() => setActiveTab('settings')}
             className={cn(
               "flex-1 py-2 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all",
               activeTab === 'settings' ? "bg-[var(--bg-card)] text-primary shadow-sm" : "text-[var(--text-muted)] border-transparent"
             )}
           >
             Ajustes
           </button>
         </div>
         
         {/* LIST / SETTINGS */}
         <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar bg-[var(--bg-card)]">
           {activeTab === 'alerts' ? (
             notifications.length === 0 ? (
               <div className="flex flex-col items-center justify-center h-full py-16 text-center opacity-40">
                 <div className="h-16 w-16 rounded-3xl bg-[var(--bg-secondary)] flex items-center justify-center mb-4">
                    <CheckCircle2 className="w-8 h-8 text-[var(--text-muted)]" />
                 </div>
                 <p className="text-sm font-black text-[var(--text-primary)] uppercase italic">Todo al día</p>
                 <p className="text-[10px] font-bold text-[var(--text-muted)] mt-1 uppercase tracking-widest">No tienes notificaciones pendientes</p>
               </div>
             ) : (
               notifications.map((n) => (
                 <div 
                   key={n.id} 
                   onClick={() => !n.leido && markAsRead(n.id)}
                   className={cn(
                     "p-4 rounded-2xl border transition-all cursor-pointer flex gap-4 items-start relative group",
                     n.leido ? "bg-transparent border-[var(--border-color)]/30 opacity-60" : "bg-[var(--bg-secondary)] border-primary/20 shadow-sm hover:border-primary/40"
                   )}
                 >
                   <div className={cn(
                     "h-10 w-10 rounded-xl flex items-center justify-center shrink-0 shadow-sm transition-transform group-hover:scale-110",
                     n.tipo === 'goal_deadline' || n.tipo === 'goal' ? "bg-amber-500/10 text-amber-600" :
                     n.tipo === 'card_cutoff' || n.tipo === 'card' ? "bg-indigo-500/10 text-indigo-600" :
                     n.tipo === 'low_balance' || n.tipo === 'alert' ? "bg-red-500/10 text-red-600" : "bg-blue-500/10 text-blue-600"
                   )}>
                     {n.tipo === 'goal' ? <Target className="w-5 h-5" /> : 
                      n.tipo === 'card' ? <CreditCard className="w-5 h-5" /> :
                      n.tipo === 'alert' || n.tipo === 'low_balance' ? <AlertCircle className="w-5 h-5" /> : <Bell className="w-5 h-5" />}
                   </div>
                   <div className="flex-1 min-w-0 font-medium">
                     <div className="flex justify-between items-start mb-1">
                        <p className="font-black text-[12px] text-[var(--text-primary)] truncate uppercase italic leading-none pr-1.5">{n.title || n.titulo}</p>
                        {!n.leido && (
                          <div className="h-2 w-2 bg-blue-500 rounded-full shadow-[0_0_8px_rgba(59,130,246,0.5)] shrink-0 ml-2" />
                        )}
                     </div>
                     <p className="text-[11px] font-semibold text-[var(--text-muted)] leading-snug line-clamp-2 mb-2">{n.mensaje}</p>
                     <span className="text-[9px] font-black text-[var(--text-muted)]/50 uppercase tracking-tighter">
                       {formatRelative(new Date(n.created_at || n.fecha), new Date(), { locale: es })}
                     </span>
                   </div>
                 </div>
               ))
             )
           ) : (
             <div className="space-y-6 py-2 px-2">
               <div className="space-y-4">
                 <p className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest px-1">Canales de alerta</p>
                 <NotificationToggle 
                   icon={Zap} 
                   label="Presupuestos" 
                   description="Alertas al llegar al 80% y 100% de tus límites."
                   checked={preferences.budget} 
                   onChange={() => handleTogglePreference('budget')}
                 />
                 <NotificationToggle 
                   icon={Clock} 
                   label="Recordatorios" 
                   description="Notificaciones 24h antes de tus vencimientos."
                   checked={preferences.reminder} 
                   onChange={() => handleTogglePreference('reminder')}
                 />
                 <NotificationToggle 
                   icon={Target} 
                   label="Metas de ahorro" 
                   description="Avances y metas alcanzadas."
                   checked={preferences.goal} 
                   onChange={() => handleTogglePreference('goal')}
                 />
                 <NotificationToggle 
                   icon={Wallet} 
                   label="Saldo bajo" 
                   description="Avisos cuando tus cuentas bajen de $50."
                   checked={preferences.balance} 
                   onChange={() => handleTogglePreference('balance')}
                 />
                 <NotificationToggle 
                   icon={CreditCard} 
                   label="Uso de tarjetas" 
                   description="Alertas de límite de crédito y cortes."
                   checked={preferences.card} 
                   onChange={() => handleTogglePreference('card')}
                 />
               </div>

               <div className="p-4 rounded-2xl bg-blue-500/5 border border-blue-500/10">
                 <div className="flex gap-3">
                   <Shield className="w-4 h-4 text-blue-500 shrink-0" />
                   <div>
                     <p className="text-[10px] font-black text-blue-500 uppercase tracking-tight">Privacidad Buco</p>
                     <p className="text-[10px] text-[var(--text-muted)] mt-1 font-medium leading-relaxed">Tus datos nunca se comparten. Las notificaciones se envían de forma segura a través de nuestro servidor.</p>
                   </div>
                 </div>
               </div>
             </div>
           )}
         </div>

        {/* FOOTER */}
        <div className="p-4 border-t border-[var(--border-color)] bg-[var(--bg-secondary)]/50 flex justify-center sticky bottom-0 z-10">
           <button 
              onClick={markAllAsRead} 
              disabled={unreadCount === 0}
              className={cn(
                "text-[10px] font-black uppercase tracking-[0.15em] transition-all flex items-center gap-2",
                unreadCount > 0 ? "text-primary hover:text-primary/80" : "text-[var(--text-muted)] opacity-30 cursor-not-allowed"
              )}
           >
             Marcar todas como leídas
             <ChevronRight className="w-3 h-3" />
           </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function NotificationToggle({ icon: Icon, label, description, checked, onChange }: any) {
  return (
    <div className="flex items-center justify-between p-1">
      <div className="flex gap-3">
        <div className="h-9 w-9 rounded-xl bg-[var(--bg-secondary)] flex items-center justify-center text-[var(--text-muted)] border border-[var(--border-color)]">
          <Icon className="w-4 h-4" />
        </div>
        <div>
          <p className="text-[12px] font-black text-[var(--text-primary)] uppercase italic leading-none">{label}</p>
          <p className="text-[10px] text-[var(--text-muted)] font-medium mt-1 leading-tight">{description}</p>
        </div>
      </div>
      <button 
        onClick={onChange}
        className={cn(
          "w-10 h-5 rounded-full relative transition-all duration-300",
          checked ? "bg-primary" : "bg-[var(--bg-secondary)] border border-[var(--border-color)]"
        )}
      >
        <div className={cn(
          "absolute top-1 w-3 h-3 rounded-full bg-white transition-all shadow-sm",
          checked ? "right-1" : "left-1"
        )} />
      </button>
    </div>
  );
}
