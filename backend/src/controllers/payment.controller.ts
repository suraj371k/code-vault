import { Request, Response } from "express";
import { prisma } from "../lib/prisma.js";
import Stripe from "stripe";
import { PLAN_LIMITS } from "../config/planLimits.js";

// Fail fast at startup if critical Stripe env vars are missing
const missingEnvVars = [
  "STRIPE_SECRET_KEY",
  "STRIPE_PRICE_PRO",
  "STRIPE_PRICE_ENTERPRISE",
  "STRIPE_WEBHOOK_SECRET",
  "CORS_ORIGIN",
].filter((key) => !process.env[key]);

if (missingEnvVars.length > 0) {
  console.error(
    `[payment.controller] FATAL: Missing required environment variables: ${missingEnvVars.join(", ")}`,
  );
  process.exit(1);
}

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
      subscriptionStatus: "ACTIVE",
      ...(expiryDate && { planExpiresAt: expiryDate }),
    },
  });

  console.log(` Renewal successful for organization ${orgId}`);
};

// Create Checkout Session
export const createPayment = async (req: Request, res: Response) => {
  try {
    const { plan, organizationId } = req.body;
    const requesterId = Number((req as any).user?.userId);
    const parsedOrganizationId = Number(organizationId);

    // Guard: must be authenticated
    if (!requesterId || isNaN(requesterId)) {
      return res
        .status(401)
        .json({ success: false, message: "Not authenticated" });
    }

    // Guard: organizationId must be a valid number
    if (!parsedOrganizationId || isNaN(parsedOrganizationId) || parsedOrganizationId <= 0) {
      return res.status(400).json({
        success: false,
        message: "Valid organization ID is required",
      });
    }

    // Normalize plan key to lowercase so "PRO"/"ENTERPRISE" from frontend maps correctly
    const planKey = (plan as string)?.toLowerCase() as keyof typeof PLANS;
    const selectedPlan = PLANS[planKey];

    if (!selectedPlan) {
      return res.status(400).json({ success: false, message: "Invalid plan. Must be 'pro' or 'enterprise'." });
    }

    // Guard: env var must be set – catch missing Stripe price IDs before calling Stripe
    if (!selectedPlan.priceId) {
      console.error(`Missing Stripe price ID for plan: ${planKey}`);
      return res.status(500).json({
        success: false,
        message: "Payment configuration error. Please contact support.",
      });
    }

    const org = await prisma.organization.findUnique({
      where: { id: parsedOrganizationId },
    });

    if (!org) {
      return res
        .status(404)
        .json({ success: false, message: "Organization not found" });
    }

    const ownerMembership = await prisma.membership.findFirst({
      where: {
        organizationId: parsedOrganizationId,
        userId: requesterId,
        role: "OWNER",
      },
    });

    if (!ownerMembership) {
      return res.status(403).json({
        success: false,
        message: "Only organization owners can buy or upgrade plans",
      });
    }

    const sessionParams: Stripe.Checkout.SessionCreateParams = {
      mode: "subscription",
      client_reference_id: String(parsedOrganizationId),
      line_items: [{ price: selectedPlan.priceId, quantity: 1 }],
      subscription_data: {
        metadata: {
          organizationId: String(parsedOrganizationId),
          plan: planKey,
        },
      },
      success_url: `${process.env.CORS_ORIGIN}/success`,
      cancel_url: `${process.env.CORS_ORIGIN}/pricing`,
    };

    if (org.stripeCustomerId) {
      // Returning customer — attach to existing Stripe customer
      sessionParams.customer = org.stripeCustomerId;
    } else {
      // New customer — use email from req.user; fall back to org owner lookup
      const userEmail = (req as any).user?.email;

      if (userEmail) {
        sessionParams.customer_email = userEmail;
      } else {
        // Fetch email from DB as a safety net (Google OAuth users always have email)
        const user = await prisma.user.findUnique({
          where: { id: requesterId },
          select: { email: true },
        });
        if (user?.email) {
          sessionParams.customer_email = user.email;
        }
        // If still no email, Stripe will let the customer enter it in checkout
      }
    }

    const session = await stripe.checkout.sessions.create(sessionParams);

    return res.json({ success: true, url: session.url });
  } catch (error) {
    console.error("Error creating payment:", error);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
};

export const cancelSubscription = async (req: Request, res: Response) => {
  try {
    const requesterId = Number((req as any).user?.userId);
    const parsedOrganizationId = Number(req.body.organizationId);

    if (!requesterId || isNaN(requesterId)) {
      return res.status(401).json({ success: false, message: "Not authenticated" });
    }

    if (!parsedOrganizationId || isNaN(parsedOrganizationId)) {
      return res.status(400).json({
        success: false,
        message: "Valid organization ID is required",
      });
    }

    const ownerMembership = await prisma.membership.findFirst({
      where: {
        organizationId: parsedOrganizationId,
        userId: requesterId,
        role: "OWNER",
      },
    });

    if (!ownerMembership) {
      return res.status(403).json({
        success: false,
        message: "Only organization owners can cancel subscriptions",
      });
    }

    const org = await prisma.organization.findUnique({
      where: { id: parsedOrganizationId },
      select: {
        id: true,
        plan: true,
        subscriptionId: true,
      },
    });

    if (!org) {
      return res
        .status(404)
        .json({ success: false, message: "Organization not found" });
    }

    if (!org.subscriptionId || org.plan === "FREE") {
      return res.status(400).json({
        success: false,
        message: "No active paid subscription found for this organization",
      });
    }

    await stripe.subscriptions.cancel(org.subscriptionId);

    await prisma.organization.update({
      where: { id: parsedOrganizationId },
      data: {
        plan: "FREE",
        subscriptionId: null,
        subscriptionStatus: "CANCELED",
        planExpiresAt: null,
      },
    });

    return res.status(200).json({
      success: true,
      message: "Subscription canceled successfully",
      data: {
        organizationId: parsedOrganizationId,
        plan: "FREE",
        status: "CANCELED",
      },
    });
  } catch (error) {
    console.error("Error canceling subscription:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const updateSubscriptionPlan = async (req: Request, res: Response) => {
  try {
    const requesterId = Number((req as any).user?.userId);
    const parsedOrganizationId = Number(req.body.organizationId);
    const planKey = (req.body.plan as string)?.toLowerCase() as keyof typeof PLANS;
    const selectedPlan = PLANS[planKey];

    if (!requesterId || isNaN(requesterId)) {
      return res.status(401).json({ success: false, message: "Not authenticated" });
    }

    if (!parsedOrganizationId || isNaN(parsedOrganizationId)) {
      return res.status(400).json({
        success: false,
        message: "Valid organization ID is required",
      });
    }

    if (!selectedPlan) {
      return res.status(400).json({ success: false, message: "Invalid plan" });
    }

    const ownerMembership = await prisma.membership.findFirst({
      where: {
        organizationId: parsedOrganizationId,
        userId: requesterId,
        role: "OWNER",
      },
    });

    if (!ownerMembership) {
      return res.status(403).json({
        success: false,
        message: "Only organization owners can update subscriptions",
      });
    }

    const org = await prisma.organization.findUnique({
      where: { id: parsedOrganizationId },
      select: {
        id: true,
        plan: true,
        subscriptionId: true,
      },
    });

    if (!org) {
      return res
        .status(404)
        .json({ success: false, message: "Organization not found" });
    }

    if (!org.subscriptionId || org.plan === "FREE") {
      return res.status(400).json({
        success: false,
        message: "No active paid subscription found. Start checkout first.",
      });
    }

    if (org.plan === selectedPlan.planEnum) {
      return res.status(400).json({
        success: false,
        message: `Organization is already on ${selectedPlan.planEnum} plan`,
      });
    }

    const currentSubscription = await stripe.subscriptions.retrieve(org.subscriptionId);

    if (currentSubscription.status === "canceled") {
      return res.status(400).json({
        success: false,
        message: "Subscription is canceled. Please create a new checkout session.",
      });
    }

    const subscriptionItem = currentSubscription.items.data?.[0];

    if (!subscriptionItem) {
      return res.status(400).json({
        success: false,
        message: "Subscription item not found",
      });
    }

    const updatedSubscription = await stripe.subscriptions.update(org.subscriptionId, {
      cancel_at_period_end: false,
      proration_behavior: "create_prorations",
      items: [{ id: subscriptionItem.id, price: selectedPlan.priceId }],
      metadata: {
        ...currentSubscription.metadata,
        organizationId: String(parsedOrganizationId),
        plan: planKey,
      },
    });

    const expiryDate = getExpiryDate(updatedSubscription);

    await prisma.organization.update({
      where: { id: parsedOrganizationId },
      data: {
        plan: selectedPlan.planEnum,
        subscriptionStatus: "ACTIVE",
        ...(expiryDate && { planExpiresAt: expiryDate }),
      },
    });

    return res.status(200).json({
      success: true,
      message: `Subscription updated to ${selectedPlan.planEnum}`,
      data: {
        organizationId: parsedOrganizationId,
        plan: selectedPlan.planEnum,
        status: "ACTIVE",
        expiresAt: expiryDate,
      },
    });
  } catch (error) {
    console.error("Error updating subscription:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
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
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const organizationId = Number(session.client_reference_id);
        const subscriptionId = session.subscription as string;
        const customerId = session.customer as string;

        if (!organizationId || isNaN(organizationId)) {
          console.log("Skipping — invalid organizationId");
          break;
        }

        const subscription = await stripe.subscriptions.retrieve(subscriptionId);
        const planRaw = subscription.metadata.plan as string;
        const planEnum = PLANS[planRaw as keyof typeof PLANS]?.planEnum ?? "PRO";
        const expiryDate = getExpiryDate(subscription);

        await prisma.organization.update({
          where: { id: organizationId },
          data: {
            plan: planEnum,
            stripeCustomerId: customerId,
            subscriptionId: subscriptionId,
            subscriptionStatus: "ACTIVE",
            ...(expiryDate && { planExpiresAt: expiryDate }),
          },
        });

        console.log(`Subscription activated for organization ${organizationId} — plan: ${planEnum}`);
        break;
      }

      case "invoice.payment_succeeded": {
        const invoice = event.data.object as Stripe.Invoice & { subscription?: string };
        await handleInvoiceRenewal(invoice.subscription as string);
        break;
      }

      case "invoice_payment.paid" as any: {
        const invoicePayment = event.data.object as any;
        const subscriptionId = invoicePayment.subscription ?? invoicePayment.subscriptionId ?? null;
        if (subscriptionId) {
          await handleInvoiceRenewal(subscriptionId);
        }
        break;
      }

      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice & { subscription?: string };
        const subscriptionId = invoice.subscription as string;
        if (!subscriptionId) break;

        const subscription = await stripe.subscriptions.retrieve(subscriptionId);
        const orgId = Number(subscription.metadata.organizationId);
        if (!orgId || isNaN(orgId)) break;

        await prisma.organization.update({
          where: { id: orgId },
          data: { subscriptionStatus: "PAST_DUE" },
        });
        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        const orgId = Number(subscription.metadata.organizationId);
        if (!orgId || isNaN(orgId)) break;

        await prisma.organization.update({
          where: { id: orgId },
          data: {
            plan: "FREE",
            subscriptionId: null,
            subscriptionStatus: "CANCELED",
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

export const getOrganizationPlan = async (req: Request, res: Response) => {
  try {
    // FIX: use optional chaining — crashes with 500 if auth middleware fails silently
    const userId = (req as any).user?.userId;

    if (!userId) {
      return res.status(401).json({ success: false, message: "Not authenticated" });
    }

    const organizationId =
      Number(req.headers["x-organization-id"]) ||
      Number(req.query.organizationId);

    let membership;

    if (organizationId && !isNaN(organizationId)) {
      membership = await prisma.membership.findFirst({
        where: { userId, organizationId },
        include: { organization: true },
      });

      if (!membership) {
        return res.status(403).json({
          success: false,
          message: "You don't have access to this organization",
        });
      }
    } else {
      membership = await prisma.membership.findFirst({
        where: { userId, role: "OWNER" },
        include: { organization: true },
        orderBy: { organization: { createdAt: "desc" } },
      });

      if (!membership) {
        return res.status(400).json({
          success: false,
          message: "No organization found. Please specify organization ID.",
        });
      }
    }

    const org = membership.organization;

    return res.status(200).json({
      success: true,
      data: {
        plan: org.plan,
        status: org.subscriptionStatus,
        expiresAt: org.planExpiresAt,
        isActive: org.subscriptionStatus === "ACTIVE",
        isTrialing: org.subscriptionStatus === "TRIALING",
        isCanceled: org.subscriptionStatus === "CANCELED",
        isPastDue: org.subscriptionStatus === "PAST_DUE",
        organizationId: org.id,
        organizationName: org.name,
        limits: PLAN_LIMITS[org.plan],
      },
    });
  } catch (error) {
    console.error("Error fetching organization plan:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};
