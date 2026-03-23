"use client";

import { useState } from "react";
import { 
  Plus, 
  Trash2, 
  Sparkles, 
  CheckCircle2, 
  Circle,
  X,
  Target,
  Scissors,
  ClipboardList,
  Check,
  Clock
} from "lucide-react";
import { cn } from "@/lib/utils";
import { addTask, toggleTask, deleteTask } from "@/app/goals/actions";
import { PlansModal } from "../profile/PlansModal";

const TASK_TYPES = [
  { id: 'ahorro', label: 'Ahorro', icon: Target, color: 'text-emerald-500', bg: 'bg-emerald-50' },
  { id: 'recorte', label: 'Recorte', icon: Scissors, color: 'text-red-500', bg: 'bg-red-50' },
  { id: 'accion', label: 'Acción', icon: ClipboardList, color: 'text-blue-500', bg: 'bg-blue-50' },
  { id: 'otro', label: 'Otro', icon: Check, color: 'text-gray-500', bg: 'bg-gray-50' },
];

export default function GoalTasks({ goal, initialTasks, profile }: any) {
  const [tasks, setTasks] = useState(initialTasks);
  const [isAddingTask, setIsAddingTask] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [newTaskType, setNewTaskType] = useState("otro");
  const [isLoadingSugs, setIsLoadingSugs] = useState(false);
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isPlansModalOpen, setIsPlansModalOpen] = useState(false);
  
  const plan = profile?.plan || 'free';

  const handleAddTask = async () => {
    if (!newTaskTitle.trim()) return;
    const res = await addTask(goal.id, newTaskTitle, newTaskType);
    if (res.success) {
      setNewTaskTitle("");
      setIsAddingTask(false);
      // reload local
    }
  };

  const handleToggle = async (task: any) => {
    await toggleTask(task.id, !task.completed, goal.id);
  };

  const handleDelete = async (id: string) => {
    await deleteTask(id, goal.id);
  };

  const fetchAISuggestions = async () => {
    setIsLoadingSugs(true);
    setErrorMsg(null);
    setSuggestions([]);
    
    try {
      const res = await fetch('/api/goals/ia-suggestions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ goal })
      });
      
      const data = await res.json();
      
      if (!res.ok) {
        setErrorMsg(data.message || data.error || 'Ocurrió un error inesperado');
        return;
      }
      
      setSuggestions(data.suggestions || []);
    } catch (err) {
      console.error(err);
      setErrorMsg('Error de conexión con el servidor IA');
    } finally {
      setIsLoadingSugs(false);
    }
  };

  const addAISuggestion = async (suggestion: any) => {
    const res = await addTask(goal.id, suggestion.title, suggestion.type);
    if (res.success) {
      setSuggestions(suggestions.filter(s => s.title !== suggestion.title));
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-transparent">
      {/* Header with AI Button */}
      <div className="p-8 border-b border-[var(--border-color)] flex items-center justify-between bg-[var(--bg-card)] relative shrink-0">
          <div className="space-y-1">
             <h3 className="text-xl font-black text-[var(--text-primary)] tracking-tight leading-none italic uppercase">Lista de tareas</h3>
             <p className="text-xs font-medium text-[var(--text-muted)]">Pasos pequeños para grandes metas.</p>
          </div>
          <button 
             onClick={fetchAISuggestions}
             disabled={isLoadingSugs}
             className="h-10 px-5 rounded-xl bg-primary/10 text-primary font-black text-[10px] uppercase tracking-widest flex items-center gap-2 hover:bg-primary/20 transition-all shadow-lg border border-primary/20 italic"
          >
             <Sparkles className={cn("w-3.5 h-3.5", isLoadingSugs && "animate-pulse")} />
             {isLoadingSugs ? 'Generando...' : 'Sugerencias IA'}
          </button>
      </div>

      <div className="flex-1 overflow-y-auto p-8 no-scrollbar space-y-8">
         {/* AI Suggestions Section */}
         {(suggestions.length > 0 || errorMsg) && (
            <div className="space-y-4 animate-in fade-in slide-in-from-top-4 duration-500">
               <div className="flex items-center justify-between px-2">
                  <h4 className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.2em] flex items-center gap-2">
                     <Sparkles className="w-3 h-3" />
                     {errorMsg ? 'Función Premium' : 'Sugerido por Buco IA'}
                  </h4>
                  <button onClick={() => { setSuggestions([]); setErrorMsg(null); }} className="text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors">
                     <X className="w-4 h-4" />
                  </button>
               </div>

               {errorMsg ? (
                  <div className="p-6 rounded-2xl bg-indigo-500/5 border border-indigo-500/20 flex flex-col items-center text-center gap-3">
                     <div className="h-12 w-12 rounded-full bg-indigo-500/10 flex items-center justify-center">
                        <Sparkles className="w-6 h-6 text-indigo-500" />
                     </div>
                     <div className="space-y-1">
                        <p className="text-xs font-black text-[var(--text-primary)] uppercase italic leading-none">{errorMsg}</p>
                        <p className="text-[9px] font-medium text-[var(--text-muted)]">Eleva tu productividad con inteligencia financiera.</p>
                     </div>
                     <button 
                        onClick={() => setIsPlansModalOpen(true)}
                        className="mt-2 h-9 px-6 bg-indigo-600 text-white rounded-xl font-black text-[9px] uppercase tracking-widest hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-500/20"
                     >Mejorar Plan Ahora</button>
                  </div>
               ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {suggestions.map((s, idx) => (
                        <div key={idx} className="p-5 rounded-2xl bg-primary/5 border border-primary/10 flex items-center justify-between group hover:border-primary/30 transition-all">
                           <div className="flex items-center gap-4">
                              <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center border border-primary/10">
                                 <Target className="w-5 h-5" />
                              </div>
                              <p className="text-xs font-black text-[var(--text-primary)] italic uppercase">{s.title}</p>
                           </div>
                          <button 
                             onClick={() => addAISuggestion(s)}
                             className="h-8 w-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center hover:scale-110 active:scale-95 transition-all opacity-0 group-hover:opacity-100"
                          >
                             <Plus className="w-4 h-4" />
                          </button>
                       </div>
                    ))}
                 </div>
               )}
            </div>
         )}

         {/* Actual Tasks List */}
         <div className="space-y-4">
             {tasks.length === 0 && !isAddingTask && (
                <div className="py-20 text-center space-y-6">
                   <div className="h-20 w-20 rounded-[2rem] bg-[var(--bg-secondary)] flex items-center justify-center mx-auto border border-[var(--border-color)]">
                      <ClipboardList className="w-10 h-10 text-[var(--text-muted)] opacity-50" />
                   </div>
                   <div className="space-y-2">
                      <p className="text-[var(--text-primary)] font-black text-base italic uppercase">¿Qué sigue?</p>
                      <p className="text-[var(--text-muted)] font-medium text-xs">Añade tu primera tarea para comenzar.</p>
                   </div>
                </div>
             )}

            {tasks.map((task: any) => {
               const typeInfo = TASK_TYPES.find(t => t.id === task.type) || TASK_TYPES[3];
                return (
                   <div key={task.id} className={cn(
                     "group p-6 rounded-2xl border transition-all flex items-center justify-between shadow-sm",
                     task.completed ? "bg-[var(--bg-secondary)]/50 border-transparent opacity-60" : "bg-[var(--bg-secondary)] border-[var(--border-color)] hover:border-primary/30"
                   )}>
                     <div className="flex items-center gap-4">
                         <button 
                            onClick={() => handleToggle(task)}
                            className={cn("h-8 w-8 rounded-full flex items-center justify-center transition-all",
                               task.completed ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/20" : "bg-[var(--bg-card)] text-[var(--text-muted)] border border-[var(--border-color)] hover:border-primary hover:text-primary"
                            )}
                         >
                            {task.completed ? <CheckCircle2 className="w-4 h-4" /> : <Circle className="w-4 h-4" />}
                         </button>
                         <div className="relative">
                            <p className={cn("text-sm font-black transition-all italic tracking-tight uppercase", 
                               task.completed ? "text-[var(--text-muted)] line-through" : "text-[var(--text-primary)]"
                            )}>{task.title}</p>
                           <div className="flex items-center gap-2 mt-0.5">
                              {typeInfo && (
                                 <div className={cn("px-1.5 py-0.5 rounded-md flex items-center gap-1", typeInfo.bg)}>
                                    <typeInfo.icon className={cn("w-2 h-2", typeInfo.color)} />
                                    <span className={cn("text-[7px] font-black uppercase tracking-widest", typeInfo.color)}>{typeInfo.label}</span>
                                 </div>
                              )}
                               {task.due_date && (
                                  <span className="text-[8px] font-black text-[var(--text-muted)] uppercase tracking-widest flex items-center gap-1 italic">
                                     <Clock className="w-2.5 h-2.5" />
                                     {new Date(task.due_date).toLocaleDateString()}
                                  </span>
                               )}
                            </div>
                         </div>
                     </div>
                      <button 
                         onClick={() => handleDelete(task.id)}
                         className="h-10 w-10 rounded-xl bg-red-500/10 text-red-500 opacity-0 group-hover:opacity-100 hover:bg-red-500 hover:text-white transition-all flex items-center justify-center border border-red-500/10"
                      >
                         <Trash2 className="w-4 h-4" />
                      </button>
                  </div>
               )
            })}

             {isAddingTask ? (
                <div className="p-8 rounded-3xl border border-primary/30 bg-[var(--bg-card)] shadow-2xl animate-in zoom-in-95 duration-300">
                   <div className="flex items-center gap-4 mb-6">
                      <input 
                         autoFocus
                         type="text" 
                         placeholder="¿Cuál es el siguiente paso?" 
                         className="flex-1 bg-transparent border-none outline-none font-black text-lg text-[var(--text-primary)] italic placeholder:text-[var(--text-muted)]"
                         value={newTaskTitle}
                         onChange={(e) => setNewTaskTitle(e.target.value)}
                         onKeyDown={(e) => e.key === 'Enter' && handleAddTask()}
                      />
                      <button onClick={() => setIsAddingTask(false)} className="text-[var(--text-muted)] hover:text-[var(--text-primary)]">
                         <X className="w-5 h-5" />
                      </button>
                   </div>
                   <div className="flex items-center justify-between">
                      <div className="flex gap-2">
                         {TASK_TYPES.map(t => (
                            <button 
                               key={t.id}
                               onClick={() => setNewTaskType(t.id)}
                               className={cn(
                                  "h-10 px-4 rounded-xl flex items-center gap-2 text-[10px] font-black uppercase tracking-widest transition-all italic",
                                  newTaskType === t.id ? "bg-primary text-white" : "bg-[var(--bg-secondary)] text-[var(--text-muted)] border border-[var(--border-color)] hover:bg-[var(--bg-card)]"
                               )}
                            >
                               <t.icon className="w-3.5 h-3.5" />
                               <span className="hidden sm:inline">{t.label}</span>
                            </button>
                         ))}
                      </div>
                      <button 
                         onClick={handleAddTask}
                         className="h-10 px-8 bg-primary text-white rounded-xl font-black text-[11px] uppercase italic tracking-widest shadow-xl shadow-primary/20"
                      >Añadir</button>
                   </div>
               </div>
             ) : (
                <button 
                   onClick={() => setIsAddingTask(true)}
                   className="w-full h-16 rounded-2xl border-2 border-dashed border-[var(--border-color)] flex items-center justify-center gap-3 text-[var(--text-muted)] font-black text-[11px] uppercase tracking-[0.15em] hover:bg-[var(--bg-secondary)] hover:border-primary/30 transition-all group italic"
                >
                   <Plus className="w-5 h-5 group-hover:scale-125 transition-transform" />
                   <span>Añadir nueva tarea</span>
                </button>
             )}
         </div>
      </div>

      <PlansModal 
        isOpen={isPlansModalOpen} 
        onClose={() => setIsPlansModalOpen(false)} 
        currentPlan={plan} 
      />
    </div>
  );
}
