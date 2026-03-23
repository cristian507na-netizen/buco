"use client";
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
import { Plus, UploadCloud, Loader2 } from "lucide-react";
import { createExpense } from "@/app/expenses/actions";
import { parseMoney } from "@/lib/format";

export function NewExpenseModal() {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [monto, setMonto] = useState("");

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData(event.currentTarget);
    const result = await createExpense(formData);

    if (result.error) {
      setError(result.error);
      setLoading(false);
    } else {
      setLoading(false);
      setOpen(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger className="bg-primary hover:bg-primary-hover text-white font-semibold h-10 px-6 rounded-xl flex items-center justify-center transition-all active:scale-95 shadow-lg shadow-primary/20 border-none cursor-pointer">
        <Plus className="w-5 h-5 mr-1" /> Nuevo gasto
      </DialogTrigger>
      
      <DialogContent className="sm:max-w-[440px] bg-surface-dark border-border text-white shadow-2xl p-0 overflow-hidden">
        <form onSubmit={handleSubmit}>
          <DialogHeader className="p-6 pb-0">
            <DialogTitle className="text-xl font-bold tracking-tight">Agregar gasto</DialogTitle>
          </DialogHeader>
          
          <div className="grid gap-5 p-6 pt-4">
            {error && (
              <div className="bg-alert/10 border border-alert/20 text-alert p-3 rounded-lg text-xs font-medium">
                {error}
              </div>
            )}
            
            <div className="flex flex-col gap-2">
              <Label htmlFor="monto" className="text-sm font-semibold text-gray-400">
                Monto
              </Label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-2xl font-bold text-gray-500">$</span>
                <Input
                  id="monto"
                  name="monto"
                  type="text"
                  required
                  placeholder="0.00"
                  value={monto}
                  onChange={(e) => setMonto(parseMoney(e.target.value))}
                  className="pl-10 bg-surface border-border text-white font-bold text-3xl h-16 rounded-2xl focus:ring-primary focus:border-primary shadow-inner"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-2">
                <Label htmlFor="categoria" className="text-sm font-semibold text-gray-400">Categoría</Label>
                <Select name="categoria" defaultValue="comida">
                  <SelectTrigger className="bg-surface border-border text-white h-12 rounded-xl">
                    <SelectValue placeholder="Categoría" />
                  </SelectTrigger>
                  <SelectContent className="bg-surface-dark border-border text-white">
                    <SelectItem value="comida">🍔 Comida</SelectItem>
                    <SelectItem value="transporte">🚗 Transporte</SelectItem>
                    <SelectItem value="salud">🏥 Salud</SelectItem>
                    <SelectItem value="ocio">🍿 Ocio</SelectItem>
                    <SelectItem value="hogar">🏠 Hogar</SelectItem>
                    <SelectItem value="suscripciones">📺 Suscripciones</SelectItem>
                    <SelectItem value="otros">📦 Otros</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex flex-col gap-2">
                <Label htmlFor="metodo_pago" className="text-sm font-semibold text-gray-400">Método</Label>
                <Select name="metodo_pago" defaultValue="efectivo">
                  <SelectTrigger className="bg-surface border-border text-white h-12 rounded-xl">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-surface-dark border-border text-white">
                    <SelectItem value="efectivo">💵 Efectivo</SelectItem>
                    <SelectItem value="tarjeta_debito">💳 Débito</SelectItem>
                    <SelectItem value="tarjeta_credito">💳 Crédito</SelectItem>
                    <SelectItem value="transferencia">🏦 Transfer</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="comercio" className="text-sm font-semibold text-gray-400">
                Comercio
              </Label>
              <Input
                id="comercio"
                name="comercio"
                placeholder="Ej. McDonald's, Uber, Amazon..."
                className="bg-surface border-border text-white h-12 rounded-xl"
              />
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="fecha" className="text-sm font-semibold text-gray-400">
                Fecha
              </Label>
              <Input
                id="fecha"
                name="fecha"
                type="date"
                defaultValue={new Date().toISOString().split('T')[0]}
                className="bg-surface border-border text-white h-12 rounded-xl [color-scheme:dark]"
              />
            </div>

            <div className="flex flex-col gap-2">
               <Label className="text-sm font-semibold text-gray-400">Factura (Opcional)</Label>
               <div className="border border-dashed border-border rounded-xl p-4 flex flex-col items-center justify-center text-center hover:bg-white/5 transition-colors cursor-pointer group">
                  <div className="w-8 h-8 rounded-full bg-surface flex items-center justify-center mb-1 group-hover:text-primary transition-colors">
                    <UploadCloud className="w-4 h-4" />
                  </div>
                  <p className="text-xs font-medium text-gray-400 italic">Próximamente: lectura con IA</p>
               </div>
            </div>
          </div>

          <div className="flex flex-col p-6 pt-0 gap-3">
            <Button 
                type="submit" 
                disabled={loading}
                className="bg-primary hover:bg-primary-hover text-white h-12 rounded-xl font-bold shadow-lg shadow-primary/20"
            >
              {loading ? (
                <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Guardando...</>
              ) : (
                "Guardar gasto"
              )}
            </Button>
            <Button 
                type="button" 
                variant="ghost" 
                onClick={() => setOpen(false)} 
                className="text-gray-500 hover:text-white hover:bg-white/5 h-10 rounded-xl"
            >
              Cancelar
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

