import { createClient } from "@/utils/supabase/server";
import { redirect, notFound } from "next/navigation";
import { getModule } from "@/lib/learn-content";
import ModuleClient from "@/components/learn/ModuleClient";

export default async function ModulePage({ params }: { params: { moduleId: string } }) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return redirect("/login");

  const mod = getModule(params.moduleId);
  if (!mod) return notFound();

  const { data: progress } = await supabase
    .from("learn_progress")
    .select("chapter_id")
    .eq("user_id", user.id)
    .eq("module_id", mod.id)
    .eq("completed", true);

  const completedIds = new Set((progress || []).map((p) => p.chapter_id));

  return <ModuleClient module={mod} completedChapterIds={Array.from(completedIds)} />;
}
