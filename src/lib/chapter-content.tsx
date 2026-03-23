import React from "react";

// Visual components for specific chapters
function Visual502030() {
  const data = [
    { label: "Necesidades", pct: 50, color: "bg-blue-500", desc: "Renta, comida básica, servicios, transporte" },
    { label: "Deseos", pct: 30, color: "bg-amber-500", desc: "Ocio, ropa, restaurantes, Netflix" },
    { label: "Ahorro / Inversión", pct: 20, color: "bg-emerald-500", desc: "Esto va primero, antes de gastar" },
  ];
  return (
    <div className="rounded-2xl bg-[var(--bg-card)] border border-[var(--border-color)] p-6 space-y-4">
      <h3 className="font-black text-base text-[var(--text-primary)]">📊 La Regla 50/30/20 visualizada</h3>
      <div className="space-y-3">
        {data.map((d) => (
          <div key={d.label}>
            <div className="flex justify-between text-xs font-bold text-[var(--text-muted)] mb-1">
              <span>{d.label}</span>
              <span>{d.pct}%</span>
            </div>
            <div className="h-8 w-full bg-[var(--bg-secondary)] rounded-lg overflow-hidden relative">
              <div className={`h-full ${d.color} rounded-lg flex items-center px-3 transition-all duration-700`} style={{ width: `${d.pct * 2}%` }}>
                <span className="text-[10px] font-black text-white truncate">{d.desc}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
      <p className="text-[11px] text-[var(--text-muted)] italic">* Sobre ingresos netos (después de impuestos)</p>
    </div>
  );
}

function VisualInteresCompuesto() {
  const scenarios = [
    { label: "$100/mes", months: [5, 12, 36], values: ["$615", "$1,507", "$4,901"], color: "text-blue-500" },
    { label: "$300/mes", months: [5, 12, 36], values: ["$1,845", "$4,521", "$14,703"], color: "text-emerald-500" },
  ];
  return (
    <div className="rounded-2xl bg-[var(--bg-card)] border border-[var(--border-color)] p-6 space-y-4">
      <h3 className="font-black text-base text-[var(--text-primary)]">📈 Interés compuesto al 8% anual</h3>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-[10px] font-black uppercase text-[var(--text-muted)]">
              <th className="text-left pb-2">Aporte</th>
              <th className="pb-2">5 años</th>
              <th className="pb-2">10 años</th>
              <th className="pb-2">30 años</th>
            </tr>
          </thead>
          <tbody>
            {scenarios.map((s) => (
              <tr key={s.label} className="border-t border-[var(--border-color)]">
                <td className={`py-3 font-black ${s.color}`}>{s.label}</td>
                {s.values.map((v, i) => (
                  <td key={i} className="py-3 text-center font-bold text-[var(--text-primary)]">{v}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="text-[11px] text-[var(--text-muted)]">El tiempo importa más que el monto. Empezar hoy vale más que empezar con más dinero mañana.</p>
    </div>
  );
}

function VisualEsbi() {
  const quadrants = [
    { id: "E", label: "Empleado", icon: "👔", desc: "Cambias tiempo por dinero. Seguridad laboral pero ingresos limitados.", color: "bg-gray-100 dark:bg-gray-800 border-gray-200 dark:border-gray-700" },
    { id: "S", label: "Self-employed", icon: "💼", desc: "Eres el negocio. Libertad pero sin ti, no hay ingreso.", color: "bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800" },
    { id: "B", label: "Business", icon: "🏢", desc: "El sistema trabaja para ti. Ingresos independientes de tu tiempo.", color: "bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800" },
    { id: "I", label: "Inversor", icon: "📈", desc: "El dinero trabaja para ti. Máxima libertad financiera.", color: "bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800" },
  ];
  return (
    <div className="rounded-2xl bg-[var(--bg-card)] border border-[var(--border-color)] p-6 space-y-4">
      <h3 className="font-black text-base text-[var(--text-primary)]">🔲 El Cuadrante E-S-B-I</h3>
      <div className="grid grid-cols-2 gap-3">
        {quadrants.map((q) => (
          <div key={q.id} className={`rounded-xl border p-4 ${q.color}`}>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-2xl">{q.icon}</span>
              <div>
                <p className="font-black text-xs text-[var(--text-primary)]">{q.id}</p>
                <p className="text-[10px] text-[var(--text-muted)] font-bold">{q.label}</p>
              </div>
            </div>
            <p className="text-[11px] text-[var(--text-secondary)] leading-relaxed">{q.desc}</p>
          </div>
        ))}
      </div>
      <p className="text-xs text-[var(--text-muted)] italic">La mayoría estamos en E o S. La riqueza real vive en B e I.</p>
    </div>
  );
}

export interface ChapterContent {
  intro?: string[];
  concept?: string[];
  visual?: React.ComponentType;
  example?: string[];
  applyInBuco?: { text: string; link?: string; linkLabel?: string };
}

export const CHAPTER_CONTENT: Record<string, ChapterContent> = {
  // ── MÓDULO 1 ──
  "m1c1": {
    intro: [
      "Imagina que llevas meses trabajando duro y aun así a mitad del mes ya no tienes dinero. No porque ganes poco — sino porque nadie te enseñó a planear. Eso es exactamente lo que le pasa al 78% de las personas en Latinoamérica.",
      "Un presupuesto no es una jaula. Es un GPS. Te dice exactamente dónde estás y cómo llegar a donde quieres ir.",
    ],
    concept: [
      "Un presupuesto es simplemente decidir de antemano a dónde irá tu dinero. En vez de preguntarte al final del mes '¿a dónde se fue todo?', le dices al dinero qué hacer antes de gastarlo.",
      "No necesitas ser contable. No necesitas software caro. Solo necesitas honestidad sobre lo que ganas y lo que gastas, y 15 minutos al mes para planear.",
      "El principio más importante: cada peso que entra a tu vida debe tener un nombre antes de salir.",
    ],
    example: [
      "María gana $2,000/mes. Sin presupuesto: al día 20 no tiene nada y no sabe en qué se fue.",
      "Con presupuesto: $1,000 a necesidades, $400 a ocio, $300 a ahorro, $300 a deudas. Al día 20 todavía tiene $150 de margen.",
      "La diferencia no fue su salario. Fue el plan.",
    ],
    applyInBuco: {
      text: "Ve a Cuentas → Límites por Categoría en Buco y asigna un límite mensual a cada categoría de gasto. Buco te avisará cuando estés llegando al 70% del límite.",
      link: "/cards",
      linkLabel: "Ir a Cuentas",
    },
  },

  "m1c2": {
    intro: [
      "La regla 50/30/20 fue popularizada por Elizabeth Warren (sí, la senadora) en su libro 'All Your Worth'. Es la forma más simple y probada de organizar tus finanzas.",
      "Lo mejor: funciona con cualquier ingreso, desde $500/mes hasta $50,000/mes. Los porcentajes son los mismos.",
    ],
    concept: [
      "50% para NECESIDADES: Todo lo que necesitas para vivir — renta o hipoteca, servicios, transporte al trabajo, comida básica, seguro médico. Si este número es mayor al 50%, tienes un problema estructural.",
      "30% para DESEOS: Todo lo que quieres pero no necesitas — Netflix, restaurantes, ropa nueva, vacaciones, suscripciones. El 30% está ahí para disfrutar sin culpa.",
      "20% para AHORRO e INVERSIÓN: Este dinero va PRIMERO, no lo que sobra. Fondo de emergencia, retiro, inversiones, pago extra de deudas. Si esperas a que sobre, nunca va a sobre.",
    ],
    visual: Visual502030,
    example: [
      "Carlos gana $3,000/mes netos. Aplicando la regla:",
      "• Necesidades (50%): $1,500 — renta $800, comida $300, transporte $200, servicios $200",
      "• Deseos (30%): $900 — salidas $300, ropa $200, streaming $50, gym $100, extras $250",
      "• Ahorro (20%): $600 — $300 al fondo de emergencia, $300 a inversiones",
      "Carlos tardó 3 meses en ajustarse. Hoy ya no llega a cero nunca.",
    ],
    applyInBuco: {
      text: "Abre Reportes en Buco y ve a Análisis por Categoría. Revisa qué porcentaje representa cada tipo de gasto en tus ingresos. ¿Estás sobre el 50% en necesidades? ¿El 30% en deseos?",
      link: "/reports",
      linkLabel: "Ver mis Reportes",
    },
  },

  "m1c3": {
    intro: [
      "El método de los sobres fue inventado mucho antes de las apps financieras. Y sigue siendo una de las herramientas más poderosas para controlar el gasto.",
      "La idea es simple: cuando el sobre está vacío, paras. Sin excepciones.",
    ],
    concept: [
      "Cada categoría de gasto tiene un sobre (físico o virtual). Al inicio del mes metes en cada sobre el dinero asignado según tu presupuesto.",
      "Solo puedes gastar lo que hay en el sobre de esa categoría. Cuando se acaba, se acaba.",
      "Si sobra al final del mes, ese dinero va al ahorro o al sobre del mes siguiente.",
    ],
    applyInBuco: {
      text: "En Buco, los 'sobres' son los Límites por Categoría. Cuando alcanzas el límite de una categoría, Buco te notifica automáticamente.",
      link: "/cards",
      linkLabel: "Configurar límites",
    },
  },

  "m1c4": {
    intro: [
      "La mayoría de las personas ahorra lo que sobra al final del mes. El problema: nunca sobra nada.",
      "Las personas que construyen riqueza hacen lo contrario: ahorran primero y gastan con lo que queda.",
    ],
    concept: [
      "'Pagar primero a ti mismo' significa transferir tu ahorro automáticamente el mismo día que cobras, antes de cualquier otro gasto.",
      "Tu cerebro no puede gastar lo que no ve. Si el dinero nunca llega a tu cuenta principal, no lo echas de menos.",
      "Empieza con el 1% si es necesario. El porcentaje aumenta solo; el hábito es lo que importa.",
    ],
    applyInBuco: {
      text: "Crea una meta de ahorro en Buco con tipo 'virtual' y configura un aporte mensual fijo. Haz la transferencia el día 1 de cada mes antes de cualquier otro gasto.",
      link: "/goals",
      linkLabel: "Crear meta de ahorro",
    },
  },

  "m1c5": {
    intro: [
      "Crear un presupuesto en papel es un buen inicio. Pero Buco te permite hacerlo vivo: se actualiza automáticamente con cada transacción que registras.",
      "En este capítulo te mostramos paso a paso cómo sacarle el máximo provecho.",
    ],
    concept: [
      "Paso 1: Ve a Cuentas → Límites por Categoría. Asigna un monto máximo mensual a cada categoría.",
      "Paso 2: Cada vez que gastes algo, regístralo en Buco desde Gastos → Nueva transacción.",
      "Paso 3: Revisa cada domingo el dashboard. ¿Qué categorías están en rojo? ¿Cuáles van bien?",
    ],
    applyInBuco: {
      text: "Comienza configurando los 3 límites más importantes para ti: Comida, Ocio y Transporte. Con esos tres controlados, ya tienes el 80% del impacto.",
      link: "/cards",
      linkLabel: "Configurar presupuesto",
    },
  },

  // m1c6 — tiene sección IA, no necesita content estático

  // ── MÓDULO 2 ──
  "m2c1": {
    intro: [
      "Cuando pasas tu tarjeta en una tienda, el banco paga por ti en ese momento. Te está prestando dinero. Y dependiendo de cómo respondas a ese préstamo, puede costarte nada o puede costarte una fortuna.",
      "Entender este ciclo te da el control total.",
    ],
    concept: [
      "El ciclo de la tarjeta: cada mes hay una 'fecha de corte' — cuando el banco cierra el periodo y suma todo lo que gastaste. Luego hay una 'fecha límite de pago', típicamente 20 días después.",
      "Si pagas el TOTAL antes de la fecha límite: $0 de interés. El banco te prestó gratis por ~50 días.",
      "Si pagas solo el mínimo: el banco aplica interés (CAT) sobre el saldo restante. Un CAT del 40% convierte $1,000 en $1,400 en un año si no pagas.",
    ],
    example: [
      "Ana gastó $2,000 en enero. Fecha de corte: 15 de enero. Fecha límite: 5 de febrero.",
      "Si paga $2,000 el 4 de febrero → $0 de interés.",
      "Si paga solo el mínimo ($80) → paga $920 de intereses a lo largo de 3 años para liquidar esos mismos $2,000.",
    ],
    applyInBuco: {
      text: "Ve a Cuentas en Buco. Registra tu tarjeta de crédito con la fecha de corte y fecha de pago exactas. Buco te notificará antes de cada fecha límite.",
      link: "/cards",
      linkLabel: "Ver mis Tarjetas",
    },
  },

  "m2c3": {
    intro: [
      "El 'pago mínimo' parece una salvación cuando no tienes dinero. En realidad, es la trampa más costosa de las finanzas personales.",
      "Los bancos lo diseñaron específicamente para maximizar los intereses que te cobran.",
    ],
    concept: [
      "Cuando pagas solo el mínimo, la mayor parte del pago va a intereses, no al capital (el dinero que debes).",
      "Con un saldo de $5,000 a CAT 40% pagando el mínimo mensual, podrías tardar más de 8 años en liquidar la deuda y pagar más de $8,000 en intereses solamente.",
      "La solución: siempre paga más del mínimo. Idealmente, el total. Si no puedes, paga el doble del mínimo como regla básica.",
    ],
    example: [
      "Deuda: $5,000. CAT: 40%. Pago mínimo: ~$150/mes.",
      "Si pagas solo el mínimo: tardas ~10 años y pagas $13,000+ en total.",
      "Si pagas $500/mes: tardas 1 año y pagas $5,800 en total — ahorras $7,200.",
    ],
    applyInBuco: {
      text: "En Buco, el módulo de Cuentas te muestra el porcentaje de utilización de cada tarjeta. Si superas el 30%, prioriza el pago en tu presupuesto mensual.",
      link: "/cards",
      linkLabel: "Ver utilización",
    },
  },

  // ── MÓDULO 3 ──
  "m3c2": {
    intro: [
      "Einstein lo llamó 'el octavo milagro del mundo'. Buffett lo usó para construir la mayor fortuna individual de la historia. Y funciona igual para todos, sin importar el monto inicial.",
      "La clave: ganar intereses sobre los intereses que ya ganaste. Con el tiempo, el efecto es explosivo.",
    ],
    concept: [
      "Interés simple: inviertes $1,000 al 10% → ganas $100 cada año → en 10 años tienes $2,000.",
      "Interés compuesto: inviertes $1,000 al 10% → el año 2 ganas interés sobre $1,100 → en 10 años tienes $2,594.",
      "La diferencia parece pequeña con $1,000. Con $10,000 y 30 años: interés simple = $40,000; interés compuesto = $174,000.",
      "Ingrediente secreto: el tiempo. Empezar 10 años antes puede duplicar o triplicar el resultado final.",
    ],
    visual: VisualInteresCompuesto,
    example: [
      "Sofía y Luis tienen 25 años. Sofía empieza a invertir $200/mes hoy. Luis espera a los 35.",
      "A los 65 años, con 8% anual: Sofía tiene $702,000. Luis tiene $298,000.",
      "Sofía invirtió $96,000 en total. Luis invirtió $72,000. La diferencia de $404,000 viene de solo 10 años más de tiempo.",
    ],
    applyInBuco: {
      text: "Crea una meta de tipo 'Ahorrar' en Buco. Activa el tipo 'cuenta vinculada' para conectarla a tu cuenta de ahorro real. Cada abono que hagas se refleja automáticamente.",
      link: "/goals",
      linkLabel: "Crear Meta de Inversión",
    },
  },

  // ── MÓDULO 5 ──
  "m5c1": {
    intro: [
      "Robert Kiyosaki pasó su infancia escuchando dos historias completamente opuestas sobre el dinero: la de su padre educado (empleado toda la vida) y la de su 'padre rico' (empresario e inversor).",
      "De esa observación nació el concepto que cambió la forma de pensar de millones: el Cuadrante del Flujo de Dinero.",
    ],
    concept: [
      "Todos en el mundo generan dinero desde uno de cuatro cuadrantes. El cuadrante en que estás determina cuánto dinero puedes ganar, cuántos impuestos pagas y cuánta libertad tienes.",
      "E (Empleado): intercambias tiempo por dinero. Seguridad a cambio de control. 'Quiero un trabajo seguro con buenos beneficios.'",
      "S (Self-employed / Autoempleado): eres tu propio jefe pero también tu propio empleado. Sin ti, no hay negocio. 'Si quieres algo bien hecho, hazlo tú mismo.'",
      "B (Business Owner / Dueño): tienes un sistema que funciona sin ti. 'Busco personas inteligentes que hagan el trabajo.'",
      "I (Investor / Inversor): el dinero trabaja para ti. 'Busco un retorno del X% sobre mi inversión.'",
    ],
    visual: VisualEsbi,
    example: [
      "Carlos es médico (S). Gana bien pero si no trabaja, no cobra.",
      "María es franquiciataria de 3 sucursales (B). Gana cuando está de vacaciones.",
      "Roberto tiene $200,000 en ETFs (I). Recibe dividendos sin trabajar.",
      "La meta: moverse de E/S hacia B/I sin necesariamente dejar tu trabajo actual.",
    ],
    applyInBuco: {
      text: "Ve a Metas en Buco y crea una meta de tipo 'Ingreso' para rastrear tu objetivo de alcanzar ingresos pasivos. ¿Cuánto necesitas mensualmente para cubrir tus gastos básicos?",
      link: "/goals",
      linkLabel: "Crear Meta de Ingresos",
    },
  },

  "m5c2": {
    intro: [
      "Esta es la lección más importante y menos enseñada en el sistema educativo. La confusión entre activos y pasivos es la razón principal por la que la clase media nunca construye riqueza real.",
      "Kiyosaki la define de forma brutal y simple.",
    ],
    concept: [
      "ACTIVO: Algo que pone dinero en tu bolsillo. Ejemplos: propiedad en renta, acciones que pagan dividendos, negocio que funciona sin ti, derechos de autor, préstamos que tú otorgas.",
      "PASIVO: Algo que saca dinero de tu bolsillo. Ejemplos: tu auto (gasolina, mantenimiento, seguro), tu casa propia si vives en ella (hipoteca, mantenimiento), ropa cara, gadgets, vacaciones a crédito.",
      "La trampa de la clase media: creen que su casa es un activo. Pero si viven en ella y les cuesta dinero cada mes, es un pasivo.",
      "La estrategia: antes de aumentar tu estilo de vida, construye una columna de activos suficientemente grande. Los activos pagan el estilo de vida.",
    ],
    applyInBuco: {
      text: "Revisa tus tarjetas y cuentas en Buco. ¿Cuánto de tu patrimonio está en activos (cuentas, inversiones, metas) vs. en pasivos (deudas de tarjetas)? La diferencia es tu patrimonio neto real.",
      link: "/cards",
      linkLabel: "Ver Patrimonio",
    },
  },
};
