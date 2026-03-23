import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import Anthropic from "@anthropic-ai/sdk";

export async function POST(req: Request) {
  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    // Fetch Profile for plan check
    const { data: profile } = await supabase
      .from('profiles')
      .select('plan')
      .eq('id', user.id)
      .single();

    if (!profile) return NextResponse.json({ error: "Profile not found" }, { status: 404 });

    if (profile.plan === 'free') {
      return NextResponse.json({ 
        error: "LIMIT_REACHED", 
        message: "Las sugerencias de tareas por IA son una función Premium. ¡Mejora tu plan para obtener ayuda inteligente!" 
      }, { status: 403 });
    }

    const { goal } = await req.json();

    const prompt = `Eres el asistente financiero Buco IA. Sugiere exactamente 5 tareas concretas y accionables para ayudar al usuario a cumplir esta meta financiera:
Nombre: ${goal.name}
Tipo: ${goal.type}
Monto objetivo: ${goal.target_amount}
Descripción: ${goal.description}

Responde ÚNICAMENTE con un JSON válido sin ningún texto adicional, con este formato exacto:
{ "suggestions": [{ "title": "string", "type": "ahorro" | "recorte" | "accion" | "otro" }] }`;

    const client = new Anthropic();
    const message = await client.messages.create({
      model: "claude-3-5-sonnet-20240620",
      max_tokens: 512,
      messages: [{ role: "user", content: prompt }],
    });

    const responseText = message.content[0].type === 'text' ? message.content[0].text : '';
    const parsed = JSON.parse(responseText);

    return NextResponse.json({ suggestions: parsed.suggestions });
  } catch (error) {
    console.error('Error in ia-suggestions:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}
