import { createClient } from "@/utils/supabase/server";
import { redirect, notFound } from "next/navigation";
import { getChapter } from "@/lib/learn-content";
import ChapterClient from "@/components/learn/ChapterClient";

export default async function ChapterPage({
  params,
}: {
  params: { moduleId: string; chapterId: string };
}) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return redirect("/login");

  const result = getChapter(params.moduleId, params.chapterId);
  if (!result) return notFound();
  const { module: mod, chapter } = result;

  // Check if already completed
  const { data: progressRow } = await supabase
    .from("learn_progress")
    .select("completed")
    .eq("user_id", user.id)
    .eq("module_id", mod.id)
    .eq("chapter_id", chapter.id)
    .single();

  // Fetch user data for AI-personalized chapters
  let userData = null;
  if (chapter.hasAiSection) {
    const today = new Date();
    const firstOfMonth = new Date(today.getFullYear(), today.getMonth(), 1).toISOString();

    const [
      { data: expenses },
      { data: incomeSources },
      { data: creditCards },
      { data: bankAccounts },
      { data: goals },
    ] = await Promise.all([
      supabase.from("expenses").select("monto, categoria").eq("user_id", user.id).gte("fecha", firstOfMonth),
      supabase.from("income_sources").select("monto").eq("user_id", user.id).eq("activo", true),
      supabase.from("credit_cards").select("nombre_tarjeta, saldo_actual, limite").eq("user_id", user.id),
      supabase.from("bank_accounts").select("alias, saldo_actual").eq("user_id", user.id),
      supabase.from("savings_goals").select("id, name, status").eq("user_id", user.id).eq("status", "active"),
    ]);

    const expensesByCategory: Record<string, number> = {};
    (expenses || []).forEach((e) => {
      expensesByCategory[e.categoria] = (expensesByCategory[e.categoria] || 0) + Number(e.monto);
    });
    const totalExpenses = Object.values(expensesByCategory).reduce((a, b) => a + b, 0);
    const totalIncome = (incomeSources || []).reduce((acc, i) => acc + Number(i.monto), 0);

    userData = {
      expensesByCategory,
      totalIncome,
      totalExpenses,
      savingsRate: totalIncome > 0 ? Math.round(((totalIncome - totalExpenses) / totalIncome) * 100) : 0,
      creditCards: creditCards || [],
      bankAccounts: bankAccounts || [],
      goals: goals || [],
    };
  }

  // Find next chapter
  const currentIndex = mod.chapters.findIndex((c) => c.id === chapter.id);
  const nextChapter = mod.chapters[currentIndex + 1] ?? null;

  return (
    <ChapterClient
      module={mod}
      chapter={chapter}
      chapterIndex={currentIndex}
      nextChapter={nextChapter}
      isCompleted={progressRow?.completed ?? false}
      userData={userData}
    />
  );
}
