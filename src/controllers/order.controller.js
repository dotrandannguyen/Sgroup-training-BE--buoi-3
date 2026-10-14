import { orderService } from "../services/order.service.js";
import { HttpResponse } from "../utils/success.helper.js";
import { BadRequestError } from "../utils/error.helper.js";

export const orderController = {
    async checkout(req, res, next) {
        try {
            const userId = (req.user && req.user.userId) || req.body.userId;
            if (!userId) {
                throw new BadRequestError("User ID is required for checkout");
            }

            const result = await orderService.checkout(userId, req.body);
            return new HttpResponse(res).created(result, "Đặt hàng thành công");
        } catch (error) {
            next(error);
        }
    }
};
