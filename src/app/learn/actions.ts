"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

export async function markChapterComplete(moduleId: string, chapterId: string) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  const { error } = await supabase
    .from("learn_progress")
    .upsert(
      {
        user_id: user.id,
        module_id: moduleId,
        chapter_id: chapterId,
        completed: true,
        completed_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      { onConflict: "user_id,module_id,chapter_id" }
    );

  if (error) throw error;
  revalidatePath("/learn");
  return { success: true };
}

export async function getLearnProgress(userId: string) {
  const supabase = createClient();
  const { data } = await supabase
    .from("learn_progress")
    .select("*")
    .eq("user_id", userId)
    .eq("completed", true);
  return data || [];
}
