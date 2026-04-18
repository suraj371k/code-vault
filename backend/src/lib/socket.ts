import { Server } from "socket.io";
import { Server as HttpServer } from "http";
import { prisma } from "./prisma.js";
import jwt from "jsonwebtoken";

let io: Server;

// Track active socket connections per user
const userSockets = new Map<number, string[]>();

export const initSocket = (httpServer: HttpServer) => {
  io = new Server(httpServer, {
    cors: {
      origin: process.env.CORS_ORIGIN || "http://localhost:3000",
      methods: ["GET", "POST"],
      credentials: true, // Added credentials support
    },
  });

  // Add authentication middleware for socket connections
  io.use((socket, next) => {
    try {
      const token = socket.handshake.auth.token;

      if (!token) {
        console.log("Socket connection attempted without token");
        return next(new Error("Authentication error: No token provided"));
      }

      // Verify JWT token
      jwt.verify(token, process.env.JWT_SECRET!, (err: any, decoded: any) => {
        if (err) {
          console.log("Socket authentication failed:", err.message);
          return next(new Error("Authentication error: Invalid token"));
        }

        // Store user data in socket
        socket.data.userId = (decoded as any).userId;
        socket.data.email = (decoded as any).email;
        console.log(`Socket authenticated for user: ${socket.data.userId}`);
        next();
      });
    } catch (error) {
      console.error("Socket authentication error:", error);
      next(new Error("Authentication error"));
    }
  });

  io.on("connection", (socket) => {
    console.log(`User connected: ${socket.id}, userId: ${socket.data.userId}`);

    // each user joins their own room
    socket.on("join", async (userId: number) => {
      // Verify the userId matches the authenticated user
      if (socket.data.userId !== userId) {
        console.log(
          `User ${socket.data.userId} attempted to join room for user ${userId}`,
        );
        return;
      }

      socket.join(`user:${userId}`);

      // Track this socket connection
      if (!userSockets.has(userId)) {
        userSockets.set(userId, []);
      }
      userSockets.get(userId)!.push(socket.id);

      // Set user as online
      await prisma.user.update({
        where: { id: userId },
        data: { isOnline: true, lastSeenAt: new Date() },
      });

      // Broadcast user online status
      io.emit("userOnline", { userId, isOnline: true });
      console.log(`user: ${userId} joined their room and is now online`);
    });

    // join a group room
    socket.on("joinGroup", (groupId: number) => {
      socket.join(`group:${groupId}`);
      console.log(`joined group room: ${groupId}`);
    });

    // new conversation room
    socket.on("joinConversation", (conversationIds: number[]) => {
      conversationIds.forEach((id) => {
        socket.join(`conversation:${id}`);
      });
    });

    // organization room for snippets , notifications etc
    socket.on("joinOrganization", (organizationId: number) => {
      socket.join(`organization:${organizationId}`);
      console.log(`joined organization: ${organizationId}`);
    });

    socket.on("disconnect", async () => {
      console.log(`User disconnected: ${socket.id}`);

      // Find which user this socket belonged to
      let userId: number | null = null;
      for (const [uid, sockets] of userSockets.entries()) {
        const idx = sockets.indexOf(socket.id);
        if (idx !== -1) {
          sockets.splice(idx, 1);
          if (sockets.length === 0) {
            userId = uid;
            userSockets.delete(uid);
          }
          break;
        }
      }

      // If user has no more active connections, mark as offline
      if (userId !== null) {
        await prisma.user.update({
          where: { id: userId },
          data: { isOnline: false, lastSeenAt: new Date() },
        });

        // Broadcast user offline status
        io.emit("userOffline", { userId, isOnline: false });
        console.log(`user: ${userId} is now offline`);
      }
    });
  });
};

export const getIO = () => {
  if (!io) throw new Error("Socket.io not initialized");
  return io;
};
