import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import AccountsClient from "@/components/accounts/AccountsClient";

export default async function CardsPage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return redirect("/login");

  const now = new Date();
  const mes = now.getMonth() + 1;
  const ano = now.getFullYear();

  // Fetch all financial entities
  const [
    { data: cards },
    { data: accounts },
    { data: budgets },
    { data: recentTxs },
    { data: monthlyExpenses }
  ] = await Promise.all([
    supabase.from('credit_cards').select('*').eq('user_id', user.id).eq('activa', true),
    supabase.from('bank_accounts').select('*').eq('user_id', user.id).order('created_at', { ascending: false }),
    supabase.from('budgets').select('categoria, limite_mensual').eq('user_id', user.id).eq('mes', mes).eq('ano', ano),
    supabase.from('expenses').select('*').eq('user_id', user.id).order('fecha', { ascending: false }).limit(5),
    supabase.from('expenses').select('monto, categoria').eq('user_id', user.id).gte('fecha', new Date(now.getFullYear(), now.getMonth(), 1).toISOString())
  ]);

  // Aggregate monthly expenses by category
  const expensesByCategory: Record<string, number> = {};
  monthlyExpenses?.forEach(exp => {
    expensesByCategory[exp.categoria] = (expensesByCategory[exp.categoria] || 0) + Number(exp.monto);
  });

  return (
    <AccountsClient 
      cards={cards || []} 
      accounts={accounts || []} 
      budgets={budgets || []}
      expensesByCategory={expensesByCategory}
      recentTransactions={recentTxs || []}
      userId={user.id} 
    />
  );
}
