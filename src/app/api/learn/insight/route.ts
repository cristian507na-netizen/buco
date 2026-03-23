import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import Anthropic from "@anthropic-ai/sdk";

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export async function POST(req: NextRequest) {
  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { expensesByCategory, totalIncome, totalExpenses, savingsRate, activeGoals, creditCards } = await req.json();

    const prompt = `Eres un asesor financiero personal de Buco, una app de finanzas. Analiza los datos financieros del usuario y genera UN insight personalizado, accionable y específico con sus números reales. Máximo 2 frases. Termina sugiriendo qué módulo de educación financiera le vendría mejor. Los módulos son: 1-Presupuesto y Ahorro, 2-Tarjetas e Intereses, 3-Inversión Básica, 4-Deudas, 5-Mentalidad Millonaria, 6-Hábitos Financieros.

Datos del usuario:
- Ingresos mensuales: $${totalIncome}
- Gastos mensuales: $${totalExpenses}
- Tasa de ahorro: ${savingsRate}%
- Gastos por categoría: ${JSON.stringify(expensesByCategory)}
- Metas activas: ${activeGoals}
- Tarjetas de crédito: ${creditCards}

Responde SOLO con JSON: {"insight": "tu insight aquí", "recommendedModule": 1, "moduleTitle": "nombre del módulo"}`;

    const message = await anthropic.messages.create({
      model: "claude-opus-4-6",
      max_tokens: 256,
      messages: [{ role: "user", content: prompt }],
    });

    const text = message.content[0].type === "text" ? message.content[0].text : "";
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error("Invalid AI response");

    const result = JSON.parse(jsonMatch[0]);
    return NextResponse.json(result);
  } catch {
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}
