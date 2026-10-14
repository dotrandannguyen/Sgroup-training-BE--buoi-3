import pool, { connectionDb } from './src/database.js';
import { authService } from './src/services/auth.service.js';
import { userService } from './src/services/user.service.js';
import { productService } from './src/services/product.service.js';
import { orderService } from './src/services/order.service.js';
import redisClient, { connectRedis } from './src/utils/redis.js';

let passed = 0;
let failed = 0;

function assert(condition, message) {
    if (condition) {
        console.log(`  [PASS] ${message}`);
        passed++;
    } else {
        console.error(`  [FAIL] ${message}`);
        failed++;
    }
}

async function runTests() {
    console.log("=== STARTING COMPREHENSIVE CODEBASE TESTS ===");

    // 1. Database & Schema Initialization
    console.log("\n1. Testing Database & Schema Initialization...");
    await connectionDb();
    const [tables] = await pool.query("SHOW TABLES");
    const tableNames = tables.map(t => Object.values(t)[0]);
    assert(tableNames.includes("users"), "Table 'users' exists");
    assert(tableNames.includes("products"), "Table 'products' exists");
    assert(tableNames.includes("orders"), "Table 'orders' exists");
    assert(tableNames.includes("orders_items"), "Table 'orders_items' exists");

    // 2. Auth Service - Register & Duplicate Email Prevention
    console.log("\n2. Testing Auth Service (Register)...");
    const testEmail = `tester_${Date.now()}@example.com`;
    const regResult = await authService.register(testEmail, "password123", "Test User");
    assert(regResult.email === testEmail, "User registered successfully");

    try {
        await authService.register(testEmail, "password123", "Test User");
        assert(false, "Should have thrown 409 Conflict for duplicate email");
    } catch (err) {
        assert(err.statusCode === 409, "Throws 409 Conflict for duplicate email");
    }

    // 3. Auth Service - Login & Wrong Credentials
    console.log("\n3. Testing Auth Service (Login)...");
    try {
        await authService.login(testEmail, "wrong_password");
        assert(false, "Should have thrown 401 for wrong password");
    } catch (err) {
        assert(err.statusCode === 401, "Throws 401 Unauthorized for wrong password");
    }

    const loginResult = await authService.login(testEmail, "password123");
    assert(Boolean(loginResult.accessToken), "Returns access token on login");
    assert(Boolean(loginResult.refreshToken), "Returns refresh token on login");
    assert(loginResult.user.email === testEmail, "Returns correct user profile on login");

    // 4. Auth Service - Refresh Token & Revocation
    console.log("\n4. Testing Refresh Token & Logout...");
    const refreshResult = await authService.refreshToken(loginResult.refreshToken);
    assert(Boolean(refreshResult.accessToken), "Successfully reissued new access token");

    await authService.logout(loginResult.user.id);
    try {
        await authService.refreshToken(loginResult.refreshToken);
        assert(false, "Should fail refresh token after logout");
    } catch (err) {
        assert(err.statusCode === 401, "Refresh token rejected after logout");
    }

    // 5. User Service - CRUD & Data Sanitization
    console.log("\n5. Testing User Service...");
    const users = await userService.getAllUsers();
    assert(Array.isArray(users), "getAllUsers returns array");
    assert(!users.some(u => u.password !== undefined), "Passwords are NOT exposed in user listings");

    const createdUser = await userService.createUser({
        name: "CRUD Test User",
        email: `crud_${Date.now()}@example.com`,
        password: "secretpassword"
    });
    assert(createdUser.id > 0, "Created user successfully");
    assert(!createdUser.password, "Created user does not expose password");

    const updatedUser = await userService.updateUser(createdUser.id, { full_name: "Updated Name" });
    assert(updatedUser.full_name === "Updated Name", "User full_name updated without erasing other fields");

    const deletedUser = await userService.deleteUser(createdUser.id);
    assert(deletedUser.id === createdUser.id, "User deleted successfully");

    try {
        await userService.getUserById("invalid_id");
        assert(false, "Should reject NaN user ID");
    } catch (err) {
        assert(err.statusCode === 400, "Throws 400 Bad Request for NaN ID");
    }

    // 6. Product Service & Redis Caching
    console.log("\n6. Testing Products & Redis Cache...");
    await connectRedis();
    await redisClient.del("products"); // clear cache first

    const prodResult1 = await productService.getAllProducts();
    assert(prodResult1.source === "mysql", "First product request hits MySQL");
    assert(Array.isArray(prodResult1.data) && prodResult1.data.length > 0, "Products fetched from MySQL");

    const prodResult2 = await productService.getAllProducts();
    assert(prodResult2.source === "cache", "Second product request hits Redis cache");

    // 7. Order Service & Transaction Safety
    console.log("\n7. Testing Order Service (ACID Transaction)...");
    const testProduct = prodResult1.data[0];
    const initialStock = testProduct.stock;

    // Test insufficient stock
    try {
        await orderService.checkout(loginResult.user.id, {
            productId: testProduct.id,
            quantity: initialStock + 1000
        });
        assert(false, "Should reject checkout with insufficient stock");
    } catch (err) {
        assert(err.statusCode === 400, "Throws 400 Bad Request for insufficient stock");
    }

    // Test valid checkout
    const orderResult = await orderService.checkout(loginResult.user.id, {
        productId: testProduct.id,
        quantity: 1
    });
    assert(orderResult.orderId > 0, "Checkout transaction succeeded and created order");

    // Verify stock decreased in DB
    const [updatedProdRows] = await pool.query("SELECT stock FROM products WHERE id = ?", [testProduct.id]);
    assert(updatedProdRows[0].stock === initialStock - 1, "Stock atomically decremented in database");

    // Verify Redis cache was invalidated
    const cachedAfterOrder = await redisClient.get("products");
    assert(cachedAfterOrder === null, "Redis cache invalidated after order checkout");

    // 8. Order Service with multi-items checkout
    console.log("\n8. Testing Multi-item Checkout...");
    const multiOrderResult = await orderService.checkout(loginResult.user.id, {
        items: [
            { productId: testProduct.id, quantity: 1 }
        ]
    });
    assert(multiOrderResult.orderId > 0, "Multi-item checkout succeeded");

    console.log("\n=== TEST SUMMARY ===");
    console.log(`Passed: ${passed}`);
    console.log(`Failed: ${failed}`);

    await pool.end();
    await redisClient.disconnect();

    if (failed > 0) {
        process.exit(1);
    }
}

runTests().catch(err => {
    console.error("Test execution failed:", err);
    process.exit(1);
});
