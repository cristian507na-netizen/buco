"use client";

import { useState, useEffect } from "react";
import { BellRing, X, Check } from "lucide-react";
import { savePushSubscription } from "@/app/notifications/actions";

const urlBase64ToUint8Array = (base64String: string) => {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding)
    .replace(/\-/g, '+')
    .replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export function PushBanner() {
  const [show, setShow] = useState(false);
  const [asking, setAsking] = useState(false);

  useEffect(() => {
    // Check if permissions are supported
    if (!('Notification' in window) || !('serviceWorker' in navigator) || !('PushManager' in window)) {
      return;
    }

    const dismissed = localStorage.getItem('buco_push_banner_dismissed');
    if (Notification.permission === 'default' && !dismissed) {
      // Delay it slightly for better UX
      const timer = setTimeout(() => setShow(true), 2500);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleDismiss = () => {
    localStorage.setItem('buco_push_banner_dismissed', 'true');
    setShow(false);
  };

  const handleActivate = async () => {
    setAsking(true);
    try {
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        const registration = await navigator.serviceWorker.ready;
        const subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!)
        });
        
        // Save to DB
        await savePushSubscription(subscription.toJSON());
        localStorage.setItem('buco_push_banner_dismissed', 'true');
        setShow(false);
      } else {
        // User denied
        handleDismiss();
      }
    } catch (e) {
      console.error(e);
      setAsking(false); // Restore state on error if user manually closed dialog
    }
  };

  if (!show) return null;

  return (
    <div className="mx-6 mt-6 p-4 rounded-[24px] bg-[var(--bg-card)] border border-blue-500/20 shadow-[0_4px_30px_rgba(37,99,235,0.15)] relative overflow-hidden group slide-in-from-bottom-5 animate-in duration-500">
      <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-transparent pointer-events-none" />
      <button 
        onClick={handleDismiss} 
        disabled={asking}
        className="absolute top-4 right-4 text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors p-1"
      >
        <X className="w-4 h-4" />
      </button>

      <div className="flex gap-4 items-start relative z-10 w-full pr-6">
        <div className="h-10 w-10 shrink-0 bg-blue-500/20 text-blue-500 rounded-xl flex items-center justify-center">
          <BellRing className="w-5 h-5 animate-[swing_2s_ease-in-out_infinite]" />
        </div>
        <div className="flex-1 space-y-3">
          <div>
            <h4 className="text-[13px] font-black text-[var(--text-primary)] uppercase tracking-tight italic">
              Activa las alertas
            </h4>
            <p className="text-xs text-[var(--text-muted)] font-medium mt-1 leading-relaxed">
              Buco puede avisarte cuando tus gastos se acerquen al límite o cuando un recordatorio esté por vencer. ¿Activamos las alertas?
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            <button 
              onClick={handleActivate}
              disabled={asking}
              className="h-8 px-5 bg-primary text-white text-[10px] font-black uppercase tracking-widest rounded-lg flex items-center gap-2 hover:scale-[1.03] active:scale-[0.97] shadow-lg shadow-blue-500/30 transition-all disabled:opacity-50"
            >
              <Check className="w-3.5 h-3.5" />
              {asking ? 'Activando...' : 'Sí, Activar'}
            </button>
            <button
              onClick={handleDismiss}
              disabled={asking}
              className="h-8 px-3 text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)] hover:bg-[var(--bg-secondary)] rounded-lg transition-colors border border-transparent hover:border-[var(--border-color)]"
            >
              Más tarde
            </button>
          </div>
        </div>
      </div>
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes swing {
           15% { transform: translateY(-3px) }
           30% { transform: translateY(0) }
           45% { transform: translateY(-3px) }
           60% { transform: translateY(0) }
        }
      `}} />
    </div>
  );
}
