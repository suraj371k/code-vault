import express from "express";
import http from "http";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";
import { initSocket } from "./lib/socket.js";
import "./lib/passport.js";
import session from "express-session";
import jwt from "jsonwebtoken";
import { prisma } from "./lib/prisma.js";
//routes imports
import authRoutes from "./routes/auth.routes.js";
import snippetRoutes from "./routes/snippets.routes.js";
import organizationRoutes from "./routes/organization.routes.js";
import messageRoutes from "./routes/message.routes.js";
import aiRoutes from "./routes/ai.routes.js";
import notificationRoutes from "./routes/notification.routes.js";
import passport from "passport";
dotenv.config();
const app = express();
const server = http.createServer(app);
initSocket(server);
//middlewares
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
}));
// passport middleware
app.use(passport.initialize());
app.use(passport.session());
app.use(express.json());
app.use(cors({ origin: "http://localhost:3000", credentials: true }));
app.use(cookieParser());
//health route
app.get("/", (req, res) => {
    res.send("successfully running");
});
// Google OAuth callback route (matches Google Cloud Console redirect URI)
app.get("/oauth2/redirect/google", passport.authenticate("google", {
    failureRedirect: "/login",
    session: true,
}), async (req, res) => {
    try {
        // Get user ID from session
        const userId = req.session?.passport?.user;
        if (!userId) {
            return res.redirect(`${process.env.CORS_ORIGIN}/login?error=authentication_failed`);
        }
        // Find the user
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: {
                id: true,
                email: true,
                name: true,
            },
        });
        if (!user) {
            return res.redirect(`${process.env.CORS_ORIGIN}/login?error=user_not_found`);
        }
        const token = jwt.sign({ userId: user.id, email: user.email }, process.env.JWT_SECRET, { expiresIn: "5d" });
        res.cookie("token", token, {
            httpOnly: true,
            secure: true,
            sameSite: "none",
            maxAge: 5 * 24 * 60 * 60 * 1000,
        });
        const userWithOrg = await prisma.user.findUnique({
            where: { id: user.id },
            select: {
                memberships: {
                    select: {
                        organization: {
                            select: { slug: true },
                        },
                    },
                    take: 1,
                },
            },
        });
        const orgSlug = userWithOrg?.memberships?.[0]?.organization?.slug;
        if (orgSlug) {
            return res.redirect(`${process.env.CORS_ORIGIN}/organization/${orgSlug}/dashboard`);
        }
        return res.redirect(`${process.env.CORS_ORIGIN}/`);
    }
    catch (error) {
        console.error("error in oauth callback:", error);
        return res.redirect(`${process.env.CORS_ORIGIN}/login?error=internal_server_error`);
    }
});
//routes
app.use("/api/auth", authRoutes);
app.use("/api/snippets", snippetRoutes);
app.use("/api/organization", organizationRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/ai", aiRoutes);
app.use("/api/notifications", notificationRoutes);
const port = process.env.PORT;
server.listen(port, () => {
    console.log("Server is running on port: ", port);
});
