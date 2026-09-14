import { orderService } from "../services/order.service.js";
import { HttpResponse } from "../utils/success.helper.js";

export const orderController = {
    async checkout(req, res, next) {
        try {
            const userId = req.body.userId;
            const productId = req.body.productId;
            const quantity = req.body.quantity;

            const result = await orderService.checkout(userId, productId, quantity);
            return new HttpResponse(res).created(result, "Đặt hàng thành công");
        } catch (error) {
            next(error);
        }
    }
};
