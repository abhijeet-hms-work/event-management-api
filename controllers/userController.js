const userService = require('../services/userService');

class UserController {
    async createUser(req, res, next) {
        try {
            const user = await userService.createUser(req.body);
            
            res.status(201).json({
                status: 'success',
                message: 'User created successfully',
                data: { user }
            });
        } catch (error) {
            next(error);
        }
    }

    async getUser(req, res, next) {
        try {
            const { userId } = req.params;
            const user = await userService.getUserById(userId);
            
            res.status(200).json({
                status: 'success',
                data: { user }
            });
        } catch (error) {
            next(error);
        }
    }

    async getAllUsers(req, res, next) {
        try {
            const users = await userService.getAllUsers();
            
            res.status(200).json({
                status: 'success',
                count: users.length,
                data: { users }
            });
        } catch (error) {
            next(error);
        }
    }
}

module.exports = new UserController();
