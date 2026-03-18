import React from 'react';

export default function DebtsPage() {
  return (
    <div className="flex flex-col max-w-lg mx-auto w-full space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <h1 className="text-2xl font-bold text-white">Deudas</h1>
        <button className="p-2 bg-[#5048e5] hover:bg-indigo-600 rounded-lg transition-colors shadow-[0_0_20px_rgba(80,72,229,0.2)]">
          <span className="material-symbols-outlined text-white">add</span>
        </button>
      </div>

      {/* Main Debt Cards */}
      <section className="space-y-4">
        {/* Bank Loan Card (Circular Progress) */}
        <div className="buco-card p-5 rounded-2xl flex items-center justify-between gap-4 border border-white/5">
          <div className="space-y-1">
            <span className="text-xs font-medium text-gray-400 uppercase tracking-wider">Préstamo Bancario</span>
            <h2 className="text-2xl font-bold text-white">$5,250</h2>
            <p className="text-xs text-gray-500">Restante de $15,000</p>
          </div>
          <div className="relative w-20 h-20">
            <svg className="w-full h-full -rotate-90">
              <circle className="text-white/10" cx="40" cy="40" fill="transparent" r="32" stroke="currentColor" strokeWidth="6"></circle>
              <circle className="text-[#5048e5] transition-all duration-300" cx="40" cy="40" fill="transparent" r="32" stroke="currentColor" strokeDasharray="201" strokeDashoffset="70.35" strokeLinecap="round" strokeWidth="6"></circle>
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-xs font-bold text-white">65%</span>
            </div>
          </div>
        </div>

        {/* Personal Debt Card (Linear Progress) */}
        <div className="buco-card p-5 rounded-2xl space-y-4 border border-white/5">
          <div className="flex justify-between items-start">
            <div className="space-y-1">
              <span className="text-xs font-medium text-gray-400 uppercase tracking-wider">Deuda Personal</span>
              <h2 className="text-2xl font-bold text-white">$1,400</h2>
              <p className="text-xs text-gray-500">Restante de $2,000</p>
            </div>
            <div className="text-right">
              <span className="text-sm font-semibold text-[#5048e5]">30%</span>
            </div>
          </div>
          <div className="w-full bg-white/10 rounded-full h-2">
            <div className="bg-[#5048e5] h-2 rounded-full" style={{ width: '30%' }}></div>
          </div>
        </div>
      </section>

      {/* Projection Alert */}
      <section>
        <div className="buco-card border-l-4 border-l-[#5048e5] p-4 rounded-2xl flex items-center gap-4 bg-[#5048e5]/5">
          <div className="bg-[#5048e5]/20 p-2.5 rounded-xl">
            <span className="material-symbols-outlined text-[#5048e5]">rocket_launch</span>
          </div>
          <div>
            <p className="text-sm font-medium leading-snug text-gray-200">
              Si pagas <span className="text-[#5048e5] font-bold">$150 extra</span> al mes, terminarás de pagar en <span className="text-[#5048e5] font-bold">8 meses menos</span>.
            </p>
          </div>
        </div>
      </section>

      {/* Active Loans List */}
      <section className="space-y-4">
        <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-widest px-1">Otras Deudas</h3>
        <div className="space-y-3">
          {/* List Item 1 */}
          <div className="buco-card px-4 py-3 rounded-xl flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="size-10 rounded-full bg-surface flex items-center justify-center">
                <span className="material-symbols-outlined text-gray-400">credit_card</span>
              </div>
              <div>
                <p className="text-sm font-semibold text-white">Tarjeta Visa</p>
                <p className="text-xs text-gray-500">Siguiente: 12 Oct</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm font-bold text-white">$840.00</p>
              <div className="flex items-center gap-1 justify-end">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
                <p className="text-[10px] text-gray-400">80% Pagado</p>
              </div>
            </div>
          </div>

          {/* List Item 2 */}
          <div className="buco-card px-4 py-3 rounded-xl flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="size-10 rounded-full bg-surface flex items-center justify-center">
                <span className="material-symbols-outlined text-gray-400">account_balance</span>
              </div>
              <div>
                <p className="text-sm font-semibold text-white">Crédito Consumo</p>
                <p className="text-xs text-gray-500">Siguiente: 25 Oct</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm font-bold text-white">$2,100.00</p>
              <div className="flex items-center gap-1 justify-end">
                <div className="w-1.5 h-1.5 rounded-full bg-yellow-500"></div>
                <p className="text-[10px] text-gray-400">45% Pagado</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="h-10"></div>
    </div>
  );
}
