import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import ReportsClient from "@/components/reports/ReportsClient";

export default async function ReportsPage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return redirect("/login");

  // Fetch all basic data needed for reports
  const [
    { data: expenses },
    { data: incomes },
    { data: activeGoals },
    { data: bankAccounts },
    { data: creditCards },
    { data: profile }
  ] = await Promise.all([
    supabase.from('expenses').select('*').eq('user_id', user.id).order('fecha', { ascending: false }),
    supabase.from('incomes').select('*').eq('user_id', user.id).order('created_at', { ascending: false }),
    supabase.from('savings_goals').select('*').eq('user_id', user.id).order('created_at', { ascending: false }),
    supabase.from('bank_accounts').select('*').eq('user_id', user.id),
    supabase.from('credit_cards').select('*').eq('user_id', user.id),
    supabase.from('profiles').select('*').eq('id', user.id).single()
  ]);

  return (
    <ReportsClient
      userId={user.id}
      profile={profile || { plan: 'free' }}
      initialExpenses={expenses || []}
      initialIncomes={incomes || []}
      initialGoals={activeGoals || []}
      bankAccounts={bankAccounts || []}
      creditCards={creditCards || []}
    />
  );
}
