import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import { authRepository } from "../repositories/auth.repository.js";
import { ConflictError, UnauthorizedError, BadRequestError } from "../utils/error.helper.js";

export const authService = {
  createAccessToken(user) {
    return jwt.sign(
      { userId: user.id, role: user.role },
      process.env.ACCESS_TOKEN_SECRET || "your_access_token_secret",
      { expiresIn: "15m" }
    );
  },

  // Tạo Refresh Token (hết hạn sau 7 ngày)
  createRefreshToken(user) {
    return jwt.sign(
      { userId: user.id },
      process.env.REFRESH_TOKEN_SECRET || "your_refresh_token_secret",
      { expiresIn: "7d" }
    );
  },

  // Register
  async register(email, password, fullName = null) {
    const existingUser = await authRepository.findByEmail(email);
    if (existingUser) {
      throw new ConflictError("Email đã tồn tại");
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const userId = await authRepository.create(email, hashedPassword, "user", fullName);

    return {
      id: userId,
      email,
      fullName,
      message: "Đăng ký thành công"
    };
  },

  // Login
  async login(email, password) {
    const user = await authRepository.findByEmail(email);
    if (!user) {
      throw new UnauthorizedError("Email hoặc mật khẩu không chính xác");
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      throw new UnauthorizedError("Email hoặc mật khẩu không chính xác");
    }

    const accessToken = authService.createAccessToken(user);
    const refreshToken = authService.createRefreshToken(user);

    // Save refresh token to database
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    await authRepository.updateRefreshToken(user.id, refreshToken, expiresAt);

    return {
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        fullName: user.full_name || null
      }
    };
  },

  // Refresh Token
  async refreshToken(refreshToken) {
    if (!refreshToken) {
      throw new BadRequestError("Refresh token is required");
    }

    let payload;
    try {
      payload = jwt.verify(
        refreshToken,
        process.env.REFRESH_TOKEN_SECRET || "your_refresh_token_secret"
      );
    } catch (error) {
      throw new UnauthorizedError("Invalid or expired refresh token");
    }

    const user = await authRepository.findById(payload.userId);
    if (!user || user.refresh_token !== refreshToken) {
      throw new UnauthorizedError("Refresh token has been revoked or is invalid");
    }

    const newAccessToken = authService.createAccessToken(user);
    return {
      accessToken: newAccessToken
    };
  },

  // Logout
  async logout(userId) {
    await authRepository.updateRefreshToken(userId, null, null);
    return { message: "Đăng xuất thành công" };
  }
};
