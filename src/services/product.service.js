import pool from "../database.js";
import { productRepository } from "../repositories/product.repository.js";
import redisClient, { connectRedis } from "../utils/redis.js";

export const productService = {
  async getAllProducts() {
    const cacheKey = "products";

    // 1. Thử lấy từ Redis Cache
    try {
      await connectRedis();
      const cachedProducts = await redisClient.get(cacheKey);

      if (cachedProducts) {
        return { data: JSON.parse(cachedProducts), source: "cache" };
      }
    } catch (error) {
      console.warn(`Redis cache lookup failed: ${error.message}`);
    }

    // 2. Nếu cache miss hoặc Redis lỗi, truy vấn MySQL
    const products = await productRepository.findAll(pool);

    // 3. Lưu vào Redis Cache với TTL 60 giây
    try {
      await connectRedis();
      if (products.length > 0) {
        await redisClient.set(cacheKey, JSON.stringify(products), { EX: 60 });
      }
    } catch (error) {
      console.warn(`Redis cache save failed: ${error.message}`);
    }

    return { source: "mysql", data: products };
  },
};
