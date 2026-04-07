import { Server } from "socket.io";
let io;
export const initSocket = (httpServer) => {
    io = new Server(httpServer, {
        cors: {
            origin: 'http://localhost:3000',
            methods: ['GET', 'POST']
        }
    });
    io.on('connection', (socket) => {
        console.log(`user connected ${socket.id}`);
        // each user joins their own room
        socket.on('join', (userId) => {
            socket.join(`user:${userId}`);
            console.log(`user: ${userId} joined their room`);
        });
        // join a group room
        socket.on('joinGroup', (groupId) => {
            socket.join(`group:${groupId}`);
            console.log(`joined group room: ${groupId}`);
        });
        socket.on("disconnect", () => {
            console.log(`User disconnected: ${socket.id}`);
        });
    });
};
export const getIO = () => {
    if (!io)
        throw new Error("Socket.io not initialized");
    return io;
};
