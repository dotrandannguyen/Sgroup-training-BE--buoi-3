import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import { productData } from './data/product.data.js';

dotenv.config();

const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    port: Number(process.env.DB_PORT) || 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'auth_demo',

    connectionLimit: 10,
    waitForConnections: true,
    queueLimit: 0,
});

async function initSchema(conn) {
    // 1. Tạo bảng users nếu chưa có
    await conn.query(`
        CREATE TABLE IF NOT EXISTS users (
            id INT AUTO_INCREMENT PRIMARY KEY,
            full_name VARCHAR(255) NULL,
            email VARCHAR(255) NOT NULL UNIQUE,
            password VARCHAR(255) NOT NULL,
            role VARCHAR(50) DEFAULT 'user',
            refresh_token VARCHAR(512) NULL,
            refresh_token_expires_at DATETIME NULL
        )
    `);

    // Kiểm tra và bổ sung cột full_name nếu thiếu
    const [userCols] = await conn.query('DESCRIBE users');
    const hasFullName = userCols.some(c => c.Field === 'full_name');
    if (!hasFullName) {
        await conn.query('ALTER TABLE users ADD COLUMN full_name VARCHAR(255) NULL AFTER id');
    }

    // 2. Tạo bảng products nếu chưa có
    await conn.query(`
        CREATE TABLE IF NOT EXISTS products (
            id INT AUTO_INCREMENT PRIMARY KEY,
            name VARCHAR(255) NOT NULL,
            description TEXT NULL,
            price INT NOT NULL,
            stock INT NOT NULL DEFAULT 0,
            category VARCHAR(100) NULL
        )
    `);

    // 3. Tạo bảng orders nếu chưa có
    await conn.query(`
        CREATE TABLE IF NOT EXISTS orders (
            id INT AUTO_INCREMENT PRIMARY KEY,
            user_id INT NOT NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    `);

    // 4. Tạo bảng orders_items nếu chưa có
    await conn.query(`
        CREATE TABLE IF NOT EXISTS orders_items (
            id INT AUTO_INCREMENT PRIMARY KEY,
            order_id INT NOT NULL,
            product_id INT NOT NULL,
            quantity INT NOT NULL,
            unit_price INT NOT NULL
        )
    `);

    // 5. Seed dữ liệu sản phẩm nếu bảng products còn trống
    const [prodCount] = await conn.query('SELECT COUNT(*) as cnt FROM products');
    if (prodCount[0].cnt === 0 && Array.isArray(productData) && productData.length > 0) {
        for (const p of productData) {
            await conn.query(
                'INSERT INTO products (id, name, description, price, stock, category) VALUES (?, ?, ?, ?, ?, ?)',
                [p.id, p.name, p.description, p.price, p.stock, p.category]
            );
        }
        console.log('Seeded initial products into database');
    }
}

export const connectionDb = async () => {
    try {
        const conn = await pool.getConnection();
        console.log('Database connected successfully');
        await initSchema(conn);
        conn.release();
    } catch (err) {
        console.error('Database connect failed: ', err.message);
        process.exit(1);
    }
};

export default pool;
