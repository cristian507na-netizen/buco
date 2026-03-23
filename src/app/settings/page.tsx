import React from 'react';
import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import { SettingsClient } from '@/components/settings/SettingsClient';

export default async function SettingsPage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return redirect("/login");

  // Fetch or Initialise User Settings
  let { data: userSettings } = await supabase
    .from('user_settings')
    .select('*')
    .eq('user_id', user.id)
    .single();

  if (!userSettings) {
    const { data: newData } = await supabase
      .from('user_settings')
      .insert({ user_id: user.id })
      .select('*')
      .single();
    userSettings = newData;
  }

  // Fetch or Initialise Notification Settings
  let { data: notificationSettings } = await supabase
    .from('notification_settings')
    .select('*')
    .eq('user_id', user.id)
    .single();

  if (!notificationSettings) {
    const { data: newData } = await supabase
      .from('notification_settings')
      .insert({ user_id: user.id })
      .select('*')
      .single();
    notificationSettings = newData;
  }

  return (
    <SettingsClient 
      userSettings={userSettings} 
      notificationSettings={notificationSettings}
      userEmail={user.email || ''}
    />
  );
}
