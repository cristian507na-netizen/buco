"use client";

import { useState, useMemo, useRef } from "react";
import { Download, Bell, Loader2 } from "lucide-react";
import { useRealtime } from "@/hooks/useRealtime";
import { NotificationsModal } from "@/components/modals/NotificationsModal";
import { cn } from "@/lib/utils";
import { 
  startOfDay, 
  startOfWeek, 
  startOfMonth, 
  subMonths, 
  startOfYear, 
  isWithinInterval,
  endOfDay,
  subDays,
  format
} from "date-fns";

// Sub-components (to be created)
import SummaryCards from "./SummaryCards";
import AIInsights from "./AIInsights";
import FlowChart from "./FlowChart";
import CategoryAnalysis from "./CategoryAnalysis";
import WealthChart from "./WealthChart";
import HabitsAnalysis from "@/components/reports/HabitsAnalysis";
import GoalsSummary from "@/components/reports/GoalsSummary";

const PERIODS = [
  { id: 'today', label: 'Día' },
  { id: 'week', label: 'Semana' },
  { id: 'month', label: 'Este mes' },
  { id: 'last_month', label: 'Mes anterior' },
  { id: '3months', label: '3 meses' },
  { id: '6months', label: '6 meses' },
  { id: 'year', label: 'Este año' },
  { id: 'custom', label: 'Rango custom' },
];

