import { SystemTool } from '../index';
import { startOfWeek, startOfMonth, startOfYear } from 'date-fns';

export const getExpensesByCategory: SystemTool = {
  name: 'get_expenses_by_category',
  description: 'Obtiene los gastos agrupados por categoría para un período específico.',
  inputSchema: {
    type: 'object',
    properties: {
      period: {
        type: 'string',
        enum: ['week', 'month', 'year'],
        description: 'El período de tiempo a analizar.'
      }
    },
    required: ['period']
  },
  execute: async ({ period }, { supabase, userId }) => {
    const now = new Date();
    let startDate: Date;

    switch (period) {
      case 'week': startDate = startOfWeek(now, { weekStartsOn: 1 }); break;
      case 'month': startDate = startOfMonth(now); break;
      case 'year': startDate = startOfYear(now); break;
      default: startDate = startOfMonth(now);
    }

    const { data: expenses } = await supabase
      .from('expenses')
      .select('monto, categoria')
      .eq('user_id', userId)
      .gte('fecha', startDate.toISOString());

    const totalExpenses = (expenses || []).reduce((acc, curr) => acc + Number(curr.monto), 0);
    
    const categoryMap = new Map<string, { total: number, count: number }>();
    
    (expenses || []).forEach(e => {
      const cat = e.categoria || 'Otros';
      const amount = Number(e.monto);
      const current = categoryMap.get(cat) || { total: 0, count: 0 };
      categoryMap.set(cat, { total: current.total + amount, count: current.count + 1 });
    });

    const result = Array.from(categoryMap.entries()).map(([category, data]) => ({
      category,
      total: data.total,
      count: data.count,
      percentage: totalExpenses > 0 ? Number(((data.total / totalExpenses) * 100).toFixed(1)) : 0
    })).sort((a, b) => b.total - a.total);

    return result;
  }
};
