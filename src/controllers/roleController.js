const Role = require('../models/Role');
const QueryHelper = require('../utils/QueryHelper')
/**
 * api : /api/roles
 * required permission : all
 * @returns : success status, count (number of records) , total (total number of records), data 
 */
exports.getAllRoles = async (req, res) => {
    try {
        const queryHelper = new QueryHelper(Role.find(),req.query).executeQuery()

        const roles = await queryHelper.query 

        const total = await Role.countDocuments()

        

        res.status(200).json({
            success: true,
            count: roles.length,
            data: roles,
            total
        });
    } catch (error) {
        console.error('Get all roles error:', error);
        res.status(500).json({
            success: false,
            error: 'Server Error'
        });
    }
};

