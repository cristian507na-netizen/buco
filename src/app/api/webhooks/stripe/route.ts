import { stripe } from "@/lib/stripe";
import { createClient } from "@supabase/supabase-js";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import Stripe from "stripe";

export async function POST(req: Request) {
  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
  const body = await req.text();
  const signature = headers().get("Stripe-Signature") as string;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (error: any) {
    return new NextResponse(`Webhook Error: ${error.message}`, { status: 400 });
  }

  const session = event.data.object as Stripe.Checkout.Session;

  if (event.type === "checkout.session.completed") {
    const subscription = (await stripe.subscriptions.retrieve(
      session.subscription as string
    )) as Stripe.Subscription;

    if (!session?.metadata?.userId) {
      return new NextResponse("User id is required", { status: 400 });
    }

    const plan = session.metadata.plan || "premium"; // default fallback

    // Update user profile in Supabase
    const { error: profileError } = await supabaseAdmin
      .from("profiles")
      .update({
        plan: plan,
        plan_expires_at: new Date(
          (subscription as any).current_period_end * 1000
        ).toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq("id", session.metadata.userId);

    if (profileError) {
      console.error("[STRIPE_WEBHOOK_PROFILE_UPDATE_ERROR]", profileError);
      return new NextResponse(profileError.message, { status: 500 });
    }
  }

  if (event.type === "customer.subscription.deleted" || event.type === "customer.subscription.updated") {
    const subscription = event.data.object as Stripe.Subscription;
    const userId = subscription.metadata.userId;

    if (!userId) {
      return new NextResponse("No User Id in subscription metadata", { status: 200 });
    }

    // If subscription is canceled or ended, downgrade to free
    if (subscription.status !== 'active') {
       await supabaseAdmin
        .from("profiles")
        .update({
          plan: "free",
          plan_expires_at: null,
          updated_at: new Date().toISOString(),
        })
        .eq("id", userId);
    }
  }

  return new NextResponse(null, { status: 200 });
}
