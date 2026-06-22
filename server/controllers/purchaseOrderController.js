const PurchaseOrder = require('../models/PurchaseOrder');
const Product = require('../models/Product');

// @desc  Get all purchase orders
// @route GET /api/purchase-orders
exports.getPurchaseOrders = async (req, res, next) => {
  try {
    const { search, status, supplier, page = 1, limit = 10 } = req.query;
    const query = {};

    if (status) query.status = status;
    if (supplier) query.supplier = supplier;

    const total = await PurchaseOrder.countDocuments(query);
    const orders = await PurchaseOrder.find(query)
      .populate('supplier', 'name email phone')
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

// @desc  Create purchase order
// @route POST /api/purchase-orders
exports.createPurchaseOrder = async (req, res, next) => {
  try {
    const { supplier, product, quantity, unitCost, expectedDate, notes } = req.body;

    if (!supplier || !product || !quantity || !unitCost) {
      return res.status(400).json({
        success: false,
        message: 'Supplier, product, quantity, and unit cost are required',
      });
    }

    const totalCost = quantity * unitCost;

    const order = await PurchaseOrder.create({
      supplier,
      product,
      quantity,
      unitCost,
      totalCost,
      expectedDate,
      notes,
      createdBy: req.user._id,
    });

    const populated = await PurchaseOrder.findById(order._id)
      .populate('supplier', 'name email phone')
      .populate('product', 'name sku price image')
      .populate('createdBy', 'name email');

    res.status(201).json({ success: true, data: populated });
  } catch (error) {
    next(error);
  }
};

// @desc  Update purchase order
// @route PUT /api/purchase-orders/:id
exports.updatePurchaseOrder = async (req, res, next) => {
  try {
    const { status, quantity, unitCost, expectedDate, notes } = req.body;
    const existing = await PurchaseOrder.findById(req.params.id);

    if (!existing) {
      return res.status(404).json({ success: false, message: 'Purchase order not found' });
    }

    const updateData = { status, expectedDate, notes };

    // When status changes to 'received', update product stock
    if (status === 'received' && existing.status !== 'received') {
      const qty = quantity || existing.quantity;
      await Product.findByIdAndUpdate(existing.product, {
        $inc: { quantity: qty },
      });
      updateData.receivedBy = req.user._id;
    }

    const order = await PurchaseOrder.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      runValidators: true,
    })
      .populate('supplier', 'name email phone')
      .populate('product', 'name sku price image')
      .populate('createdBy', 'name email');

    res.json({ success: true, data: order });
  } catch (error) {
    next(error);
  }
};

// @desc  Delete purchase order
// @route DELETE /api/purchase-orders/:id
exports.deletePurchaseOrder = async (req, res, next) => {
  try {
    const order = await PurchaseOrder.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ success: false, message: 'Purchase order not found' });
    }

    if (order.status === 'received') {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete a received purchase order.',
      });
    }

    await order.deleteOne();
    res.json({ success: true, message: 'Purchase order deleted successfully' });
  } catch (error) {
    next(error);
  }
};
