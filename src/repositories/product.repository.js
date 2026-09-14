export const productRepository = {

    async findById(conn, id) {
        const result = await conn.query(
            "SELECT * FROM products WHERE id = ?",
            [id]
        );
        return result[0][0];
    },

    async decreaseStock(conn, id, qty) {
        await conn.query(
            "UPDATE products SET stock = stock - ? WHERE id = ?",
            [qty, id]
        );
    },

    async increaseStock(conn, id, qty) {
        await conn.query(
            "UPDATE products SET stock = stock + ? WHERE id = ?",
            [qty, id]
        );
    }
};
