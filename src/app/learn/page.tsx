import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { MODULES, TOTAL_CHAPTERS } from "@/lib/learn-content";
import LearnClient from "@/components/learn/LearnClient";

export default async function LearnPage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return redirect("/login");

  // Fetch user progress
  const { data: progress } = await supabase
    .from("learn_progress")
    .select("module_id, chapter_id")
    .eq("user_id", user.id)
    .eq("completed", true);

  // Fetch user financial data for the AI insight
  const today = new Date();
  const firstOfMonth = new Date(today.getFullYear(), today.getMonth(), 1).toISOString();

  const [
    { data: expenses },
    { data: incomeSources },
    { data: creditCards },
    { data: bankAccounts },
    { data: goals },
    { data: profile },
  ] = await Promise.all([
    supabase.from("expenses").select("monto, categoria").eq("user_id", user.id).gte("fecha", firstOfMonth),
    supabase.from("income_sources").select("monto").eq("user_id", user.id).eq("activo", true),
    supabase.from("credit_cards").select("nombre_tarjeta, saldo_actual, limite").eq("user_id", user.id),
    supabase.from("bank_accounts").select("alias, saldo_actual").eq("user_id", user.id),
    supabase.from("savings_goals").select("id, name, status").eq("user_id", user.id).eq("status", "active"),
    supabase.from("profiles").select("full_name, cash_balance").eq("id", user.id).single(),
  ]);

  const expensesByCategory: Record<string, number> = {};
  (expenses || []).forEach((e) => {
    expensesByCategory[e.categoria] = (expensesByCategory[e.categoria] || 0) + Number(e.monto);
  });
  const totalExpenses = Object.values(expensesByCategory).reduce((a, b) => a + b, 0);
  const totalIncome = (incomeSources || []).reduce((acc, i) => acc + Number(i.monto), 0);
  const savingsRate = totalIncome > 0 ? Math.round(((totalIncome - totalExpenses) / totalIncome) * 100) : 0;

  const completedIds = new Set((progress || []).map((p) => p.chapter_id));

  return (
    <LearnClient
      modules={MODULES}
      totalChapters={TOTAL_CHAPTERS}
      completedChapterIds={Array.from(completedIds)}
      userData={{
        expensesByCategory,
        totalIncome,
        totalExpenses,
        savingsRate,
        creditCards: creditCards || [],
        bankAccounts: bankAccounts || [],
        goals: goals || [],
        userName: profile?.full_name?.split(" ")[0] || "tú",
      }}
    />
  );
}
