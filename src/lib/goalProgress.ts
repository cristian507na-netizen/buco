export function calculateGoalProgress(currentAmount: number | string, targetAmount: number | string, type?: string): number {
  const current = Number(currentAmount) || 0;
  const target = Number(targetAmount) || 0;
  
  if (target <= 0) return 0;

  if (type === 'gasto') {
    const p = ((target - current) / target) * 100;
    return Math.min(100, Math.max(0, Math.round(p)));
  }
  
  const progress = (current / target) * 100;
  return Math.min(100, Math.max(0, Math.round(progress)));
}

export function calculateRealAmount(goal: any, contributions: any[], expenses: any[]): number {
  if (goal.type === 'gasto') {
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    return (expenses || []).filter((e: any) => {
      const isMatch = e.categoria === (goal.target_category || goal.category_limit_name);
      const expenseDate = e.fecha ? new Date(e.fecha) : new Date();
      return isMatch && expenseDate >= monthStart;
    }).reduce((acc: number, e: any) => acc + Number(e.monto || e.amount || 0), 0);
  }
  
  // Para ahorro, regalo, deuda, ingreso, habito: Supabase current_amount es la autoridad máxima
  return Number(goal.current_amount) || 0;
}
