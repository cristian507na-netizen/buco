import { createClient } from '@/utils/supabase/server';
import webpush from 'web-push';

export type TriggerType = 'budget' | 'reminder' | 'goal' | 'balance' | 'card';

// Initialize web-push
if (process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY && process.env.VAPID_PRIVATE_KEY) {
  webpush.setVapidDetails(
    process.env.VAPID_SUBJECT || 'mailto:admin@buco.app',
    process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
    process.env.VAPID_PRIVATE_KEY
  );
}

// Helpers
async function sendPushPayload(userId: string, payload: any, supabase: any) {
  // Store notification in DB (Capa 1)
  await supabase.from('notifications').insert({
    user_id: userId,
    title: payload.title,
    mensaje: payload.message,
    tipo: payload.type || 'alert',
    leido: false,
    fecha: new Date().toISOString(),
    link: payload.url || '/'
  });

  // Dispatch Web Push (Capa 2)
  const { data: profile } = await supabase.from('profiles').select('push_subscriptions').eq('id', userId).single();
  const subs = profile?.push_subscriptions || [];
  
  for (let i = 0; i < subs.length; i++) {
    try {
      await webpush.sendNotification(subs[i], JSON.stringify(payload));
    } catch (e: any) {
      console.error('Failed to push to subscription:', e);
      // Remove stale subscriptions if Error 410 or 404
      if (e?.statusCode === 410 || e?.statusCode === 404) {
         subs.splice(i, 1);
         i--;
         await supabase.from('profiles').update({ push_subscriptions: subs }).eq('id', userId);
      }
    }
  }
}

