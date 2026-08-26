const API_URL = 'http://localhost:3000/api/users';

async function runTests() {
    console.log("====== BẮT ĐẦU TEST API ======\n");

    // Test 1: Lấy danh sách (GET /api/users)
    console.log("1. TEST GET ALL USERS");
    let res = await fetch(API_URL);
    let data = await res.json();
    console.log("Status:", res.status);
    console.log("Response:", JSON.stringify(data, null, 2));
    console.log("-------------------------\n");

    // Test 2: Bắn dữ liệu sai để test Joi Validation (POST /api/users)
    console.log("2. TEST VALIDATION ERROR (Lỗi 400 - Thiếu Name, sai Email)");
    res = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: "invalid-email" }) // Thiếu name, sai email
    });
    data = await res.json();
    console.log("Status:", res.status);
    console.log("Response:", JSON.stringify(data, null, 2));
    console.log("-------------------------\n");

    // Test 3: Tạo User mới hợp lệ (POST /api/users)
    console.log("3. TEST TẠO USER THÀNH CÔNG (201 Created)");
    res = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: "Học Sinh Mới", email: "student@gmail.com" })
    });
    data = await res.json();
    console.log("Status:", res.status);
    console.log("Response:", JSON.stringify(data, null, 2));
    console.log("-------------------------\n");

    // Test 4: Lỗi 404 Route không tồn tại
    console.log("4. TEST LỖI ROUTE KHÔNG TỒN TẠI (404 Not Found)");
    res = await fetch('http://localhost:3000/api/invalid-route');
    data = await res.json();
    console.log("Status:", res.status);
    console.log("Response:", JSON.stringify(data, null, 2));
    console.log("-------------------------\n");

    console.log("====== KẾT THÚC TEST ======");
}

runTests();
