import { SystemTool } from '../index';

export const getCardsHealth: SystemTool = {
  name: 'get_cards_health',
  description: 'Evalúa la salud de las tarjetas de crédito activas (utilización, saldos y fechas de pago).',
  inputSchema: {
    type: 'object',
    properties: {},
  },
  execute: async (_, { supabase, userId }) => {
    const { data: cards } = await supabase
      .from('credit_cards')
      .select('name, credit_limit, current_balance, statement_date, due_date, interest_rate')
      .eq('user_id', userId)
      .eq('is_active', true);

    const result = (cards || []).map(card => {
      const limite = Number(card.credit_limit) || 0;
      const saldo = Number(card.current_balance) || 0;
      const utilizationPct = limite > 0 ? (saldo / limite) * 100 : 0;
      
      return {
        nombre: card.name,
        limite,
        saldoActual: saldo,
        utilizationPct: Number(utilizationPct.toFixed(1)),
        fechaCorte: card.statement_date,
        fechaPago: card.due_date,
        tasaInteres: card.interest_rate
      };
    });

    return result;
  }
};
