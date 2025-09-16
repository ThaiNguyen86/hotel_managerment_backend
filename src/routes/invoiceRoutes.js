const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middlewares/auth');
const Permission = require('../models/Permission')
const invoiceController = require('../controllers/invoiceController')

router.use(protect);

router.get('/',authorize(Permission.VIEW_INVOICES),invoiceController.getAllInvoices)

router.post('/',authorize(Permission.CREATE_INVOICES),invoiceController.checkoutInvoice)

module.exports = router;