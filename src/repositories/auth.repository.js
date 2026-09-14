import pool from '../database.js';
export const authRepository = {
    
    async findByEmail(email) {
        const [rows] = await pool.query(
            'SELECT * FROM users WHERE email = ?',
            [email]
        );
        return rows[0];
    },
    //create 

    async create(email,password) {
        const [result] = await pool.query(
            "INSERT INTO users ( email,password,role) VALUES (?, ?, ?)",
            [email, password,"user"]
        );
        return result.insertId;
    }   

}