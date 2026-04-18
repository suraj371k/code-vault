import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

interface JwtPayload {
  userId: number;
  email: string;
}

export const authMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    // Check if user is authenticated via Passport (Google OAuth session)
    if (req.isAuthenticated && req.isAuthenticated()) {
      const googleUser = req.user as any;
      (req as any).user = {
        userId: googleUser.userId,
        email: googleUser.email,
        name: googleUser.name,
      };
      console.log("Auth via Passport session - User:", googleUser.userId);
      return next();
    }

    // Extract token from Authorization header or cookies
    const authHeader = req.headers.authorization;
    const bearerToken =
      authHeader && authHeader.startsWith("Bearer ")
        ? authHeader.slice(7).trim()
        : null;

    const token = bearerToken || req.cookies?.token;

    if (!token) {
      console.warn("Auth middleware - No token provided", {
        path: req.path,
        method: req.method,
        hasAuthHeader: !!authHeader,
        hasCookie: !!req.cookies?.token,
      });
      return res
        .status(401)
        .json({ success: false, message: "Not authenticated" });
    }

    // Verify JWT token
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as JwtPayload;

    (req as any).user = decoded;

    console.log("Auth via JWT - User:", decoded.userId, "Path:", req.path);

    next();
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      console.error("Auth middleware - Invalid token:", error.message);
    } else if (error instanceof jwt.TokenExpiredError) {
      console.error("Auth middleware - Token expired:", error.expiredAt);
    } else {
      console.error("Auth middleware - Error:", error);
    }
    
    return res
      .status(401)
      .json({ success: false, message: "Invalid or expired token" });
  }
};
