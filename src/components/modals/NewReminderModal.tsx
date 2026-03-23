"use client"

import React, { useState } from 'react';
import { 
  X, 
  CreditCard, 
  Target, 
  Receipt, 
  RotateCw, 
  FileText, 
  Zap,
  ChevronRight,
  ArrowLeft,
  Calendar,
  DollarSign
} from 'lucide-react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogTrigger
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { parseMoney } from "@/lib/format";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";

interface NewReminderModalProps {
  userId: string;
  trigger: React.ReactElement;
  cards: any[];
  goals: any[];
}

const TYPES = [
  { id: 'card_payment', name: 'Tarjeta / Pago', icon: CreditCard, color: 'text-indigo-600', bg: 'bg-indigo-50', desc: 'Fecha de corte o pago' },
  { id: 'goal_contribution', name: 'Abonar a Meta', icon: Target, color: 'text-emerald-600', bg: 'bg-emerald-50', desc: 'Ahorro recurrente' },
  { id: 'debt_payment', name: 'Deuda / Multa', icon: Receipt, color: 'text-red-600', bg: 'bg-red-50', desc: 'Pago único temporal' },
  { id: 'subscription', name: 'Suscripción', icon: RotateCw, color: 'text-purple-600', bg: 'bg-purple-50', desc: 'Netflix, Spotify, etc.' },
  { id: 'personal', name: 'Personal Libre', icon: FileText, color: 'text-gray-600', bg: 'bg-gray-50', desc: 'Cualquier recordatorio' },
  { id: 'custom', name: 'Personalizado', icon: Zap, color: 'text-amber-600', bg: 'bg-amber-50', desc: 'Configuración total' },
];

