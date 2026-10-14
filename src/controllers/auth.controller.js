import { authService } from "../services/auth.service.js";
import { HttpResponse } from "../utils/success.helper.js";

export const authController = {
  async register(req, res, next) {
    try {
      const { email, password, fullName, name } = req.body;
      const result = await authService.register(email, password, fullName || name);
      return new HttpResponse(res).created(result, "Đăng ký thành công");
    } catch (error) {
      next(error);
    }
  },

  async login(req, res, next) {
    try {
      const { email, password } = req.body;
      const tokens = await authService.login(email, password);
      return new HttpResponse(res).success(tokens, "Đăng nhập thành công");
    } catch (error) {
      next(error);
    }
  },

  async refreshToken(req, res, next) {
    try {
      const { refreshToken } = req.body;
      const result = await authService.refreshToken(refreshToken);
      return new HttpResponse(res).success(result, "Cấp lại access token thành công");
    } catch (error) {
      next(error);
    }
  },

  async logout(req, res, next) {
    try {
      const userId = req.user?.userId;
      const result = await authService.logout(userId);
      return new HttpResponse(res).success(result, "Đăng xuất thành công");
    } catch (error) {
      next(error);
    }
  }
};
