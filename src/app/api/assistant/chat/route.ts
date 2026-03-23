import { NextRequest } from 'next/server';
import { streamText, jsonSchema, convertToModelMessages, stepCountIs } from 'ai';
import { openai } from '@ai-sdk/openai';
import { createClient } from '@/utils/supabase/server';
import { registeredTools } from '@/lib/tools/registry';

export const maxDuration = 60;
export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return new Response('Unauthorized', { status: 401 });
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('nombre, plan')
      .eq('id', user.id)
      .single();

    const body = await req.json();
    const uiMessages = body.messages ?? [];
    const context = { supabase, userId: user.id };

    // Build tools as plain objects to avoid v6 generic constraints
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const tools: Record<string, any> = {};
    for (const t of registeredTools) {
      tools[t.name] = {
        description: t.description,
        inputSchema: jsonSchema(t.inputSchema as Parameters<typeof jsonSchema>[0]),
        execute: async (params: Record<string, unknown>) => {
          try {
            return await t.execute(params, context);
          } catch (e) {
            return { error: String(e) };
          }
        },
      };
    }

    const systemPrompt = `Eres Buco AI, el asistente financiero personal de ${profile?.nombre || 'el usuario'}.
Fecha actual: ${new Date().toLocaleDateString('es-MX', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
Plan: ${profile?.plan || 'free'}

PERSONALIDAD: Experto financiero, directo, honesto, motivador, empático y proactivo.
REGLA PRINCIPAL: SIEMPRE usa las tools disponibles para obtener datos reales del usuario ANTES de responder a consultas sobre sus finanzas, metas, o hábitos.
Responde de manera concisa pero muy amigable. Da consejos específicos y accionables basados totalmente en los números reales del usuario.`;

    // Convert v6 UIMessages to model messages
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const modelMessages = await convertToModelMessages(uiMessages as any);

    const result = streamText({
      model: openai('gpt-4o'),
      system: systemPrompt,
      messages: modelMessages,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      tools: tools as any,
      stopWhen: stepCountIs(5),
    });

    return result.toUIMessageStreamResponse();
  } catch (error) {
    console.error('API error', error);
    return new Response('Internal Server Error', { status: 500 });
  }
}
