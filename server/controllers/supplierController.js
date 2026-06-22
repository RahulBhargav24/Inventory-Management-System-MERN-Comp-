const Supplier = require('../models/Supplier');
const Product = require('../models/Product');

// @desc  Get all suppliers
// @route GET /api/suppliers
exports.getSuppliers = async (req, res, next) => {
  try {
    const { search, page = 1, limit = 10 } = req.query;
    const query = {};

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } },
      ];
    }

    const total = await Supplier.countDocuments(query);
    const suppliers = await Supplier.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    res.json({
      success: true,
      data: suppliers,
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

// @desc  Create supplier
// @route POST /api/suppliers
exports.createSupplier = async (req, res, next) => {
  try {
    const { name, email, phone, address } = req.body;

    if (!name || !email || !phone) {
      return res.status(400).json({ success: false, message: 'Name, email, and phone are required' });
    }

    const supplier = await Supplier.create({ name, email, phone, address });
    res.status(201).json({ success: true, data: supplier });
  } catch (error) {
    next(error);
  }
};

// @desc  Update supplier
// @route PUT /api/suppliers/:id
exports.updateSupplier = async (req, res, next) => {
  try {
    const supplier = await Supplier.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!supplier) {
      return res.status(404).json({ success: false, message: 'Supplier not found' });
    }

    res.json({ success: true, data: supplier });
  } catch (error) {
    next(error);
  }
};

// @desc  Delete supplier
// @route DELETE /api/suppliers/:id
exports.deleteSupplier = async (req, res, next) => {
  try {
    const supplier = await Supplier.findById(req.params.id);

    if (!supplier) {
      return res.status(404).json({ success: false, message: 'Supplier not found' });
    }

    const productCount = await Product.countDocuments({ supplier: req.params.id });
    if (productCount > 0) {
      return res.status(400).json({
        success: false,
        message: 'This item cannot be deleted because it is currently being used.',
      });
    }

    await supplier.deleteOne();
    res.json({ success: true, message: 'Supplier deleted successfully' });
  } catch (error) {
    next(error);
  }
};
