import { useState } from "react";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Plus, UploadCloud } from "lucide-react";

export function NewExpenseModal() {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-primary text-white hover:bg-primary-hover border-none font-medium">
          <Plus className="w-5 h-5 mr-1" /> Nuevo gasto
        </Button>
      </DialogTrigger>
      
      <DialogContent className="sm:max-w-[425px] bg-[#1A1A1A] border-[#2A2A2A] text-white">
        <DialogHeader>
          <DialogTitle className="text-xl">Agregar nuevo gasto</DialogTitle>
        </DialogHeader>
        
        <div className="grid gap-6 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="monto" className="text-right text-gray-400">
              Monto
            </Label>
            <div className="col-span-3 relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">$</span>
              <Input
                id="monto"
                type="number"
                placeholder="0.00"
                className="pl-8 bg-[#0F0F0F] border-[#2A2A2A] text-white font-medium text-lg h-12"
              />
            </div>
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="comercio" className="text-right text-gray-400">
              Comercio
            </Label>
            <Input
              id="comercio"
              placeholder="Ej. McDonald's"
              className="col-span-3 bg-[#0F0F0F] border-[#2A2A2A] text-white"
            />
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label className="text-right text-gray-400">Categoría</Label>
            <div className="col-span-3">
              <Select>
                <SelectTrigger className="bg-[#0F0F0F] border-[#2A2A2A] text-white w-full">
                  <SelectValue placeholder="Selecciona..." />
                </SelectTrigger>
                <SelectContent className="bg-[#1A1A1A] border-[#2A2A2A] text-white">
                  <SelectItem value="comida">🍔 Comida</SelectItem>
                  <SelectItem value="transporte">🚗 Transporte</SelectItem>
                  <SelectItem value="salud">🏥 Salud</SelectItem>
                  <SelectItem value="ocio">🍿 Ocio</SelectItem>
                  <SelectItem value="hogar">🏠 Hogar</SelectItem>
                  <SelectItem value="otros">📦 Otros</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label className="text-right text-gray-400">Método</Label>
            <div className="col-span-3">
              <Select defaultValue="efectivo">
                <SelectTrigger className="bg-[#0F0F0F] border-[#2A2A2A] text-white w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-[#1A1A1A] border-[#2A2A2A] text-white">
                  <SelectItem value="efectivo">Efectivo / Transferencia</SelectItem>
                  <SelectItem value="tarjeta_debito">Tarjeta de Débito</SelectItem>
                  <SelectItem value="tarjeta_credito">Tarjeta de Crédito</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-4 items-start gap-4">
            <Label className="text-right text-gray-400 mt-2">Factura</Label>
            <div className="col-span-3">
              <div className="border-2 border-dashed border-[#2A2A2A] rounded-lg p-6 flex flex-col items-center justify-center text-center hover:bg-[#0F0F0F] transition-colors cursor-pointer group">
                <div className="w-10 h-10 rounded-full bg-[#2A2A2A] flex items-center justify-center mb-2 group-hover:bg-primary/20 group-hover:text-primary transition-colors">
                  <UploadCloud className="w-5 h-5" />
                </div>
                <p className="text-sm font-medium text-white">Subir foto o PDF</p>
                <p className="text-xs text-gray-500 mt-1">Arrastra tu archivo aquí</p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3 mt-2 pt-4 border-t border-[#2A2A2A]">
          <Button variant="ghost" onClick={() => setOpen(false)} className="text-white hover:bg-white/5 hover:text-white">
            Cancelar
          </Button>
          <Button type="submit" className="bg-primary hover:bg-primary-hover text-white">
            Guardar gasto
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
