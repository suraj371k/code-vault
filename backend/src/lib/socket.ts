import { Server } from "socket.io";
import { Server as HttpServer } from "http";

let io: Server;

export const initSocket = (httpServer: HttpServer) => {
    io = new Server(httpServer, {
        cors: {
            origin: 'http://localhost:3000',
            methods: ['GET', 'POST']
        }
    })

    io.on('connection', (socket) => {
        console.log(`user connected ${socket.id}`)

        // each user join there own room
        socket.on('join', (userId: number) => {
            socket.join(`user:${userId}`)
            console.log(`user: ${userId} joined their room`)
        })

        // join a group room
        socket.on('joinGroup', (groupId: number) => {
            socket.join(`groip: ${groupId}`)
            console.log(`joined group room: ${groupId}`)
        })

        socket.on("disconnect", () => {
            console.log(`User disconnected: ${socket.id}`);
        });
        return io;
    })
}

export const getIO = () => {
    if (!io) throw new Error("Socket.io not initialized");
    return io;
};
