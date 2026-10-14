import { productService } from "../services/product.service.js";
import { HttpResponse } from "../utils/success.helper.js";

export const productController = {
  async getAllProducts(req, res, next) {
    try {
      const result = await productService.getAllProducts();
      return new HttpResponse(res).success(
        result,
        "Fetched all products successfully",
      );
    } catch (err) {
      next(err);
    }
  },
};
