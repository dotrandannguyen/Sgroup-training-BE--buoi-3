// ok
import { createClient } from "redis";
import dotenv from "dotenv";
dotenv.config();

// Khi chạy local: REDIS_URL = "redis://localhost:6379"  (hoặc để trống)
// Khi chạy Docker: compose.yaml ghi đè REDIS_URL = "redis://redis:6379" (tên service)
const redisClient = createClient({
    url: process.env.REDIS_URL || "redis://localhost:6379"
});

redisClient.on("error", (err) => console.error("Redis Client Error:", err.message));
redisClient.on("connect", () => console.log("Redis connected:", process.env.REDIS_URL || "redis://localhost:6379"));

export async function connectRedis() {
    if (!redisClient.isOpen) {
        await redisClient.connect();
    }
}

export default redisClient;
