import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { PricingCards } from "@/app/billing/PricingCards";

export default async function BillingPage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
     return redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  return (
    <div className="min-h-screen bg-[var(--bg-global)] py-20 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-6xl font-black text-[var(--text-primary)] tracking-tighter italic mb-4">
            Mejora tu Plan
          </h1>
          <p className="text-[var(--text-muted)] text-lg uppercase tracking-widest font-bold opacity-60">
            Libera el poder total de tu IA financiera
          </p>
        </div>

        <PricingCards currentPlan={profile?.plan || 'free'} />
      </div>
    </div>
  );
}
