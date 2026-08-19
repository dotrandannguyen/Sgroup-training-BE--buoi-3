import express from "express";
import dotenv from "dotenv";
import { users, books } from "./data.js";
dotenv.config();
const app = express();
const port = process.env.PORT || 3000;
const localhost = "localhost";

import userRouter from "./routes/user.router.js"


app.use(express.json());
app.get("/", (req, res) => {
  res.send("Hello World LOGIN");
});

app.use("/",userRouter);

app.listen(port, localhost, () => {
  console.log(`Server is running on http://${localhost}:${port}`);
});
