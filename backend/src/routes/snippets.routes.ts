import { Router } from "express";
import { authMiddleware } from "../middleware/auth.middleware.js";
import { createSnippets, getSnippetsByUser } from "../controllers/snippets.controller.js";

const router = Router()

router.post('/' , authMiddleware , createSnippets)
router.get('/' , authMiddleware , getSnippetsByUser)

export default router;