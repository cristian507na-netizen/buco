import React from 'react';

export default function CardsPage() {
  return (
    <div className="flex flex-col max-w-lg mx-auto w-full space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <h1 className="text-2xl font-bold text-white">Tarjetas</h1>
        <button className="p-2 bg-surface hover:bg-white/10 rounded-lg transition-colors border border-white/10">
          <span className="material-symbols-outlined text-gray-400">add</span>
        </button>
      </div>

      {/* Virtual Card Section */}
      <section className="space-y-4">
        <div className="bg-gradient-to-br from-[#5048e5] to-indigo-900 p-6 rounded-2xl shadow-2xl relative overflow-hidden aspect-[1.58/1] flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <span className="material-symbols-outlined text-4xl opacity-80 text-white">contactless</span>
            <span className="font-bold tracking-widest italic text-xl text-white">PREMIUM</span>
          </div>
          <div>
            <p className="text-white/70 text-xs font-medium uppercase tracking-wider mb-1">Balance Actual</p>
            <p className="text-white text-3xl font-bold tracking-tight">$1,200.50</p>
          </div>
          <div className="flex justify-between items-end">
            <div className="space-y-1">
              <p className="text-white/80 font-mono tracking-widest text-sm">•••• 5824</p>
              <p className="text-white/60 text-[10px] uppercase">Exp: 08/28</p>
            </div>
            <div className="h-8 w-12 bg-white/20 rounded-md flex items-center justify-center backdrop-blur-sm relative overflow-hidden">
               <div className="w-5 h-5 rounded-full bg-red-500/80 absolute left-1"></div>
               <div className="w-5 h-5 rounded-full bg-yellow-500/80 absolute right-1"></div>
            </div>
          </div>
        </div>

        {/* Card Stats */}
        <div className="grid grid-cols-2 gap-4">
          <div className="buco-card p-4 rounded-xl">
            <p className="text-gray-400 text-xs font-medium mb-1">Cupo Total</p>
            <p className="text-lg font-bold text-white">$5,000.00</p>
          </div>
          <div className="buco-card p-4 rounded-xl border border-[#5048e5]/30 bg-[#5048e5]/5">
            <p className="text-gray-400 text-xs font-medium mb-1">Cupo Disponible</p>
            <p className="text-lg font-bold text-[#5048e5]">$3,799.50</p>
          </div>
        </div>
      </section>

      {/* Smart Warning Alert */}
      <section>
        <div className="rounded-xl p-4 flex gap-3 items-center border border-warning/20 bg-warning/10 text-warning">
          <div className="flex-shrink-0">
            <span className="material-symbols-outlined text-2xl">warning</span>
          </div>
          <p className="text-sm font-medium leading-tight text-white">
            Si solo pagas el mínimo, tu deuda crecerá <span className="text-warning font-bold">15%</span> en 6 meses.
          </p>
        </div>
      </section>

      {/* Important Dates */}
      <section className="buco-card rounded-xl overflow-hidden">
        <div className="p-4 border-b border-white/5 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-gray-400 text-sm">calendar_today</span>
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Detalles del Estado</span>
          </div>
        </div>
        <div className="divide-y divide-white/5">
          <div className="p-4 flex justify-between items-center">
            <p className="text-gray-300 text-sm">Fecha de Corte</p>
            <p className="font-bold text-white">28 Oct</p>
          </div>
          <div className="p-4 flex justify-between items-center bg-[#5048e5]/5">
            <p className="text-gray-300 text-sm">Fecha de Pago</p>
            <p className="font-bold text-[#5048e5]">12 Nov</p>
          </div>
        </div>
      </section>

      {/* Recent Transactions */}
      <section className="space-y-4">
        <div className="flex justify-between items-end px-1">
          <h3 className="text-lg font-bold text-white">Movimientos Recientes</h3>
          <button className="text-[#5048e5] text-sm font-medium hover:underline">Ver Todos</button>
        </div>
        <div className="space-y-3">
          <div className="flex items-center justify-between p-4 buco-card rounded-xl">
            <div className="flex items-center gap-4">
              <div className="size-10 bg-surface rounded-full flex items-center justify-center">
                <span className="material-symbols-outlined text-gray-300">phone_iphone</span>
              </div>
              <div>
                <p className="font-semibold text-sm text-white">Apple Store</p>
                <p className="text-gray-400 text-xs">Electrónica • Hoy</p>
              </div>
            </div>
            <p className="font-bold text-sm text-white">-$99.00</p>
          </div>
          
          <div className="flex items-center justify-between p-4 buco-card rounded-xl">
            <div className="flex items-center gap-4">
              <div className="size-10 bg-[#00704A]/20 rounded-full flex items-center justify-center">
                <span className="material-symbols-outlined text-[#00704A]">local_cafe</span>
              </div>
              <div>
                <p className="font-semibold text-sm text-white">Starbucks</p>
                <p className="text-gray-400 text-xs">Comida • Ayer</p>
              </div>
            </div>
            <p className="font-bold text-sm text-white">-$5.50</p>
          </div>

          <div className="flex items-center justify-between p-4 buco-card rounded-xl">
            <div className="flex items-center gap-4">
              <div className="size-10 bg-blue-500/20 rounded-full flex items-center justify-center">
                <span className="material-symbols-outlined text-blue-500">local_gas_station</span>
              </div>
              <div>
                <p className="font-semibold text-sm text-white">Gasolinera</p>
                <p className="text-gray-400 text-xs">Transporte • 24 Oct</p>
              </div>
            </div>
            <p className="font-bold text-sm text-white">-$42.00</p>
          </div>
        </div>
      </section>
      
      <div className="h-10"></div>
    </div>
  );
}
