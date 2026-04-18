import { io, Socket } from "socket.io-client";

let socketInstance: Socket | null = null;

export const getSocket = (): Socket => {
  if (!socketInstance) {
    socketInstance = io(process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000", {
      autoConnect: false,
      withCredentials: true,
    });
  }
  return socketInstance;
};

export const connectSocket = (token: string): Socket => {
  const socket = getSocket();
  
  // Update auth token
  socket.auth = { token };
  
  // Connect if not already connected
  if (!socket.connected) {
    socket.connect();
  }
  
  return socket;
};

export const disconnectSocket = (): void => {
  if (socketInstance && socketInstance.connected) {
    socketInstance.disconnect();
  }
};

// For backward compatibility
export const socket = getSocket();
