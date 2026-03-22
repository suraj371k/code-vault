import { Router } from "express";
import {
  login,
  logout,
  profile,
  signup,
} from "../controllers/auth.controller.js";
import { authMiddleware } from "../middleware/auth.middleware.js";

const router = Router();

router.post("/signup", signup);
router.post("/login", login);
router.post("/logout", logout);
router.get("/profile", authMiddleware, profile);

export default router;
