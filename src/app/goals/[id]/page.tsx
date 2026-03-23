import { createClient } from "@/utils/supabase/server";
import { notFound, redirect } from "next/navigation";
import GoalDetailClient from "@/components/goals/GoalDetailClient";

export default async function GoalDetailPage({ params }: { params: { id: string } }) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return redirect("/login");

  const [
    { data: goal },
    { data: contributions },
    { data: tasks },
    { data: messages },
    { data: accounts },
    { data: creditCards },
    { data: expenses },
    { data: incomes },
    { data: profile },
    { data: planSteps },
  ] = await Promise.all([
    supabase.from('savings_goals').select('*').eq('id', params.id).single(),
    supabase.from('goal_contributions').select('*').eq('goal_id', params.id).order('date', { ascending: false }),
    supabase.from('goal_tasks').select('*').eq('goal_id', params.id).order('created_at', { ascending: false }),
    supabase.from('goal_chats').select('*').eq('goal_id', params.id).order('created_at', { ascending: true }),
    supabase.from('bank_accounts').select('*').eq('user_id', user.id),
    supabase.from('credit_cards').select('*').eq('user_id', user.id),
    supabase.from('expenses').select('*').eq('user_id', user.id),
    supabase.from('incomes').select('*').eq('user_id', user.id),
    supabase.from('profiles').select('*').eq('id', user.id).single(),
    supabase.from('goal_plan_steps').select('*').eq('goal_id', params.id).order('due_date', { ascending: true }),
  ]);

  if (!goal) return notFound();

  return (
    <GoalDetailClient 
      goal={goal}
      contributions={contributions || []}
      tasks={tasks || []}
      messages={messages || []}
      accounts={accounts || []}
      creditCards={creditCards || []}
      expenses={expenses || []}
      incomes={incomes || []}
      profile={profile}
      userId={user.id}
      planSteps={planSteps || []}
    />
  );
}
