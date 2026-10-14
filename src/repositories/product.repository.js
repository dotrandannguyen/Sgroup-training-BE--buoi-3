export const productRepository = {
  async findById(conn, id) {
    const [rows] = await conn.query(
      "SELECT id, name, description, price, stock, category FROM products WHERE id = ?",
      [id]
    );
    return rows[0] || null;
  },

  async decreaseStock(conn, id, qty) {
    const [result] = await conn.query(
      "UPDATE products SET stock = stock - ? WHERE id = ? AND stock >= ?",
      [qty, id, qty]
    );
    return result.affectedRows > 0;
  },

  async increaseStock(conn, id, qty) {
    await conn.query(
      "UPDATE products SET stock = stock + ? WHERE id = ?",
      [qty, id]
    );
  },

  async findAll(conn) {
    const [rows] = await conn.query(
      "SELECT id, name, description, price, stock, category FROM products"
    );
    return rows;
  },
};
