const Product = require('../models/Product');
const Order = require('../models/Order');
const generateSKU = require('../utils/skuGenerator');

// @desc  Get all products
// @route GET /api/products
exports.getProducts = async (req, res, next) => {
  try {
    const { search, category, supplier, stockStatus, sortBy = 'createdAt', order = 'desc', page = 1, limit = 10 } = req.query;
    const query = {};

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { sku: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }

    if (category) query.category = category;
    if (supplier) query.supplier = supplier;

    if (stockStatus === 'out_of_stock') query.quantity = 0;
    else if (stockStatus === 'low_stock') query.quantity = { $gt: 0, $lt: 10 };
    else if (stockStatus === 'in_stock') query.quantity = { $gte: 10 };

    const total = await Product.countDocuments(query);
    const products = await Product.find(query)
      .populate('category', 'name')
      .populate('supplier', 'name email')
      .sort({ [sortBy]: order === 'asc' ? 1 : -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    res.json({
      success: true,
      data: products,
      pagination: {
        total,
        page: Number(page),
        pages: Math.ceil(total / limit),
        limit: Number(limit),
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc  Create product
// @route POST /api/products
exports.createProduct = async (req, res, next) => {
  try {
    const { name, category, supplier, price, quantity, description } = req.body;
    let { sku } = req.body;

    if (!name || !category || !supplier || price === undefined) {
      return res.status(400).json({ success: false, message: 'Name, category, supplier, and price are required' });
    }

    if (!sku) {
      const Category = require('../models/Category');
      const cat = await Category.findById(category);
      sku = generateSKU(name, cat ? cat.name : 'PRD');
    }

    const productData = { name, category, supplier, sku, price, quantity: quantity || 0, description };
    if (req.file) productData.image = `/uploads/${req.file.filename}`;

    const product = await Product.create(productData);
    const populated = await Product.findById(product._id)
      .populate('category', 'name')
      .populate('supplier', 'name email');

    res.status(201).json({ success: true, data: populated });
  } catch (error) {
    next(error);
  }
};

// @desc  Update product
// @route PUT /api/products/:id
exports.updateProduct = async (req, res, next) => {
  try {
    const updateData = { ...req.body };
    if (req.file) updateData.image = `/uploads/${req.file.filename}`;

    const product = await Product.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      runValidators: true,
    })
      .populate('category', 'name')
      .populate('supplier', 'name email');

    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    res.json({ success: true, data: product });
  } catch (error) {
    next(error);
  }
};

// @desc  Delete product
// @route DELETE /api/products/:id
exports.deleteProduct = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    const orderCount = await Order.countDocuments({ product: req.params.id });
    if (orderCount > 0) {
      return res.status(400).json({
        success: false,
        message: 'This item cannot be deleted because it is currently being used.',
      });
    }

    await product.deleteOne();
    res.json({ success: true, message: 'Product deleted successfully' });
  } catch (error) {
    next(error);
  }
};
