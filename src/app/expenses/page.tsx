import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import ExpensesClient from "@/components/expenses/ExpensesClient";

export default async function ExpensesPage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return redirect("/login");

  const { data: profile } = await supabase
    .from('profiles')
    .select('whatsapp_numero, whatsapp_connected')
    .eq('id', user.id)
    .single();

  // Fetch user expenses (últimos 1000 registros para búsqueda profunda)
  const { data: expenses } = await supabase
    .from('expenses')
    .select('*')
    .eq('user_id', user.id)
    .order('fecha', { ascending: false })
    .limit(1000);

  // Fetch user incomes (últimos 1000 registros)
  const { data: incomes } = await supabase
    .from('incomes')
    .select('*')
    .eq('user_id', user.id)
    .order('fecha', { ascending: false })
    .limit(1000);

  // Fetch accounts for the selection dropdown
  const { data: bankAccounts } = await supabase
    .from('bank_accounts')
    .select('*')
    .eq('user_id', user.id);

  const { data: creditCards } = await supabase
    .from('credit_cards')
    .select('*')
    .eq('user_id', user.id);

  // Combine and ensure types
  const typedExpenses = (expenses || []).map(e => ({ ...e, monto: Number(e.monto), type: 'expense' as const }));
  const typedIncomes = (incomes || []).map(i => ({ ...i, monto: Number(i.monto), type: 'income' as const }));
  const accounts = [
    ...(bankAccounts || []).map(a => ({ id: a.id, name: `${a.nombre_banco} - ${a.alias}`, type: 'bank' })),
    ...(creditCards || []).map(c => ({ id: c.id, name: `${c.nombre_banco} - ${c.nombre_tarjeta}`, type: 'card' }))
  ];

  return (
    <ExpensesClient
      initialExpenses={typedExpenses}
      initialIncomes={typedIncomes}
      accounts={accounts}
      userId={user.id}
      profile={profile ?? undefined}
    />
  );
}
