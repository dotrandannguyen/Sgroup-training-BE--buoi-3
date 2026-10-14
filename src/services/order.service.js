import pool from "../database.js";
import { orderRepository } from "../repositories/order.repository.js";
import { productRepository } from "../repositories/product.repository.js";
import { NotFoundError, BadRequestError } from "../utils/error.helper.js";
import redisClient, { connectRedis } from "../utils/redis.js";

export const orderService = {
    async checkout(userId, orderPayload) {
        let items = [];
        if (Array.isArray(orderPayload.items) && orderPayload.items.length > 0) {
            items = orderPayload.items;
        } else if (orderPayload.productId && orderPayload.quantity) {
            items = [{ productId: orderPayload.productId, quantity: orderPayload.quantity }];
        } else {
            throw new BadRequestError("Vui lòng cung cấp sản phẩm và số lượng cần đặt");
        }

        const conn = await pool.getConnection();

        try {
            await conn.beginTransaction();

            // 1. Kiểm tra từng sản phẩm và tồn kho trước khi đặt
            const preparedItems = [];
            let totalAmount = 0;

            for (const item of items) {
                const product = await productRepository.findById(conn, item.productId);
                if (!product) {
                    throw new NotFoundError(`Sản phẩm với ID ${item.productId} không tồn tại`);
                }

                if (product.stock < item.quantity) {
                    throw new BadRequestError(
                        `Sản phẩm "${product.name}" không đủ hàng trong kho (hiện còn ${product.stock}, yêu cầu ${item.quantity})`
                    );
                }

                preparedItems.push({
                    productId: product.id,
                    name: product.name,
                    quantity: item.quantity,
                    unitPrice: product.price,
                    subtotal: product.price * item.quantity
                });

                totalAmount += product.price * item.quantity;
            }

            // 2. Tạo đơn hàng trong bảng orders
            const orderId = await orderRepository.createOrder(conn, userId);

            // 3. Thêm chi tiết đơn hàng và trừ tồn kho
            for (const item of preparedItems) {
                await orderRepository.createOrderItem(
                    conn,
                    orderId,
                    item.productId,
                    item.quantity,
                    item.unitPrice
                );

                const decremented = await productRepository.decreaseStock(
                    conn,
                    item.productId,
                    item.quantity
                );

                if (!decremented) {
                    throw new BadRequestError(`Không thể cập nhật tồn kho cho sản phẩm ${item.name}`);
                }
            }

            await conn.commit();

            // 4. Xóa cache Redis để đồng bộ tồn kho mới
            try {
                await connectRedis();
                await redisClient.del("products");
            } catch (cacheErr) {
                console.warn("Could not invalidate products cache:", cacheErr.message);
            }

            return {
                orderId,
                userId,
                totalAmount,
                items: preparedItems
            };

        } catch (error) {
            await conn.rollback();
            throw error;
        } finally {
            conn.release();
        }
    }
};
