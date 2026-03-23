"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function addExpense(formData: FormData) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) throw new Error("Unauthorized");

  const monto = parseFloat(formData.get("monto") as string);
  const categoria = formData.get("categoria") as string;
  const comercio = formData.get("comercio") as string;
  const descripcion = formData.get("descripcion") as string;
  const fecha = formData.get("fecha") as string || new Date().toISOString();
  const metodo_pago = formData.get("metodo_pago") as string;
  const source_type = (formData.get("source_type") as string) || "cash";
  const source_id = formData.get("source_id") as string || null;

  const { error } = await supabase.rpc('register_expense_v1', {
    p_user_id: user.id,
    p_monto: monto,
    p_categoria: categoria,
    p_comercio: comercio,
    p_fecha: fecha,
    p_metodo_pago: metodo_pago,
    p_descripcion: descripcion,
    p_origen: "manual",
    p_source_type: source_type,
    p_source_id: source_id
  });

  if (error) throw error;

  revalidatePath("/");
  revalidatePath("/expenses");

  // Background notification check
  import("@/lib/notifications/engine").then(({ checkNotificationTriggers }) => {
    checkNotificationTriggers({ userId: user.id, triggerType: 'budget' }).catch(console.error);
  });

  return { success: true };
}

export async function addIncome(formData: FormData) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) throw new Error("Unauthorized");

  const monto = parseFloat(formData.get("monto") as string);
  const descripcion = (formData.get("descripcion") as string) || (formData.get("nombre") as string);
  const categoria = (formData.get("categoria") as string) || "otros";
  const fecha = (formData.get("fecha") as string) || new Date().toISOString();
  const source_type = (formData.get("source_type") as string) || "cash";
  const source_id = formData.get("source_id") as string || null;

  const { error } = await supabase.rpc('register_income_v1', {
    p_user_id: user.id,
    p_monto: monto,
    p_categoria: categoria,
    p_fecha: fecha,
    p_metodo_pago: "transferencia",
    p_descripcion: descripcion,
    p_origen: "manual",
    p_source_type: source_type,
    p_source_id: source_id
  });

  if (error) throw error;

  revalidatePath("/");
  revalidatePath("/expenses");

  // Background notification check
  import("@/lib/notifications/engine").then(({ checkNotificationTriggers }) => {
    checkNotificationTriggers({ userId: user.id, triggerType: 'budget' }).catch(console.error);
  });

  return { success: true };
}

export async function deleteMovement(id: string, type: 'expense' | 'income' | 'card_transaction') {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");
  const table = type === 'expense' ? 'expenses' : type === 'income' ? 'incomes' : 'card_transactions';

  const { error } = await supabase.from(table).delete().eq('id', id).eq('user_id', user.id);
  if (error) throw error;

  revalidatePath("/expenses");
  revalidatePath("/");
  return { success: true };
}

export async function addCard(formData: FormData) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  // 1. Check Plan Limits
  const { data: profile } = await supabase.from('profiles').select('plan').eq('id', user.id).single()
  const { count: bankCount } = await supabase.from('bank_accounts').select('*', { count: 'exact', head: true }).eq('user_id', user.id).neq('nombre_banco', 'Cash')
  const { count: cardCount } = await supabase.from('credit_cards').select('*', { count: 'exact', head: true }).eq('user_id', user.id)
  
  const totalAccounts = (bankCount || 0) + (cardCount || 0)
  const currentPlan = (profile?.plan || 'free') as 'free' | 'premium' | 'pro'
  const limit = currentPlan === 'free' ? 5 : currentPlan === 'premium' ? 10 : 999 

  if (totalAccounts >= limit) {
    return { error: `Has alcanzado el límite de ${limit} cuentas/tarjetas para tu plan ${currentPlan.toUpperCase()}. Mejora tu plan para añadir más.` }
  }

  const { error } = await supabase.from("credit_cards").insert({
    user_id: user.id,
    nombre_banco: formData.get("nombre_banco") as string,
    nombre_tarjeta: formData.get("nombre_tarjeta") as string,
    tipo_tarjeta: formData.get("tipo_tarjeta") as string,
    limite: parseFloat(formData.get("limite") as string) || 0,
    saldo_actual: parseFloat(formData.get("saldo_actual") as string) || 0,
    fecha_corte: Number(formData.get("fecha_corte")) || 15,
    fecha_pago: Number(formData.get("fecha_pago")) || 30,
    ultimos_4: formData.get("ultimos_4") as string,
    color: (formData.get("color") as string) || "#4F46E5",
    activa: true
  });

  if (error) throw error;
  revalidatePath("/cards");
  revalidatePath("/");
  return { success: true };
}

