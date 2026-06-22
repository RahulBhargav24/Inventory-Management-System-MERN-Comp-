const Order = require('../models/Order');
const Product = require('../models/Product');

// @desc  Get all orders
// @route GET /api/orders
exports.getOrders = async (req, res, next) => {
  try {
    const { search, status, page = 1, limit = 10 } = req.query;
    const query = {};

    if (req.user.role !== 'admin') {
      query.createdBy = req.user._id;
    }

    if (search) {
      query.customerName = { $regex: search, $options: 'i' };
    }

    if (status) query.status = status;

    const total = await Order.countDocuments(query);
    const orders = await Order.find(query)
      .populate('product', 'name sku price image')
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    res.json({
      success: true,
      data: orders,
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

// @desc  Create order
// @route POST /api/orders
exports.createOrder = async (req, res, next) => {
  try {
    const { product: productId, customerName, quantity } = req.body;

    if (!productId || !customerName || !quantity) {
      return res.status(400).json({ success: false, message: 'Product, customer name, and quantity are required' });
    }

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    if (product.quantity < quantity) {
      return res.status(400).json({ success: false, message: `Insufficient stock. Available: ${product.quantity}` });
    }

    const totalAmount = product.price * quantity;

    const order = await Order.create({
      product: productId,
      customerName,
      quantity,
      totalAmount,
      createdBy: req.user._id,
    });

    product.quantity -= quantity;
    await product.save();

    const populated = await Order.findById(order._id)
      .populate('product', 'name sku price image')
      .populate('createdBy', 'name email');

    res.status(201).json({ success: true, data: populated });
  } catch (error) {
    next(error);
  }
};

// @desc  Update order
// @route PUT /api/orders/:id
exports.updateOrder = async (req, res, next) => {
  try {
    const { status } = req.body;

    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true, runValidators: true }
    )
      .populate('product', 'name sku price image')
      .populate('createdBy', 'name email');

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    res.json({ success: true, data: order });
  } catch (error) {
    next(error);
  }
};

// @desc  Delete order
// @route DELETE /api/orders/:id
exports.deleteOrder = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    if (req.user.role !== 'admin' && order.createdBy?.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized to delete this order' });
    }

    await order.deleteOne();
    res.json({ success: true, message: 'Order deleted successfully' });
  } catch (error) {
    next(error);
  }
};
