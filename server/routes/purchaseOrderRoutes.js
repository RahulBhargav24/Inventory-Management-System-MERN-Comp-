const express = require('express');
const router = express.Router();
const {
  getPurchaseOrders,
  createPurchaseOrder,
  updatePurchaseOrder,
  deletePurchaseOrder,
} = require('../controllers/purchaseOrderController');
const { protect, adminOnly } = require('../middleware/auth');

router.route('/').get(protect, adminOnly, getPurchaseOrders).post(protect, adminOnly, createPurchaseOrder);
router.route('/:id').put(protect, adminOnly, updatePurchaseOrder).delete(protect, adminOnly, deletePurchaseOrder);

module.exports = router;
