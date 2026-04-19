import { Request, Response } from "express";
import { prisma } from "../lib/prisma.js";
import Razorpay from "razorpay";
import crypto from "crypto";
import { PLAN_LIMITS } from "../config/planLimits.js";

// Razorpay client
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
});

//  Plan config
const PLANS = {
  pro: {
    planId: process.env.RAZORPAY_PLAN_PRO!,
    name: "Pro Plan",
    amount: 8000,
    planEnum: "PRO" as const,
  },
  enterprise: {
    planId: process.env.RAZORPAY_PLAN_ENTERPRISE!,
    name: "Enterprise Plan",
    amount: 2000,
    planEnum: "ENTERPRISE" as const,
  },
};

// CREATE SUBSCRIPTION
export const createPayment = async (req: Request, res: Response) => {
  try {
    const { plan, organizationId } = req.body;
    const requesterId = Number((req as any).user?.userId);
    const parsedOrganizationId = Number(organizationId);

    if (!requesterId || isNaN(requesterId)) {
      return res
        .status(401)
        .json({ success: false, message: "Not authenticated" });
    }

    if (
      !parsedOrganizationId ||
      isNaN(parsedOrganizationId) ||
      parsedOrganizationId <= 0
    ) {
      return res
        .status(400)
        .json({ success: false, message: "Valid organization ID is required" });
    }

    const planKey = (plan as string)?.toLowerCase() as keyof typeof PLANS;
    const selectedPlan = PLANS[planKey];

    if (!selectedPlan) {
      return res.status(400).json({
        success: false,
        message: "Invalid plan. Must be 'pro' or 'enterprise'.",
      });
    }

    if (!selectedPlan.planId) {
      console.error(`Missing Razorpay plan ID for: ${planKey}`);
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

    // Fetch user email for prefilling the Razorpay modal
    const user = await prisma.user.findUnique({
      where: { id: requesterId },
      select: { email: true, name: true },
    });

    // Create a Razorpay Subscription
    const subscription = await razorpay.subscriptions.create({
      plan_id: selectedPlan.planId,
      customer_notify: 1,
      quantity: 1,
      total_count: 12,
      notes: {
        organizationId: String(parsedOrganizationId),
        plan: planKey,
        userId: String(requesterId),
      },
    });

    return res.json({
      success: true,
      subscriptionId: subscription.id,
      keyId: process.env.RAZORPAY_KEY_ID,
      prefill: {
        email: user?.email ?? "",
        name: user?.name ?? "",
      },
      organizationName: org.name,
    });
  } catch (error) {
    console.error("Error creating payment:", error);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
};

// VERIFY PAYMENT
export const verifyPayment = async (req: Request, res: Response) => {
  try {
    const {
      razorpay_payment_id,
      razorpay_subscription_id,
      razorpay_signature,
      organizationId,
      plan,
    } = req.body;

    const requesterId = Number((req as any).user?.userId);
    const parsedOrganizationId = Number(organizationId);

    if (!requesterId || isNaN(requesterId)) {
      return res
        .status(401)
        .json({ success: false, message: "Not authenticated" });
    }

    if (
      !razorpay_payment_id ||
      !razorpay_subscription_id ||
      !razorpay_signature
    ) {
      return res.status(400).json({
        success: false,
        message: "Missing payment verification fields",
      });
    }

    const body = `${razorpay_payment_id}|${razorpay_subscription_id}`;
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET!)
      .update(body)
      .digest("hex");

    if (expectedSignature !== razorpay_signature) {
      return res.status(400).json({
        success: false,
        message: "Payment verification failed: invalid signature",
      });
    }

    const planKey = (plan as string)?.toLowerCase() as keyof typeof PLANS;
    const selectedPlan = PLANS[planKey];

    if (!selectedPlan) {
      return res.status(400).json({ success: false, message: "Invalid plan" });
    }

    // Activate subscription in DB
    await prisma.organization.update({
      where: { id: parsedOrganizationId },
      data: {
        plan: selectedPlan.planEnum,
        subscriptionId: razorpay_subscription_id,
        subscriptionStatus: "ACTIVE",
        planExpiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // +30 days
      },
    });

    console.log(
      `Subscription verified & activated for org ${parsedOrganizationId} — plan: ${selectedPlan.planEnum}`,
    );

    return res.json({
      success: true,
      message: "Payment verified successfully",
    });
  } catch (error) {
    console.error("Error verifying payment:", error);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
};

// CANCEL SUBSCRIPTION
export const cancelSubscription = async (req: Request, res: Response) => {
  try {
    const requesterId = Number((req as any).user?.userId);
    const parsedOrganizationId = Number(req.body.organizationId);

    if (!requesterId || isNaN(requesterId)) {
      return res
        .status(401)
        .json({ success: false, message: "Not authenticated" });
    }

    if (!parsedOrganizationId || isNaN(parsedOrganizationId)) {
      return res
        .status(400)
        .json({ success: false, message: "Valid organization ID is required" });
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
      select: { id: true, plan: true, subscriptionId: true },
    });

    if (!org) {
      return res
        .status(404)
        .json({ success: false, message: "Organization not found" });
    }

    if (!org.subscriptionId || org.plan === "FREE") {
      return res
        .status(400)
        .json({ success: false, message: "No active paid subscription found" });
    }

    // Cancel at period end in Razorpay (cancel_at_cycle_end = 1)
    await razorpay.subscriptions.cancel(org.subscriptionId, true);

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
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
};

// UPDATE SUBSCRIPTION PLAN
export const updateSubscriptionPlan = async (req: Request, res: Response) => {
  try {
    const requesterId = Number((req as any).user?.userId);
    const parsedOrganizationId = Number(req.body.organizationId);
    const planKey = (
      req.body.plan as string
    )?.toLowerCase() as keyof typeof PLANS;
    const selectedPlan = PLANS[planKey];

    if (!requesterId || isNaN(requesterId)) {
      return res
        .status(401)
        .json({ success: false, message: "Not authenticated" });
    }

    if (!parsedOrganizationId || isNaN(parsedOrganizationId)) {
      return res
        .status(400)
        .json({ success: false, message: "Valid organization ID is required" });
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
      select: { id: true, plan: true, subscriptionId: true },
    });

    if (!org) {
      return res
        .status(404)
        .json({ success: false, message: "Organization not found" });
    }

    if (!org.subscriptionId || org.plan === "FREE") {
      return res.status(400).json({
        success: false,
        message: "No active subscription found. Start a new checkout.",
      });
    }

    if (org.plan === selectedPlan.planEnum) {
      return res.status(400).json({
        success: false,
        message: `Already on ${selectedPlan.planEnum} plan`,
      });
    }

    await razorpay.subscriptions.cancel(org.subscriptionId, false);

    const newSubscription = await razorpay.subscriptions.create({
      plan_id: selectedPlan.planId,
      customer_notify: 1,
      quantity: 1,
      total_count: 12,
      notes: {
        organizationId: String(parsedOrganizationId),
        plan: planKey,
        userId: String(requesterId),
      },
    });

    const user = await prisma.user.findUnique({
      where: { id: requesterId },
      select: { email: true, name: true },
    });

    return res.status(200).json({
      success: true,
      subscriptionId: newSubscription.id,
      keyId: process.env.RAZORPAY_KEY_ID,
      prefill: {
        email: user?.email ?? "",
        name: user?.name ?? "",
      },
      message: `New checkout created for ${selectedPlan.planEnum} plan`,
    });
  } catch (error) {
    console.error("Error updating subscription:", error);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
};

// RAZORPAY WEBHOOK
export const handleWebHook = async (req: Request, res: Response) => {
  const signature = req.headers["x-razorpay-signature"] as string;

  if (!signature) {
    return res.status(400).json({ message: "Missing Razorpay signature" });
  }

  // Verify webhook signature
  const expectedSignature = crypto
    .createHmac("sha256", process.env.RAZORPAY_WEBHOOK_SECRET!)
    .update(req.body) // raw buffer
    .digest("hex");

  if (expectedSignature !== signature) {
    console.error("Webhook signature mismatch");
    return res.status(400).json({ message: "Invalid webhook signature" });
  }

  let event: any;
  try {
    event = JSON.parse(req.body.toString());
  } catch {
    return res.status(400).json({ message: "Invalid JSON in webhook body" });
  }

  try {
    const eventType = event.event as string;
    console.log(`Razorpay webhook received: ${eventType}`);

    switch (eventType) {
      // ── Subscription activated (first payment success) ──
      case "subscription.activated":
      case "subscription.charged": {
        const subscription = event.payload.subscription.entity;
        const orgId = Number(subscription.notes?.organizationId);
        const planRaw = subscription.notes?.plan as string;
        const selectedPlan = PLANS[planRaw as keyof typeof PLANS];

        if (!orgId || isNaN(orgId) || !selectedPlan) {
          console.log("Skipping — invalid orgId or plan in notes");
          break;
        }

        await prisma.organization.update({
          where: { id: orgId },
          data: {
            plan: selectedPlan.planEnum,
            subscriptionId: subscription.id,
            subscriptionStatus: "ACTIVE",
            planExpiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          },
        });

        console.log(
          `✅ Subscription activated for org ${orgId} — plan: ${selectedPlan.planEnum}`,
        );
        break;
      }

      // ── Payment failed ──
      case "subscription.pending":
      case "payment.failed": {
        const subscription = event.payload.subscription?.entity;
        if (!subscription) break;

        const orgId = Number(subscription.notes?.organizationId);
        if (!orgId || isNaN(orgId)) break;

        await prisma.organization.update({
          where: { id: orgId },
          data: { subscriptionStatus: "PAST_DUE" },
        });

        console.log(`⚠️ Payment failed for org ${orgId}`);
        break;
      }

      // ── Subscription cancelled ──
      case "subscription.cancelled": {
        const subscription = event.payload.subscription.entity;
        const orgId = Number(subscription.notes?.organizationId);
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

        console.log(` Subscription cancelled for org ${orgId}`);
        break;
      }

      // ubscription completed (all billing cycles done)
      case "subscription.completed": {
        const subscription = event.payload.subscription.entity;
        const orgId = Number(subscription.notes?.organizationId);
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

        console.log(
          ` Subscription completed for org ${orgId} — reverted to FREE`,
        );
        break;
      }

      default:
        console.log(`Unhandled Razorpay event: ${eventType}`);
    }

    return res.json({ received: true });
  } catch (error) {
    console.error("Webhook processing error:", error);
    return res.status(500).json({ message: "Webhook processing failed" });
  }
};

// GET ORGANIZATION PLAN
export const getOrganizationPlan = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.userId;

    if (!userId) {
      return res
        .status(401)
        .json({ success: false, message: "Not authenticated" });
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
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
};
