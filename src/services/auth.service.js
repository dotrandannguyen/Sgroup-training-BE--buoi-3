import jwt from "jsonwebtoken";
import brcypt from "bcrypt";
import { authRepository } from "../repositories/auth.repository.js";

export const authService = {
  createAccessToken(user) {
    return jwt.sign(
      { userId: user.id, role: user.role },
      process.env.ACCESS_TOKEN_SECRET,
      { expiresIn: "30s" },
    );
  },

  // Tạo Refresh Token (hết hạn sau 7 ngày).
  createRefreshToken(user) {
    return jwt.sign({ userId: user.id }, process.env.REFRESH_TOKEN_SECRET, {
      expiresIn: "7d",
    });
  },
  //register
  async register(email, password) {
    const existingUser = await authRepository.findByEmail(email);

    if (existingUser) {
      throw new Error("Email đã tồn tại");
    }
    const hashedPassword = await brcypt.hash(password, 10);
    await authRepository.create(email, hashedPassword);
    return { message: "Đăng ký thành công" };
  },

  //login
  async login(email, password) {
    const user = await authRepository.findByEmail(email);
    if (!user) {
      throw new Error("Email không tồn tại");
    }
    const isMatch = await brcypt.compare(password, user.password);
    if (!isMatch) {
      throw new Error("Mật khẩu không đúng");
    }
    return {
      accessToken: this.createAccessToken(user),
      refreshToken: this.createRefreshToken(user),
    };
  },
};
