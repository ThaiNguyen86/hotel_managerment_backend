const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middlewares/auth');
const Permission = require('../models/Permission')
const {
    getAllCustomers,
    getCustomer,
    createCustomer,
    updateCustomer,
    deleteCustomer
} = require('../controllers/customerController');

router.use(protect);

router.post('/',authorize(Permission.CREATE_CUSTOMERS),createCustomer);
router.get('/:id',authorize(Permission.VIEW_CUSTOMERS),getCustomer);

router.get('/',authorize(Permission.VIEW_CUSTOMERS), getAllCustomers);
router.patch('/:id',authorize(Permission.UPDATE_CUSTOMERS), updateCustomer);
router.delete('/:id',authorize(Permission.DELETE_CUSTOMERS), deleteCustomer);

module.exports = router;