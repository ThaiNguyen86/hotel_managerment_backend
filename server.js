require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./src/configs/database');

// Import routes
const userRoutes = require('./src/routes/userRoutes');
const roomRoutes = require('./src/routes/roomRoutes');
const roomTypeRoutes = require('./src/routes/roomTypeRoutes');
const bookingRoutes = require('./src/routes/bookingRoutes');
const customerRoutes = require('./src/routes/customerRoutes');
const customerTypeRoutes = require('./src/routes/customerTypeRoutes');
const invoiceRoutes = require('./src/routes/invoiceRoutes')
const reportRoutes = require('./src/routes/reportRoutes')
const roleRoutes = require('./src/routes/roleRoutes')
// Connect to database
connectDB();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/users', userRoutes);
app.use('/api/rooms', roomRoutes);
app.use('/api/room-types', roomTypeRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/customers', customerRoutes);
app.use('/api/customer-types', customerTypeRoutes);
app.use('/api/invoices',invoiceRoutes)
app.use('/api/reports',reportRoutes)
app.use('/api/roles',roleRoutes)
// Base route
app.get('/', (req, res) => {
    res.json({ message: 'Welcome to Hotel Management API' });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({
        success: false,
        error: 'Route not found'
    });
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);

    // MongoDB Error
    if (err.name === 'MongoError' || err.name === 'MongoServerError') {
        return res.status(400).json({
            success: false,
            error: 'Database operation failed'
        });
    }

    // Validation Error
    if (err.name === 'ValidationError') {
        return res.status(400).json({
            success: false,
            error: err.message
        });
    }

    // JWT Error
    if (err.name === 'JsonWebTokenError') {
        return res.status(401).json({
            success: false,
            error: 'Invalid token'
        });
    }

    // Default Error
    res.status(err.status || 500).json({
        success: false,
        error: err.message || 'Internal server error'
    });
});

// Start server
const PORT = process.env.PORT || 3000;
const server = app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
    console.log('UNHANDLED REJECTION! 💥 Shutting down...');
    console.error(err);
    server.close(() => {
        process.exit(1);
    });
});