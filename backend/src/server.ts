import express from "express";
import http from 'http'
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";
import { initSocket } from "./lib/socket.js";

//routes imports
import authRoutes from "./routes/auth.routes.js";
import snippetRoutes from "./routes/snippets.routes.js";
import organizationRoutes from './routes/organization.routes.js'
import messageRoutes from './routes/message.routes.js'
import aiRoutes from './routes/ai.routes.js'

dotenv.config();


const app = express();
const server = http.createServer(app)

initSocket(server)
//middlewares
app.use(express.json());
app.use(cors({ origin: "http://localhost:3000", credentials: true }));
app.use(cookieParser());

//health route
app.get("/", (req, res) => {
  res.send("successfully running");
});

//routes
app.use("/api/auth", authRoutes);
app.use("/api/snippets", snippetRoutes);
app.use('/api/organization', organizationRoutes);
app.use('/api/messages', messageRoutes)
app.use('/api/ai', aiRoutes)

const port = process.env.PORT!;

server.listen(port, () => {
  console.log("Server is running on port: ", port);
});
