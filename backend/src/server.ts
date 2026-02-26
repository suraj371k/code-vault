import express from "express";
import dotenv from "dotenv";
import cors from "cors";
dotenv.config();
const app = express();

app.use(express.json());
app.use(cors({ origin: "http://localhost:3000" }));

app.get("/", (req, res) => {
  res.send("server is running successfully");
});

app.listen(5000, () => {
  console.log("Server is running on port 5000");
});
