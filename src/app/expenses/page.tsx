import { Button } from "@/components/ui/button";
import { Plus, FileText, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { ExpenseList } from "@/components/expenses/expense-list";
import { ExpenseChart } from "@/components/expenses/expense-chart";
import { NewExpenseModal } from "@/components/expenses/new-expense-modal";

export default function ExpensesPage() {
  return (
    <div className="flex flex-col gap-6 max-w-6xl mx-auto w-full">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border/50 pb-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-white mb-1">Gastos</h1>
          <div className="flex items-baseline gap-3">
             <span className="text-gray-400">Marzo 2025</span>
             <span className="text-xl font-bold text-white">$2,180.00</span>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <Button variant="outline" className="bg-surface border-border text-white hover:bg-white/5">
            <FileText className="w-4 h-4 mr-2" />
            Importar PDF
          </Button>
          <NewExpenseModal />
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3 bg-surface p-4 rounded-xl border border-border">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input 
            placeholder="Buscar comercio..." 
            className="pl-9 bg-background border-border text-white h-10"
          />
        </div>
        
        <Select defaultValue="todas">
          <SelectTrigger className="w-[160px] bg-background border-border text-white h-10">
            <SelectValue placeholder="Categoría" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todas">Todas las categorías</SelectItem>
            <SelectItem value="comida">🍔 Comida</SelectItem>
            <SelectItem value="transporte">🚗 Transporte</SelectItem>
            <SelectItem value="salud">🏥 Salud</SelectItem>
            <SelectItem value="ocio">🍿 Ocio</SelectItem>
          </SelectContent>
        </Select>

        <Select defaultValue="mes">
          <SelectTrigger className="w-[140px] bg-background border-border text-white h-10">
            <SelectValue placeholder="Fecha" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="mes">Este mes</SelectItem>
            <SelectItem value="semana">Esta semana</SelectItem>
            <SelectItem value="custom">Personalizado</SelectItem>
          </SelectContent>
        </Select>

        <Select defaultValue="todos">
          <SelectTrigger className="w-[160px] bg-background border-border text-white h-10">
            <SelectValue placeholder="Método" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todos los métodos</SelectItem>
            <SelectItem value="efectivo">Efectivo</SelectItem>
            <SelectItem value="debito">Tarjeta Débito</SelectItem>
            <SelectItem value="credito">Tarjeta Crédito</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chart Column */}
        <div className="lg:col-span-1 space-y-6">
          <ExpenseChart />
          
          {/* Comparison */}
          <div className="buco-card p-4">
             <div className="flex items-center justify-between text-sm">
               <span className="text-gray-400">Feb: $1,950</span>
               <span className="text-white font-medium">Mar: $2,180</span>
               <span className="text-alert font-bold bg-alert/10 px-2 py-0.5 rounded text-xs">+11.8%</span>
             </div>
             <div className="w-full bg-surface h-2 mt-3 rounded-full overflow-hidden border border-border flex">
                <div className="bg-gray-500 w-[47%] h-full"></div>
                <div className="bg-alert w-[53%] h-full relative">
                  <div className="absolute left-0 top-0 w-1 h-full bg-background z-10"></div>
                </div>
             </div>
          </div>
        </div>

        {/* List Column */}
        <div className="lg:col-span-2">
          <ExpenseList />
        </div>
      </div>
    </div>
  );
}
