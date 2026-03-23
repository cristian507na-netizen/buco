import { memo } from "react";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { FileIcon, MoreVertical, Edit2, Trash2, Receipt } from "lucide-react";
import { Expense } from "@/types/finance";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const categoryColors: Record<string, string> = {
  comida: "bg-success/10 text-success border-success/20",
  transporte: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  salud: "bg-red-500/10 text-red-400 border-red-500/20",
  ocio: "bg-pink-500/10 text-pink-400 border-pink-500/20",
  hogar: "bg-orange-500/10 text-orange-400 border-orange-500/20",
  suscripciones: "bg-purple-500/10 text-purple-400 border-purple-500/20",
  otros: "bg-gray-500/10 text-gray-400 border-gray-500/20",
};

const categoryEmojis: Record<string, string> = {
  comida: "🍔",
  transporte: "🚗",
  salud: "🏥",
  suscripciones: "📺",
  hogar: "🏠",
  ocio: "🎉",
  otros: "🛍️",
};

interface ExpenseListProps {
  items: Expense[];
}

export const ExpenseList = memo(function ExpenseList({ items }: ExpenseListProps) {
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' });
  };

  return (
    <Card className="buco-card bg-surface w-full overflow-hidden">
      <div className="overflow-x-auto min-h-[300px]">
        {items.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="h-16 w-16 rounded-full bg-surface-dark flex items-center justify-center mb-4">
              <Receipt className="h-8 w-8 text-gray-600" />
            </div>
            <h3 className="text-lg font-medium text-white mb-1">Sin gastos registrados</h3>
            <p className="text-sm text-gray-500 max-w-xs">Tus gastos aparecerán aquí tan pronto como los registres en la app o por WhatsApp.</p>
          </div>
        ) : (
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-gray-400 uppercase bg-surface/50 border-b border-border">
              <tr>
                <th className="px-6 py-4 font-semibold tracking-wider">Comercio</th>
                <th className="px-6 py-4 font-semibold tracking-wider hidden md:table-cell text-center">Categoría</th>
                <th className="px-6 py-4 font-semibold tracking-wider hidden sm:table-cell text-center">Método</th>
                <th className="px-6 py-4 font-semibold tracking-wider text-center">Fecha</th>
                <th className="px-6 py-4 font-semibold tracking-wider text-right">Monto</th>
                <th className="px-6 py-4 font-semibold tracking-wider text-center">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50">
              {items.map((item) => (
                <tr key={item.id} className="hover:bg-white/5 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 shrink-0 flex items-center justify-center rounded-full bg-surface-dark border border-border group-hover:border-primary/50 transition-colors text-lg shadow-sm">
                        {categoryEmojis[item.categoria] || "🛍️"}
                      </div>
                      <div className="flex flex-col">
                        <span className="font-medium text-white group-hover:text-primary transition-colors">
                          {item.comercio || item.descripcion || 'Sin nombre'}
                        </span>
                        <span className="md:hidden text-[10px] text-gray-400 mt-0.5 capitalize flex items-center gap-1">
                          {item.categoria} • {item.metodo_pago}
                        </span>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 hidden md:table-cell text-center">
                    <Badge variant="outline" className={`capitalize border text-[10px] font-bold px-2 py-0.5 tracking-wide ${categoryColors[item.categoria] || categoryColors.otros}`}>
                      {item.categoria}
                    </Badge>
                  </td>
                  <td className="px-6 py-4 text-gray-400 hidden sm:table-cell text-center capitalize text-xs">
                    {item.metodo_pago.replace('_', ' ')}
                  </td>
                  <td className="px-6 py-4 text-gray-400 text-center text-xs">
                    {formatDate(item.fecha)}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <span className="font-bold text-white text-base">
                      ${Number(item.monto).toFixed(2)}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <div className="flex items-center justify-center gap-3">
                      {item.factura_url && (
                        <button className="text-gray-500 hover:text-primary transition-all cursor-pointer transform hover:scale-110" title="Ver factura">
                          <FileIcon className="w-4 h-4" />
                        </button>
                      )}
                      
                      <DropdownMenu>
                        <DropdownMenuTrigger className="text-gray-500 hover:text-white transition-colors outline-none cursor-pointer flex items-center justify-center h-8 w-8 rounded-full hover:bg-white/10">
                          <MoreVertical className="w-4 h-4" />
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="bg-surface border-border p-1 min-w-[140px] shadow-xl">
                          <DropdownMenuItem className="focus:bg-white/10 hover:bg-white/10 cursor-pointer rounded-lg">
                            <Edit2 className="w-4 h-4 mr-2" /> Editar
                          </DropdownMenuItem>
                          <DropdownMenuItem className="text-alert focus:bg-alert/10 hover:bg-alert/10 cursor-pointer rounded-lg">
                            <Trash2 className="w-4 h-4 mr-2" /> Eliminar
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
      
      {items.length > 0 && (
        <div className="p-4 border-t border-border flex justify-center bg-surface/30">
          <button className="text-xs font-semibold text-gray-500 hover:text-white transition-colors uppercase tracking-widest px-6 py-2">
            Ver más historial
          </button>
        </div>
      )}
    </Card>
  );
});
