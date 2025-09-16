const User = require('../models/User');
const Role = require('../models/Role');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const QueryHelper = require('../utils/QueryHelper')
// Login user
exports.login = async (req, res) => {
    const { username, password } = req.body;

    try {
        // Check if user exists
        const user = await User.findOne({ username }).populate('role');
        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Account or password is not correct'
            });
        }

        // Check password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({
                success: false,
                message: 'Account or password is not correct'
            });
        }

        // Create token
        const token = jwt.sign(
            { id: user._id, role: user.role.name },
            process.env.JWT_SECRET,
            { expiresIn: '1d' }
        );

        res.status(200).json({
            success: true,
            message: 'Login successfully',
            data: {
                user: {
                    id: user._id,
                    username: user.username,
                    fullName: user.fullName,
                    role: user.role.name
                },
                token
            }
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({
            success: false,
            message: 'Error server'
        });
    }
};

// Register new user (always creates a regular user)
exports.register = async (req, res) => {
    try {
        const { username, password, fullName, phone, address } = req.body;

        // Validate input
        if (!username || !password || !fullName) {
            return res.status(400).json({
                success: false,
                message: 'Please fill in all required information'
            });
        }

        // Check if username exists
        const existingUser = await User.findOne({ username });
        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: 'Username already exists'
            });
        }

        // Get user role
        const userRole = await Role.findOne({ name: 'receptionist' });
        if (!userRole) {
            return res.status(500).json({
                success: false,
                message: 'Error getting user role'
            });
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Create user with user role
        const user = await User.create({
            username,
            password: hashedPassword,
            fullName,
            phone,
            address,
            role: userRole._id
        });

        // Create token
        const token = jwt.sign(
            { id: user._id, role: 'user' },
            process.env.JWT_SECRET,
            { expiresIn: '1d' }
        );

        res.status(201).json({
            success: true,
            message: 'Registered successfully',
            data: {
                user: {
                    id: user._id,
                    username: user.username,
                    fullName: user.fullName,
                    role: 'user'
                },
                token
            }
        });
    } catch (error) {
        console.error('Register error:', error);
        res.status(500).json({
            success: false,
            message: 'Error server'
        });
    }
};

exports.logout = async (req, res) => {
    try {
        res.status(200).json({
            success: true,
            message: 'Logged out successfully'
        });
    } catch (error) {
        console.error('Logout error:', error);
        res.status(500).json({
            success: false,
            message: 'Error server'
        });
    }
};
/**
 * API Endpoint: GET http://localhost:4000/api/users?limit=5&page=1
 * @param {limit,page} params 
 */
exports.getAllUsers = async (req, res) => {
    try {
        
        const userQuery = User.find()
            .populate({
                path: 'role',
                select: '_id name'
            })
            .select('-password');

        const queryHelper = new QueryHelper(userQuery,req.query).executeQuery()
        
        const users = await queryHelper.query
        const total = await User.countDocuments()
        res.status(200).json({
            success: true,
            count: users.length,
            total,
            data: users

        });
    } catch (error) {
        console.error('Get all users error:', error);
        res.status(500).json({
            success: false,
            message: 'Error server'
        });
    }
};

// Get single user
exports.getUser = async (req, res) => {
    try {
        const user = await User.findById(req.params.id).populate('role').select('-password');
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        res.status(200).json({
            success: true,
            data: user
        });
    } catch (error) {
        console.error('Get user error:', error);
        res.status(500).json({
            success: false,
            message: 'Error server'
        });
    }
};

/**
 * API endpoint : http://localhost:4000/api/users/6774d3edc41de323ef8b386f
 * @param {params: userId}
 * @param {body: data need to change}} 
 */
exports.updateUser = async (req, res) => {
    try {
        const { password, fullName, phone, address, role } = req.body;
        let updateData = { fullName, phone, address, role };

        updateData = Object.fromEntries(
            Object.entries(updateData).filter(([key, value]) => value !== undefined)
        );

        if (password) {
            const salt = await bcrypt.genSalt(10);
            updateData.password = await bcrypt.hash(password, salt);
        }

        const user = await User.findByIdAndUpdate(
            req.params.id,
            updateData,
            {
                new: true,
                runValidators: true 
            }
        ).select('-password'); 

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Updated information successfully',
            data: user
        });
    } catch (error) {
        console.error('Update user error:', error);
        res.status(500).json({
            success: false,
            message: 'Error server'
        });
    }
};
// Delete user
exports.deleteUser = async (req, res) => {
    try {
        const user = await User.findById(req.params.id).populate('role');
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Prevent deleting admin accounts
        if (user.role.name === 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Admin accounts cannot be deleted'
            });
        }

        await user.remove();

        res.status(200).json({
            success: true,
            message: 'User deletion successful'
        });
    } catch (error) {
        console.error('Delete user error:', error);
        res.status(500).json({
            success: false,
            message: 'Error server'
        });
    }
};