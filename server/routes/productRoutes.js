const express = require('express');
const router = express.Router();
const { getProducts, createProduct, updateProduct, deleteProduct } = require('../controllers/productController');
const { protect, adminOnly } = require('../middleware/auth');
const upload = require('../middleware/upload');

router.route('/').get(protect, getProducts).post(protect, adminOnly, upload.single('image'), createProduct);
router.route('/:id').put(protect, adminOnly, upload.single('image'), updateProduct).delete(protect, adminOnly, deleteProduct);

module.exports = router;
