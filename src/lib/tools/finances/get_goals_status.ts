import { SystemTool } from '../index';

export const getGoalsStatus: SystemTool = {
  name: 'get_goals_status',
  description: 'Obtiene el progreso de las metas de ahorro, presupuesto o pago de deudas activas.',
  inputSchema: {
    type: 'object',
    properties: {},
  },
  execute: async (_, { supabase, userId }) => {
    const { data: goals } = await supabase
      .from('savings_goals')
      .select('name, target_amount, current_amount, type, deadline, status')
      .eq('user_id', userId)
      .eq('status', 'active');

    const result = (goals || []).map(goal => {
      const target = Number(goal.target_amount) || 0;
      const current = Number(goal.current_amount) || 0;
      const progressPct = target > 0 ? Math.min((current / target) * 100, 100) : 0;
      
      let daysRemaining: number | null = null;
      let monthlyNeeded: number | null = null;

      if (goal.deadline) {
        const diff = new Date(goal.deadline).getTime() - new Date().getTime();
        daysRemaining = Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
        
        if (daysRemaining > 0 && target > current) {
          const monthsRemaining = daysRemaining / 30;
          monthlyNeeded = (target - current) / Math.max(1, monthsRemaining);
        }
      }

      return {
        nombre: goal.name,
        targetAmount: target,
        currentAmount: current,
        progressPct: Number(progressPct.toFixed(1)),
        daysRemaining,
        monthlyNeeded: monthlyNeeded ? Number(monthlyNeeded.toFixed(2)) : null,
        tipo: goal.type
      };
    });

    return result;
  }
};
