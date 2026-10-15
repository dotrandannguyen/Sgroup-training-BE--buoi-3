// ok
import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import { productData } from './data/product.data.js';

dotenv.config();

const pool = mysql.createPool({
    host:     process.env.DB_HOST     || 'localhost',
    port:     Number(process.env.DB_PORT) || 3306,
    user:     process.env.DB_USER     || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME     || 'auth_demo',
    connectionLimit: 10,
    waitForConnections: true,
    queueLimit: 0,
});

// ─── Khởi tạo schema nếu chưa có ─────────────────────────────────────────────
async function initSchema(conn) {
    await conn.query(`
        CREATE TABLE IF NOT EXISTS users (
            id                       INT AUTO_INCREMENT PRIMARY KEY,
            full_name                VARCHAR(255) NULL,
            email                    VARCHAR(255) NOT NULL UNIQUE,
            password                 VARCHAR(255) NOT NULL,
            role                     VARCHAR(50)  DEFAULT 'user',
            refresh_token            VARCHAR(512) NULL,
            refresh_token_expires_at DATETIME     NULL
        )
    `);

    await conn.query(`
        CREATE TABLE IF NOT EXISTS products (
            id          INT AUTO_INCREMENT PRIMARY KEY,
            name        VARCHAR(255) NOT NULL,
            description TEXT         NULL,
            price       INT          NOT NULL,
            stock       INT          NOT NULL DEFAULT 0,
            category    VARCHAR(100) NULL
        )
    `);

    await conn.query(`
        CREATE TABLE IF NOT EXISTS orders (
            id         INT AUTO_INCREMENT PRIMARY KEY,
            user_id    INT  NOT NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    `);

    await conn.query(`
        CREATE TABLE IF NOT EXISTS orders_items (
            id         INT AUTO_INCREMENT PRIMARY KEY,
            order_id   INT NOT NULL,
            product_id INT NOT NULL,
            quantity   INT NOT NULL,
            unit_price INT NOT NULL
        )
    `);

    // Seed products nếu bảng còn trống
    const [[{ cnt }]] = await conn.query('SELECT COUNT(*) AS cnt FROM products');
    if (cnt === 0 && Array.isArray(productData) && productData.length > 0) {
        for (const p of productData) {
            await conn.query(
                'INSERT INTO products (id, name, description, price, stock, category) VALUES (?, ?, ?, ?, ?, ?)',
                [p.id, p.name, p.description, p.price, p.stock, p.category]
            );
        }
        console.log('Seeded initial products into database');
    }
}

// ─── Kết nối với retry (quan trọng khi chạy Docker) ──────────────────────────
// Trong Docker, MySQL container cần vài giây để khởi động xong
// Dùng depends_on + healthcheck trong compose.yaml là đủ,
// nhưng retry ở đây là lớp bảo vệ thêm phòng khi timeout ngắn.
export const connectionDb = async (retries = 5, delay = 3000) => {
    for (let attempt = 1; attempt <= retries; attempt++) {
        try {
            const conn = await pool.getConnection();
            console.log(`Database connected (attempt ${attempt}/${retries})`);
            await initSchema(conn);
            conn.release();
            return; // Kết nối thành công → thoát
        } catch (err) {
            console.error(`DB connection failed (attempt ${attempt}/${retries}): ${err.message}`);
            if (attempt === retries) {
                console.error('All DB connection attempts failed. Exiting.');
                process.exit(1);
            }
            // Chờ trước khi thử lại
            console.log(`Retrying in ${delay / 1000}s...`);
            await new Promise(resolve => setTimeout(resolve, delay));
        }
    }
};

export default pool;
