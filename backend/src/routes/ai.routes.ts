import { Router } from "express";
import { authMiddleware } from "../middleware/auth.middleware.js";
import { chatWithSnippet } from "../controllers/ai.controller.js";

const router = Router();

router.post(`/:snippetId`, authMiddleware, chatWithSnippet);

export default router;
