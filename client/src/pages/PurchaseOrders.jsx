import { useState, useEffect, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import {
  FiPlus, FiEdit2, FiTrash2, FiSearch, FiClipboard, FiDownload,
  FiTruck, FiCheckCircle, FiXCircle, FiClock,
} from 'react-icons/fi';
import { toast } from 'react-toastify';
import { purchaseOrderAPI, supplierAPI, productAPI } from '../services/api';
import Modal from '../components/ui/Modal';
import ConfirmDialog from '../components/ui/ConfirmDialog';
import Pagination from '../components/ui/Pagination';
import EmptyState from '../components/ui/EmptyState';
import { PageLoader } from '../components/ui/Spinner';
import Spinner from '../components/ui/Spinner';
import { formatCurrency, formatDate, getErrorMessage, downloadCSV } from '../utils/helpers';
import usePagination from '../hooks/usePagination';

const STATUSES = [
  { value: 'draft', label: 'Draft', icon: FiClock, color: 'text-slate-500 bg-slate-100' },
  { value: 'ordered', label: 'Ordered', icon: FiClipboard, color: 'text-blue-600 bg-blue-50' },
  { value: 'received', label: 'Received', icon: FiCheckCircle, color: 'text-emerald-600 bg-emerald-50' },
  { value: 'cancelled', label: 'Cancelled', icon: FiXCircle, color: 'text-rose-600 bg-rose-50' },
];

const statusMeta = (status) => STATUSES.find((s) => s.value === status) || STATUSES[0];

const PurchaseOrderForm = ({ defaultValues, onSubmit, loading, onClose, suppliers, products }) => {
  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm({ defaultValues });
  const watchProduct = watch('product');
  const watchQty = watch('quantity', 1);
  const watchCost = watch('unitCost', 0);
  const selectedProduct = products.find((p) => p._id === watchProduct);
  const total = (watchQty || 0) * (watchCost || 0);

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Supplier *</label>
          <select {...register('supplier', { required: 'Supplier is required' })} className="input-field">
            <option value="">Select supplier</option>
            {suppliers.map((s) => <option key={s._id} value={s._id}>{s.name}</option>)}
          </select>
          {errors.supplier && <p className="text-rose-500 text-xs mt-1">{errors.supplier.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Product *</label>
          <select {...register('product', { required: 'Product is required' })} className="input-field">
            <option value="">Select product</option>
            {products.map((p) => (
              <option key={p._id} value={p._id}>{p.name} (SKU: {p.sku})</option>
            ))}
          </select>
          {errors.product && <p className="text-rose-500 text-xs mt-1">{errors.product.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Quantity *</label>
          <input
            {...register('quantity', { required: 'Quantity is required', min: { value: 1, message: 'Min 1' } })}
            type="number" min={1} className="input-field" placeholder="0"
          />
          {errors.quantity && <p className="text-rose-500 text-xs mt-1">{errors.quantity.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Unit Cost ($) *</label>
          <input
            {...register('unitCost', { required: 'Unit cost is required', min: { value: 0, message: 'Must be positive' } })}
            type="number" step="0.01" className="input-field" placeholder="0.00"
          />
          {errors.unitCost && <p className="text-rose-500 text-xs mt-1">{errors.unitCost.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Expected Delivery</label>
          <input {...register('expectedDate')} type="date" className="input-field" />
        </div>

        <div className="flex items-end">
          <div className="w-full bg-emerald-50 border border-emerald-100 rounded-lg p-3">
            <p className="text-xs text-emerald-600 font-medium">Total Cost</p>
            <p className="text-xl font-bold text-emerald-700 mt-0.5">{formatCurrency(total)}</p>
          </div>
        </div>

        <div className="sm:col-span-2">
          <label className="block text-sm font-medium text-slate-700 mb-1">Notes</label>
          <textarea {...register('notes')} className="input-field resize-none" rows={2} placeholder="Additional notes..." />
        </div>
      </div>

      <div className="flex gap-3 pt-2">
        <button type="button" onClick={onClose} className="btn-secondary">Cancel</button>
        <button type="submit" disabled={loading} className="btn-primary flex items-center gap-2">
          {loading && <Spinner size="sm" className="border-white border-t-transparent" />}
          {defaultValues?._id ? 'Update Order' : 'Create Order'}
        </button>
      </div>
    </form>
  );
};

const UpdateStatusForm = ({ order, onSubmit, loading, onClose }) => {
  const { register, handleSubmit } = useForm({ defaultValues: { status: order.status } });
  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="bg-slate-50 rounded-xl p-4 space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-slate-500">Supplier</span>
          <span className="font-medium text-slate-800">{order.supplier?.name}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-slate-500">Product</span>
          <span className="font-medium text-slate-800">{order.product?.name}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-slate-500">Quantity</span>
          <span className="font-medium text-slate-800">{order.quantity} units</span>
        </div>
        <div className="flex justify-between text-sm font-bold border-t border-slate-200 pt-2 mt-2">
          <span className="text-slate-600">Total Cost</span>
          <span className="text-emerald-600">{formatCurrency(order.totalCost)}</span>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-2">Update Status</label>
        <div className="grid grid-cols-2 gap-2">
          {STATUSES.map(({ value, label, icon: Icon, color }) => (
            <label key={value} className="cursor-pointer">
              <input type="radio" {...register('status')} value={value} className="sr-only peer" />
              <div className={`flex items-center gap-2 p-3 rounded-lg border-2 transition-all peer-checked:border-emerald-500 peer-checked:bg-emerald-50 border-slate-200 hover:border-slate-300`}>
                <Icon className={`w-4 h-4 ${color.split(' ')[0]}`} />
                <span className="text-sm font-medium text-slate-700">{label}</span>
              </div>
            </label>
          ))}
        </div>
        <p className="text-xs text-amber-600 mt-2">Note: Setting to "Received" will add quantity to product stock.</p>
      </div>

      <div className="flex gap-3">
        <button type="button" onClick={onClose} className="btn-secondary">Cancel</button>
        <button type="submit" disabled={loading} className="btn-primary flex items-center gap-2">
          {loading && <Spinner size="sm" className="border-white border-t-transparent" />}
          Update Status
        </button>
      </div>
    </form>
  );
};

const PurchaseOrders = () => {
  const [orders, setOrders] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [products, setProducts] = useState([]);
  const [pagination, setPagination] = useState({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [filterStatus, setFilterStatus] = useState('');
  const [filterSupplier, setFilterSupplier] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [deleteItem, setDeleteItem] = useState(null);
  const { page, limit, goToPage, resetPage } = usePagination();

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page, limit };
      if (filterStatus) params.status = filterStatus;
      if (filterSupplier) params.supplier = filterSupplier;
      const res = await purchaseOrderAPI.getAll(params);
      setOrders(res.data.data);
      setPagination(res.data.pagination);
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  }, [page, limit, filterStatus, filterSupplier]);

  const fetchDropdowns = useCallback(async () => {
    try {
      const [supRes, prodRes] = await Promise.all([
        supplierAPI.getAll({ limit: 200 }),
        productAPI.getAll({ limit: 200 }),
      ]);
      setSuppliers(supRes.data.data);
      setProducts(prodRes.data.data);
    } catch {}
  }, []);

  useEffect(() => { fetchOrders(); }, [fetchOrders]);
  useEffect(() => { fetchDropdowns(); }, [fetchDropdowns]);

  const handleCreate = async (data) => {
    setSubmitting(true);
    try {
      await purchaseOrderAPI.create(data);
      toast.success('Purchase order created');
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
      await purchaseOrderAPI.update(editItem._id, data);
      toast.success('Purchase order updated');
      if (data.status === 'received') toast.info('Product stock has been updated');
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
      await purchaseOrderAPI.delete(deleteItem._id);
      toast.success('Purchase order deleted');
      setDeleteItem(null);
      fetchOrders();
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setDeleting(false);
    }
  };

  const exportCSV = () => {
    const data = orders.map((o) => ({
      Supplier: o.supplier?.name,
      Product: o.product?.name,
      SKU: o.product?.sku,
      Quantity: o.quantity,
      'Unit Cost': o.unitCost,
      'Total Cost': o.totalCost,
      Status: o.status,
      'Expected Date': o.expectedDate ? formatDate(o.expectedDate) : '',
      Created: formatDate(o.createdAt),
    }));
    downloadCSV(data, 'purchase-orders');
    toast.success('Exported to CSV');
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-xl font-bold text-slate-800">Purchase Orders</h1>
          <p className="text-slate-400 text-sm mt-0.5">Manage orders placed to suppliers</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={exportCSV} className="btn-secondary text-sm flex items-center gap-2">
            <FiDownload className="w-4 h-4" /> Export
          </button>
          <button onClick={() => setModalOpen(true)} className="btn-primary flex items-center gap-2">
            <FiPlus className="w-4 h-4" /> New Purchase Order
          </button>
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {STATUSES.map(({ value, label, icon: Icon, color }) => {
          const count = orders.filter((o) => o.status === value).length;
          return (
            <button
              key={value}
              onClick={() => { setFilterStatus(filterStatus === value ? '' : value); resetPage(); }}
              className={`bg-white rounded-xl border p-4 text-left transition-all hover:shadow-md ${filterStatus === value ? 'border-emerald-400 ring-1 ring-emerald-300' : 'border-slate-200'}`}
            >
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center mb-3 ${color}`}>
                <Icon className="w-4 h-4" />
              </div>
              <p className="text-2xl font-bold text-slate-800">{count}</p>
              <p className="text-xs text-slate-500 mt-0.5">{label}</p>
            </button>
          );
        })}
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-slate-200 px-4 py-3 flex flex-wrap items-center gap-3">
        <select
          value={filterStatus}
          onChange={(e) => { setFilterStatus(e.target.value); resetPage(); }}
          className="input-field w-auto text-sm"
        >
          <option value="">All Statuses</option>
          {STATUSES.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
        </select>
        <select
          value={filterSupplier}
          onChange={(e) => { setFilterSupplier(e.target.value); resetPage(); }}
          className="input-field w-auto text-sm"
        >
          <option value="">All Suppliers</option>
          {suppliers.map((s) => <option key={s._id} value={s._id}>{s.name}</option>)}
        </select>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        {loading ? (
          <PageLoader />
        ) : orders.length === 0 ? (
          <EmptyState
            title="No purchase orders"
            description="Create your first purchase order to restock inventory."
            action={
              <button onClick={() => setModalOpen(true)} className="btn-primary flex items-center gap-2">
                <FiPlus className="w-4 h-4" /> New Purchase Order
              </button>
            }
          />
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="table">
                <thead>
                  <tr>
                    <th>Supplier</th>
                    <th>Product</th>
                    <th>Qty</th>
                    <th>Unit Cost</th>
                    <th>Total Cost</th>
                    <th>Status</th>
                    <th>Expected</th>
                    <th>Created</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((order) => {
                    const meta = statusMeta(order.status);
                    return (
                      <tr key={order._id}>
                        <td>
                          <div className="flex items-center gap-2">
                            <div className="w-7 h-7 bg-teal-50 rounded-lg flex items-center justify-center flex-shrink-0">
                              <FiTruck className="w-3.5 h-3.5 text-teal-600" />
                            </div>
                            <div>
                              <p className="text-sm font-medium text-slate-800">{order.supplier?.name}</p>
                              <p className="text-xs text-slate-400">{order.supplier?.email}</p>
                            </div>
                          </div>
                        </td>
                        <td>
                          <p className="text-sm font-medium text-slate-700">{order.product?.name}</p>
                          <p className="text-xs font-mono text-slate-400">{order.product?.sku}</p>
                        </td>
                        <td className="text-sm font-semibold text-slate-700">{order.quantity}</td>
                        <td className="text-sm text-slate-600">{formatCurrency(order.unitCost)}</td>
                        <td className="text-sm font-bold text-slate-800">{formatCurrency(order.totalCost)}</td>
                        <td>
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${meta.color}`}>
                            <meta.icon className="w-3 h-3" />
                            {meta.label}
                          </span>
                        </td>
                        <td className="text-xs text-slate-500">
                          {order.expectedDate ? formatDate(order.expectedDate) : '—'}
                        </td>
                        <td className="text-xs text-slate-400">{formatDate(order.createdAt)}</td>
                        <td>
                          <div className="flex items-center gap-1.5">
                            {order.status !== 'received' && order.status !== 'cancelled' && (
                              <button
                                onClick={() => setEditItem(order)}
                                className="icon-btn-edit"
                              >
                                <FiEdit2 className="w-4 h-4" />
                              </button>
                            )}
                            <button
                              onClick={() => setDeleteItem(order)}
                              disabled={order.status === 'received'}
                              className="icon-btn-delete disabled:opacity-30 disabled:cursor-not-allowed"
                            >
                              <FiTrash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <Pagination {...pagination} onPageChange={goToPage} />
          </>
        )}
      </div>

      {/* Create Modal */}
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="New Purchase Order" size="lg">
        <PurchaseOrderForm
          onSubmit={handleCreate}
          loading={submitting}
          onClose={() => setModalOpen(false)}
          suppliers={suppliers}
          products={products}
        />
      </Modal>

      {/* Update Status Modal */}
      <Modal isOpen={!!editItem} onClose={() => setEditItem(null)} title="Update Purchase Order">
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
        title="Delete Purchase Order"
        message={`Delete the purchase order for "${deleteItem?.product?.name}"?`}
      />
    </div>
  );
};

export default PurchaseOrders;
