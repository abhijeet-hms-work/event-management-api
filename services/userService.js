const pool = require('../config/database');
const { AppError } = require('../middleware/errorHandler');

class UserService {
    // Create a new user
    async createUser(userData) {
        const { name, email } = userData;
        
        try {
            const result = await pool.query(
                `INSERT INTO users (name, email) 
                 VALUES ($1, $2) 
                 RETURNING id, name, email, created_at`,
                [name, email]
            );

            return result.rows[0];
        } catch (error) {
            if (error.code === '23505') { // Unique violation
                throw new AppError('Email already exists', 400);
            }
            console.error('Error creating user:', error);
            throw new AppError('Failed to create user', 500);
        }
    }

    // Get user by ID
    async getUserById(userId) {
        try {
            const result = await pool.query(
                'SELECT id, name, email, created_at FROM users WHERE id = $1',
                [userId]
            );

            if (result.rows.length === 0) {
                throw new AppError('User not found', 404);
            }

            return result.rows[0];
        } catch (error) {
            if (error instanceof AppError) {
                throw error;
            }
            console.error('Error fetching user:', error);
            throw new AppError('Failed to fetch user', 500);
        }
    }

    // Get all users
    async getAllUsers() {
        try {
            const result = await pool.query(
                'SELECT id, name, email, created_at FROM users ORDER BY created_at DESC'
            );

            return result.rows;
        } catch (error) {
            console.error('Error fetching users:', error);
            throw new AppError('Failed to fetch users', 500);
        }
    }
}

module.exports = new UserService();
