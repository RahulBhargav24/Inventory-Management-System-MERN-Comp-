import { useState, useEffect, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import {
  FiPlus, FiEdit2, FiTrash2, FiSearch, FiShoppingCart, FiDownload,
} from 'react-icons/fi';
import { toast } from 'react-toastify';
import { orderAPI, productAPI } from '../services/api';
import Modal from '../components/ui/Modal';
import ConfirmDialog from '../components/ui/ConfirmDialog';
import Pagination from '../components/ui/Pagination';
import EmptyState from '../components/ui/EmptyState';
import { PageLoader } from '../components/ui/Spinner';
import Spinner from '../components/ui/Spinner';
import { formatCurrency, formatDate, getOrderStatusBadge, getErrorMessage, downloadCSV } from '../utils/helpers';
import usePagination from '../hooks/usePagination';
import { useAuth } from '../context/AuthContext';

const ORDER_STATUSES = ['pending', 'processing', 'completed', 'cancelled'];

const CreateOrderForm = ({ onSubmit, loading, onClose, products }) => {
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [qty, setQty] = useState(1);
  const { register, handleSubmit, watch, formState: { errors } } = useForm();
  const watchProduct = watch('product');
  const watchQty = watch('quantity', 1);

  useEffect(() => {
    const p = products.find((p) => p._id === watchProduct);
    setSelectedProduct(p || null);
  }, [watchProduct, products]);

  const total = selectedProduct ? selectedProduct.price * (watchQty || 1) : 0;

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">Customer Name *</label>
        <input
          {...register('customerName', { required: 'Customer name is required' })}
          className="input-field"
          placeholder="John Doe"
        />
        {errors.customerName && <p className="text-red-500 text-xs mt-1">{errors.customerName.message}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">Product *</label>
        <select
          {...register('product', { required: 'Product is required' })}
          className="input-field"
        >
          <option value="">Select product</option>
          {products.map((p) => (
            <option key={p._id} value={p._id} disabled={p.quantity === 0}>
              {p.name} — {formatCurrency(p.price)} (Stock: {p.quantity})
            </option>
          ))}
        </select>
        {errors.product && <p className="text-red-500 text-xs mt-1">{errors.product.message}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">Quantity *</label>
        <input
          {...register('quantity', {
            required: 'Quantity is required',
            min: { value: 1, message: 'Minimum quantity is 1' },
            max: selectedProduct ? { value: selectedProduct.quantity, message: `Max stock: ${selectedProduct.quantity}` } : undefined,
          })}
          type="number"
          min={1}
          max={selectedProduct?.quantity}
          className="input-field"
          defaultValue={1}
        />
        {errors.quantity && <p className="text-red-500 text-xs mt-1">{errors.quantity.message}</p>}
      </div>

      {selectedProduct && (
        <div className="bg-emerald-50 rounded-lg p-4">
          <div className="flex justify-between text-sm">
            <span className="text-slate-600">Unit Price:</span>
            <span className="font-medium">{formatCurrency(selectedProduct.price)}</span>
          </div>
          <div className="flex justify-between text-sm mt-1">
            <span className="text-slate-600">Quantity:</span>
            <span className="font-medium">× {watchQty || 1}</span>
          </div>
          <div className="flex justify-between font-bold text-base mt-2 pt-2 border-t border-emerald-200">
            <span>Total Amount:</span>
            <span className="text-emerald-600">{formatCurrency(total)}</span>
          </div>
        </div>
      )}

      <div className="flex gap-3 pt-2">
        <button type="button" onClick={onClose} className="btn-secondary">Cancel</button>
        <button type="submit" disabled={loading} className="btn-primary flex items-center gap-2">
          {loading && <Spinner size="sm" className="border-white border-t-transparent" />}
          Create Order
        </button>
      </div>
    </form>
  );
};

const UpdateStatusForm = ({ order, onSubmit, loading, onClose }) => {
  const { register, handleSubmit } = useForm({ defaultValues: { status: order.status } });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="bg-slate-50 rounded-lg p-4 space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-slate-500">Customer:</span>
          <span className="font-medium">{order.customerName}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-slate-500">Product:</span>
          <span className="font-medium">{order.product?.name}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-slate-500">Total:</span>
          <span className="font-semibold text-emerald-600">{formatCurrency(order.totalAmount)}</span>
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">Order Status</label>
        <select {...register('status')} className="input-field">
          {ORDER_STATUSES.map((s) => (
            <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
          ))}
        </select>
      </div>
      <div className="flex gap-3 pt-2">
        <button type="button" onClick={onClose} className="btn-secondary">Cancel</button>
        <button type="submit" disabled={loading} className="btn-primary flex items-center gap-2">
          {loading && <Spinner size="sm" className="border-white border-t-transparent" />}
          Update Status
        </button>
      </div>
    </form>
  );
};

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [pagination, setPagination] = useState({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [deleteItem, setDeleteItem] = useState(null);
  const { page, limit, goToPage, resetPage } = usePagination();
  const { isAdmin } = useAuth();

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    try {
      const params = { search, page, limit };
      if (filterStatus) params.status = filterStatus;
      const res = await orderAPI.getAll(params);
      setOrders(res.data.data);
      setPagination(res.data.pagination);
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  }, [search, page, limit, filterStatus]);

  const fetchProducts = useCallback(async () => {
    try {
      const res = await productAPI.getAll({ limit: 200 });
      setProducts(res.data.data);
    } catch {}
  }, []);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const handleCreateOrder = async (data) => {
    setSubmitting(true);
    try {
      await orderAPI.create(data);
      toast.success('Order created successfully');
      setModalOpen(false);
      fetchOrders();
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateStatus = async (data) => {
    setSubmitting(true);
    try {
      await orderAPI.update(editItem._id, data);
      toast.success('Order status updated');
      setEditItem(null);
      fetchOrders();
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await orderAPI.delete(deleteItem._id);
      toast.success('Order deleted');
      setDeleteItem(null);
      fetchOrders();
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setDeleting(false);
    }
  };

  const handleExportCSV = () => {
    const data = orders.map((o) => ({
      Customer: o.customerName,
      Product: o.product?.name,
      Quantity: o.quantity,
      Total: o.totalAmount,
      Status: o.status,
      Date: formatDate(o.createdAt),
    }));
    downloadCSV(data, 'orders');
    toast.success('Exported to CSV');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Orders</h1>
          <p className="text-slate-500 text-sm mt-1">Track and manage customer orders</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={handleExportCSV} className="btn-secondary flex items-center gap-2 text-sm">
            <FiDownload className="w-4 h-4" /> Export CSV
          </button>
          <button onClick={() => setModalOpen(true)} className="btn-primary flex items-center gap-2">
            <FiPlus className="w-4 h-4" /> Create Order
          </button>
        </div>
      </div>

      <div className="card">
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[200px]">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
            <input
              type="text"
              value={search}
              onChange={(e) => { setSearch(e.target.value); resetPage(); }}
              placeholder="Search by customer name..."
              className="input-field pl-10"
            />
          </div>
          <select
            value={filterStatus}
            onChange={(e) => { setFilterStatus(e.target.value); resetPage(); }}
            className="input-field w-auto"
          >
            <option value="">All Status</option>
            {ORDER_STATUSES.map((s) => (
              <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="card p-0 overflow-hidden">
        {loading ? (
          <PageLoader />
        ) : orders.length === 0 ? (
          <EmptyState
            title="No orders found"
            description="Create your first order."
            action={
              <button onClick={() => setModalOpen(true)} className="btn-primary flex items-center gap-2">
                <FiPlus className="w-4 h-4" /> Create Order
              </button>
            }
          />
        ) : (
          <>
            <div className="table-container">
              <table className="table">
                <thead>
                  <tr>
                    <th>Customer</th>
                    <th>Product</th>
                    <th>Qty</th>
                    <th>Total</th>
                    <th>Status</th>
                    <th>Date</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((order) => (
                    <tr key={order._id}>
                      <td>
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                            <span className="text-orange-600 text-xs font-bold">
                              {order.customerName.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <span className="font-medium text-slate-900 text-sm">{order.customerName}</span>
                        </div>
                      </td>
                      <td>
                        <div className="flex items-center gap-2">
                          {order.product?.image ? (
                            <img src={order.product.image} alt="" className="w-7 h-7 rounded object-cover" />
                          ) : (
                            <div className="w-7 h-7 bg-slate-100 rounded flex items-center justify-center">
                              <FiShoppingCart className="w-3.5 h-3.5 text-slate-400" />
                            </div>
                          )}
                          <span className="text-sm text-slate-700">{order.product?.name}</span>
                        </div>
                      </td>
                      <td className="text-sm text-slate-700 font-medium">{order.quantity}</td>
                      <td className="font-semibold text-slate-900 text-sm">{formatCurrency(order.totalAmount)}</td>
                      <td>
                        <span className={getOrderStatusBadge(order.status)}>
                          {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                        </span>
                      </td>
                      <td className="text-xs text-slate-400">{formatDate(order.createdAt)}</td>
                      <td>
                        <div className="flex items-center gap-2">
                          {isAdmin && (
                            <button
                              onClick={() => setEditItem(order)}
                              className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                              title="Update Status"
                            >
                              <FiEdit2 className="w-4 h-4" />
                            </button>
                          )}
                          <button
                            onClick={() => setDeleteItem(order)}
                            className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                          >
                            <FiTrash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <Pagination {...pagination} onPageChange={goToPage} />
          </>
        )}
      </div>

      {/* Create Order Modal */}
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Create New Order">
        <CreateOrderForm
          onSubmit={handleCreateOrder}
          loading={submitting}
          onClose={() => setModalOpen(false)}
          products={products}
        />
      </Modal>

      {/* Update Status Modal */}
      <Modal isOpen={!!editItem} onClose={() => setEditItem(null)} title="Update Order Status">
        {editItem && (
          <UpdateStatusForm
            order={editItem}
            onSubmit={handleUpdateStatus}
            loading={submitting}
            onClose={() => setEditItem(null)}
          />
        )}
      </Modal>

      <ConfirmDialog
        isOpen={!!deleteItem}
        onClose={() => setDeleteItem(null)}
        onConfirm={handleDelete}
        loading={deleting}
        title="Delete Order"
        message={`Delete order for "${deleteItem?.customerName}"? This cannot be undone.`}
      />
    </div>
  );
};

export default Orders;
