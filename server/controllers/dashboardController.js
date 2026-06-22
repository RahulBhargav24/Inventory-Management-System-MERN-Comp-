const Product = require('../models/Product');
const Category = require('../models/Category');
const Supplier = require('../models/Supplier');
const Order = require('../models/Order');
const PurchaseOrder = require('../models/PurchaseOrder');

// @desc  Get dashboard statistics
// @route GET /api/dashboard/stats
exports.getDashboardStats = async (req, res, next) => {
  try {
    const [totalProducts, totalCategories, totalSuppliers, totalOrders, outOfStock, lowStock, revenueData, totalPurchaseOrders, pendingPurchaseOrders] =
      await Promise.all([
        Product.countDocuments(),
        Category.countDocuments(),
        Supplier.countDocuments(),
        Order.countDocuments(),
        Product.countDocuments({ quantity: 0 }),
        Product.countDocuments({ quantity: { $gt: 0, $lt: 10 } }),
        Order.aggregate([
          { $match: { status: { $in: ['completed', 'processing'] } } },
          { $group: { _id: null, total: { $sum: '$totalAmount' } } },
        ]),
        PurchaseOrder.countDocuments(),
        PurchaseOrder.countDocuments({ status: { $in: ['draft', 'ordered'] } }),
      ]);

    const revenue = revenueData.length > 0 ? revenueData[0].total : 0;

    const recentOrders = await Order.find()
      .populate('product', 'name sku price image')
      .populate('createdBy', 'name')
      .sort({ createdAt: -1 })
      .limit(5);

    const recentProducts = await Product.find()
      .populate('category', 'name')
      .populate('supplier', 'name')
      .sort({ createdAt: -1 })
      .limit(5);

    // Monthly orders for the past 6 months
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
    sixMonthsAgo.setDate(1);
    sixMonthsAgo.setHours(0, 0, 0, 0);

    const monthlyOrders = await Order.aggregate([
      { $match: { createdAt: { $gte: sixMonthsAgo } } },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' },
          },
          count: { $sum: 1 },
          revenue: { $sum: '$totalAmount' },
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
    ]);

    // Category distribution
    const categoryDistribution = await Product.aggregate([
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 },
        },
      },
      {
        $lookup: {
          from: 'categories',
          localField: '_id',
          foreignField: '_id',
          as: 'category',
        },
      },
      { $unwind: '$category' },
      {
        $project: {
          name: '$category.name',
          count: 1,
        },
      },
      { $sort: { count: -1 } },
      { $limit: 8 },
    ]);

    res.json({
      success: true,
      data: {
        stats: {
          totalProducts,
          totalCategories,
          totalSuppliers,
          totalOrders,
          revenue,
          outOfStock,
          lowStock,
          totalPurchaseOrders,
          pendingPurchaseOrders,
        },
        recentOrders,
        recentProducts,
        monthlyOrders,
        categoryDistribution,
      },
    });
  } catch (error) {
    next(error);
  }
};
