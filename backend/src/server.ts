import express from "express";
import http from "http";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";
import { initSocket } from "./lib/socket.js";
import "./lib/passport.js";
import session from "express-session";
import passport from "passport";
import { handleWebHook } from "./controllers/payment.controller.js";

//routes imports
import authRoutes from "./routes/auth.routes.js";
import snippetRoutes from "./routes/snippets.routes.js";
import organizationRoutes from "./routes/organization.routes.js";
import messageRoutes from "./routes/message.routes.js";
import aiRoutes from "./routes/ai.routes.js";
import notificationRoutes from "./routes/notification.routes.js";
import paymentRoutes from "./routes/payment.routes.js";

dotenv.config();

const app = express();
const server = http.createServer(app);

initSocket(server);

//middlewares
app.use(
  session({
    secret: process.env.SESSION_SECRET!,
    resave: false,
    saveUninitialized: false,
  }),
);

app.post(
  "/stripe/webhook",
  express.raw({ type: "application/json" }),
  handleWebHook,
);

// passport middleware
app.use(passport.initialize());
app.use(express.json());
app.use(cors({ origin: process.env.CORS_ORIGIN, credentials: true }));
app.use(cookieParser());

//health route
app.get("/", (req, res) => {
  res.send("successfully running");
});

//routes
app.use("/api/auth", authRoutes);
app.use("/api/snippets", snippetRoutes);
app.use("/api/organization", organizationRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/ai", aiRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/payment", paymentRoutes);

const port = process.env.PORT!;

server.listen(port, () => {
  console.log(`server is running on ${port}`);
});
