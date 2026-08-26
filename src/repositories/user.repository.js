import { users } from "../data.js";

// Mocking these functions as asynchronous (similar to a real Database call)
export const userRepository = {
    async findAll() {
        return users;
    },
    
    async findById(id) {
        return users.find(u => u.id === id);
    },
    
    async create(userData) {
        const newUser = {
            id: users.length > 0 ? users[users.length - 1].id + 1 : 1,
            ...userData
        };
        users.push(newUser);
        return newUser;
    },
    
    async update(id, userData) {
        const index = users.findIndex(u => u.id === id);
        if (index !== -1) {
            users[index] = { ...users[index], ...userData };
            return users[index];
        }
        return null;
    },
    
    async delete(id) {
        const index = users.findIndex(u => u.id === id);
        if (index !== -1) {
            const deletedUser = users[index];
            users.splice(index, 1);
            return deletedUser;
        }
        return null;
    }
};
