import { userRepository } from "../repositories/user.repository.js";
import { NotFoundError } from "../utils/error.helper.js";

export const userService = {
    async getAllUsers() {
        return await userRepository.findAll();
    },

    async getUserById(id) {
        const user = await userRepository.findById(id);
        if (!user) {
            throw new NotFoundError(`User not found with id: ${id}`);
        }
        return user;
    },

    async createUser(userData) {
        return await userRepository.create(userData);
    },

    async updateUser(id, userData) {
        const existingUser = await userRepository.findById(id);
        if (!existingUser) {
            throw new NotFoundError(`User not found with id: ${id} to update`);
        }
        return await userRepository.update(id, userData);
    },

    async deleteUser(id) {
        const deletedUser = await userRepository.delete(id);
        if (!deletedUser) {
            throw new NotFoundError(`User not found with id: ${id} to delete`);
        }
        return deletedUser;
    }
};
