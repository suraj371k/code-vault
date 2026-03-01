import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";
//routes imports
import authRoutes from './routes/auth.route.js'

dotenv.config();

const app = express();

//middlewares
app.use(express.json());
app.use(cors({ origin: "http://localhost:3000" }));
app.use(cookieParser())

//health route
app.get("/", (req, res) => {
  res.send("successfully running");
});

//routes
app.use('/api/auth' , authRoutes)

const port = process.env.PORT!;

app.listen(port, () => {
  console.log("Server is running on port: " , port);
});