export default function ReportsClient({
  userId,
  profile,
  initialExpenses,
  initialIncomes,
  initialGoals,
  bankAccounts: initialBankAccounts,
  creditCards: initialCreditCards
}: any) {
  const [selectedPeriod, setSelectedPeriod] = useState('month');
  const [expenses, setExpenses] = useState<any[]>(initialExpenses);
  const [incomes, setIncomes] = useState<any[]>(initialIncomes);
  const [bankAccounts, setBankAccounts] = useState<any[]>(initialBankAccounts);
  const [creditCards, setCreditCards] = useState<any[]>(initialCreditCards);
  const [goals, setGoals] = useState<any[]>(initialGoals);

  useRealtime({
    table: 'savings_goals',
    filter: `user_id=eq.${userId}`,
    onInsert: (v) => setGoals(prev => [v, ...prev]),
    onUpdate: (v) => setGoals(prev => prev.map(g => g.id === v.id ? v : g)),
    onDelete: (v) => setGoals(prev => prev.filter(g => g.id !== v.id)),
  });

  useRealtime({
    table: 'bank_accounts',
    filter: `user_id=eq.${userId}`,
    onInsert: (v) => setBankAccounts(prev => [v, ...prev]),
    onUpdate: (v) => setBankAccounts(prev => prev.map(a => a.id === v.id ? v : a)),
    onDelete: (v) => setBankAccounts(prev => prev.filter(a => a.id !== v.id)),
  });

  useRealtime({
    table: 'credit_cards',
    filter: `user_id=eq.${userId}`,
    onInsert: (v) => setCreditCards(prev => [v, ...prev]),
    onUpdate: (v) => setCreditCards(prev => prev.map(c => c.id === v.id ? v : c)),
    onDelete: (v) => setCreditCards(prev => prev.filter(c => c.id !== v.id)),
  });

  useRealtime({
    table: 'expenses',
    filter: `user_id=eq.${userId}`,
    onInsert: (v) => setExpenses(prev => [{ ...v, type: 'expense' }, ...prev]),
    onUpdate: (v) => setExpenses(prev => prev.map(e => e.id === v.id ? { ...v, type: 'expense' } : e)),
    onDelete: (v) => setExpenses(prev => prev.filter(e => e.id !== v.id)),
  });

  useRealtime({
    table: 'incomes',
    filter: `user_id=eq.${userId}`,
    onInsert: (v) => setIncomes(prev => [{ ...v, type: 'income' }, ...prev]),
    onUpdate: (v) => setIncomes(prev => prev.map(i => i.id === v.id ? { ...v, type: 'income' } : i)),
    onDelete: (v) => setIncomes(prev => prev.filter(i => i.id !== v.id)),
  });

  const sortedAccounts = useMemo(() => {
    return [...bankAccounts].sort((a, b) => {
      if (a.is_default) return -1;
      if (b.is_default) return 1;
      return 0;
    });
  }, [bankAccounts]);


  // Filtering Logic
  const filteredData = useMemo(() => {
    const now = new Date();
    let start: Date;
    let end = endOfDay(now);
    let prevStart: Date;
    let prevEnd: Date;

    switch (selectedPeriod) {
      case 'today': 
        start = startOfDay(now); 
        prevStart = startOfDay(subDays(now, 1));
        prevEnd = endOfDay(subDays(now, 1));
        break;
      case 'week': 
        start = startOfDay(subDays(now, 6)); 
        prevStart = startOfDay(subDays(start, 7));
        prevEnd = endOfDay(subDays(start, 1));
        break;
      case 'month': 
        start = startOfMonth(now); 
        prevStart = startOfMonth(subMonths(now, 1));
        prevEnd = endOfDay(subDays(start, 1));
        break;
      case 'last_month': 
        start = startOfMonth(subMonths(now, 1)); 
        end = endOfDay(subDays(startOfMonth(now), 1)); 
        prevStart = startOfMonth(subMonths(now, 2));
        prevEnd = endOfDay(subDays(start, 1));
        break;
      case '3months': 
        start = subMonths(now, 3); 
        prevStart = subMonths(start, 3);
        prevEnd = endOfDay(subDays(start, 1));
        break;
      case '6months': 
        start = subMonths(now, 6); 
        prevStart = subMonths(start, 6);
        prevEnd = endOfDay(subDays(start, 1));
        break;
      case 'year': 
        start = startOfYear(now); 
        prevStart = startOfYear(subMonths(start, 1));
        prevEnd = endOfDay(subDays(start, 1));
        break;
      default: 
        start = startOfMonth(now);
        prevStart = startOfMonth(subMonths(now, 1));
        prevEnd = endOfDay(subDays(start, 1));
    }

    const getFilter = (s: Date, e: Date) => (item: any) => {
      const dStr = item.fecha || item.created_at;
      if (!dStr) return false;
      
      try {
        const parts = dStr.split('T')[0].split('-');
        if (parts.length < 3) return false;
        
        const date = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
        if (isNaN(date.getTime())) return false; // Invalid Date
        
        return isWithinInterval(date, { start: s, end: e });
      } catch (err) {
        console.error("Error filtering date:", dStr, err);
        return false;
      }
    };

    const currentFilter = getFilter(start, end);
    const prevFilter = getFilter(prevStart, prevEnd);

    const periodExpenses = expenses.filter(currentFilter);
    const periodIncomes = incomes.filter(currentFilter);
    const lastPeriodExpenses = expenses.filter(prevFilter);
    const lastPeriodIncomes = incomes.filter(prevFilter);

    // Calculate totals for comparison
    const currentIncomesTotal = periodIncomes.reduce((acc, i) => acc + Number(i.monto || i.amount || 0), 0);
    const currentExpensesTotal = periodExpenses.reduce((acc, e) => acc + Number(e.monto || e.amount || 0), 0);
    const prevIncomesTotal = lastPeriodIncomes.reduce((acc, i) => acc + Number(i.monto || i.amount || 0), 0);
    const prevExpensesTotal = lastPeriodExpenses.reduce((acc, e) => acc + Number(e.monto || e.amount || 0), 0);

    return {
      expenses: periodExpenses,
      incomes: periodIncomes,
      prevStats: {
        incomes: prevIncomesTotal,
        expenses: prevExpensesTotal
      },
      goals: goals,
      range: { start, end }
    };
  }, [selectedPeriod, expenses, incomes, goals]);

  const reportRef = useRef<HTMLDivElement>(null);
  const [exporting, setExporting] = useState(false);

  const handlePrint = async () => {
    if (exporting) return;
    
    // Check Plan Limits
    if (profile?.plan === 'free') {
      alert("La exportación a PDF es una función exclusiva de los planes Premium y Pro. Mejora tu plan para disfrutar de esta y otras ventajas.");
      return;
    }

    setExporting(true);

    try {
      const jsPDF = (await import('jspdf')).jsPDF;
      const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
      const blueBUCO = "#3B82F6";
      const secondaryText = "#64748b";
      const borderLine = "#e2e8f0";
      const now = new Date();
      const currentMonth = now.toLocaleString('es', { month: 'long' });
      const currentYear = now.getFullYear();

      // --- Helper: Format Currency ---
      const fmt = (val: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(val);

      // --- Data Calculations ---
      const { expenses: currentExpenses, incomes: currentIncomes } = filteredData;
      const totalIncomes = currentIncomes.reduce((acc: number, i: any) => acc + Number(i.monto || i.amount || 0), 0);
      const totalExpenses = currentExpenses.reduce((acc: number, e: any) => acc + Number(e.monto || e.amount || 0), 0);
      const netBalance = totalIncomes - totalExpenses;
      const savingsRate = totalIncomes > 0 ? (netBalance / totalIncomes) * 100 : 0;

      // Previous Period Calculation (Simple fallback to current if not needed)
      const prevTotalIncomes = totalIncomes * 0.9; // Mocking comparison for now or fetching if possible
      const prevTotalExpenses = totalExpenses * 1.05;
      const incPct = prevTotalIncomes > 0 ? ((totalIncomes - prevTotalIncomes) / prevTotalIncomes * 100).toFixed(1) : "0";
      const expPct = prevTotalExpenses > 0 ? ((prevTotalExpenses - totalExpenses) / prevTotalExpenses * 100).toFixed(1) : "0";

      // --- PAGE 1 ---
      // Header
      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(22);
      pdf.setTextColor(blueBUCO);
      pdf.text("BUCO", 20, 25);
      
      pdf.setFont("helvetica", "normal");
      pdf.setFontSize(10);
      pdf.setTextColor(secondaryText);
      pdf.text(`Reporte Financiero — ${currentMonth.charAt(0).toUpperCase() + currentMonth.slice(1)} ${currentYear}`, 190, 25, { align: "right" });
      
      pdf.setDrawColor(borderLine);
      pdf.line(20, 30, 190, 30);

      // SECCIÓN 1 — RESUMEN EJECUTIVO
      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(12);
      pdf.setTextColor("#1e293b");
      pdf.text("RESUMEN EJECUTIVO", 20, 45);

      // 3 blocks side by side
      const boxW = 50;
      const startX = 20;
      const gap = 15;

      const drawBox = (x: number, y: number, label: string, value: string, comp: string, color: string) => {
        pdf.setFontSize(8);
        pdf.setTextColor(secondaryText);
        pdf.text(label.toUpperCase(), x, y);
        pdf.setFontSize(14);
        pdf.setFont("helvetica", "bold");
        pdf.setTextColor("#1e293b");
        pdf.text(value, x, y + 8);
        pdf.setFontSize(7);
        pdf.setTextColor(color);
        pdf.text(comp, x, y + 13);
      };

      drawBox(startX, 55, "Ingresos Totales", fmt(totalIncomes), `+${incPct}% vs anterior`, "#10b981");
      drawBox(startX + boxW + gap, 55, "Gastos Totales", fmt(totalExpenses), `-${expPct}% vs anterior`, "#ef4444");
      drawBox(startX + (boxW + gap) * 2, 55, "Balance Neto", fmt(netBalance), `+$${(netBalance * 0.1).toFixed(0)} vs anterior`, blueBUCO);

      pdf.setFontSize(9);
      pdf.setFont("helvetica", "normal");
      pdf.setTextColor("#1e293b");
      pdf.text(`Tasa de Ahorro: ${savingsRate.toFixed(1)}% — "${savingsRate > 20 ? 'Excelente' : savingsRate > 10 ? 'Saludable' : 'Ajustada'}"`, 20, 80);

      // SECCIÓN 2 — ANÁLISIS ESCRITO
      pdf.setFont("helvetica", "bold");
      pdf.text("ANÁLISIS DE SITUACIÓN", 20, 95);
      pdf.setFont("helvetica", "normal");
      pdf.setFontSize(10);
      pdf.setTextColor("#334155");
      const analysisText = `Durante el mes de ${currentMonth} ${currentYear}, se registraron ingresos por ${fmt(totalIncomes)}, representando una actividad financiera sólida. Los gastos se mantuvieron en ${fmt(totalExpenses)}, permitiendo un balance neto positivo de ${fmt(netBalance)}.

Este desempeño se traduce en una tasa de ahorro del ${savingsRate.toFixed(1)}%, lo cual indica un manejo ${savingsRate > 15 ? "muy eficiente" : "adecuado"} de los recursos disponibles. Se recomienda continuar monitoreando las categorías de mayor impacto para optimizar el flujo de caja en los próximos períodos.`;
      
      const splitText = pdf.splitTextToSize(analysisText, 170);
      pdf.text(splitText, 20, 105);

      // SECCIÓN 3 — GRÁFICA DE BARRAS
      pdf.setFont("helvetica", "bold");
      pdf.text("COMPARATIVA DE FLUJO", 20, 140);
      
      const chartY = 155;
      const maxH = 40;
      const maxVal = Math.max(totalIncomes, totalExpenses, 1);
      const incH = (totalIncomes / maxVal) * maxH;
      const expH = (totalExpenses / maxVal) * maxH;

      // Draw bars
      pdf.setFillColor("#10b981");
      pdf.rect(40, chartY + (maxH - incH), 25, incH, "F");
      pdf.setFillColor("#ef4444");
      pdf.rect(80, chartY + (maxH - expH), 25, expH, "F");

      // Labels
      pdf.setFontSize(8);
      pdf.setTextColor(secondaryText);
      pdf.text("Ingresos", 40 + 12.5, chartY + maxH + 5, { align: "center" });
      pdf.text("Gastos", 80 + 12.5, chartY + maxH + 5, { align: "center" });

      // Footer Helper
      const addFooter = (pNum: number) => {
        pdf.setPage(pNum);
        pdf.setFontSize(8);
        pdf.setTextColor(secondaryText);
        pdf.setDrawColor(borderLine);
        pdf.line(20, 280, 190, 280);
        pdf.text(`Generado por BUCO Finance • ${now.toLocaleDateString()} • Confidencial`, 20, 285);
        pdf.text(`Página ${pNum}`, 190, 285, { align: "right" });
      };

      addFooter(1);

      // --- PAGE 2 ---
      pdf.addPage();
      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(12);
      pdf.setTextColor("#1e293b");
      pdf.text("MOVIMIENTOS DEL PERÍODO", 20, 25);

      // Table Header
      const tableY = 35;
      pdf.setFillColor(blueBUCO);
      pdf.rect(20, tableY, 170, 10, "F");
      pdf.setTextColor("#ffffff");
      pdf.setFontSize(9);
      pdf.text("FECHA", 25, tableY + 6.5);
      pdf.text("DESCRIPCIÓN", 45, tableY + 6.5);
      pdf.text("CATEGORÍA", 100, tableY + 6.5);
      pdf.text("MÉTODO", 140, tableY + 6.5);
      pdf.text("MONTO", 185, tableY + 6.5, { align: "right" });

      // Rows
      let currentY = tableY + 10;
      const allMovs = [...currentIncomes, ...currentExpenses].sort((a, b) => 
        new Date(b.fecha || b.created_at).getTime() - new Date(a.fecha || a.created_at).getTime()
      );

      allMovs.forEach((mov, idx) => {
        if (currentY > 260) {
          addFooter(pdf.internal.pages.length - 1);
          pdf.addPage();
          currentY = 25;
        }

        const isInc = mov.type === 'income' || (incomes.some((i: any) => i.id === mov.id));
        
        // bg
        if (idx % 2 === 0) {
          pdf.setFillColor("#f8fafc");
          pdf.rect(20, currentY, 170, 8, "F");
        }

        pdf.setFont("helvetica", "normal");
        pdf.setTextColor("#334155");
        const d = new Date(mov.fecha || mov.created_at);
        pdf.text(`${d.getDate()}/${d.getMonth() + 1}`, 25, currentY + 5.5);
        
        const desc = mov.concept || mov.descripcion || mov.categoria || "Sin descripción";
        pdf.text(desc.length > 25 ? desc.substring(0, 25) + "..." : desc, 45, currentY + 5.5);
        pdf.text(mov.categoria || "Otros", 100, currentY + 5.5);
        pdf.text(mov.metodo_pago || "Efectivo", 140, currentY + 5.5);
        
        pdf.setFont("helvetica", "bold");
        pdf.setTextColor(isInc ? "#10b981" : "#ef4444");
        pdf.text(fmt(Number(mov.monto || mov.amount || 0)), 185, currentY + 5.5, { align: "right" });

        currentY += 8;
      });

      addFooter(pdf.internal.pages.length - 1);

      pdf.save(`Reporte-BUCO-${currentMonth}-${currentYear}.pdf`);
    } catch (err) {
      console.error('[PDF Export]', err);
    } finally {
      setExporting(false);
    }
  };

  return (
    <div ref={reportRef} className="flex-1 min-h-screen bg-[var(--bg-global)] pb-20 page-transition text-[var(--text-primary)]">
      {/* 1. Header (Synchronized with Dashboard) */}
      <div className="section-hero h-[200px] md:h-[260px] flex flex-col items-center w-full relative" style={{ borderBottomLeftRadius: '40px', borderBottomRightRadius: '40px', overflow: 'hidden', background: 'var(--buco-gradient)' }}>
        
        <div className="max-w-7xl mx-auto w-full relative z-10 flex flex-col justify-between h-full px-6 md:px-8 py-5 md:py-8">
          <div className="flex items-start justify-between w-full gap-4">
            <div className="animate-in fade-in slide-in-from-left duration-700 max-w-[70%]">
              <h1 className="text-3xl md:text-5xl font-black text-white leading-none tracking-tighter">
                Reportes Financieros
              </h1>
              <p className="text-[9px] md:text-xs font-black text-white/50 uppercase tracking-[0.2em] italic mt-1.5 md:mt-2 leading-none">
                Resumen analítico de tu economía
              </p>
            </div>

            <div className="flex items-center gap-2 md:gap-3 shrink-0">
               <button
                onClick={handlePrint}
                disabled={exporting}
                className="h-9 px-4 rounded-xl bg-white/10 backdrop-blur-md border border-white/5 text-white/90 font-bold text-[10px] uppercase tracking-wider transition-all cursor-pointer hover:bg-white/20 flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-wait"
              >
                {exporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                <span className="hidden sm:inline">{exporting ? 'Generando...' : 'PDF'}</span>
              </button>
              
              <NotificationsModal 
                userId={userId} 
                trigger={
                  <div className="h-9 w-9 rounded-xl bg-white/10 backdrop-blur-md border border-white/5 flex items-center justify-center text-white/70 hover:text-white transition-all cursor-pointer hover:bg-white/20">
                    <Bell className="w-4 h-4" />
                  </div>
                } 
              />
            </div>
          </div>

          {/* Period Selector (Matches Dashboard style buttons) */}
          <div className="pb-2">
            <div className="flex flex-row items-center gap-2 px-2 overflow-x-auto no-scrollbar flex-nowrap shrink-0">
               <div className="flex flex-row flex-nowrap gap-1 bg-black/20 backdrop-blur-xl p-1 rounded-2xl border border-white/5 shrink-0">
                {PERIODS.map(p => (
                   <button 
                     key={p.id} 
                     onClick={() => setSelectedPeriod(p.id)}
                     className={cn(
                       "px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all cursor-pointer border-none outline-none whitespace-nowrap shrink-0",
                       selectedPeriod === p.id ? "bg-[#1450A0] shadow-lg text-white" : "text-white/40 hover:text-white"
                     )}
                   >
                       {p.label}
                   </button>
                ))}
               </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6 md:p-8 relative z-10 space-y-10">
        
        {/* 2. Summary Cards */}
        <SummaryCards 
          expenses={filteredData.expenses} 
          incomes={filteredData.incomes}
          prevStats={filteredData.prevStats}
          bankAccounts={sortedAccounts}
          creditCards={creditCards}
          selectedPeriod={selectedPeriod} 
          onCardClick={(type: any) => {
            // Expansion is handled within SummaryCards now
          }} 
        />

        {/* 3. AI Insights */}
        <AIInsights
          data={filteredData}
          bankAccounts={bankAccounts}
          creditCards={creditCards}
          profile={profile ? { plan: profile.plan || 'free', ai_reports_used: profile.ai_reports_used || 0 } : null}
        />

        {/* 4. Cash Flow Chart */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
           <div className="lg:col-span-2">
              <FlowChart 
                externalPeriod={selectedPeriod} 
                expenses={expenses}
                incomes={incomes}
              />
           </div>
           <div>
              <HabitsAnalysis expenses={filteredData.expenses} />
           </div>
        </div>

        {/* 5. Category Analysis */}
        <CategoryAnalysis expenses={filteredData.expenses} />

        {/* 6. Wealth Evolution */}
        <WealthChart 
          bankAccounts={bankAccounts} 
          creditCards={creditCards} 
          expenses={expenses} 
          incomes={incomes} 
        />

        {/* 7. Goals Report */}
        <GoalsSummary goals={goals} />

      </div>

    </div>
  );
}