export function NewReminderModal({ userId, trigger, cards, goals }: NewReminderModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [step, setStep] = useState(1);
  const [selectedType, setSelectedType] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [monto, setMonto] = useState("");

  // States for dynamic date calculation
  const [frequency, setFrequency] = useState('monthly');
  const [isFreqOpen, setIsFreqOpen] = useState(false);
  const [fecha, setFecha] = useState(() => {
    const d = new Date();
    d.setMonth(d.getMonth() + 1);
    return d.toISOString().split('T')[0];
  });
  const router = useRouter();
  const supabase = createClient();

  const handleCreate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    const data = Object.fromEntries(formData.entries());

    const reminderData: any = {
      user_id: userId,
      type: selectedType.id,
      nombre: data.nombre,
      fecha: data.fecha,
      monto: data.monto ? parseFloat(data.monto as string) : null,
      description: data.descripcion,
      is_recurring: selectedType.id === 'card_payment' || selectedType.id === 'goal_contribution' || selectedType.id === 'subscription' || data.is_recurring === 'on',
      frequency: data.frequency || (selectedType.id === 'card_payment' || selectedType.id === 'subscription' ? 'monthly' : null),
      linked_id: data.linked_id || null,
      linked_type: selectedType.id === 'card_payment' ? 'card' : selectedType.id === 'goal_contribution' ? 'goal' : null,
      status: 'active'
    };

    const { error } = await supabase.from('reminders').insert(reminderData);
    
    setLoading(false);
    if (!error) {
      setIsOpen(false);
      setMonto("");
      setStep(1);
      setSelectedType(null);
      router.refresh();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open: boolean) => { setIsOpen(open); if(!open) setStep(1); }}>
      <DialogTrigger render={trigger} />
      <DialogContent className="rounded-[2.5rem] p-0 overflow-hidden max-w-md bg-[var(--bg-card)] border-none shadow-2xl">
        <div className="flex flex-col">
          <div className="p-8 bg-[#1450A0] text-white">
            <div className="flex items-center gap-4 mb-2">
              {step === 2 && (
                <button onClick={() => setStep(1)} className="h-8 w-8 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-all border-none cursor-pointer">
                  <ArrowLeft className="w-4 h-4" />
                </button>
              )}
              <h3 className="text-2xl font-black italic uppercase tracking-tighter">
                {step === 1 ? 'Nuevo Recordatorio' : selectedType.name}
              </h3>
            </div>
            <p className="text-[10px] font-bold uppercase tracking-widest opacity-60">
              {step === 1 ? 'Elige el tipo de alerta' : 'Configura los detalles'}
            </p>
          </div>

          <div className="p-6">
            {step === 1 ? (
              <div className="grid grid-cols-2 gap-3">
                {TYPES.map((type) => (
                  <button
                    key={type.id}
                    onClick={() => { setSelectedType(type); setStep(2); }}
                    className="flex flex-col items-start p-4 rounded-3xl bg-[var(--bg-secondary)] border border-[var(--border-color)] hover:border-primary/40 hover:scale-[1.02] transition-all text-left group cursor-pointer"
                  >
                    <div className={cn("h-10 w-10 rounded-xl flex items-center justify-center mb-3 transition-transform group-hover:scale-110", type.bg, type.color)}>
                      <type.icon className="w-5 h-5" />
                    </div>
                    <p className="font-black text-xs uppercase italic text-[var(--text-primary)] leading-none mb-1">{type.name}</p>
                    <p className="text-[9px] font-bold text-[var(--text-muted)] leading-tight">{type.desc}</p>
                  </button>
                ))}
              </div>
            ) : (
              <form onSubmit={handleCreate} className="space-y-4">
                <div className="space-y-3">
                  <label className="text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)] ml-1">Descripción</label>
                  <input 
                    name="nombre" 
                    defaultValue={selectedType.id === 'subscription' ? '' : selectedType.name}
                    placeholder={selectedType.id === 'subscription' ? 'Ejem: Netflix' : 'Nombre del recordatorio'} 
                    className="w-full p-4 bg-[var(--bg-secondary)] text-[var(--text-primary)] rounded-2xl border border-[var(--border-color)] font-bold outline-none focus:border-primary" 
                    required 
                  />
                </div>

                {selectedType.id === 'card_payment' && (
                  <div className="space-y-3">
                    <label className="text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)] ml-1">Seleccionar Tarjeta</label>
                    <select name="linked_id" className="w-full p-4 bg-[var(--bg-secondary)] text-[var(--text-primary)] rounded-2xl border border-[var(--border-color)] font-bold outline-none appearance-none" required>
                      <option value="">Elegir tarjeta...</option>
                      {cards.map(c => <option key={c.id} value={c.id}>{c.nombre_banco} - {c.nombre_tarjeta}</option>)}
                    </select>
                  </div>
                )}

                {selectedType.id === 'goal_contribution' && (
                  <div className="space-y-3">
                    <label className="text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)] ml-1">Seleccionar Meta</label>
                    <select name="linked_id" className="w-full p-4 bg-[var(--bg-secondary)] text-[var(--text-primary)] rounded-2xl border border-[var(--border-color)] font-bold outline-none appearance-none" required>
                      <option value="">Elegir meta...</option>
                      {goals.map(g => <option key={g.id} value={g.id}>{g.title}</option>)}
                    </select>
                  </div>
                )}

                <div className="space-y-3">
                  <label className="text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)] ml-1">Monto (opcional)</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)]"><DollarSign className="w-4 h-4" /></span>
                    <input name="monto" type="text" value={monto} onChange={(e) => setMonto(parseMoney(e.target.value))} className="w-full p-4 pl-10 bg-[var(--bg-secondary)] text-[var(--text-primary)] rounded-2xl border border-[var(--border-color)] font-bold outline-none focus:border-primary transition-colors" placeholder="0.00" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <label className="text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)] ml-1 block">Próximo disparo</label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)]"><Calendar className="w-4 h-4" /></span>
                      <input 
                        name="fecha" 
                        type="date" 
                        value={fecha}
                        onChange={(e) => setFecha(e.target.value)}
                        className="w-full p-4 pl-10 bg-[var(--bg-secondary)] text-[var(--text-primary)] rounded-2xl border border-[var(--border-color)] font-bold outline-none focus:border-primary transition-colors" 
                        required 
                      />
                    </div>
                  </div>

                  {(selectedType.id === 'goal_contribution' || selectedType.id === 'subscription' || selectedType.id === 'custom' || selectedType.id === 'card_payment' || selectedType.id === 'debt_payment' || selectedType.id === 'personal') && (
                     <div className="space-y-3 relative">
                       <label className="text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)] ml-1">Frecuencia</label>
                       <input type="hidden" name="frequency" value={frequency} />
                       
                       <div
                         onClick={() => setIsFreqOpen(!isFreqOpen)}
                         className="w-full p-4 bg-[var(--bg-secondary)] text-[var(--text-primary)] rounded-2xl border border-[var(--border-color)] font-bold flex flex-col justify-center cursor-pointer hover:border-primary transition-colors h-[54px]"
                       >
                         <span className="flex items-center justify-between w-full">
                           {frequency === 'daily' ? 'Diario' : frequency === 'weekly' ? 'Semanal' : frequency === 'biweekly' ? 'Quincenal' : frequency === 'monthly' ? 'Mensual' : 'Anual'}
                           <ChevronRight className={cn("w-4 h-4 text-[var(--text-muted)] transition-transform", isFreqOpen && "rotate-90")} />
                         </span>
                       </div>

                       {isFreqOpen && (
                         <div className="absolute top-full left-0 right-0 mt-2 bg-[#1A2234] border border-[#1F2D45] rounded-[12px] shadow-2xl z-50 overflow-hidden font-bold">
                           {[
                             { id: 'daily', name: 'Diario', days: 1 },
                             { id: 'weekly', name: 'Semanal', days: 7 },
                             { id: 'biweekly', name: 'Quincenal', days: 15 },
                             { id: 'monthly', name: 'Mensual', days: 30 },
                             { id: 'annual', name: 'Anual', days: 365 }
                           ].map(f => (
                             <div 
                               key={f.id}
                               onClick={() => {
                                 setFrequency(f.id);
                                 setIsFreqOpen(false);
                                 // Auto calculate next date
                                 const nextDate = new Date();
                                 if (f.id === 'daily') nextDate.setDate(nextDate.getDate() + 1);
                                 else if (f.id === 'weekly') nextDate.setDate(nextDate.getDate() + 7);
                                 else if (f.id === 'biweekly') nextDate.setDate(nextDate.getDate() + 15);
                                 else if (f.id === 'annual') nextDate.setFullYear(nextDate.getFullYear() + 1);
                                 else nextDate.setMonth(nextDate.getMonth() + 1);
                                 setFecha(nextDate.toISOString().split('T')[0]);
                               }}
                               className={cn(
                                 "p-4 cursor-pointer hover:bg-[var(--bg-secondary)] transition-colors border-b border-[var(--border-color)] last:border-none",
                                 frequency === f.id && "text-blue-500 bg-blue-500/10"
                               )}
                             >
                               {f.name}
                             </div>
                           ))}
                         </div>
                       )}
                     </div>
                  )}
                </div>

                {selectedType.id === 'personal' && (
                  <div className="flex items-center justify-between p-4 bg-[var(--bg-secondary)] rounded-2xl border border-[var(--border-color)]">
                     <span className="text-xs font-bold text-[var(--text-primary)]">¿Es recurrente?</span>
                     <input type="checkbox" name="is_recurring" className="h-5 w-5 rounded border-gray-300 text-primary focus:ring-primary" />
                  </div>
                )}

                <button 
                  type="submit" 
                  disabled={loading}
                  className="w-full bg-[#1450A0] text-white py-5 rounded-[2rem] font-black text-lg uppercase italic border-none cursor-pointer mt-4 shadow-xl shadow-blue-500/20 active:scale-95 transition-all text-center flex items-center justify-center"
                >
                  {loading ? 'Creando...' : 'Crear Recordatorio'}
                </button>
              </form>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
