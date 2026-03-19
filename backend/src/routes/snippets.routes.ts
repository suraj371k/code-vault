import { Router } from "express";
import { authMiddleware } from "../middleware/auth.middleware.js";
import {
  createSnippets,
  deleteSnippet,
  getOrganizationSnippet,
  getSnippetById,
  updateSnippets,
} from "../controllers/snippets.controller.js";

const router = Router();

//create snippet
router.post("/:organizationId", authMiddleware, createSnippets);

//get all snippets
router.get(
  "/organization/:organizationId",
  authMiddleware,
  getOrganizationSnippet,
);

//get snippet by id
router.get("/:snippetId", authMiddleware, getSnippetById);

//delete snippet
router.delete("/:snippetId", authMiddleware, deleteSnippet);

//update snippet
router.patch("/:snippetId", authMiddleware, updateSnippets);

export default router;
