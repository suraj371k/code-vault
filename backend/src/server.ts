import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";
//routes imports
import authRoutes from "./routes/auth.route.js";
import snippetRoutes from "./routes/snippets.routes.js";
import organizationRoutes from './routes/organization.routes.js'

dotenv.config();

const app = express();

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
app.use('/api/organization' , organizationRoutes);

const port = process.env.PORT!;

app.listen(port, () => {
  console.log("Server is running on port: ", port);
});
