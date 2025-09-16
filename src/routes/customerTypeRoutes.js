// routes/customerTypeRoutes.js
const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middlewares/auth');
const {
    getAllCustomerTypes,
    getCustomerType,
    createCustomerType,
    updateCustomerType,
    deleteCustomerType
} = require('../controllers/customerTypeController');
const Permissison = require('../models/Permission')

router.use(protect);

// Public routes
router.get('/',authorize(Permissison.VIEW_CUSTOMERTYPES), getAllCustomerTypes);
router.get('/:id',authorize(Permissison.VIEW_CUSTOMERTYPES), getCustomerType);

// Admin routes

router.post('/',authorize(Permissison.CREATE_CUSTOMERTYPES), createCustomerType);
router.patch('/:id',authorize(Permissison.UPDATE_CUSTOMERTYPES), updateCustomerType);
router.delete('/:id',authorize(Permissison.DELETE_CUSTOMERTYPES), deleteCustomerType);

module.exports = router;