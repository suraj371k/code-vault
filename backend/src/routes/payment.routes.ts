import { Router } from "express";
import { authMiddleware } from "../middleware/auth.middleware.js";
import {
  cancelSubscription,
  createPayment,
  getOrganizationPlan,
  updateSubscriptionPlan,
  verifyPayment,
} from "../controllers/payment.controller.js";

const router = Router();

// Create a Razorpay subscription — returns subscriptionId + keyId for frontend modal
router.post("/create-checkout-session", authMiddleware, createPayment);

// Verify payment after Razorpay modal closes successfully (HMAC signature check)
router.post("/verify-payment", authMiddleware, verifyPayment);

// Cancel active subscription
router.post("/cancel-subscription", authMiddleware, cancelSubscription);

// Upgrade / downgrade plan (cancels current + creates new subscription checkout)
router.put("/update-subscription", authMiddleware, updateSubscriptionPlan);

// Get current plan info for an organization
router.get("/plan", authMiddleware, getOrganizationPlan);

export default router;
