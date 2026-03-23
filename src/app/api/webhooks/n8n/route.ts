import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import { generateText } from "ai";
import { openai } from "@ai-sdk/openai";

export async function POST(req: Request) {
  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  try {
    const body = await req.json();

    // --- SUPPORT BOTH OLD FORMAT (type/amount/...) AND NEW FORMAT (message raw) ---
    const { phone, message, secret } = body;

    // 1. Security check
    if (secret !== process.env.N8N_WEBHOOK_SECRET) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!phone || !message) {
      return NextResponse.json({ error: "Missing phone or message" }, { status: 400 });
    }

    // 2. Find user by phone
    const { data: profile, error: profileError } = await supabaseAdmin
      .from("profiles")
      .select("id, cash_balance")
      .eq("whatsapp_numero", phone)
      .eq("whatsapp_connected", true)
      .single();

    if (profileError || !profile) {
      return NextResponse.json({
        action: "error",
        reply_message:
          "❌ Tu número no está registrado en Buco. Ve a *Perfil → Registro de WhatsApp* para conectarlo.",
      });
    }

    const userId = profile.id;

    // 3. Fetch user's accounts to give Claude real context
    const [{ data: bankAccounts }, { data: creditCards }] = await Promise.all([
      supabaseAdmin
        .from("bank_accounts")
        .select("id, nombre_banco, alias, saldo_actual, tipo_cuenta")
        .eq("user_id", userId),
      supabaseAdmin
        .from("credit_cards")
        .select("id, nombre_banco, nombre_tarjeta, tipo_tarjeta, saldo_actual")
        .eq("user_id", userId),
    ]);

    const accountsContext = [
      ...(bankAccounts || []).map(
        (a) =>
          `- [banco] alias="${a.alias || a.nombre_banco}" banco="${a.nombre_banco}" tipo="${a.tipo_cuenta}" saldo=$${a.saldo_actual}`
      ),
      ...(creditCards || []).map(
        (c) =>
          `- [tarjeta_${c.tipo_tarjeta}] nombre="${c.nombre_tarjeta}" banco="${c.nombre_banco}" saldo=$${c.saldo_actual}`
      ),
      "- [efectivo] alias=\"efectivo\" (dinero en mano / cash)",
    ].join("\n");

    // 4. Use OpenAI to interpret the raw message
    const systemPrompt = `Eres un asistente financiero que interpreta mensajes de WhatsApp en español para registrar gastos e ingresos.
Siempre responde con JSON puro y válido, sin markdown, sin explicaciones.`;

    const userPrompt = `CUENTAS REGISTRADAS DEL USUARIO (busca coincidencias aquí):
${accountsContext}

CATEGORÍAS DE GASTOS: comida, transporte, ocio, hogar, salud, suscripciones, educacion, otros
CATEGORÍAS DE INGRESOS: sueldo, freelance, regalo, venta, transferencia, loteria, otros

MENSAJE DEL USUARIO: "${message}"

═══ REGLAS CRÍTICAS ═══

PASO 1 — DETECTAR CUENTA/BANCO EN EL MENSAJE:
Escanea TODO el mensaje buscando cualquier palabra o frase que coincida con el alias, nombre_banco o nombre de las cuentas del usuario.
Ejemplos de patrones donde el banco aparece en CUALQUIER posición:
  "banco general sueldo 127"        → account_keyword = "banco general"
  "sueldo 127 banco general"        → account_keyword = "banco general"
  "gasté 14 en mcd con bac"         → account_keyword = "bac"
  "compre ropa 128 con mi cuenta de bac" → account_keyword = "bac"
  "me pagaron 12 en efectivo"       → account_keyword = "efectivo"
  "gané 5 en loteria"               → account_keyword = null (no menciona cuenta)

PASO 2 — TIPO DE MOVIMIENTO:
  - GASTO: "gasté/gaste", "compré/compre", "pagué/pague", "compra", "gasté en", "cobré con"
  - INGRESO: "sueldo", "me pagaron", "gané/gane", "cobré", "me mandaron", "me deben", "recibí", "depósito", "transferencia recibida", "ingresó"
  - Si el mensaje empieza con el nombre de un banco + keyword de ingreso → es INGRESO a esa cuenta

PASO 3 — DESCRIPCIÓN:
  Para ingresos: usa la fuente (ej: "Sueldo", "Lotería", "Pago de cliente")
  Para gastos: usa el comercio/lugar (ej: "McDonald's", "Ropa", "Pasaje")

PASO 4 — REGLAS DE VALIDACIÓN:
  - GASTO sin cuenta → action="ask_back"
  - INGRESO sin cuenta y sin "efectivo"/"cash"/"en mano" → action="ask_back"
  - Si mencionó una cuenta pero NO está en la lista → action="ask_back", lista las cuentas disponibles

PASO 5 — INFERIR CATEGORÍA:
  McDonald's/comida/restaurante/pizza → comida
  ropa/tienda/mall/zapatos → ocio
  pasaje/uber/bus/taxi/gasolina → transporte
  mueble/casa/hogar/supermercado → hogar
  doctor/farmacia/salud/medicina → salud
  netflix/spotify/suscripcion → suscripciones
  curso/libro/escuela → educacion
  sueldo/nomina/salario → sueldo
  loteria/premio → loteria
  freelance/trabajo independiente → freelance

Responde SOLO con este JSON (sin markdown):
{
  "action": "register" | "ask_back",
  "type": "expense" | "income",
  "amount": número | null,
  "description": "descripción corta",
  "category": "categoría válida",
  "account_keyword": "exactamente como lo escribió el usuario" | "efectivo" | null,
  "ask_back_message": "mensaje amigable en español pidiendo la info faltante" | null
}`;

    const { text: aiText } = await generateText({
      model: openai("gpt-4o-mini"),
      system: systemPrompt,
      prompt: userPrompt,
    });

    // 5. Parse OpenAI response
    let parsed: {
      action: string;
      type: string;
      amount: number | null;
      description: string;
      category: string;
      account_keyword: string | null;
      matched_account_type: string | null;
      ask_back_message: string | null;
    };

    try {
      const text = aiText.trim().replace(/^```json\n?/, "").replace(/\n?```$/, "");
      parsed = JSON.parse(text);
    } catch {
      return NextResponse.json({
        action: "error",
        reply_message:
          '❌ No pude entender tu mensaje. Intenta así:\n\n*"Gasté 14 en McDonald\'s con banco general"*\n*"Sueldo de 600 en banco general"*',
      });
    }

    // Validate amount
    if (!parsed.amount || isNaN(Number(parsed.amount)) || Number(parsed.amount) <= 0) {
      return NextResponse.json({
        action: "ask_back",
        reply_message:
          "❓ No detecté el monto. ¿Cuánto fue? Intenta así:\n*Gasté $14 en McDonald's con banco general*",
      });
    }

    // 6. Handle ask_back
    if (parsed.action === "ask_back") {
      const accountList = [
        ...(bankAccounts || []).map((a) => `  • ${a.alias || a.nombre_banco}`),
        ...(creditCards || []).map((c) => `  • ${c.nombre_tarjeta} (${c.nombre_banco})`),
        "  • Efectivo",
      ].join("\n");

      const msg =
        parsed.ask_back_message ||
        `❓ No quedó claro con qué cuenta fue este movimiento.\n\nTus cuentas:\n${accountList}\n\nEjemplo: _"Gasté $14 en McDonald's con banco general"_`;

      return NextResponse.json({ action: "ask_back", reply_message: msg });
    }

    // 7. Match account
    let sourceId: string | null = null;
    let sourceType = "cash";
    let accountDisplayName = "Efectivo";

    const kw = (parsed.account_keyword || "").toLowerCase().trim();

    if (kw && kw !== "efectivo" && kw !== "cash" && kw !== "en mano") {
      // Try bank accounts first
      const matchedBank = (bankAccounts || []).find((a) => {
        const alias = (a.alias || "").toLowerCase();
        const banco = (a.nombre_banco || "").toLowerCase();
        return alias.includes(kw) || banco.includes(kw) || kw.includes(alias) || kw.includes(banco);
      });

      if (matchedBank) {
        sourceId = matchedBank.id;
        sourceType = "bank_account";
        accountDisplayName = matchedBank.alias || matchedBank.nombre_banco;
      } else {
        // Try credit/debit cards
        const matchedCard = (creditCards || []).find((c) => {
          const nombre = (c.nombre_tarjeta || "").toLowerCase();
          const banco = (c.nombre_banco || "").toLowerCase();
          return nombre.includes(kw) || banco.includes(kw) || kw.includes(nombre) || kw.includes(banco);
        });

        if (matchedCard) {
          sourceId = matchedCard.id;
          sourceType = "card";
          accountDisplayName = matchedCard.nombre_tarjeta || matchedCard.nombre_banco;
        } else {
          // No match found — ask back
          const accountList = [
            ...(bankAccounts || []).map((a) => `  • ${a.alias || a.nombre_banco}`),
            ...(creditCards || []).map((c) => `  • ${c.nombre_tarjeta} (${c.nombre_banco})`),
            "  • Efectivo",
          ].join("\n");

          return NextResponse.json({
            action: "ask_back",
            reply_message: `❓ No encontré una cuenta llamada *"${parsed.account_keyword}"*.\n\nTus cuentas registradas:\n${accountList}\n\nEnvía el mensaje de nuevo con el nombre correcto.`,
          });
        }
      }
    }

    // 8. Register the transaction via RPC
    const rpcName =
      parsed.type === "income" ? "register_income_v1" : "register_expense_v1";

    const metodo_pago =
      sourceType === "bank_account"
        ? "transferencia"
        : sourceType === "card"
        ? "tarjeta_debito"
        : "efectivo";

    const rpcParams: Record<string, unknown> = {
      p_user_id: userId,
      p_monto: Number(parsed.amount),
      p_categoria: parsed.category || "otros",
      p_fecha: new Date().toISOString(),
      p_metodo_pago: metodo_pago,
      p_descripcion: parsed.description || message,
      p_origen: "whatsapp",
      p_source_type: sourceType,
      p_source_id: sourceId,
    };

    if (parsed.type === "expense") {
      rpcParams.p_comercio = parsed.description || "WhatsApp";
    }

    const { error: rpcError } = await supabaseAdmin.rpc(rpcName, rpcParams);

    if (rpcError) {
      console.error("[WhatsApp Webhook] RPC Error:", rpcError);
      return NextResponse.json({
        action: "error",
        reply_message: `❌ Error al registrar en Buco: ${rpcError.message}`,
      });
    }

    // 9. Build confirmation reply
    const isExpense = parsed.type === "expense";
    const emoji = isExpense ? "💸" : "💰";
    const typeLabel = isExpense ? "Gasto registrado" : "Ingreso registrado";

    const categoryEmojis: Record<string, string> = {
      comida: "🍔", transporte: "🚗", ocio: "🛍️", hogar: "🏠",
      salud: "🏥", suscripciones: "📺", educacion: "📚", otros: "📌",
      sueldo: "💼", freelance: "💻", regalo: "🎁", venta: "🏷️",
      transferencia: "🔄", loteria: "🎰",
    };

    const catEmoji = categoryEmojis[parsed.category] || "📌";

    const replyMessage =
      `${emoji} *${typeLabel}*\n\n` +
      `${catEmoji} ${parsed.description}\n` +
      `💵 *$${Number(parsed.amount).toLocaleString("es")}*\n` +
      `🏦 ${accountDisplayName}\n` +
      `🏷️ ${parsed.category}\n\n` +
      `_Registrado en Buco ✅_`;

    return NextResponse.json({
      action: "registered",
      reply_message: replyMessage,
      data: {
        userId,
        amount: parsed.amount,
        type: parsed.type,
        category: parsed.category,
        sourceType,
        sourceId,
        accountDisplayName,
      },
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("[WhatsApp Webhook] Server Error:", message);
    return NextResponse.json(
      {
        action: "error",
        reply_message: "❌ Error interno en Buco. Intenta de nuevo en un momento.",
      },
      { status: 500 }
    );
  }
}
