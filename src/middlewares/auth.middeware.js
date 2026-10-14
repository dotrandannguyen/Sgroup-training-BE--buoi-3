import jwt from "jsonwebtoken";
import {UnauthorizedError} from "../utils/error.helper.js";
export const authMiddleware = (req, res, next) => {
  try {
    // Bước 1: Lấy authorization header từ request
    const authorizationHeader = req.headers.authorization;

    // Bước 2: Kiểm tra header có dạng Bearer token hay không
    if (!authorizationHeader || !authorizationHeader.startsWith("Bearer ")) {
      return next(new UnauthorizedError("Missing or invalid authorization header"));
    }

    // Bước 3: Tách access token từ header
    const accessToken = authorizationHeader.split(" ")[1];
    if (!accessToken) {
      return next(new UnauthorizedError("Access token is missing"));
    }

    // Bước 4: Verify access token
    const payload = jwt.verify(
      accessToken,
      process.env.ACCESS_TOKEN_SECRET || "your_access_token_secret"
    );

    // Bước 5: Gán payload vào request để truyền xuống controller
    req.user = payload;
    next();
  } catch (error) {
    return next(new UnauthorizedError("Invalid or expired access token"));
  }
};
