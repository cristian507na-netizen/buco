"use server";

import { createClient } from '@/utils/supabase/server';
import webpush from 'web-push';

export async function savePushSubscription(subscription: any) {
  try {
    const supabase = createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return { success: false, error: 'User not authenticated' };
    }

    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('push_subscriptions')
      .eq('id', user.id)
      .single();

    if (profileError && profileError.code !== 'PGRST116') {
      console.error('Error fetching profile:', profileError);
      return { success: false, error: 'Database error' };
    }

    const existingSubs = profile?.push_subscriptions || [];
    
    // Check if subscription already exists based on endpoint
    if (!existingSubs.some((sub: any) => sub.endpoint === subscription.endpoint)) {
      const newSubs = [...existingSubs, subscription];
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ push_subscriptions: newSubs })
        .eq('id', user.id);
        
      if (updateError) {
        console.error('Error updating subscriptions:', updateError);
        return { success: false, error: 'Failed to save subscription' };
      }
    }

    return { success: true };
  } catch (error) {
    console.error('Error saving push subscription:', error);
    return { success: false, error: 'Internal error' };
  }
}

export async function updateNotificationPreferences(preferences: any) {
  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) return { success: false, error: 'Not authenticated' };

    const { error } = await supabase
      .from('profiles')
      .update({ notification_preferences: preferences })
      .eq('id', user.id);

    if (error) throw error;
    return { success: true };
  } catch (error) {
    console.error('Error updating preferences:', error);
    return { success: false, error: 'Failed to update' };
  }
}

export async function triggerUserNotifications() {
  try {
    const { createClient } = await import('@/utils/supabase/server');
    const { checkNotificationTriggers } = await import('@/lib/notifications/engine');
    
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (user) {
      await checkNotificationTriggers({ userId: user.id, triggerType: 'all' });
    }
    return { success: true };
  } catch (error) {
    console.error('Trigger Error:', error);
    return { success: false };
  }
}
