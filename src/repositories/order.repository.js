export const orderRepository = {
    async createOrder(conn, userId) {
        const result = await conn.query(
            `INSERT INTO orders (user_id) VALUES (?)`,
            [userId]
        );
        return result[0].insertId;
    },

    async createOrderItem(conn, orderId, productId, quantity, unitPrice) {
        await conn.query(
            `INSERT INTO orders_items (order_id, product_id, quantity, unit_price)
             VALUES (?, ?, ?, ?)`,
            [orderId, productId, quantity, unitPrice]
        );
    }
};
