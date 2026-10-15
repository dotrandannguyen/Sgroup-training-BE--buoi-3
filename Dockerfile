# // ok
# 1. Dùng Node.js 20 trên Alpine Linux (gọn nhẹ)
#    Nếu không có internet: docker pull node:20-alpine (hoặc dùng image đã có sẵn)
FROM node:20-alpine

# 2. Thư mục làm việc bên trong container
WORKDIR /app

# 3. Copy file khai báo dependencies vào trước
#    (giúp Docker cache layer này, không cần npm install lại nếu code thay đổi)
COPY package*.json ./

# 4. Cài đặt dependencies (npm ci dùng package-lock.json, nhanh và chính xác hơn npm install)
RUN npm ci --omit=dev

# 5. Copy toàn bộ source code vào container
COPY . .

# 6. Khai báo cổng backend sẽ lắng nghe
EXPOSE 3000

# 7. Lệnh khởi động server
CMD ["node", "src/index.js"]
