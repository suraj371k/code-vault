import { Server } from "socket.io";
import { Server as HttpServer } from "http";
import { prisma } from "./prisma.js";

let io: Server;

// Track active socket connections per user
const userSockets = new Map<number, string[]>();

export const initSocket = (httpServer: HttpServer) => {
  io = new Server(httpServer, {
    cors: {
      origin: "http://localhost:3000",
      methods: ["GET", "POST"],
    },
  });

  io.on("connection", (socket) => {
    console.log(`user connected ${socket.id}`);

    // each user joins their own room
    socket.on("join", async (userId: number) => {
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
