import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { generateText } from "ai";
import { openai } from "@ai-sdk/openai";

export async function POST(req: Request) {
  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { data: profile } = await supabase
      .from('profiles')
      .select('plan, ai_messages_used')
      .eq('id', user.id)
      .single();

    if (!profile) return NextResponse.json({ error: "Profile not found" }, { status: 404 });

    const plan = profile.plan || 'free';
    const limits: Record<string, number> = { free: 5, premium: 50, pro: 500 };
    const limit = limits[plan] ?? 5;

    // Count user messages sent THIS month (resets automatically each month)
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const { count: used } = await supabase
      .from('goal_chats')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .eq('role', 'user')
      .gte('created_at', startOfMonth.toISOString());

    if ((used ?? 0) >= limit) {
      const next = plan === 'free' ? 'Premium (50 mensajes)' : plan === 'premium' ? 'Pro (200 mensajes)' : null;
      return NextResponse.json({
        error: "LIMIT_REACHED",
        message: `Has alcanzado el límite de ${limit} mensajes de tu plan ${plan}.${next ? ` ¡Mejora a ${next}!` : ''}`
      }, { status: 403 });
    }

    const { goal, message, history = [], progress, expenses, incomes, tasks } = await req.json();

    const totalExpenses = expenses?.reduce((acc: number, e: any) => acc + Number(e.monto), 0) ?? 0;
    const totalIncomes = incomes?.reduce((acc: number, i: any) => acc + Number(i.monto), 0) ?? 0;
    const relatedExpenses = expenses?.filter((e: any) => e.categoria === goal.target_category)
      .reduce((acc: number, e: any) => acc + Number(e.monto), 0) ?? 0;
    const pendingTasks = tasks?.filter((t: any) => !t.completed).length ?? 0;
    const monthlyRate = goal.current_amount && goal.created_at
      ? (goal.current_amount / Math.max(1, Math.ceil((Date.now() - new Date(goal.created_at).getTime()) / (1000 * 60 * 60 * 24 * 30))))
      : 0;
    const remaining = (goal.target_amount ?? 0) - (goal.current_amount ?? 0);
    const monthsLeft = monthlyRate > 0 ? Math.ceil(remaining / monthlyRate) : null;

    const systemPrompt = `Eres Buco IA, el asesor financiero personal de la app Buco Finanzas. Eres directo, empático y usas datos reales para dar consejos accionables. Respondes siempre en español con formato markdown claro (usa **negrita**, listas, y emojis con moderación).

## CONTEXTO DE LA META
- **Nombre:** ${goal.name}
- **Tipo:** ${goal.type}
- **Descripción:** ${goal.description || 'Sin descripción'}
- **Progreso:** ${progress}% ($${Number(goal.current_amount).toFixed(2)} de $${Number(goal.target_amount).toFixed(2)})
- **Restante:** $${remaining.toFixed(2)}
- **Estado:** ${goal.status}
- **Ritmo mensual actual:** $${monthlyRate.toFixed(2)}/mes
- **Estimado para completar:** ${monthsLeft ? `${monthsLeft} meses` : 'Sin datos suficientes'}

## ACTIVIDAD FINANCIERA (este mes)
- **Gastos totales:** $${totalExpenses.toFixed(2)}
- **Ingresos totales:** $${totalIncomes.toFixed(2)}
- **Gastos en categoría relacionada (${goal.target_category || 'N/A'}):** $${relatedExpenses.toFixed(2)}

## TAREAS DE LA META
- **Total:** ${tasks?.length ?? 0} | **Pendientes:** ${pendingTasks} | **Completadas:** ${(tasks?.length ?? 0) - pendingTasks}

## INSTRUCCIONES
- Sé específico con los números del contexto, no inventes cifras
- Máximo 3-4 párrafos cortos o una lista accionable
- Si el usuario pregunta algo fuera de finanzas personales, redirige amablemente hacia su meta`;

    const historyMessages = (history as any[])
      .filter((m: any) => m.role === 'user' || m.role === 'assistant')
      .map((m: any) => ({ role: m.role as 'user' | 'assistant', content: m.content }));

    historyMessages.push({ role: 'user', content: message });

    const { text: content } = await generateText({
      model: openai('gpt-4o'),
      system: systemPrompt,
      messages: historyMessages,
    });

    return NextResponse.json({ role: 'assistant', content });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
