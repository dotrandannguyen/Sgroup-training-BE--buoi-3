import { userService } from "../services/user.service.js";
import { HttpResponse } from "../utils/success.helper.js";

export const userController = {
    async getAll(req, res, next) {
        try {
            const users = await userService.getAllUsers();
            return new HttpResponse(res).success(users, "Fetched all users successfully");
        } catch (error) {
            next(error);
        }
    },

    async getById(req, res, next) {
        try {
            const id = parseInt(req.params.id);
            const user = await userService.getUserById(id);
            return new HttpResponse(res).success(user, "Fetched user successfully");
        } catch (error) {
            next(error);
        }
    },

    async create(req, res, next) {
        try {
            const newUser = await userService.createUser(req.body);
            return new HttpResponse(res).created(newUser, "User created successfully");
        } catch (error) {
            next(error);
        }
    },

    async update(req, res, next) {
        try {
            const id = parseInt(req.params.id);
            const updatedUser = await userService.updateUser(id, req.body);
            return new HttpResponse(res).success(updatedUser, "User updated successfully");
        } catch (error) {
            next(error);
        }
    },

    async delete(req, res, next) {
        try {
            const id = parseInt(req.params.id);
            await userService.deleteUser(id);
            return new HttpResponse(res).success(null, "User deleted successfully");
        } catch (error) {
            next(error);
        }
    }
};
