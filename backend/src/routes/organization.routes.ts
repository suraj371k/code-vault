import { Router } from "express";
import { authMiddleware } from "../middleware/auth.middleware.js";
import {
  addMembers,
  createOrganization,
  getMembers,
  getMyOrganizations,
  getOrganizationBySlug,
} from "../controllers/organization.controller.js";

console.log("[debug] loaded organization.routes");

const router = Router();

router.post("/", authMiddleware, createOrganization);

router.get('/me' , authMiddleware , getMyOrganizations)

router.post("/:organizationId/member", authMiddleware, addMembers);

router.get("/:organizationId/member", authMiddleware, getMembers);

router.get("/:slug", authMiddleware, getOrganizationBySlug);



export default router;
