import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import GoalsClient from "@/components/goals/GoalsClient";

export default async function GoalsPage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return redirect("/login");

  const [
    { data: goals },
    { data: cards },
    { data: categories },
    { data: contributions },
    { data: expenses },
    { data: incomes }
  ] = await Promise.all([
    supabase.from('savings_goals').select('*').eq('user_id', user.id).order('created_at', { ascending: false }),
    supabase.from('credit_cards').select('*').eq('user_id', user.id),
    supabase.from('expenses').select('categoria').eq('user_id', user.id),
    supabase.from('goal_contributions').select('*').eq('user_id', user.id).order('created_at', { ascending: false }).limit(100),
    supabase.from('expenses').select('*').eq('user_id', user.id).order('fecha', { ascending: false }).limit(100),
    supabase.from('incomes').select('*').eq('user_id', user.id).order('fecha', { ascending: false }).limit(100),
  ]);

  // Unique categories for the "Controlar Gastos" selector
  const uniqueCategories = Array.from(new Set(categories?.map(c => c.categoria) || []));

  return (
    <GoalsClient 
      initialGoals={goals || []} 
      initialContributions={contributions || []}
      initialExpenses={expenses || []}
      initialIncomes={incomes || []}
      accounts={cards || []} 
      categories={uniqueCategories}
      userId={user.id} 
    />
  );
}