export async function addBankAccount(formData: FormData) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  // Plan limits check
  const { data: profile } = await supabase.from('profiles').select('plan').eq('id', user.id).single()
  const { count: bankCount } = await supabase.from('bank_accounts').select('*', { count: 'exact', head: true }).eq('user_id', user.id).neq('nombre_banco', 'Cash')
  const { count: cardCount } = await supabase.from('credit_cards').select('*', { count: 'exact', head: true }).eq('user_id', user.id)
  
  const totalAccounts = (bankCount || 0) + (cardCount || 0)
  const currentPlan = (profile?.plan || 'free') as 'free' | 'premium' | 'pro'
  const limit = currentPlan === 'free' ? 5 : currentPlan === 'premium' ? 10 : 999 

  if (totalAccounts >= limit) {
    return { error: `Has alcanzado el límite de ${limit} cuentas/tarjetas para tu plan ${currentPlan.toUpperCase()}.` }
  }
  
  const { error } = await supabase.from("bank_accounts").insert({
    user_id: user.id,
    nombre_banco: formData.get("nombre_banco") as string,
    alias: formData.get("alias") as string,
    tipo_cuenta: formData.get("tipo_cuenta") as string,
    saldo_actual: parseFloat(formData.get("saldo_actual") as string) || 0,
    moneda: (formData.get("moneda") as string) || "USD",
    identificador_corto: formData.get("identificador_corto") as string
  });

  if (error) throw error;
  revalidatePath("/cards");
  revalidatePath("/");
  return { success: true };
}

export async function updateBudget(formData: FormData) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  const categoria = formData.get("categoria") as string;
  const limite_mensual = parseFloat(formData.get("limite_mensual") as string);
  const mes = new Date().getMonth() + 1;
  const ano = new Date().getFullYear();

  const { data: existing } = await supabase
    .from("budgets")
    .select("id")
    .eq("user_id", user.id)
    .eq("categoria", categoria.toLowerCase())
    .eq("mes", mes)
    .eq("ano", ano)
    .maybeSingle();

  if (existing) {
    const { error } = await supabase
      .from("budgets")
      .update({ limite_mensual, updated_at: new Date().toISOString() })
      .eq("id", existing.id);
    if (error) throw error;
  } else {
    const { error } = await supabase
      .from("budgets")
      .insert({
        user_id: user.id,
        categoria,
        limite_mensual,
        mes,
        ano
      });
    if (error) throw error;
  }

  revalidatePath("/cards");
  revalidatePath("/");
  return { success: true };
}

export async function addReminder(formData: FormData) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  const { error } = await supabase.from("reminders").insert({
    user_id: user.id,
    nombre: formData.get("nombre") as string,
    fecha: formData.get("fecha") as string,
    monto: formData.get("monto") ? parseFloat(formData.get("monto") as string) : null,
    categoria: formData.get("categoria") as string,
    leido: false
  });

  if (error) throw error;
  revalidatePath("/");
  return { success: true };
}

export async function markReminderAsRead(id: string) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");
  const { error } = await supabase
    .from("reminders")
    .update({ leido: true })
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) throw error;
  revalidatePath("/");
  return { success: true };
}

export async function deleteReminder(id: string) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");
  const { error } = await supabase
    .from("reminders")
    .update({ status: 'deleted' })
    .eq("id", id)
    .eq("user_id", user.id);
  if (error) throw error;
  revalidatePath("/");
  return { success: true };
}

export async function snoozeReminder(id: string, days: number) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");
  const newDate = new Date();
  newDate.setDate(newDate.getDate() + days);
  const { error } = await supabase
    .from("reminders")
    .update({ fecha: newDate.toISOString().split('T')[0] })
    .eq("id", id)
    .eq("user_id", user.id);
  if (error) throw error;
  revalidatePath("/");
  return { success: true };
}

export async function markReminderPaid(id: string, nextDate: string, expense: { monto: number; nombre: string; tipo: string } | null) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  if (expense && expense.monto) {
    await supabase.from("expenses").insert({
      user_id: user.id,
      monto: expense.monto,
      comercio: expense.nombre,
      descripcion: expense.nombre,
      fecha: new Date().toISOString().split('T')[0],
      origen: 'recordatorio',
      categoria: expense.tipo === 'subscription' ? 'suscripciones' : expense.tipo === 'card_payment' ? 'tarjeta' : 'otros',
      metodo_pago: 'efectivo',
    });
  }

  const { error } = await supabase
    .from("reminders")
    .update({ fecha: nextDate })
    .eq("id", id)
    .eq("user_id", user.id);
  if (error) throw error;
  revalidatePath("/");
  return { success: true };
}

export async function addSavingsGoal(formData: FormData) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  // Plan limits check for goals
  const { data: profile } = await supabase.from('profiles').select('plan').eq('id', user.id).single()
  const { count: goalCount } = await supabase.from('savings_goals').select('*', { count: 'exact', head: true }).eq('user_id', user.id)
  
  const currentPlan = (profile?.plan || 'free') as 'free' | 'premium' | 'pro'
  const goalLimit = currentPlan === 'free' ? 4 : 999 

  if (goalCount && goalCount >= goalLimit) {
    return { error: `Has alcanzado el límite de ${goalLimit} metas para tu plan ${currentPlan.toUpperCase()}. Mejora tu plan para añadir más.` }
  }

  const { error } = await supabase.from("savings_goals").insert({
    user_id: user.id,
    nombre: formData.get("nombre") as string,
    monto_objetivo: parseFloat(formData.get("monto_objetivo") as string),
    monto_actual: parseFloat(formData.get("monto_actual") as string) || 0,
    fecha_limite: (formData.get("fecha_limite") as string) || null,
    activa: true
  });

  if (error) throw error;
  revalidatePath("/");
  return { success: true };
}

