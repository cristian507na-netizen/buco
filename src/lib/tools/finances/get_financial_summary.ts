import { SystemTool } from '../index';
import { startOfDay, startOfWeek, startOfMonth, startOfYear } from 'date-fns';

export const getFinancialSummary: SystemTool = {
  name: 'get_financial_summary',
  description: 'Obtiene el resumen financiero (ingresos, gastos, balance y tasa de ahorro) para un período específico.',
  inputSchema: {
    type: 'object',
    properties: {
      period: {
        type: 'string',
        enum: ['day', 'week', 'month', 'year'],
        description: 'El período de tiempo a analizar.'
      }
    },
    required: ['period']
  },
  execute: async ({ period }, { supabase, userId }) => {
    const now = new Date();
    let startDate: Date;

    switch (period) {
      case 'day': startDate = startOfDay(now); break;
      case 'week': startDate = startOfWeek(now, { weekStartsOn: 1 }); break;
      case 'month': startDate = startOfMonth(now); break;
      case 'year': startDate = startOfYear(now); break;
      default: startDate = startOfMonth(now);
    }

    const { data: expenses } = await supabase
      .from('expenses')
      .select('monto')
      .eq('user_id', userId)
      .gte('fecha', startDate.toISOString());

    const { data: incomes } = await supabase
      .from('incomes')
      .select('monto')
      .eq('user_id', userId)
      .gte('fecha', startDate.toISOString());

    const totalExpenses = (expenses || []).reduce((acc, curr) => acc + Number(curr.monto), 0);
    const totalIncomes = (incomes || []).reduce((acc, curr) => acc + Number(curr.monto), 0);
    const netBalance = totalIncomes - totalExpenses;
    const savingsRate = totalIncomes > 0 ? (netBalance / totalIncomes) * 100 : 0;

    return {
      period,
      totalExpenses,
      totalIncomes,
      netBalance,
      savingsRate: Number(savingsRate.toFixed(2))
    };
  }
};
