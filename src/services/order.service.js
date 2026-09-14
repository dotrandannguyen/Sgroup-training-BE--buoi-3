import pool from "../database.js";
import { orderRepository } from "../repositories/order.repository.js";
import { productRepository } from "../repositories/product.repository.js";
import { NotFoundError, BadRequestError } from "../utils/error.helper.js";

export const orderService = {
    async checkout(userId, productId, quantity) {
        const conn = await pool.getConnection();

        try {
            await conn.beginTransaction();

            // 1. Kiểm tra sản phẩm và lấy giá
            const product = await productRepository.findById(conn, productId);
            if (!product) {
                throw new NotFoundError("Sản phẩm không tồn tại");
            }

            // 2. Kiểm tra tồn kho trước khi đặt
            if (product.stock < quantity) {
                throw new BadRequestError("Không đủ hàng trong kho");
            }

            // 3. Tạo đơn hàng
            const orderId = await orderRepository.createOrder(conn, userId);

            // 4. Thêm sản phẩm vào đơn với giá thật
            await orderRepository.createOrderItem(conn, orderId, productId, quantity, product.price);

            // 5. Trừ tồn kho
            await productRepository.decreaseStock(conn, productId, quantity);

            await conn.commit();
            return { orderId };

        } catch (error) {
            await conn.rollback();
            throw error;

        } finally {
            conn.release();
        }
    }
};
