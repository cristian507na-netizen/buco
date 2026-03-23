export const REALTIME_TABLES = [
  'expenses',           // gastos
  'incomes',            // ingresos  
  'savings_goals',      // metas
  'goal_contributions', // aportaciones a metas
  'goal_tasks',         // tareas de metas
  'goal_chats',         // chat IA de metas
  'cards',              // tarjetas de crédito/débito
  'bank_accounts',      // cuentas bancarias
  'reminders',          // recordatorios
  'profiles',           // perfil de usuario
  'user_settings',      // configuración
  'notification_settings', // preferencias notificaciones
] as const;

export type RealtimeTable = typeof REALTIME_TABLES[number];
