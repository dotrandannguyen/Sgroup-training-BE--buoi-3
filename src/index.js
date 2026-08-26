import express from "express";
import dotenv from "dotenv";
import { users, books } from "./data.js";
import userRouter from "./routes/user.router.js";
import { errorHandler } from "./middlewares/error.middleware.js";
import { NotFoundError } from "./utils/error.helper.js";

dotenv.config();
const app = express();
const port = process.env.PORT || 3000;
const localhost = "localhost";

app.use(express.json());

app.get("/", (req, res) => {
  res.send("Hello World LOGIN");
});

// Mount User Router with /api prefix
app.use("/", userRouter);

// Catch 404 for all invalid routes
app.use((req, res, next) => {
    next(new NotFoundError(`Route not found: ${req.originalUrl}`));
});

// Final handler: Global Error Handler
app.use(errorHandler);

app.listen(port, localhost, () => {
  console.log(`Server is running on http://${localhost}:${port}`);
});
