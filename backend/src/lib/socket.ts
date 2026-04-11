import { Server } from "socket.io";
import { Server as HttpServer } from "http";

let io: Server;

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
    socket.on("join", (userId: number) => {
      socket.join(`user:${userId}`);
      console.log(`user: ${userId} joined their room`);
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

    socket.on("disconnect", () => {
      console.log(`User disconnected: ${socket.id}`);
    });
  });
};

export const getIO = () => {
  if (!io) throw new Error("Socket.io not initialized");
  return io;
};
