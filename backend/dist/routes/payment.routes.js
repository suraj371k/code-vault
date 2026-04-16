import { Router } from "express";
import { authMiddleware } from "../middleware/auth.middleware.js";
import { createPayment, getOrganizationPlan, } from "../controllers/payment.controller.js";
const router = Router();
router.post("/create-checkout-session", authMiddleware, createPayment);
router.get("/plan", authMiddleware, getOrganizationPlan);
export default router;
