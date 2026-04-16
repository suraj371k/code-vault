import { Router } from "express";
import { authMiddleware } from "../middleware/auth.middleware.js";
import {
  cancelSubscription,
  createPayment,
  getOrganizationPlan,
  updateSubscriptionPlan,
} from "../controllers/payment.controller.js";

const router = Router();

router.post("/create-checkout-session", authMiddleware, createPayment);
router.post("/cancel-subscription", authMiddleware, cancelSubscription);
router.put("/update-subscription", authMiddleware, updateSubscriptionPlan);

router.get("/plan", authMiddleware, getOrganizationPlan);

export default router;
