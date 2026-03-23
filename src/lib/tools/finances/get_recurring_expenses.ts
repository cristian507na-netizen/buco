import { SystemTool } from '../index';

export const getRecurringExpenses: SystemTool = {
  name: 'get_recurring_expenses',
  description: 'Identifica gastos recurrentes o suscripciones del usuario basados en las transacciones de los últimos 90 días.',
  inputSchema: {
    type: 'object',
    properties: {},
  },
  execute: async (_, { supabase, userId }) => {
    const ninetyDaysAgo = new Date();
    ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);

    const { data: expenses } = await supabase
      .from('expenses')
      .select('monto, descripcion, categoria, fecha')
      .eq('user_id', userId)
      .gte('fecha', ninetyDaysAgo.toISOString())
      .order('fecha', { ascending: false });

    const expenseMap = new Map<string, any>();

    (expenses || []).forEach(e => {
      const descDesc = e.descripcion?.toLowerCase().trim() || 'Desconocido';
      const key = `${descDesc}-${e.monto}`;
      const isSubscription = e.categoria?.toLowerCase().includes('suscrip');

      const current = expenseMap.get(key) || { name: e.descripcion, amount: e.monto, count: 0, lastDate: e.fecha, isSubscription };
      expenseMap.set(key, { 
        ...current, 
        count: current.count + 1, 
        lastDate: current.lastDate < e.fecha ? e.fecha : current.lastDate,
        isSubscription: current.isSubscription || isSubscription
      });
    });

    const recurring = Array.from(expenseMap.values())
      .filter(item => item.count >= 2 || item.isSubscription) 
      .map(item => ({
        name: item.name,
        amount: Number(item.amount),
        frequency: item.count >= 3 ? 'mensual_estimado' : (item.isSubscription ? 'suscripción' : 'recurrente'),
        lastDate: item.lastDate
      }))
      .sort((a, b) => b.amount - a.amount);

    return recurring;
  }
};
