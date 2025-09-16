const Customer = require('../models/Customer');
const CustomerType = require('../models/CustomerType');

/**
 * API endpoint example GET http://localhost:4000/api/customer-types
 * Required role: receptionist, manager, admin
 */
exports.getAllCustomerTypes = async (req, res) => {
    try {
        const total = await CustomerType.countDocuments()
        const customerTypes = await CustomerType.find().sort('name');

        res.status(200).json({
            success: true,
            count: customerTypes.length,
            total,
            data: customerTypes
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'Server Error'
        });
    }
};

// Get single customer type
exports.getCustomerType = async (req, res) => {
    try {
        const customerType = await CustomerType.findById(req.params.id);

        if (!customerType) {
            return res.status(404).json({
                success: false,
                error: 'Customer type not found'
            });
        }

        res.status(200).json({
            success: true,
            data: customerType
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'Server Error'
        });
    }
};

/**
 * API endpoint example POST http://localhost:4000/api/customer-types
 * Required role: manager, admin
 * @param {req.body = {name,coefficient}}
 */
exports.createCustomerType = async (req, res) => {
    try {
        const customerType = await CustomerType.create(req.body);

        res.status(201).json({
            success: true,
            data: customerType
        });
    } catch (error) {
        if (error.code === 11000) {
            return res.status(400).json({
                success: false,
                error: 'Customer type name already exists'
            });
        }
        res.status(500).json({
            success: false,
            error: 'Server Error'
        });
    }
};

/**
 * API endpoint example PATCH http://localhost:4000/api/customer-types/6761956e50ddce926994bbcf
 * Required role: manager, admin
 * @param {customertype_id}
 * @param {req.body = {name,coefficient}}
 */
exports.updateCustomerType = async (req, res) => {
    try {
        const customerType = await CustomerType.findByIdAndUpdate(
            req.params.id,
            req.body,
            {
                new: true,
                runValidators: true
            }
        );

        if (!customerType) {
            return res.status(404).json({
                success: false,
                error: 'Customer type not found'
            });
        }

        res.status(200).json({
            success: true,
            data: customerType
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'Server Error'
        });
    }
};

// Delete customer type (Admin)
/**
 * API endpoint example DELETE http://localhost:4000/api/customer-types/6761956e50ddce926994bbcf
 * Required role: admin, manager
 * @param {id}
 */
exports.deleteCustomerType = async (req, res) => {
    try {
        const customerType = await CustomerType.findById(req.params.id);

        if (!customerType) {
            return res.status(404).json({
                success: false,
                error: 'Customer type not found'
            });
        }

        // Kiểm tra xem có customer nào đang dùng type này không
        const hasCustomers = await Customer.exists({ customerTypeId: req.params.id });
        if (hasCustomers) {
            return res.status(400).json({
                success: false,
                error: 'Cannot delete customer type that has customers'
            });
        }

        await customerType.deleteOne();

        res.status(200).json({
            success: true,
            message: 'Customer type deleted successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'Server Error'
        });
    }
};