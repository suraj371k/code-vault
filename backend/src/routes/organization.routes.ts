import { Router } from "express";
import { authMiddleware } from "../middleware/auth.middleware.js";
import {
  addMembers,
  createOrganization,
  deleteOrganization,
  getMembers,
  getMyOrganizations,
  getOrganizationBySlug,
  removeMember,
  getOnlineStatus,
} from "../controllers/organization.controller.js";

console.log("[debug] loaded organization.routes");

const router = Router();

// create organization
router.post("/", authMiddleware, createOrganization);

// get organizations
router.get("/me", authMiddleware, getMyOrganizations);

// add members in organization
router.post("/:organizationId/member", authMiddleware, addMembers);

// get members of the organization
router.get("/:organizationId/member", authMiddleware, getMembers);

// get online status of organization members
router.get("/:organizationId/online-status", authMiddleware, getOnlineStatus);

// get organization detail
router.get("/:slug", authMiddleware, getOrganizationBySlug);

// delete organization
router.delete("/:organizationId", authMiddleware, deleteOrganization);

// remove member from organization (owner only)
router.delete(
  "/:organizationId/member/:memberId",
  authMiddleware,
  removeMember,
);

export default router;
