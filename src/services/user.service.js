import bcrypt from "bcrypt";
import { userRepository } from "../repositories/user.repository.js";
import { NotFoundError, BadRequestError, ConflictError } from "../utils/error.helper.js";

export const userService = {
    async getAllUsers() {
        return await userRepository.findAll();
    },

    async getUserById(id) {
        if (!id || isNaN(id) || id <= 0) {
            throw new BadRequestError("Invalid user ID");
        }
        const user = await userRepository.findById(id);
        if (!user) {
            throw new NotFoundError(`User not found with id: ${id}`);
        }
        return user;
    },

    async createUser(userData) {
        const existingUser = await userRepository.findByEmail(userData.email);
        if (existingUser) {
            throw new ConflictError("Email đã tồn tại");
        }

        const dataToInsert = { ...userData };
        if (dataToInsert.password) {
            dataToInsert.password = await bcrypt.hash(dataToInsert.password, 10);
        } else {
            dataToInsert.password = await bcrypt.hash("123456", 10);
        }

        const insertId = await userRepository.create(dataToInsert);
        return await userRepository.findById(insertId);
    },

    async updateUser(id, userData) {
        if (!id || isNaN(id) || id <= 0) {
            throw new BadRequestError("Invalid user ID");
        }
        const user = await userRepository.findById(id);
        if (!user) {
            throw new NotFoundError(`User not found with id: ${id}`);
        }

        if (userData.email && userData.email !== user.email) {
            const existingEmail = await userRepository.findByEmail(userData.email);
            if (existingEmail) {
                throw new ConflictError("Email đã tồn tại");
            }
        }

        const dataToUpdate = { ...userData };
        if (dataToUpdate.password) {
            dataToUpdate.password = await bcrypt.hash(dataToUpdate.password, 10);
        }

        await userRepository.update(id, dataToUpdate);
        return await userRepository.findById(id);
    },

    async deleteUser(id) {
        if (!id || isNaN(id) || id <= 0) {
            throw new BadRequestError("Invalid user ID");
        }
        const user = await userRepository.findById(id);
        if (!user) {
            throw new NotFoundError(`User not found with id: ${id}`);
        }
        await userRepository.delete(id);
        return user;
    }
};
