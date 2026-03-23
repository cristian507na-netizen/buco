"use client";

import { useMemo, useState } from "react";
import { 
  PieChart, 
  Pie, 
  Cell, 
  ResponsiveContainer, 
  Tooltip as ChartTooltip 
} from "recharts";
import { 
  ChevronRight, 
  ListFilter, 
  ShoppingBag, 
  Utensils, 
  Car, 
  Gamepad2, 
  Home, 
  Search,
  ArrowUpRight,
  TrendingUp,
  TrendingDown,
  X
} from "lucide-react";
import { cn } from "@/lib/utils";

const CATEGORY_ICONS: any = {
  Comida: Utensils,
  Transporte: Car,
  Ocio: Gamepad2,
  Hogar: Home,
  Shopping: ShoppingBag,
};

const CATEGORY_COLORS: any = {
  Comida: "#FCA5A5",
  Transporte: "#93C5FD",
  Ocio: "#C4B5FD",
  Hogar: "#FDBA74",
  Shopping: "#F9A8D4",
  Salud: "#6EE7B7",
  Otros: "#CBD5E1"
};

export default function CategoryAnalysis({ expenses }: any) {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const categoryData = useMemo(() => {
    const counts: any = {};
    const total = expenses.reduce((acc: number, e: any) => acc + Number(e.monto), 0);

    expenses.forEach((e: any) => {
      counts[e.categoria] = (counts[e.categoria] || 0) + Number(e.monto);
    });

    return Object.entries(counts)
      .map(([name, value]: [string, any]) => ({
        name,
        value,
        percentage: total > 0 ? (value / total) * 100 : 0,
        color: CATEGORY_COLORS[name] || CATEGORY_COLORS.Otros,
        icon: CATEGORY_ICONS[name] || ListFilter
      }))
      .sort((a, b) => b.value - a.value);
  }, [expenses]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Donut Chart */}
      <div 
        style={{
          background: 'var(--bg-card)',
          border: '1px solid var(--border-color)',
          borderRadius: '20px'
        }}
        className="lg:col-span-1 p-6 md:p-8 flex flex-col items-center"
      >
         <h3 className="text-xl font-black text-[var(--text-primary)] leading-none mb-1 text-center w-full uppercase italic">Distribución</h3>
         <p className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest mb-8 text-center w-full">Gastos por Categoría</p>
         
         <div className="h-[250px] w-full relative">
            <ResponsiveContainer width="100%" height="100%">
               <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={8}
                    dataKey="value"
                    stroke="none"
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <ChartTooltip 
                    content={({ active, payload }: any) => {
                       if (active && payload && payload.length) {
                          return (
                             <div className="bg-[var(--bg-card)] p-3 rounded-xl border border-[var(--border-color)] shadow-xl">
                                <p className="text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)]">{payload[0].name}</p>
                                <p className="text-sm font-black text-[var(--text-primary)]">${payload[0].value.toLocaleString()}</p>
                             </div>
                          );
                       }
                       return null;
                    }}
                  />
               </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
               <span className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest leading-none">Total</span>
               <span className="text-2xl font-black text-[var(--text-primary)] mt-1">${categoryData.reduce((acc, c) => acc + c.value, 0).toLocaleString()}</span>
            </div>
         </div>

         <div className="grid grid-cols-2 gap-3 w-full mt-6">
            {categoryData.slice(0, 4).map((c, i) => (
               <div key={i} className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full" style={{ backgroundColor: c.color }} />
                  <span className="text-[10px] font-bold text-[var(--text-muted)] truncate">{c.name}</span>
               </div>
            ))}
         </div>
      </div>

      {/* Ranking List */}
      <div 
        style={{
          background: 'var(--bg-card)',
          border: '1px solid var(--border-color)',
          borderRadius: '20px'
        }}
        className="lg:col-span-2 p-6 md:p-8 flex flex-col"
      >
         <div className="flex items-center justify-between mb-8">
            <div>
               <h3 className="text-xl font-black text-[var(--text-primary)] leading-none mb-1 uppercase italic">Ranking de Gastos</h3>
               <p className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest">Mayores salidas de dinero</p>
            </div>
            <button className="h-10 w-10 rounded-xl bg-[var(--bg-secondary)] text-[var(--text-muted)] flex items-center justify-center hover:opacity-80 transition-colors">
               <ListFilter className="w-4 h-4" />
            </button>
         </div>

         <div className="flex-1 space-y-6 overflow-y-auto no-scrollbar pr-2">
            {categoryData.map((category, idx) => (
               <div 
                 key={idx} 
                 className="group cursor-pointer"
                 onClick={() => setSelectedCategory(category.name)}
               >
                  <div className="flex items-center justify-between mb-2">
                     <div className="flex items-center gap-3">
                        <div className={cn("h-10 w-10 rounded-xl flex items-center justify-center overflow-hidden relative")}>
                           <div className="absolute inset-0 opacity-10" style={{ backgroundColor: category.color }} />
                           <category.icon className="w-5 h-5 relative z-10" style={{ color: category.color }} />
                        </div>
                        <span className="text-sm font-black text-[var(--text-primary)]">{category.name}</span>
                     </div>
                     <div className="text-right">
                        <p className="text-sm font-black text-[var(--text-primary)]">${category.value.toLocaleString()}</p>
                        <p className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest">{category.percentage.toFixed(1)}%</p>
                     </div>
                  </div>
                  <div className="h-2 w-full bg-[var(--bg-secondary)] rounded-full overflow-hidden">
                     <div 
                        className="h-full rounded-full transition-all duration-1000 group-hover:opacity-80" 
                        style={{ width: `${category.percentage}%`, backgroundColor: category.color }} 
                     />
                  </div>
               </div>
            ))}
         </div>
      </div>

      {/* Transaction Overlay (Simulated Drawer) */}
      {selectedCategory && (
         <div className="fixed inset-0 z-50 flex items-center justify-end">
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setSelectedCategory(null)} />
            <div className="relative w-full max-w-lg h-full bg-[var(--bg-card)] shadow-2xl p-10 animate-in slide-in-from-right duration-500 border-l border-[var(--border-color)]">
               <button 
                 onClick={() => setSelectedCategory(null)}
                 className="absolute top-8 right-8 h-10 w-10 rounded-full bg-[var(--bg-secondary)] text-[var(--text-muted)] flex items-center justify-center hover:opacity-80 transition-all shadow-sm"
               >
                  <X className="w-5 h-5" />
               </button>
               
               <div className="mb-10">
                  <div className="h-16 w-16 rounded-3xl mb-6 flex items-center justify-center relative overflow-hidden">
                     <div className="absolute inset-0 opacity-10" style={{ backgroundColor: CATEGORY_COLORS[selectedCategory] }} />
                     {(() => {
                        const Icon = CATEGORY_ICONS[selectedCategory] || ListFilter;
                        return <Icon className="w-8 h-8 relative z-10" style={{ color: CATEGORY_COLORS[selectedCategory] }} />
                     })()}
                  </div>
                  <h3 className="text-3xl font-black text-[var(--text-primary)] leading-none mb-2 uppercase italic">{selectedCategory}</h3>
                  <div className="flex items-center gap-4">
                     <p className="text-lg font-black text-[var(--text-muted)] tracking-tight">Total acumulado: <span className="text-[var(--text-primary)]">${categoryData.find(c => c.name === selectedCategory)?.value.toLocaleString()}</span></p>
                  </div>
               </div>

               <div className="space-y-6">
                  <p className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest">Transacciones del período</p>
                  <div className="space-y-4 max-h-[calc(100vh-350px)] overflow-y-auto pr-4 no-scrollbar">
                     {expenses.filter((e:any) => e.categoria === selectedCategory).map((e:any, i:number) => (
                        <div key={i} className="flex items-center justify-between p-4 rounded-2xl bg-[var(--bg-secondary)] hover:bg-[var(--bg-secondary)]/80 transition-colors border border-[var(--border-color)] group">
                           <div className="flex items-center gap-4">
                              <div className="h-10 w-10 rounded-xl bg-[var(--bg-card)] flex items-center justify-center shadow-sm">
                                 <ShoppingBag className="w-4 h-4 text-[var(--text-muted)]" />
                              </div>
                              <div>
                                 <p className="text-sm font-black text-[var(--text-primary)]">{e.descripcion}</p>
                                 <p className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest">{new Date(e.fecha).toLocaleDateString()}</p>
                              </div>
                           </div>
                           <p className="text-sm font-black text-red-500">-${Number(e.monto).toLocaleString()}</p>
                        </div>
                     ))}
                  </div>
               </div>
            </div>
         </div>
      )}
    </div>
  );
}
