const mongoose = require('mongoose');
const Role = require('../models/Role');
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv')
const Permission = require('../models/Permission')
const {mockRoomTypeAndRoomData,mockCustomerTypeData} = require('../boot/createMockData')
dotenv.config({path:'../../.env'})

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI.replace('<db_password>',process.env.DB_PASSWORD));
        console.log('MongoDB connected successfully');
        await initializeSystem();
    } catch (error) {
        console.error('MongoDB connection error:', error);
        process.exit(1);
    }
};

const initializeSystem = async () => {
    try {
        /**
         * admin role with full access to web server
         */
        const adminRole = {
            name: 'admin',
            description: 'Administrator with full access',
            permissions: [
                Permission.VIEW_INVOICES,
                Permission.CREATE_INVOICES,
                Permission.CREATE_CUSTOMERTYPES,
                Permission.UPDATE_CUSTOMERTYPES,
                Permission.DELETE_CUSTOMERTYPES ,
                Permission.VIEW_CUSTOMERTYPES ,
                Permission.CREATE_BOOKINGS,
                Permission.CREATE_ROOMS,
                Permission.CREATE_ROOMTYPES,
                Permission.DELETE_BOOKINGS,
                Permission.DELETE_ROOMS,
                Permission.DELETE_ROOMTYPES,
                Permission.MANAGE_ROLES,
                Permission.MANAGE_USERS,
                Permission.UPDATE_BOOKINGS,
                Permission.UPDATE_ROOMS,
                Permission.UPDATE_ROOMTYPES,
                Permission.VIEW_BOOKINGS,
                Permission.VIEW_REPORTS,
                Permission.VIEW_ROOMS,
                Permission.VIEW_ROOMTYPES,
                Permission.CREATE_CUSTOMERS,
                Permission.VIEW_CUSTOMERS,
                Permission.UPDATE_CUSTOMERS,
                Permission.DELETE_CUSTOMERS,

            ]
        };

        /**
         * receptist with limit permision 
         * permisison : view permission, create bookings, update room status,checkout 
         */
        const receptionistRole = {
            name: 'receptionist',
            description: 'Receptionist with limited access, also default role when account created',
            permissions: [
                Permission.VIEW_INVOICES,
                Permission.CREATE_INVOICES,
                Permission.VIEW_CUSTOMERTYPES ,
                Permission.VIEW_ROOMS,
                Permission.CREATE_BOOKINGS,
                Permission.UPDATE_BOOKINGS,
                Permission.DELETE_BOOKINGS,
                Permission.VIEW_BOOKINGS,
                Permission.VIEW_ROOMTYPES,
                Permission.CREATE_CUSTOMERS,
                Permission.VIEW_CUSTOMERS,
                Permission.UPDATE_CUSTOMERS
            ]
        };
        /**
         * Manage role with almost full permissions
         * 
         */
        const managerRole = {
            name: 'manager',
            description: 'Manager role with almost full access',
            permissions: [
                Permission.VIEW_INVOICES,
                Permission.CREATE_INVOICES,
                Permission.CREATE_CUSTOMERTYPES,
                Permission.UPDATE_CUSTOMERTYPES,
                Permission.DELETE_CUSTOMERTYPES ,
                Permission.VIEW_CUSTOMERTYPES ,
                Permission.CREATE_CUSTOMERS,
                Permission.VIEW_CUSTOMERS,
                Permission.UPDATE_CUSTOMERS,
                Permission.DELETE_CUSTOMERS,
                Permission.CREATE_BOOKINGS,
                Permission.CREATE_ROOMS,
                Permission.CREATE_ROOMTYPES,
                Permission.DELETE_BOOKINGS,
                Permission.DELETE_ROOMS,
                Permission.DELETE_ROOMTYPES,
                Permission.MANAGE_ROLES,
                Permission.MANAGE_USERS,
                Permission.UPDATE_BOOKINGS,
                Permission.UPDATE_ROOMS,
                Permission.UPDATE_ROOMTYPES,
                Permission.VIEW_BOOKINGS,
                Permission.VIEW_REPORTS,
                Permission.VIEW_ROOMS,
                Permission.VIEW_ROOMTYPES
            ]
        };

        // Tạo hoặc cập nhật admin role
        const adminRoleDoc = await Role.findOneAndUpdate(
            { name: 'admin' },
            adminRole,  
            { upsert: true, new: true }
        );

        // Tạo hoặc cập nhật user role
        await Role.findOneAndUpdate(
            { name: 'admin' },
            adminRole,
            { upsert: true }
        );
        await Role.findOneAndUpdate(
            { name: 'manager' },
            managerRole,
            { upsert: true }
        );
        await Role.findOneAndUpdate(
            { name: 'receptionist' },
            receptionistRole,
            { upsert: true }
        );

        console.log('Default roles created successfully');

        // Khởi tạo tài khoản admin mặc định
        const defaultAdmins = [
            {
                username: 'admin1',
                password: 'admin1@password',
                fullName: 'Admin One'
            },
            {
                username: 'admin2',
                password: 'admin2@password',
                fullName: 'Admin Two'
            }
        ];

        for (const admin of defaultAdmins) {
            const existingAdmin = await User.findOne({ username: admin.username });
            if (!existingAdmin) {
                const salt = await bcrypt.genSalt(10);
                const hashedPassword = await bcrypt.hash(admin.password, salt);

                await User.create({
                    username: admin.username,
                    password: hashedPassword,
                    fullName: admin.fullName,
                    role: adminRoleDoc._id
                });
                console.log(`Created admin account: ${admin.username}`);
            }
        }

        /**
         * @author pctien 
         * Create default roomtype and room when there is no room or room type available
         * Log to console when data created
        */
        await mockRoomTypeAndRoomData()
        /**
         * @author pctien 
         * Create default roomtype and room when there is no customerType available
         * Log to console when data created
        */
        await mockCustomerTypeData()

    } catch (error) {
        console.error('Error initializing system:', error);
    }
};

module.exports = connectDB;