export async function checkNotificationTriggers(params: { userId: string; triggerType: TriggerType | 'all' }) {
  const supabase = createClient();
  const { userId, triggerType } = params;

  // Verify User Preferences First
  const { data: profile } = await supabase.from('profiles').select('notification_preferences').eq('id', userId).single();
  const prefs = profile?.notification_preferences || { budget: true, reminder: true, goal: true, balance: true, card: true };

  const today = new Date();
  
  // 1. BUDGET TRIGGER
  if ((triggerType === 'budget' || triggerType === 'all') && (prefs.budget !== false)) {
    const monthStart = new Date(today.getFullYear(), today.getMonth(), 1).toISOString();
    const { data: goals } = await supabase.from('savings_goals').select('*').eq('user_id', userId).eq('type', 'gasto').eq('status', 'active');
    const { data: expenses } = await supabase.from('expenses').select('*').eq('user_id', userId).gte('fecha', monthStart);
    
    if (goals && expenses) {
        for (const goal of goals) {
          const categoryName = (goal.target_category || goal.category_limit_name || goal.name || '').toLowerCase();
          const spent = expenses
            .filter(e => (e.categoria || '').toLowerCase() === categoryName)
            .reduce((sum, e) => sum + Number(e.monto || e.amount || 0), 0);
          
          const limit = Number(goal.target_amount);
          if (limit > 0) {
             const ratio = spent / limit;
             // 80% Near Limit
             if (ratio >= 0.8 && ratio < 1.0) {
                const { data: recent } = await supabase.from('notifications')
                  .select('*')
                  .eq('user_id', userId)
                  .ilike('mensaje', `%80% del límite de ${goal.name}%`)
                  .gte('fecha', monthStart)
                  .limit(1);
                
                if (!recent || recent.length === 0) {
                  await sendPushPayload(userId, {
                    title: '⚠️ Límite de Gasto Cerca',
                    message: `Has gastado el 80% de tu presupuesto para ${goal.name}. ($${spent.toFixed(2)} / $${limit})`,
                    type: 'warning',
                    url: '/expenses'
                  }, supabase);
                }
             } 
             // 100% Exceeded
             else if (ratio >= 1.0) {
                const { data: recent } = await supabase.from('notifications')
                  .select('*')
                  .eq('user_id', userId)
                  .ilike('mensaje', `%superado el límite de ${goal.name}%`)
                  .gte('fecha', monthStart)
                  .limit(1);

                if (!recent || recent.length === 0) {
                  await sendPushPayload(userId, {
                    title: '🚨 Presupuesto Superado',
                    message: `Has superado el límite de ${goal.name}. ($${spent.toFixed(2)} de $${limit} permitidos)`,
                    type: 'alert',
                    url: '/expenses'
                  }, supabase);
                }
             }
          }
        }
    }
  }

  // 2. REMINDER TRIGGER + FOLLOW-UPS
  if ((triggerType === 'reminder' || triggerType === 'all') && (prefs.reminder !== false)) {
    const todayStr = today.toISOString().split('T')[0];
    const hour = today.getHours();

    // 2a. 24h-before notification (due tomorrow)
    const tmrw = new Date(); tmrw.setDate(today.getDate() + 1);
    const tmrwStr = tmrw.toISOString().split('T')[0];
    const { data: tomorrowReminders } = await supabase.from('reminders').select('*').eq('user_id', userId).eq('status', 'active').gte('fecha', `${tmrwStr}T00:00:00`).lte('fecha', `${tmrwStr}T23:59:59`);
    for (const reminder of tomorrowReminders || []) {
      const name = reminder.nombre || reminder.titulo || 'Recordatorio';
      const { data: recent } = await supabase.from('notifications').select('id').eq('user_id', userId).eq('tipo', 'reminder').ilike('mensaje', `%vence mañana%${name}%`).gte('fecha', `${todayStr}T00:00:00`).limit(1);
      if (!recent?.length) {
        await sendPushPayload(userId, {
          title: '📅 Vence mañana',
          message: `${name} vence mañana${reminder.monto ? ` — $${reminder.monto}` : ''}. Toca aquí para marcarlo como pagado.`,
          type: 'reminder',
          url: '/'
        }, supabase);
      }
    }

    // 2b. Same-day 9am notification
    if (hour >= 9) {
      const { data: todayReminders } = await supabase.from('reminders').select('*').eq('user_id', userId).eq('status', 'active').gte('fecha', `${todayStr}T00:00:00`).lte('fecha', `${todayStr}T23:59:59`);
      for (const reminder of todayReminders || []) {
        const name = reminder.nombre || reminder.titulo || 'Recordatorio';
        const monto = reminder.monto ? ` — $${reminder.monto}` : '';
        const { data: recent } = await supabase.from('notifications').select('id').eq('user_id', userId).eq('tipo', 'recordatorio_followup').ilike('mensaje', `%Hoy vence ${name}%`).gte('fecha', `${todayStr}T00:00:00`).limit(1);
        if (!recent?.length) {
          await sendPushPayload(userId, {
            title: '📅 Recordatorio de hoy',
            message: `Hoy vence ${name}${monto}. Toca aquí para marcarlo como pagado.`,
            type: 'recordatorio_followup',
            url: '/'
          }, supabase);
        }
      }
    }

    // 2c. Same-day 8pm follow-up if still unpaid
    if (hour >= 20) {
      const { data: todayReminders } = await supabase.from('reminders').select('*').eq('user_id', userId).eq('status', 'active').gte('fecha', `${todayStr}T00:00:00`).lte('fecha', `${todayStr}T23:59:59`);
      for (const reminder of todayReminders || []) {
        const name = reminder.nombre || reminder.titulo || 'Recordatorio';
        const monto = reminder.monto ? ` de $${reminder.monto}` : '';
        const { data: recent } = await supabase.from('notifications').select('id').eq('user_id', userId).eq('tipo', 'recordatorio_followup').ilike('mensaje', `%aún no fue marcado como pagado%`).ilike('mensaje', `%${name}%`).gte('fecha', `${todayStr}T20:00:00`).limit(1);
        if (!recent?.length) {
          await sendPushPayload(userId, {
            title: '⏰ Recordatorio pendiente',
            message: `Recordatorio pendiente — ${name}${monto} aún no fue marcado como pagado hoy.`,
            type: 'recordatorio_followup',
            url: '/'
          }, supabase);
        }
      }
    }

    // 2d. Overdue follow-ups (1 day, 3 days)
    const { data: overdueReminders } = await supabase.from('reminders').select('*').eq('user_id', userId).eq('status', 'active').lt('fecha', `${todayStr}T00:00:00`);
    for (const reminder of overdueReminders || []) {
      const name = reminder.nombre || reminder.titulo || 'Recordatorio';
      const monto = reminder.monto ? ` $${reminder.monto}` : '';
      const reminderDateStr = (reminder.fecha || '').split('T')[0];
      const daysOverdue = Math.floor((today.getTime() - new Date(reminderDateStr).getTime()) / 86400000);

      if (daysOverdue === 1) {
        const { data: recent } = await supabase.from('notifications').select('id').eq('user_id', userId).eq('tipo', 'recordatorio_followup').ilike('mensaje', `%vencido desde ayer%`).ilike('mensaje', `%${name}%`).limit(1);
        if (!recent?.length) {
          await sendPushPayload(userId, {
            title: '⚠️ Pago vencido',
            message: `${name} está vencido desde ayer —${monto} pendiente. ¿Ya lo pagaste?`,
            type: 'recordatorio_followup',
            url: '/'
          }, supabase);
        }
      } else if (daysOverdue >= 3) {
        const { data: recent } = await supabase.from('notifications').select('id').eq('user_id', userId).eq('tipo', 'recordatorio_followup').ilike('mensaje', `%Lleva 3 días vencido%`).ilike('mensaje', `%${name}%`).limit(1);
        if (!recent?.length) {
          await sendPushPayload(userId, {
            title: '🚨 Pago urgente',
            message: `Lleva 3 días vencido — ${name} de${monto}. Márcalo como pagado o edita la fecha si ya no aplica.`,
            type: 'recordatorio_followup',
            url: '/'
          }, supabase);
        }
      }
    }

    // NEW: Cleanup old notifications (older than 7 days)
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    await supabase.from('notifications')
      .delete()
      .eq('user_id', userId)
      .lt('created_at', oneWeekAgo.toISOString());
  }

  // 3. CARD TRIGGER
  if ((triggerType === 'card' || triggerType === 'all') && (prefs.card !== false)) {
    const { data: cards } = await supabase.from('credit_cards').select('*').eq('user_id', userId);
    if (cards) {
       for (const card of cards) {
         const limit = Number(card.limite || card.limit_amount || 0);
         const balance = Number(card.saldo_actual || card.current_balance || 0);
         const cardName = card.nombre_tarjeta || card.name || 'Tarjeta';
         if (limit > 0 && balance/limit >= 0.9) {
            const { data: recent } = await supabase.from('notifications').select('*').eq('user_id', userId).ilike('mensaje', `%90% crédito en ${cardName}%`).limit(1);
            if (!recent || recent.length === 0) {
              await sendPushPayload(userId, {
                title: '💳 Alerta de Crédito',
                message: `Has superado el 90% crédito en ${cardName}.`,
                type: 'warning',
                url: '/accounts'
              }, supabase);
            }
         }
       }
    }
  }

  // 4. GOAL TRIGGER
  if ((triggerType === 'goal' || triggerType === 'all') && (prefs.goal !== false)) {
    const { data: goals } = await supabase.from('savings_goals').select('*').eq('user_id', userId).eq('type', 'ahorro').eq('status', 'active');
    if (goals) {
      for (const goal of goals) {
        const target = Number(goal.target_amount);
        const current = Number(goal.current_amount);
        if (target > 0 && (current / target) >= 0.9) {
          const { data: recent } = await supabase.from('notifications').select('*').eq('user_id', userId).ilike('mensaje', `%90% de tu meta ${goal.name}%`).limit(1);
          if (!recent || recent.length === 0) {
            await sendPushPayload(userId, {
              title: '🎯 Meta casi lista',
              message: `¡Increíble! Has alcanzado el 90% de tu meta ${goal.name}.`,
              type: 'goal',
              url: `/goals/${goal.id}`
            }, supabase);
          }
        }
      }
    }
  }

  // 5. BALANCE TRIGGER
  if ((triggerType === 'balance' || triggerType === 'all') && (prefs.balance !== false)) {
    const { data: accounts } = await supabase.from('bank_accounts').select('*').eq('user_id', userId);
    if (accounts) {
      for (const acc of accounts) {
        const balance = Number(acc.saldo_actual || acc.balance || 0);
        const accName = acc.alias || acc.nombre_banco || acc.name || 'Cuenta';
        if (balance < 50) {
          const { data: recent } = await supabase.from('notifications').select('*').eq('user_id', userId).ilike('mensaje', `%saldo bajo en ${accName}%`).limit(1);
          if (!recent || recent.length === 0) {
            await sendPushPayload(userId, {
              title: '💰 Saldo Bajo',
              message: `Tu cuenta ${accName} tiene un saldo menor a $50.`,
              type: 'alert',
              url: '/accounts'
            }, supabase);
          }
        }
      }
    }
  }

  // 6. GLOBAL CLEANUP (older than 7 days)
  const oneWeekAgo = new Date();
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
  await supabase.from('notifications')
    .delete()
    .eq('user_id', userId)
    .lt('created_at', oneWeekAgo.toISOString());
}
