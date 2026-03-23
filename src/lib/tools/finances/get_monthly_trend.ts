import { SystemTool } from '../index';
import { subMonths, startOfMonth, format } from 'date-fns';
import { es } from 'date-fns/locale';

export const getMonthlyTrend: SystemTool = {
  name: 'get_monthly_trend',
  description: 'Obtiene la tendencia de ingresos y gastos de los últimos 6 meses.',
  inputSchema: {
    type: 'object',
    properties: {},
  },
  execute: async (_, { supabase, userId }) => {
    const now = new Date();
    const sixMonthsAgo = startOfMonth(subMonths(now, 5));

    const { data: expenses } = await supabase
      .from('expenses')
      .select('monto, fecha')
      .eq('user_id', userId)
      .gte('fecha', sixMonthsAgo.toISOString());

    const { data: incomes } = await supabase
      .from('incomes')
      .select('monto, fecha')
      .eq('user_id', userId)
      .gte('fecha', sixMonthsAgo.toISOString());

    const monthMap = new Map<string, { incomes: number, expenses: number, label: string }>();

    for (let i = 5; i >= 0; i--) {
      const d = subMonths(now, i);
      const key = format(d, 'yyyy-MM');
      const label = format(d, 'MMM yyyy', { locale: es });
      monthMap.set(key, { incomes: 0, expenses: 0, label });
    }

    (incomes || []).forEach(i => {
      if (!i.fecha) return;
      const key = i.fecha.substring(0, 7);
      if (monthMap.has(key)) {
        const current = monthMap.get(key)!;
        current.incomes += Number(i.monto);
      }
    });

    (expenses || []).forEach(e => {
      if (!e.fecha) return;
      const key = e.fecha.substring(0, 7);
      if (monthMap.has(key)) {
        const current = monthMap.get(key)!;
        current.expenses += Number(e.monto);
      }
    });

    const result = Array.from(monthMap.entries()).map(([, data]) => ({
      month: data.label,
      incomes: data.incomes,
      expenses: data.expenses,
      balance: data.incomes - data.expenses
    }));

    return result;
  }
};
