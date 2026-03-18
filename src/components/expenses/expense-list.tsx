import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { FileIcon, MoreVertical, Edit2, Trash2 } from "lucide-react";
import { Expense } from "@/types/finance";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// Mocks
const list: any[] = [
  { id: "1", comercio: "McDonald's", monto: 12.50, categoria: "comida", fecha: "Hoy", metodo: "Crédito", c_color: "success", hasFactura: true },
  { id: "2", comercio: "Uber", monto: 8.00, categoria: "transporte", fecha: "Ayer", metodo: "Efectivo", c_color: "blue", hasFactura: false },
  { id: "3", comercio: "Farmacia Arrocha", monto: 35.00, categoria: "salud", fecha: "15 Mar", metodo: "Débito", c_color: "red", hasFactura: true },
  { id: "4", comercio: "Netflix", monto: 15.99, categoria: "suscripciones", fecha: "14 Mar", metodo: "Crédito", c_color: "purple", isImported: true },
  { id: "5", comercio: "Gasolinera Texaco", monto: 45.00, categoria: "transporte", fecha: "13 Mar", metodo: "Efectivo", c_color: "blue", hasFactura: false },
  { id: "6", comercio: "Super 99", monto: 127.80, categoria: "comida", fecha: "12 Mar", metodo: "Débito", c_color: "success", hasFactura: true },
  { id: "7", comercio: "Alquiler", monto: 450.00, categoria: "hogar", fecha: "1 Mar", metodo: "Transferencia", c_color: "warning", isImported: true },
];

const emojis: any = { comida: "🍔", transporte: "🚗", salud: "🏥", suscripciones: "📺", hogar: "🏠" };

export function ExpenseList() {
  return (
    <Card className="buco-card bg-surface w-full overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="text-xs text-gray-400 uppercase bg-surface/50 border-b border-border">
            <tr>
              <th className="px-4 py-3 font-medium">Comercio</th>
              <th className="px-4 py-3 font-medium hidden md:table-cell">Categoría</th>
              <th className="px-4 py-3 font-medium hidden sm:table-cell">Método</th>
              <th className="px-4 py-3 font-medium">Fecha</th>
              <th className="px-4 py-3 font-medium text-right">Monto</th>
              <th className="px-4 py-3 font-medium text-center">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/50">
            {list.map((item) => (
              <tr key={item.id} className="hover:bg-white/5 transition-colors group">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 shrink-0 flex items-center justify-center rounded-full bg-background border border-border">
                      {emojis[item.categoria] || "🛍️"}
                    </div>
                    <div className="flex flex-col">
                      <span className="font-medium text-white">{item.comercio}</span>
                      {/* Mobile only category badge */}
                      <span className="md:hidden text-[10px] text-gray-500 mt-0.5 capitalize">{item.categoria}</span>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3 hidden md:table-cell">
                  <Badge variant="outline" className={`capitalize
                    ${item.c_color === 'success' ? 'bg-success/10 text-success border-success/20' : ''}
                    ${item.c_color === 'blue' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' : ''}
                    ${item.c_color === 'red' ? 'bg-red-500/10 text-red-400 border-red-500/20' : ''}
                    ${item.c_color === 'purple' ? 'bg-purple-500/10 text-purple-400 border-purple-500/20' : ''}
                    ${item.c_color === 'warning' ? 'bg-warning/10 text-warning border-warning/20' : ''}
                  `}>
                    {item.categoria}
                  </Badge>
                  {item.isImported && (
                    <span className="ml-2 text-[10px] bg-gray-800 text-gray-400 px-1.5 py-0.5 rounded">PDF</span>
                  )}
                </td>
                <td className="px-4 py-3 text-gray-400 hidden sm:table-cell">
                  {item.metodo}
                </td>
                <td className="px-4 py-3 text-gray-400">
                  {item.fecha}
                </td>
                <td className="px-4 py-3 text-right font-semibold text-white">
                  ${item.monto.toFixed(2)}
                </td>
                <td className="px-4 py-3 text-center">
                  <div className="flex items-center justify-center gap-2">
                    {item.hasFactura && (
                      <button className="text-gray-500 hover:text-primary transition-colors cursor-pointer" title="Ver factura">
                        <FileIcon className="w-4 h-4" />
                      </button>
                    )}
                    
                    <DropdownMenu>
                      <DropdownMenuTrigger className="text-gray-500 hover:text-white transition-colors outline-none cursor-pointer">
                        <MoreVertical className="w-4 h-4" />
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="bg-surface border-border">
                        <DropdownMenuItem className="focus:bg-white/10 hover:bg-white/10 cursor-pointer">
                          <Edit2 className="w-4 h-4 mr-2" /> Editar
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-alert focus:bg-alert/10 hover:bg-alert/10 cursor-pointer">
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
      </div>
      
      <div className="p-4 border-t border-border flex justify-center">
        <button className="text-sm text-gray-400 hover:text-white transition-colors">
          Cargar más transacciones...
        </button>
      </div>
    </Card>
  );
}
