// ok
import express from "express";
import dotenv from "dotenv";
import { connectionDb } from "./database.js";
import userRouter from "./routes/user.router.js";
import orderRouter from "./routes/order.router.js";
import productRouter from "./routes/product.router.js";
import { authRouter } from "./routes/auth.router.js";
import { errorHandler } from "./middlewares/error.middleware.js";
import { NotFoundError } from "./utils/error.helper.js";

dotenv.config();
const app = express();
const port = process.env.PORT || 3000;
// Docker: phải dùng "0.0.0.0" để container mở cổng ra ngoài
// Local:  "localhost" cũng hoạt động bình thường
const localhost = "0.0.0.0";

app.use(express.json());

app.get("/", (req, res) => {
  res.send("Hello World LOGIN");
});

// Mount routers with both root and /api prefixes for maximum compatibility
app.use("/", userRouter);
app.use("/api", userRouter);

app.use("/", orderRouter);
app.use("/api", orderRouter);

app.use("/", productRouter);
app.use("/api", productRouter);

app.use("/", authRouter);
app.use("/api", authRouter);

// Catch 404 for all invalid routes
app.use((req, res, next) => {
  next(new NotFoundError(`Route not found: ${req.originalUrl}`));
});

// Final handler: Global Error Handler
app.use(errorHandler);

// Connect to Database
connectionDb();

app.listen(port, localhost, () => {
  console.log(`Server is running on http://${localhost}:${port}`);
});

export default app;
