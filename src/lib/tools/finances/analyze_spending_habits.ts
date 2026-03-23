import { SystemTool } from '../index';
import { startOfMonth, subMonths, getDay } from 'date-fns';

export const analyzeSpendingHabits: SystemTool = {
  name: 'analyze_spending_habits',
  description: 'Analiza los hábitos de gasto del usuario (días pico, categorías principales, promedios diarios).',
  inputSchema: {
    type: 'object',
    properties: {
      period: {
        type: 'string',
        enum: ['month', '3months'],
        description: 'El período a analizar.'
      }
    },
    required: ['period']
  },
  execute: async ({ period }, { supabase, userId }) => {
    const now = new Date();
    const monthsBack = period === '3months' ? 2 : 0;
    const startDate = startOfMonth(subMonths(now, monthsBack));

    const { data: expenses } = await supabase
      .from('expenses')
      .select('monto, categoria, fecha')
      .eq('user_id', userId)
      .gte('fecha', startDate.toISOString());

    if (!expenses || expenses.length === 0) {
      return { message: "No hay suficientes datos para analizar hábitos en este período." };
    }

    let total = 0;
    const categoryMap = new Map<string, number>();
    const dayOfWeekMap = new Map<number, number>();

    expenses.forEach(e => {
      const amount = Number(e.monto);
      total += amount;
      
      const cat = e.categoria || 'Otros';
      categoryMap.set(cat, (categoryMap.get(cat) || 0) + amount);

      if (e.fecha) {
        // Fix timezone issue by parsing date correctly
        const parts = e.fecha.split('T')[0].split('-');
        const dateObj = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
        const day = getDay(dateObj); // 0 = Sunday, 1 = Monday, etc.
        dayOfWeekMap.set(day, (dayOfWeekMap.get(day) || 0) + amount);
      }
    });

    // Top Category
    let topCategory = '';
    let topCategoryAmount = 0;
    categoryMap.forEach((amount, cat) => {
      if (amount > topCategoryAmount) {
        topCategory = cat;
        topCategoryAmount = amount;
      }
    });

    // Peak Day of Week
    let peakDayIdx = 0;
    let peakDayAmount = 0;
    dayOfWeekMap.forEach((amount, day) => {
      if (amount > peakDayAmount) {
        peakDayIdx = day;
        peakDayAmount = amount;
      }
    });
    const days = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
    
    // Avg daily spend
    const daysInPeriod = period === '3months' ? 90 : 30;
    const avgDailySpend = total / daysInPeriod;

    return {
      topCategory,
      topCategoryPercentage: Number(((topCategoryAmount / total) * 100).toFixed(1)),
      avgDailySpend: Number(avgDailySpend.toFixed(2)),
      peakDayOfWeek: days[peakDayIdx],
      totalSpent: total
    };
  }
};
