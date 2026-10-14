-- Tạo bảng users
CREATE TABLE IF NOT EXISTS users (
    id                      INT AUTO_INCREMENT PRIMARY KEY,
    full_name               VARCHAR(255) NULL,
    email                   VARCHAR(255) NOT NULL UNIQUE,
    password                VARCHAR(255) NOT NULL,
    role                    VARCHAR(50)  DEFAULT 'user',
    refresh_token           VARCHAR(512) NULL,
    refresh_token_expires_at DATETIME    NULL
);

-- Tạo bảng products
CREATE TABLE IF NOT EXISTS products (
    id          INT AUTO_INCREMENT PRIMARY KEY,
    name        VARCHAR(255) NOT NULL,
    description TEXT         NULL,
    price       INT          NOT NULL,
    stock       INT          NOT NULL DEFAULT 0,
    category    VARCHAR(100) NULL
);

-- Tạo bảng orders
CREATE TABLE IF NOT EXISTS orders (
    id         INT AUTO_INCREMENT PRIMARY KEY,
    user_id    INT  NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Tạo bảng orders_items
CREATE TABLE IF NOT EXISTS orders_items (
    id         INT AUTO_INCREMENT PRIMARY KEY,
    order_id   INT NOT NULL,
    product_id INT NOT NULL,
    quantity   INT NOT NULL,
    unit_price INT NOT NULL
);

-- Seed dữ liệu ban đầu cho products (chỉ thêm nếu bảng còn trống)
INSERT INTO products (id, name, description, price, stock, category)
SELECT 1, 'Laptop Dell Inspiron 15', 'Laptop văn phòng hiệu năng ổn định.', 15990000, 12, 'laptop'
WHERE NOT EXISTS (SELECT 1 FROM products WHERE id = 1);

INSERT INTO products (id, name, description, price, stock, category)
SELECT 2, 'Ban phim co Keychron K2', 'Bàn phím cơ không dây cho công việc và chơi game.', 1890000, 25, 'accessories'
WHERE NOT EXISTS (SELECT 1 FROM products WHERE id = 2);

INSERT INTO products (id, name, description, price, stock, category)
SELECT 3, 'Chuot Logitech MX Master 3S', 'Chuột không dây công thái học, dùng cho văn phòng.', 2190000, 18, 'accessories'
WHERE NOT EXISTS (SELECT 1 FROM products WHERE id = 3);

INSERT INTO products (id, name, description, price, stock, category)
SELECT 4, 'Man hinh LG UltraGear 27', 'Màn hình 27 inch, tần số quét cao.', 7490000, 8, 'monitor'
WHERE NOT EXISTS (SELECT 1 FROM products WHERE id = 4);
