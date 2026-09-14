import { authService } from "../services/auth.service.js";
import { HttpResponse } from "../utils/success.helper.js";

export const authController = {
  async register(req, res, next) {
    try {
      const { email, password } = req.body;
      const result = await authService.register(email, password);
      return new HttpResponse(res).created(result, "register successful");
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
};
