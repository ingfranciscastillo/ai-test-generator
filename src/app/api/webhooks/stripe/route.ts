import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import {
  handleSuccessfulPayment,
  handleFailedPayment,
} from "@/lib/subscription";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-06-30.basil",
});

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(req: NextRequest) {
  try {
    const body = await req.text();
    const signature = req.headers.get("stripe-signature") || "";

    let event: Stripe.Event;

    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } catch (err: any) {
      console.error("Webhook signature verification failed:", err);
      return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
    }

    console.log("Received webhook event:", event.type);

    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;

        if (session.mode === "subscription" && session.subscription) {
          await handleSuccessfulPayment(
            session.customer as string,
            session.subscription as string
          );
          console.log("Subscription activated for customer:", session.customer);
        }
        break;
      }

      case "customer.subscription.created": {
        const subscription = event.data.object as Stripe.Subscription;
        await handleSuccessfulPayment(
          subscription.customer as string,
          subscription.id
        );
        console.log("Subscription created:", subscription.id);
        break;
      }

      case "customer.subscription.updated": {
        const subscription = event.data.object as Stripe.Subscription;

        if (subscription.status === "active") {
          await handleSuccessfulPayment(
            subscription.customer as string,
            subscription.id
          );
        } else {
          await handleFailedPayment(subscription.id);
        }
        console.log(
          "Subscription updated:",
          subscription.id,
          "Status:",
          subscription.status
        );
        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        await handleFailedPayment(subscription.id);
        console.log("Subscription cancelled:", subscription.id);
        break;
      }

      default:
        console.log("Unhandled webhook event type:", event.type);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Webhook error:", error);
    return NextResponse.json(
      { error: "Webhook processing failed" },
      { status: 500 }
    );
  }
}
