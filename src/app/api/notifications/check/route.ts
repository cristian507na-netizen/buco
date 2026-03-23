import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { checkNotificationTriggers } from '@/lib/notifications/engine';

export async function GET(request: Request) {
  try {
    // Basic auth check for CRON (optional, can use a secret header)
    const authHeader = request.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabase = createClient();
    
    // Get all users who have onboarding completed
    const { data: users, error } = await supabase
      .from('profiles')
      .select('id')
      .eq('onboarding_completed', true);

    if (error) throw error;

    const results = [];
    for (const user of users) {
      await checkNotificationTriggers({ userId: user.id, triggerType: 'all' });
      results.push(user.id);
    }

    return NextResponse.json({ 
      success: true, 
      processed_users: results.length 
    });
  } catch (error: any) {
    console.error('CRON Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
