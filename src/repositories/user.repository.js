import pool from "../database.js";

export const userRepository = {
    // Lấy tất cả user (loại bỏ thông tin nhạy cảm như password)
    async findAll() {
        const [rows] = await pool.query(
            "SELECT id, full_name, email, role FROM users"
        );
        return rows;
    },

    // Tìm user theo id
    async findById(id) {
        const [rows] = await pool.query(
            "SELECT id, full_name, email, role FROM users WHERE id = ?",
            [id]
        );
        return rows[0] || null;
    },

    // Tìm user theo email
    async findByEmail(email) {
        const [rows] = await pool.query(
            "SELECT * FROM users WHERE email = ?",
            [email]
        );
        return rows[0] || null;
    },

    // Tạo user
    async create(user) {
        const fullName = user.full_name || user.name || null;
        const role = user.role || "user";
        const password = user.password || user.password_hash || "$2b$10$defaultHashPlaceholder";
        
        const [result] = await pool.query(
            `INSERT INTO users (full_name, email, password, role)
             VALUES (?, ?, ?, ?)`,
            [fullName, user.email, password, role]
        );
        return result.insertId;
    },

    // Cập nhật user linh hoạt các trường
    async update(id, user) {
        const fields = [];
        const values = [];

        if (user.full_name !== undefined || user.name !== undefined) {
            fields.push("full_name = ?");
            values.push(user.full_name !== undefined ? user.full_name : user.name);
        }
        if (user.email !== undefined) {
            fields.push("email = ?");
            values.push(user.email);
        }
        if (user.role !== undefined) {
            fields.push("role = ?");
            values.push(user.role);
        }
        if (user.password !== undefined) {
            fields.push("password = ?");
            values.push(user.password);
        }

        if (fields.length === 0) return;

        values.push(id);
        await pool.query(
            `UPDATE users SET ${fields.join(", ")} WHERE id = ?`,
            values
        );
    },

    // Xóa user
    async delete(id) {
        const [result] = await pool.query(
            "DELETE FROM users WHERE id = ?",
            [id]
        );
        return result.affectedRows > 0;
    }
};
