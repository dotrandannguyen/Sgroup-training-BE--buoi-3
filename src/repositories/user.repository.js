import pool from "../database.js";

export const userRepository = {

    // Lấy tất cả user
    async findAll() {
        const result = await pool.query(
            "SELECT * FROM users"
        );
        return result[0];
    },

    // Tìm user theo id
    async findById(id) {
        const result = await pool.query(
            "SELECT * FROM users WHERE id = ?",
            [id]
        );
        return result[0][0];
    },

    // Tạo user
    async create(user) {
        const result = await pool.query(
            `INSERT INTO users (full_name, email, password_hash, role)
             VALUES (?, ?, ?, ?)`,
            [user.full_name, user.email, user.password_hash, user.role]
        );
        return result[0].insertId;
    },

    // Cập nhật user
    async update(id, user) {
        await pool.query(
            `UPDATE users SET full_name = ?, email = ?, role = ? WHERE id = ?`,
            [user.full_name, user.email, user.role, id]
        );
    },

    // Xóa user
    async delete(id) {
        await pool.query(
            "DELETE FROM users WHERE id = ?",
            [id]
        );
    }
};
