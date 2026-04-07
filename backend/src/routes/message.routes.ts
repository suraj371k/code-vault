import { Router } from "express";
import { authMiddleware } from "../middleware/auth.middleware.js";
import {
  addMembersInGroup,
  createGroup,
  createGroupMessage,
  createMessage,
  getAllGroupMembers,
  getConversationMessages,
  getGroupMessages,
  getUserConversations,
  getUserGroups,
  removeMemberFromGroup,
} from "../controllers/message.controller.js";

const router = Router();

// ── Direct Messages ──────────────────────────────────────────────────────────

// Send a personal message (creates conversation if needed)
router.post(
  "/personal/:organizationId/:receiverId/message",
  authMiddleware,
  createMessage,
);

// Get all conversations for current user in an org
router.get(
  "/conversation/org/:organizationId",
  authMiddleware,
  getUserConversations,
);

// Get messages in a specific conversation
router.get(
  "/conversation/org/:organizationId/:conversationId/messages",
  authMiddleware,
  getConversationMessages,
);

// ── Groups ───────────────────────────────────────────────────────────────────

// Create a group in an org
router.post("/groups/org/:organizationId", authMiddleware, createGroup);

// Get all groups the current user belongs to in an org
router.get("/groups/org/:organizationId", authMiddleware, getUserGroups);

// Send a message to a group (orgId scopes the auth check)
router.post(
  "/groups/org/:organizationId/:groupId/message",
  authMiddleware,
  createGroupMessage,
);

// Get messages in a specific group
router.get(
  "/groups/org/:organizationId/:groupId/messages",
  authMiddleware,
  getGroupMessages,
);

// Add a member to a group
router.post(
  "/groups/org/:organizationId/:groupId/member",
  authMiddleware,
  addMembersInGroup,
);

// Remove a member from a group (owner only)
router.delete(
  "/groups/org/:organizationId/:groupId/member/:memberUserId",
  authMiddleware,
  removeMemberFromGroup,
);

// Get all members of a group
router.get(
  "/groups/org/:organizationId/:groupId/member",
  authMiddleware,
  getAllGroupMembers,
);

export default router;
