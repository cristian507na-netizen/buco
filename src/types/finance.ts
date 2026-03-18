export type UserProfile = {
  id: string;
  email: string;
  nombre: string | null;
  sueldo_mensual: number;
  moneda: string;
  whatsapp_numero: string | null;
  avatar_url: string | null;
  onboarding_completed: boolean;
};

export type Expense = {
  id: string;
  user_id: string;
  monto: number;
  categoria:
    | "comida"
    | "transporte"
    | "salud"
    | "ocio"
    | "hogar"
    | "suscripciones"
    | "educacion"
    | "ropa"
    | "tecnologia"
    | "otros";
  comercio: string | null;
  descripcion: string | null;
  fecha: string;
  metodo_pago:
    | "efectivo"
    | "tarjeta_debito"
    | "tarjeta_credito"
    | "transferencia"
    | "otro";
  factura_url: string | null;
  origen: "manual" | "whatsapp" | "pdf_import" | "card_sync";
  card_id: string | null;
  created_at: string;
};

export type DashboardSummary = {
  sueldo: number;
  gastos: number;
  cuotas_deudas: number;
  pagos_tarjetas: number;
  saldo_disponible: number;
  ahorro_acumulado: number;
  score_salud: number;
  porcentaje_gastado: number;
};
