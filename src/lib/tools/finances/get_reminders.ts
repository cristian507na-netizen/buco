import { SystemTool } from '../index';

export const getReminders: SystemTool = {
  name: 'get_reminders',
  description: 'Obtiene los próximos recordatorios o pagos pendientes que no han sido leídos.',
  inputSchema: {
    type: 'object',
    properties: {
      days_ahead: {
        type: 'number',
        description: 'Cantidad de días hacia adelante para buscar recordatorios (ej: 7).'
      }
    },
    required: ['days_ahead']
  },
  execute: async ({ days_ahead }, { supabase, userId }) => {
    const days = Number(days_ahead) || 7;
    const now = new Date();
    const future = new Date();
    future.setDate(future.getDate() + days);

    const { data: reminders } = await supabase
      .from('reminders')
      .select('title, amount, due_date, leido')
      .eq('user_id', userId)
      .eq('leido', false)
      .lte('due_date', future.toISOString())
      .order('due_date', { ascending: true });

    const result = (reminders || []).map(r => {
      const diff = new Date(r.due_date).getTime() - now.getTime();
      const daysUntil = Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
      
      return {
        titulo: r.title,
        monto: Number(r.amount),
        fecha: r.due_date,
        daysUntil
      };
    });

    return result;
  }
};
