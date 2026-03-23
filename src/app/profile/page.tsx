import React from 'react';
import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import { ProfileClient } from '@/components/profile/ProfileClient';

export default async function ProfilePage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return redirect("/login");

  // Fetch Profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  // Fetch Goals (matching Dashboard logic)
  const { data: activeGoals } = await supabase
    .from('savings_goals')
    .select('*')
    .eq('user_id', user.id)
    .order('deadline', { ascending: true });

  return (
    <ProfileClient 
      profile={profile} 
      userEmail={user.email || ''} 
      activeGoals={activeGoals || []} 
    />
  );
}

