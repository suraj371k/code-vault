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
  getGroups,
  getUserConversations,
  getUserGroups,
} from "../controllers/message.controller.js";
const router = Router();

// create personal message
router.post("/personal/:receiverId/message", authMiddleware, createMessage);

// create group message
router.post("/groups/:groupId/message", authMiddleware, createGroupMessage);

// create group message
router.post("/groups/:organizationId", authMiddleware, createGroup);

// get conversations
router.get("/conversation", authMiddleware, getUserConversations);

// get conversation detail
router.get(
  "/conversation/:conversationId",
  authMiddleware,
  getConversationMessages,
);

// get all groups
router.get("/groups/all", authMiddleware, getGroups);

// get users groups
router.get("/groups", authMiddleware, getUserGroups);

// get group message
router.get("/groups/:groupId", authMiddleware, getGroupMessages);

//add member to the group
router.post('/groups/:groupId/member', authMiddleware, addMembersInGroup)

//get all group members
router.get('/groups/:groupId/member' , authMiddleware , getAllGroupMembers)

export default router;
