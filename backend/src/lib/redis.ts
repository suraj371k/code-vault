import { createClient } from "redis";
import dotenv from "dotenv";

dotenv.config();

const redisClient = createClient({
  url: process.env.REDIS_URL! || "redis://localhost:6379",
});

console.log("redis url: ", process.env.REDIS_URL!);

redisClient.on("error", (err) => console.error("Redis Client Error:", err));
redisClient.on("connect", () => console.log("Redis connected"));
redisClient.on("reconnecting", () => console.log("Redis reconnecting..."));

const connectRedis = async () => {
  if (!redisClient.isOpen) {
    await redisClient.connect();
  }
};

connectRedis().catch(console.error);

export default redisClient;
