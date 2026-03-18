import React from 'react';

export default function BudgetPage() {
  return (
    <div className="flex flex-col max-w-lg mx-auto w-full space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <h1 className="text-2xl font-bold text-white">Presupuesto</h1>
        <div className="flex gap-2">
          <button className="p-2 bg-surface hover:bg-white/10 rounded-full transition-colors border border-white/5">
            <span className="material-symbols-outlined text-white">add</span>
          </button>
          <button className="p-2 bg-surface hover:bg-white/10 rounded-full transition-colors border border-white/5">
            <span className="material-symbols-outlined text-white">settings</span>
          </button>
        </div>
      </div>

      {/* Monthly Chart Section */}
      <section className="flex flex-col items-center">
        <div className="relative w-full flex justify-center items-center">
          <svg className="w-64 h-64" viewBox="0 0 36 36">
            <path
              className="fill-none stroke-white/5 stroke-[2.5]"
              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
            />
            <path
              className="fill-none stroke-[#5048e5] stroke-[2.8] stroke-linecap-round animate-[progress_1s_ease-out_forwards]"
              strokeDasharray="72, 100"
              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center pt-2">
            <span className="text-gray-400 text-sm font-medium">Gastado este mes</span>
            <span className="text-4xl font-bold mt-1 text-white">$2,450</span>
            <div className="h-px w-12 bg-white/20 my-2"></div>
            <span className="text-gray-400 text-xs">de $3,400</span>
          </div>
        </div>
      </section>

      {/* Alert Section */}
      <section>
        <div className="rounded-2xl p-4 flex items-center gap-4 bg-warning/10 border border-warning/20 backdrop-blur-md">
          <div className="flex-shrink-0 w-10 h-10 rounded-full bg-warning/20 flex items-center justify-center text-warning">
            <span className="material-symbols-outlined">warning</span>
          </div>
          <div>
            <p className="text-sm font-medium text-white">Límite alcanzado</p>
            <p className="text-xs text-gray-300">Has llegado al 85% de tu presupuesto de <span className="font-bold">Comida</span>.</p>
          </div>
        </div>
      </section>

      {/* Category Budget Section */}
      <section className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold text-white">Presupuesto por Categoría</h2>
          <button className="text-[#5048e5] text-sm font-medium hover:underline">Ver todos</button>
        </div>
        
        <div className="space-y-5">
          {/* Category: Comida */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="flex items-center gap-2 text-white">
                <span className="p-1.5 rounded-lg bg-surface text-xl">🍔</span>
                Comida
              </span>
              <span className="font-medium text-white">$850 <span className="text-gray-500 font-normal">/ $1,000</span></span>
            </div>
            <div className="h-2.5 w-full bg-surface rounded-full overflow-hidden">
              <div className="h-full bg-warning rounded-full transition-all duration-500" style={{ width: '85%' }}></div>
            </div>
          </div>

          {/* Category: Entretenimiento */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="flex items-center gap-2 text-white">
                <span className="p-1.5 rounded-lg bg-surface text-xl">🎬</span>
                Entretenimiento
              </span>
              <span className="font-medium text-white">$300 <span className="text-gray-500 font-normal">/ $500</span></span>
            </div>
            <div className="h-2.5 w-full bg-surface rounded-full overflow-hidden">
              <div className="h-full bg-[#5048e5] rounded-full transition-all duration-500" style={{ width: '60%' }}></div>
            </div>
          </div>

          {/* Category: Transporte */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="flex items-center gap-2 text-white">
                <span className="p-1.5 rounded-lg bg-surface text-xl">🚗</span>
                Transporte
              </span>
              <span className="font-medium text-white">$160 <span className="text-gray-500 font-normal">/ $400</span></span>
            </div>
            <div className="h-2.5 w-full bg-surface rounded-full overflow-hidden">
              <div className="h-full bg-emerald-500 rounded-full transition-all duration-500" style={{ width: '40%' }}></div>
            </div>
          </div>
        </div>
      </section>
      
      <div className="h-10"></div>
    </div>
  );
}
