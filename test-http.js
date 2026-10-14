import app from './src/index.js';
import pool from './src/database.js';
import redisClient from './src/utils/redis.js';

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

async function runHttpTests() {
    console.log("=== STARTING HTTP API ENDPOINT TESTS ===");

    const server = app.listen(0);
    const port = server.address().port;
    const baseUrl = `http://localhost:${port}`;

    try {
        // 1. GET /
        console.log("\n1. Testing GET / ...");
        const resRoot = await fetch(`${baseUrl}/`);
        assert(resRoot.status === 200, "Root returns 200 OK");

        // 2. Validation error on POST /register
        console.log("\n2. Testing Zod Validation on POST /register ...");
        const resRegInvalid = await fetch(`${baseUrl}/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: "invalid-email" })
        });
        const regInvalidJson = await resRegInvalid.json();
        assert(resRegInvalid.status === 400, "Returns 400 Bad Request for invalid body");
        assert(regInvalidJson.success === false, "Response contains success: false");
        assert(Array.isArray(regInvalidJson.errors) && regInvalidJson.errors.length > 0, "Response contains validation errors array");

        // 3. Register valid user
        console.log("\n3. Testing valid POST /register ...");
        const userEmail = `http_test_${Date.now()}@example.com`;
        const resReg = await fetch(`${baseUrl}/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: userEmail, password: "securepassword", fullName: "Http Tester" })
        });
        assert(resReg.status === 201, "Returns 201 Created on valid register");

        // 4. Duplicate register
        console.log("\n4. Testing duplicate email POST /register ...");
        const resRegDup = await fetch(`${baseUrl}/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: userEmail, password: "securepassword" })
        });
        assert(resRegDup.status === 409, "Returns 409 Conflict for duplicate email");

        // 5. Login
        console.log("\n5. Testing POST /login ...");
        const resLogin = await fetch(`${baseUrl}/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: userEmail, password: "securepassword" })
        });
        assert(resLogin.status === 200, "Returns 200 OK on valid login");
        const loginData = await resLogin.json();
        const accessToken = loginData.data.accessToken;
        const refreshToken = loginData.data.refreshToken;
        assert(Boolean(accessToken), "Access token present in login response");
        assert(Boolean(refreshToken), "Refresh token present in login response");

        // 6. Protected GET /users without token
        console.log("\n6. Testing protected GET /users without token ...");
        const resUsersUnauth = await fetch(`${baseUrl}/users`);
        assert(resUsersUnauth.status === 401, "Returns 401 Unauthorized without Bearer token");

        // 7. Protected GET /users with token
        console.log("\n7. Testing protected GET /users with token ...");
        const resUsersAuth = await fetch(`${baseUrl}/users`, {
            headers: { 'Authorization': `Bearer ${accessToken}` }
        });
        assert(resUsersAuth.status === 200, "Returns 200 OK with Bearer token");
        const usersJson = await resUsersAuth.json();
        assert(Array.isArray(usersJson.data), "Returns array of users");

        // 8. GET /products (caching check)
        console.log("\n8. Testing GET /products ...");
        const resProducts = await fetch(`${baseUrl}/products`);
        assert(resProducts.status === 200, "GET /products returns 200 OK");
        const prodJson = await resProducts.json();
        assert(Array.isArray(prodJson.data.data), "Returns products list");

        // 9. POST /orders/checkout with validation
        console.log("\n9. Testing POST /orders/checkout ...");
        const checkoutProduct = prodJson.data.data[0];
        const resCheckout = await fetch(`${baseUrl}/orders/checkout`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${accessToken}`
            },
            body: JSON.stringify({
                productId: checkoutProduct.id,
                quantity: 1
            })
        });
        assert(resCheckout.status === 201, "Returns 201 Created on checkout");

        // 10. POST /refresh-token
        console.log("\n10. Testing POST /refresh-token ...");
        const resRefresh = await fetch(`${baseUrl}/refresh-token`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ refreshToken })
        });
        assert(resRefresh.status === 200, "Returns 200 OK for token refresh");
        const refreshJson = await resRefresh.json();
        assert(Boolean(refreshJson.data.accessToken), "New access token received");

        // 11. POST /logout
        console.log("\n11. Testing POST /logout ...");
        const resLogout = await fetch(`${baseUrl}/logout`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${accessToken}` }
        });
        assert(resLogout.status === 200, "Returns 200 OK on logout");

        // 12. 404 Route handling
        console.log("\n12. Testing 404 handler for invalid route ...");
        const resNotFound = await fetch(`${baseUrl}/non-existent-endpoint-xyz`);
        assert(resNotFound.status === 404, "Returns 404 Not Found for non-existent route");
        const notFoundJson = await resNotFound.json();
        assert(notFoundJson.success === false, "404 returns formatted error response");

        console.log("\n=== HTTP TEST SUMMARY ===");
        console.log(`Passed: ${passed}`);
        console.log(`Failed: ${failed}`);
    } finally {
        server.close();
        await pool.end();
        if (redisClient.isOpen) {
            await redisClient.disconnect();
        }
    }

    if (failed > 0) {
        process.exit(1);
    }
}

runHttpTests().catch(e => {
    console.error("HTTP test error:", e);
    process.exit(1);
});
