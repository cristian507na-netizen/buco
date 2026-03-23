import { SystemTool } from './index';
import { getFinancialSummary } from './finances/get_financial_summary';
import { getExpensesByCategory } from './finances/get_expenses_by_category';
import { getRecurringExpenses } from './finances/get_recurring_expenses';
import { getGoalsStatus } from './finances/get_goals_status';
import { getCardsHealth } from './finances/get_cards_health';
import { getMonthlyTrend } from './finances/get_monthly_trend';
import { getReminders } from './finances/get_reminders';
import { analyzeSpendingHabits } from './finances/analyze_spending_habits';
import { getRecentTransactions } from './finances/get_recent_transactions';

export const registeredTools: SystemTool[] = [
  getFinancialSummary,
  getExpensesByCategory,
  getRecurringExpenses,
  getGoalsStatus,
  getCardsHealth,
  getMonthlyTrend,
  getReminders,
  analyzeSpendingHabits,
  getRecentTransactions,
];
