import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import Anthropic from "@anthropic-ai/sdk";

export async function POST(req: Request) {
  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    // Fetch Profile for plan limits
    const { data: profile } = await supabase
      .from('profiles')
      .select('plan, ai_reports_used')
      .eq('id', user.id)
      .single();

    if (!profile) return NextResponse.json({ error: "Profile not found" }, { status: 404 });

    // Plan Logic
    const plan = profile.plan || 'free';
    const used = profile.ai_reports_used || 0;

    if (plan === 'free') {
      return NextResponse.json({ 
        error: "LIMIT_REACHED", 
        message: "Los informes con análisis IA son una función Premium. ¡Mejora tu plan para obtener insights profundos!" 
      }, { status: 403 });
    }

    if (plan === 'premium' && used >= 3) {
      return NextResponse.json({ 
        error: "LIMIT_REACHED", 
        message: "Has alcanzado el límite de 3 informes mensuales de tu plan Premium." 
      }, { status: 403 });
    }

    if (plan === 'pro' && used >= 999) {
      return NextResponse.json({ 
        error: "LIMIT_REACHED", 
        message: "Has alcanzado el límite de 999 informes mensuales de tu plan Pro." 
      }, { status: 403 });
    }

    const { data, bankAccounts, creditCards } = await req.json();
    const { expenses, incomes, range } = data;

    // Aggregating data for the AI prompt
    const totalExpenses = expenses.reduce((acc: number, e: any) => acc + Number(e.monto), 0);
    const totalIncomes = incomes.reduce((acc: number, i: any) => acc + Number(i.monto), 0);
    
    const categories = expenses.reduce((acc: any, e: any) => {
      acc[e.categoria] = (acc[e.categoria] || 0) + Number(e.monto);
      return acc;
    }, {});

    const topCategory = Object.entries(categories).sort((a: any, b: any) => b[1] - a[1])[0];

    const prompt = `Eres el asistente financiero Buco IA. Analiza estos datos financieros del usuario y genera entre 4 y 6 insights accionables:

- Total gastos: $${totalExpenses.toFixed(2)}
- Total ingresos: $${totalIncomes.toFixed(2)}
- Balance neto: $${(totalIncomes - totalExpenses).toFixed(2)}
- Categoría con más gasto: ${topCategory?.[0] || 'N/A'} ($${Number(topCategory?.[1] || 0).toFixed(2)})
- Número de transacciones: ${expenses.length}
- Período: ${range || 'este mes'}

Responde ÚNICAMENTE con un JSON válido sin texto adicional, con este formato exacto:
{ "insights": [{ "type": "spending"|"trend"|"shopping"|"goal"|"warning", "sentiment": "positive"|"negative"|"neutral", "text": "string", "action": "string" }] }`;

    const client = new Anthropic();
    const message = await client.messages.create({
      model: "claude-opus-4-6",
      max_tokens: 1024,
      messages: [{ role: "user", content: prompt }],
    });

    const responseText = message.content[0].type === 'text' ? message.content[0].text : '';
    const cleanText = responseText.trim().replace(/^```json\n?/, '').replace(/\n?```$/, '').trim();
    const parsed = JSON.parse(cleanText);

    // Increment usage
    await supabase
      .from('profiles')
      .update({ ai_reports_used: used + 1 })
      .eq('id', user.id);

    return NextResponse.json({ insights: parsed.insights });
  } catch (error) {
    console.error('Error in ai-insights:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}
