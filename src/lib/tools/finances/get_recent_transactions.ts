import { SystemTool } from '../index';

export const getRecentTransactions: SystemTool = {
  name: 'get_recent_transactions',
  description: 'Obtiene las transacciones individuales más recientes del usuario (gastos e ingresos), ordenadas por fecha descendente. Usar para preguntas como "¿cuál fue mi último gasto?", "muéstrame mis últimas transacciones", "¿qué gasté ayer?", "¿cuánto fue mi último movimiento?".',
  inputSchema: {
    type: 'object',
    properties: {
      limit: {
        type: 'number',
        description: 'Número de transacciones a retornar (1-20). Default 5.'
      },
      type: {
        type: 'string',
        enum: ['expense', 'income', 'all'],
        description: '"expense" solo gastos, "income" solo ingresos, "all" ambos. Default "expense".'
      }
    },
    required: []
  },
  execute: async ({ limit = 5, type = 'expense' }, { supabase, userId }) => {
    const n = Math.min(Number(limit), 20);

    const [{ data: expenses }, { data: incomes }] = await Promise.all([
      type !== 'income'
        ? supabase
            .from('expenses')
            .select('monto, categoria, fecha, descripcion, comercio, metodo_pago')
            .eq('user_id', userId)
            .order('fecha', { ascending: false })
            .limit(n)
        : Promise.resolve({ data: [] }),
      type !== 'expense'
        ? supabase
            .from('incomes')
            .select('monto, categoria, fecha, descripcion')
            .eq('user_id', userId)
            .order('fecha', { ascending: false })
            .limit(n)
        : Promise.resolve({ data: [] }),
    ]);

    const expenseRows = (expenses || []).map(e => ({
      tipo: 'gasto',
      monto: Number(e.monto),
      categoria: e.categoria || 'Sin categoría',
      fecha: e.fecha,
      descripcion: e.comercio || e.descripcion || null,
      metodo_pago: e.metodo_pago || null,
    }));

    const incomeRows = (incomes || []).map(i => ({
      tipo: 'ingreso',
      monto: Number(i.monto),
      categoria: i.categoria || 'otros',
      fecha: i.fecha,
      descripcion: i.descripcion || null,
      metodo_pago: null,
    }));

    const combined = [...expenseRows, ...incomeRows]
      .sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime())
      .slice(0, n);

    if (combined.length === 0) {
      return { message: 'No hay transacciones recientes.' };
    }

    return combined;
  }
};
