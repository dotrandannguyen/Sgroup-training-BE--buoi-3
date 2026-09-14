import { userRepository } from "../repositories/user.repository.js";
import { NotFoundError } from "../utils/error.helper.js";

export const userService = {
    async getAllUsers() {
        return await userRepository.findAll();
    },

    async getUserById(id) {
        const user = await userRepository.findById(id);
        if (!user) throw new NotFoundError(`User not found with id: ${id}`);
        return user;
    },

    async createUser(userData) {
        const insertId = await userRepository.create(userData);
        return await userRepository.findById(insertId);
    },

    async updateUser(id, userData) {
        const user = await userRepository.findById(id);
        if (!user) throw new NotFoundError(`User not found with id: ${id}`);
        await userRepository.update(id, userData);
        return await userRepository.findById(id);
    },

    async deleteUser(id) {
        const user = await userRepository.findById(id);
        if (!user) throw new NotFoundError(`User not found with id: ${id}`);
        await userRepository.delete(id);
        return user;
    }
};
