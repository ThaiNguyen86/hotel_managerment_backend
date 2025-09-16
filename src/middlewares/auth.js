const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Bảo vệ routes
exports.protect = async (req, res, next) => {
    try {
        let token;

        // Lấy token từ header
        if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
            token = req.headers.authorization.split(' ')[1];
        }

        // Kiểm tra token tồn tại
        if (!token) {
            return res.status(401).json({
                success: false,
                error: 'Please Login'
            });
        }

        try {
            // Verify token
            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            // Lấy thông tin user từ token
            const user = await User.findById(decoded.id).populate('role');
            if (!user) {
                return res.status(401).json({
                    success: false,
                    error: 'Can not find user'
                });
            }

            // Thêm thông tin user vào request
            req.user = user;
            next();
        } catch (err) {
            return res.status(401).json({
                success: false,
                error: 'Token is invalid'
            });
        }
    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'Error server'
        });
    }
};

/**
 * 
 * @param roles List of roles can access to specified functionality  
 * @description if current user's roles are not in required roles list then return 403
 */
exports.authorize = (...permissions) => {
    return (req, res, next) => {
        
        const hasPermission = permissions.every(permission=>req.user.role && req.user.role.some(userRole=>userRole && userRole.permissions.includes(permission)))

        if (!hasPermission) {
            return res.status(403).json({
                success: false,
                error: 'You do not have permission'
            });
        }
        next();
    };
};