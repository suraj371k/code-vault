import { io } from "socket.io-client";

export const socket = io(process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000", {
  autoConnect: false, // we'll connect manually after login
});