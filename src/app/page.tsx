import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import DashboardClient from "@/components/dashboard/DashboardClient";
import { ensureCashAccount } from "@/app/dashboard/actions";

export default async function DashboardPage() {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const ninetyDaysAgo = new Date();
  ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);
  const ninetyDaysAgoStr = ninetyDaysAgo.toISOString().split("T")[0];

  const prevMonthStart = new Date();
  prevMonthStart.setMonth(prevMonthStart.getMonth() - 1);
  prevMonthStart.setDate(1);
  const prevMonthEnd = new Date();
  prevMonthEnd.setDate(0);
  const prevMonthStartStr = prevMonthStart.toISOString().split("T")[0];
  const prevMonthEndStr = prevMonthEnd.toISOString().split("T")[0];

  const [
    { data: profile },
    { data: recentExpenses },
    { data: yearExpenses },
    { data: prevMonthExpenses },
    { data: incomes },
    { data: bankAccounts },
    { data: creditCards },
    { data: reminders },
    { data: savingsGoals },
    { data: goalContributions },
    { data: userSettings },
    { data: debts },
  ] = await Promise.all([
    supabase.from("profiles").select("*").eq("id", user.id).single(),
    supabase
      .from("expenses")
      .select("*")
      .eq("user_id", user.id)
      .order("fecha", { ascending: false })
      .limit(20),
    supabase
      .from("expenses")
      .select("*")
      .eq("user_id", user.id)
      .gte("fecha", ninetyDaysAgoStr)
      .order("fecha", { ascending: false }),
    supabase
      .from("expenses")
      .select("*")
      .eq("user_id", user.id)
      .gte("fecha", prevMonthStartStr)
      .lte("fecha", prevMonthEndStr),
    supabase
      .from("incomes")
      .select("*")
      .eq("user_id", user.id)
      .order("fecha", { ascending: false }),
    supabase
      .from("bank_accounts")
      .select("*")
      .eq("user_id", user.id),
    supabase
      .from("credit_cards")
      .select("*")
      .eq("user_id", user.id),
    supabase
      .from("reminders")
      .select("*")
      .eq("user_id", user.id)
      .neq("status", "deleted")
      .order("fecha", { ascending: true }),
    supabase
      .from("savings_goals")
      .select("*")
      .eq("user_id", user.id)
      .eq("status", "active"),
    supabase
      .from("goal_contributions")
      .select("*")
      .eq("user_id", user.id),
    supabase
      .from("user_settings")
      .select("*")
      .eq("user_id", user.id)
      .single(),
    supabase
      .from("debts")
      .select("*")
      .eq("user_id", user.id)
      .eq("activa", true),
  ]);

  const expenseTransactions = (recentExpenses ?? []).map((e: any) => ({
    ...e,
    type: "expense",
    date: e.fecha,
    concept: e.descripcion || e.comercio,
    category: e.categoria,
    amount: e.monto,
  }));

  const incomeTransactions = (incomes ?? []).map((i: any) => ({
    ...i,
    type: "income",
    date: (i.fecha || i.created_at?.split("T")[0]) ?? "",
    fecha: (i.fecha || i.created_at?.split("T")[0]) ?? "",
    concept: i.descripcion || i.nombre || "Ingreso",
    category: i.categoria || "ingreso",
    amount: i.monto,
  }));

  const allTransactions = [...expenseTransactions, ...incomeTransactions].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  // Ensure 'Cash' account exists
  await ensureCashAccount(user.id, profile?.moneda || 'USD');

  return (
    <DashboardClient
      initialProfile={profile}
      initialExpenses={recentExpenses ?? []}
      initialIncomes={incomes ?? []}
      yearExpenses={yearExpenses ?? []}
      prevYearExpenses={prevMonthExpenses ?? []}
      allTransactions={allTransactions}
      bankAccounts={bankAccounts ?? []}
      creditCards={creditCards ?? []}
      reminders={reminders ?? []}
      savingsGoals={savingsGoals ?? []}
      goalContributions={goalContributions ?? []}
      userSettings={userSettings}
      debts={debts ?? []}
    />
  );
}
