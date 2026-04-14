import { Request, Response } from "express";
import { prisma } from "../lib/prisma.js";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

const PLANS = {
  pro: {
    priceId: process.env.STRIPE_PRICE_PRO!,
    name: "Pro Plan",
    amount: 10,
    planEnum: "PRO" as const,
  },
  enterprise: {
    priceId: process.env.STRIPE_PRICE_ENTERPRISE!,
    name: "Enterprise Plan",
    amount: 25,
    planEnum: "ENTERPRISE" as const,
  },
};

// Helper to safely get expiry date from subscription
const getExpiryDate = (subscription: Stripe.Subscription): Date | null => {
  try {
    const end =
      (subscription as any).current_period_end ??
      subscription.items?.data?.[0]?.current_period_end;

    if (!end || isNaN(Number(end))) return null;

    const date = new Date(Number(end) * 1000);
    if (isNaN(date.getTime())) return null;

    return date;
  } catch {
    return null;
  }
};

// Helper to handle invoice payment renewal logic (used by both v1 and v2 events)
const handleInvoiceRenewal = async (subscriptionId: string) => {
  if (!subscriptionId) return;

  const subscription = await stripe.subscriptions.retrieve(subscriptionId);
  const userId = Number(subscription.metadata.userId);

  if (!userId || isNaN(userId)) {
    console.log("Skipping renewal — no userId in metadata");
    return;
  }

  const expiryDate = getExpiryDate(subscription);

  await prisma.user.update({
    where: { id: userId },
    data: {
      subscriptionStatus: "active",
      ...(expiryDate && { planExpiresAt: expiryDate }),
    },
  });

  console.log(`✅ Renewal successful for user ${userId}`);
};

// Create Checkout Session
export const createPayment = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.userId;
    const { plan } = req.body;

    const selectedPlan = PLANS[plan as keyof typeof PLANS];
    if (!selectedPlan) {
      return res.status(400).json({ success: false, message: "Invalid plan" });
    }

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    const sessionParams: Stripe.Checkout.SessionCreateParams = {
      mode: "subscription",
      client_reference_id: String(userId),
      line_items: [{ price: selectedPlan.priceId, quantity: 1 }],
      subscription_data: {
        metadata: { userId: String(userId), plan },
      },
      success_url: `${process.env.CORS_ORIGIN}/success`,
      cancel_url: `${process.env.CORS_ORIGIN}/pricing`,
    };

    if (user.stripeCustomerId) {
      sessionParams.customer = user.stripeCustomerId;
    } else {
      sessionParams.customer_email = user.email;
    }

    const session = await stripe.checkout.sessions.create(sessionParams);

    res.json({ success: true, url: session.url });
  } catch (error) {
    console.error("Error creating payment:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// Webhook Handler
export const handleWebHook = async (req: Request, res: Response) => {
  const sig = req.headers["stripe-signature"];

  if (!sig) {
    return res.status(400).json({ message: "Missing stripe signature" });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig as string,
      process.env.STRIPE_WEBHOOK_SECRET!,
    );
  } catch (err: any) {
    console.error("Webhook signature error:", err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  try {
    switch (event.type) {

      // ✅ User subscribed — save to DB
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const userId = Number(session.client_reference_id);
        const subscriptionId = session.subscription as string;
        const customerId = session.customer as string;

        if (!userId || isNaN(userId)) {
          console.log("Skipping — invalid userId");
          break;
        }

        const subscription = await stripe.subscriptions.retrieve(subscriptionId);
        const plan = subscription.metadata.plan as keyof typeof PLANS;
        const planEnum = PLANS[plan]?.planEnum ?? "PRO";
        const expiryDate = getExpiryDate(subscription);

        console.log("subscription data:", {
          userId,
          plan,
          planEnum,
          expiryDate,
          current_period_end: (subscription as any).current_period_end,
        });

        await prisma.user.update({
          where: { id: userId },
          data: {
            plan: planEnum,
            stripeCustomerId: customerId,
            subscriptionId: subscriptionId,
            subscriptionStatus: "active",
            ...(expiryDate && { planExpiresAt: expiryDate }),
          },
        });

        console.log(`✅ User ${userId} subscribed to ${plan}`);
        break;
      }

      // ✅ Monthly renewal — v1 snapshot event
      case "invoice.payment_succeeded": {
        const invoice = event.data.object as Stripe.Invoice & { subscription?: string };
        await handleInvoiceRenewal(invoice.subscription as string);
        break;
      }

      // ✅ Monthly renewal — v2 thin event (invoice_payment.paid)
      // This is the newer Stripe API event format — handles the same renewal logic
      case "invoice_payment.paid" as any: {
        const invoicePayment = event.data.object as any;
        // v2 thin event: get subscriptionId from invoice_payment object
        const subscriptionId =
          invoicePayment.subscription ?? invoicePayment.subscriptionId ?? null;
        if (subscriptionId) {
          await handleInvoiceRenewal(subscriptionId);
        } else {
          console.log("invoice_payment.paid — no subscriptionId found, skipping");
        }
        break;
      }

      // ❌ Payment failed — v1
      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice & { subscription?: string };
        const subscriptionId = invoice.subscription as string;

        if (!subscriptionId) break;

        const subscription = await stripe.subscriptions.retrieve(subscriptionId);
        const userId = Number(subscription.metadata.userId);

        if (!userId || isNaN(userId)) break;

        await prisma.user.update({
          where: { id: userId },
          data: { subscriptionStatus: "past_due" },
        });

        console.log(`❌ Payment failed for user ${userId}`);
        break;
      }

      // 🚫 Subscription cancelled
      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        const userId = Number(subscription.metadata.userId);

        if (!userId || isNaN(userId)) break;

        await prisma.user.update({
          where: { id: userId },
          data: {
            plan: "FREE",
            subscriptionId: null,
            subscriptionStatus: "canceled",
            planExpiresAt: null,
          },
        });

        console.log(`🚫 Subscription cancelled for user ${userId}`);
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    res.json({ received: true });
  } catch (error) {
    console.error("Webhook processing error:", error);
    res.status(500).json({ message: "Webhook processing failed" });
  }
};

export const getUserPlan = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.userId;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        plan: true,
        subscriptionStatus: true,
        planExpiresAt: true,
      },
    });

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    res.json({
      success: true,
      plan: user.plan,
      status: user.subscriptionStatus,
      expiresAt: user.planExpiresAt,
      isActive: user.subscriptionStatus === "active",
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};
