import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import Anthropic from "@anthropic-ai/sdk";

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const CHAPTER_PROMPTS: Record<string, string> = {
  "m1c6": `Aplica la regla 50/30/20 a los datos reales del usuario. Calcula exactamente cuánto debería ir a cada categoría con sus ingresos, compara con lo que gasta realmente, e identifica la categoría donde más se excede. Sé directo con los números.`,
  "m2c6": `Analiza el estado de las tarjetas de crédito del usuario: saldo usado, límite total, porcentaje de utilización, y cuánto paga en intereses estimados. Identifica la tarjeta más costosa y sugiere el orden de pago óptimo.`,
  "m3c6": `Con el ahorro mensual actual del usuario, calcula exactamente cuánto tendría en 5, 10 y 20 años invirtiendo al 8% anual. Compara con el escenario si llegara al 20% de ahorro. Muestra la diferencia en dinero real.`,
  "m4c5": `Analiza las deudas del usuario (tarjetas y créditos) y genera un plan de pago específico usando el método bola de nieve. Indica en qué mes estaría libre de deudas si aplica el plan.`,
  "m6c6": `Detecta patrones en los gastos del usuario: días de mayor gasto, categorías con gasto impulsivo, consistencia del ahorro. Sugiere UN cambio de hábito concreto basado en sus datos reales.`,
};

export async function POST(req: NextRequest) {
  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { chapterId, userData } = await req.json();
    const chapterPrompt = CHAPTER_PROMPTS[chapterId];
    if (!chapterPrompt) return NextResponse.json({ error: "Chapter not found" }, { status: 404 });

    const { expensesByCategory, totalIncome, totalExpenses, savingsRate, creditCards, bankAccounts, goals } = userData;

    const prompt = `Eres el asesor financiero de Buco. ${chapterPrompt}

Datos reales del usuario:
- Ingresos mensuales: $${totalIncome}
- Gastos totales: $${totalExpenses}
- Tasa de ahorro: ${savingsRate}%
- Gastos por categoría: ${JSON.stringify(expensesByCategory)}
- Tarjetas: ${JSON.stringify(creditCards?.map((c: any) => ({ nombre: c.nombre_tarjeta, saldo: c.saldo_actual, limite: c.limite })))}
- Cuentas bancarias: ${JSON.stringify(bankAccounts?.map((a: any) => ({ alias: a.alias, saldo: a.saldo_actual })))}
- Metas activas: ${goals?.length || 0}

Responde en español, con datos exactos del usuario, formato claro con bullets o números. Máximo 200 palabras. Sin frases genéricas.`;

    const message = await anthropic.messages.create({
      model: "claude-opus-4-6",
      max_tokens: 512,
      messages: [{ role: "user", content: prompt }],
    });

    const text = message.content[0].type === "text" ? message.content[0].text : "";
    return NextResponse.json({ analysis: text });
  } catch {
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}
