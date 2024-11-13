const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const userModel = require('./Models/userModel');
require('dotenv').config();

console.log('JWT_SECRET_KEY:', process.env.JWT_SECRET_KEY);

const authMiddleware = async (req, res, next) => {
    const authHeader = req.header('Authorization');
    if (!authHeader) {
        return res.status(401).json({ message: 'Authorization header is missing' });
    }

    const token = authHeader.replace('Bearer ', '').trim();
    console.log('Received token:', token);

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
        console.log('Decoded token:', decoded);

        // Kiểm tra xem decoded._id có phải là ObjectId hợp lệ không
        if (!mongoose.Types.ObjectId.isValid(decoded._id)) {
            throw new Error('Invalid user ID');
        }

        // Tìm người dùng dựa trên `_id` từ token
        const user = await userModel.findById(decoded._id);

        if (!user) {
            throw new Error('User not found');
        }

        req.token = token;
        req.user = user;
        next();
    } catch (error) {
        console.error('Authentication error:', error.message);
        res.status(401).json({ message: 'Please authenticate.', error: error.message });
    }
};

module.exports = authMiddleware;