export async function signOut() {
  const supabase = createClient();
  await supabase.auth.signOut();
  redirect("/login");
}

export async function transferBetweenAccounts(fromId: string, toId: string, amount: number, note?: string) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  // 1. Get current balances — filter by user_id to prevent cross-user access
  const { data: fromAccount } = await supabase.from('bank_accounts').select('saldo_actual').eq('id', fromId).eq('user_id', user.id).single();
  const { data: toAccount } = await supabase.from('bank_accounts').select('saldo_actual').eq('id', toId).eq('user_id', user.id).single();

  if (!fromAccount || !toAccount) throw new Error("Account not found or access denied");
  if (fromAccount.saldo_actual < amount) throw new Error("Insufficient funds");

  // 2. Perform updates
  const { error: updateFromError } = await supabase
    .from('bank_accounts')
    .update({ saldo_actual: parseFloat(fromAccount.saldo_actual.toString()) - amount })
    .eq('id', fromId);
    
  if (updateFromError) throw updateFromError;

  const { error: updateToError } = await supabase
    .from('bank_accounts')
    .update({ saldo_actual: parseFloat(toAccount.saldo_actual.toString()) + amount })
    .eq('id', toId);
    
  if (updateToError) throw updateToError;

  // 3. Record transfer
  const { error: transferError } = await supabase.from('account_transfers').insert({
    user_id: user.id,
    from_account_id: fromId,
    to_account_id: toId,
    amount,
    note,
    date: new Date().toISOString().split('T')[0]
  });

  if (transferError) throw transferError;
  revalidatePath("/cards");
  revalidatePath("/");
  return { success: true };
}

export async function deleteCard(id: string) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  const { error } = await supabase.from("credit_cards").delete().eq('id', id).eq('user_id', user.id);
  if (error) throw error;

  revalidatePath("/cards");
  revalidatePath("/");
  return { success: true };
}

export async function deleteBankAccount(id: string) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  const { error } = await supabase.from("bank_accounts").delete().eq('id', id).eq('user_id', user.id);
  if (error) throw error;

  revalidatePath("/cards");
  revalidatePath("/");
  return { success: true };
}

export async function updateCard(id: string, formData: FormData) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  const { error } = await supabase.from("credit_cards").update({
    nombre_banco: formData.get("nombre_banco") as string,
    nombre_tarjeta: formData.get("nombre_tarjeta") as string,
    tipo_tarjeta: formData.get("tipo_tarjeta") as string,
    limite: parseFloat(formData.get("limite") as string) || 0,
    saldo_actual: parseFloat(formData.get("saldo_actual") as string) || 0,
    fecha_corte: Number(formData.get("fecha_corte")) || 15,
    fecha_pago: Number(formData.get("fecha_pago")) || 30,
    ultimos_4: formData.get("ultimos_4") as string,
    color: (formData.get("color") as string) || "#4F46E5",
  }).eq('id', id).eq('user_id', user.id);

  if (error) throw error;
  revalidatePath("/cards");
  revalidatePath("/");
  return { success: true };
}

export async function updateBankAccount(id: string, formData: FormData) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  const { error } = await supabase.from("bank_accounts").update({
    nombre_banco: formData.get("nombre_banco") as string,
    alias: formData.get("alias") as string,
    tipo_cuenta: formData.get("tipo_cuenta") as string,
    saldo_actual: parseFloat(formData.get("saldo_actual") as string) || 0,
    moneda: (formData.get("moneda") as string) || "USD",
    identificador_corto: formData.get("identificador_corto") as string
  }).eq('id', id).eq('user_id', user.id);

  if (error) throw error;
  revalidatePath("/cards");
  revalidatePath("/");
  return { success: true };
}
export async function ensureCashAccount(userId: string, currency: string = 'USD') {
  const supabase = createClient();
  
  const { data: existing } = await supabase
    .from("bank_accounts")
    .select("id")
    .eq("user_id", userId)
    .eq("nombre_banco", "Cash")
    .maybeSingle();

  if (!existing) {
    await supabase.from("bank_accounts").insert({
      user_id: userId,
      nombre_banco: "Cash",
      alias: "Efectivo",
      tipo_cuenta: "corriente",
      saldo_actual: 0,
      moneda: currency,
      color: "#10B981",
      icon_name: "Wallet",
      is_default: true,
      is_deletable: false,
      identificador_corto: "CASH"
    });
    return true;
  }
  return false;
}
