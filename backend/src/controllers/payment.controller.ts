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

// Helper to handle invoice payment renewal logic
const handleInvoiceRenewal = async (subscriptionId: string) => {
  if (!subscriptionId) return;

  const subscription = await stripe.subscriptions.retrieve(subscriptionId);
  const orgId = Number(subscription.metadata.organizationId);

  if (!orgId || isNaN(orgId)) {
    console.log("Skipping renewal — no orgId in metadata");
    return;
  }

  const expiryDate = getExpiryDate(subscription);

  await prisma.organization.update({
    where: { id: orgId },
    data: {
      subscriptionStatus: "active",
      ...(expiryDate && { planExpiresAt: expiryDate }),
    },
  });

  console.log(` Renewal successful for organization ${orgId}`);
};

// Create Checkout Session
export const createPayment = async (req: Request, res: Response) => {
  try {
    const { plan, organizationId } = req.body;

    const selectedPlan = PLANS[plan as keyof typeof PLANS];
    if (!selectedPlan) {
      return res.status(400).json({ success: false, message: "Invalid plan" });
    }

    const org = await prisma.organization.findUnique({
      where: {
        id: organizationId,
      },
    });

    if (!org) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    const sessionParams: Stripe.Checkout.SessionCreateParams = {
      mode: "subscription",
      client_reference_id: String(organizationId),
      line_items: [{ price: selectedPlan.priceId, quantity: 1 }],
      subscription_data: {
        metadata: { organizationId: String(organizationId), plan },
      },
      success_url: `${process.env.CORS_ORIGIN}/success`,
      cancel_url: `${process.env.CORS_ORIGIN}/pricing`,
    };

    if (org.stripeCustomerId) {
      sessionParams.customer = org.stripeCustomerId;
    } else {
      sessionParams.customer_email = (req as any).user.email;
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
      //  User subscribed
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const organizationId = Number(session.client_reference_id);
        const subscriptionId = session.subscription as string;
        const customerId = session.customer as string;

        if (!organizationId || isNaN(organizationId)) {
          console.log("Skipping — invalid userId");
          break;
        }

        const subscription =
          await stripe.subscriptions.retrieve(subscriptionId);
        const plan = subscription.metadata.plan as keyof typeof PLANS;
        const planEnum = PLANS[plan]?.planEnum ?? "PRO";
        const expiryDate = getExpiryDate(subscription);

        await prisma.organization.update({
          where: { id: organizationId },
          data: {
            plan: planEnum,
            stripeCustomerId: customerId,
            subscriptionId: subscriptionId,
            subscriptionStatus: "active",
            ...(expiryDate && { planExpiresAt: expiryDate }),
          },
        });
        break;
      }

      //  Monthly renewal — v1 snapshot event
      case "invoice.payment_succeeded": {
        const invoice = event.data.object as Stripe.Invoice & {
          subscription?: string;
        };
        await handleInvoiceRenewal(invoice.subscription as string);
        break;
      }

      //  Monthly renewal — v2 thin event (invoice_payment.paid)
      // This is the newer Stripe API event format — handles the same renewal logic
      case "invoice_payment.paid" as any: {
        const invoicePayment = event.data.object as any;
        // v2 thin event: get subscriptionId from invoice_payment object
        const subscriptionId =
          invoicePayment.subscription ?? invoicePayment.subscriptionId ?? null;
        if (subscriptionId) {
          await handleInvoiceRenewal(subscriptionId);
        } else {
          console.log(
            "invoice_payment.paid — no subscriptionId found, skipping",
          );
        }
        break;
      }

      //  Payment failed — v1
      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice & {
          subscription?: string;
        };
        const subscriptionId = invoice.subscription as string;

        if (!subscriptionId) break;

        const subscription =
          await stripe.subscriptions.retrieve(subscriptionId);
        const orgId = Number(subscription.metadata.organizationId);

        if (!orgId || isNaN(orgId)) break;

        await prisma.organization.update({
          where: { id: orgId },
          data: { subscriptionStatus: "past_due" },
        });
        break;
      }

      //  Subscription cancelled
      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        const orgId = Number(subscription.metadata.organizationId);

        if (!orgId || isNaN(orgId)) break;

        await prisma.organization.update({
          where: { id: orgId },
          data: {
            plan: "FREE",
            subscriptionId: null,
            subscriptionStatus: "canceled",
            planExpiresAt: null,
          },
        });

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

    const organizationId =
      Number(req.headers["x-organization-id"]) ||
      Number(req.query.organizationId);

    let membership;

    if (organizationId && !isNaN(organizationId)) {
      membership = await prisma.membership.findFirst({
        where: {
          userId,
          organizationId,
        },
        include: {
          organization: true,
        },
      });
    } else {
      membership = await prisma.membership.findFirst({
        where: { userId },
        include: {
          organization: true,
        },
      });
    }

    if (!membership || !membership.organization) {
      return res.status(404).json({
        success: false,
        message: "Organization not found for user",
      });
    }

    const org = membership.organization;

    res.json({
      success: true,
      plan: org.plan,
      status: org.subscriptionStatus,
      expiresAt: org.planExpiresAt,
      isActive: org.subscriptionStatus === "active",
      organizationId: org.id,
    });
  } catch (error) {
    console.error("Error fetching user plan:", error);

    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};
