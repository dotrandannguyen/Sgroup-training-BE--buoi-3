import pool from '../database.js';

export const authRepository = {
    async findByEmail(email) {
        const [rows] = await pool.query(
            'SELECT * FROM users WHERE email = ?',
            [email]
        );
        return rows[0] || null;
    },

    async findById(id) {
        const [rows] = await pool.query(
            'SELECT * FROM users WHERE id = ?',
            [id]
        );
        return rows[0] || null;
    },

    async create(email, password, role = "user", fullName = null) {
        const [result] = await pool.query(
            "INSERT INTO users (email, password, role, full_name) VALUES (?, ?, ?, ?)",
            [email, password, role, fullName]
        );
        return result.insertId;
    },

    async updateRefreshToken(id, refreshToken, expiresAt = null) {
        await pool.query(
            "UPDATE users SET refresh_token = ?, refresh_token_expires_at = ? WHERE id = ?",
            [refreshToken, expiresAt, id]
        );
    }
};