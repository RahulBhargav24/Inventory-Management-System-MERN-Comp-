import { useState, useEffect, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { FiPlus, FiEdit2, FiTrash2, FiSearch, FiTruck, FiMail, FiPhone } from 'react-icons/fi';
import { toast } from 'react-toastify';
import { supplierAPI } from '../services/api';
import Modal from '../components/ui/Modal';
import ConfirmDialog from '../components/ui/ConfirmDialog';
import Pagination from '../components/ui/Pagination';
import EmptyState from '../components/ui/EmptyState';
import { PageLoader } from '../components/ui/Spinner';
import Spinner from '../components/ui/Spinner';
import { formatDate, getErrorMessage } from '../utils/helpers';
import usePagination from '../hooks/usePagination';

const SupplierForm = ({ defaultValues, onSubmit, loading, onClose }) => {
  const { register, handleSubmit, formState: { errors } } = useForm({ defaultValues });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">Supplier Name *</label>
        <input
          {...register('name', { required: 'Name is required' })}
          className="input-field"
          placeholder="Supplier name"
        />
        {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">Email *</label>
        <input
          {...register('email', {
            required: 'Email is required',
            pattern: { value: /^\S+@\S+\.\S+$/, message: 'Invalid email' },
          })}
          type="email"
          className="input-field"
          placeholder="supplier@example.com"
        />
        {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">Phone *</label>
        <input
          {...register('phone', { required: 'Phone is required' })}
          className="input-field"
          placeholder="+1 234 567 8900"
        />
        {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone.message}</p>}
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">Address</label>
        <textarea
          {...register('address')}
          className="input-field resize-none"
          rows={2}
          placeholder="Supplier address..."
        />
      </div>
      <div className="flex gap-3 pt-2">
        <button type="button" onClick={onClose} className="btn-secondary">Cancel</button>
        <button type="submit" disabled={loading} className="btn-primary flex items-center gap-2">
          {loading && <Spinner size="sm" className="border-white border-t-transparent" />}
          {defaultValues ? 'Update Supplier' : 'Add Supplier'}
        </button>
      </div>
    </form>
  );
};

const Suppliers = () => {
  const [suppliers, setSuppliers] = useState([]);
  const [pagination, setPagination] = useState({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [deleteItem, setDeleteItem] = useState(null);
  const { page, limit, goToPage, resetPage } = usePagination();

  const fetchSuppliers = useCallback(async () => {
    setLoading(true);
    try {
      const res = await supplierAPI.getAll({ search, page, limit });
      setSuppliers(res.data.data);
      setPagination(res.data.pagination);
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  }, [search, page, limit]);

  useEffect(() => {
    fetchSuppliers();
  }, [fetchSuppliers]);

  const handleSearchChange = (e) => {
    setSearch(e.target.value);
    resetPage();
  };

  const openCreate = () => {
    setEditItem(null);
    setModalOpen(true);
  };

  const openEdit = (supplier) => {
    setEditItem(supplier);
    setModalOpen(true);
  };

  const handleSubmit = async (data) => {
    setSubmitting(true);
    try {
      if (editItem) {
        await supplierAPI.update(editItem._id, data);
        toast.success('Supplier updated successfully');
      } else {
        await supplierAPI.create(data);
        toast.success('Supplier added successfully');
      }
      setModalOpen(false);
      fetchSuppliers();
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await supplierAPI.delete(deleteItem._id);
      toast.success('Supplier deleted successfully');
      setDeleteItem(null);
      fetchSuppliers();
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Suppliers</h1>
          <p className="text-slate-500 text-sm mt-1">Manage your product suppliers</p>
        </div>
        <button onClick={openCreate} className="btn-primary flex items-center gap-2">
          <FiPlus className="w-4 h-4" />
          Add Supplier
        </button>
      </div>

      <div className="card">
        <div className="relative max-w-sm">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
          <input
            type="text"
            value={search}
            onChange={handleSearchChange}
            placeholder="Search suppliers..."
            className="input-field pl-10"
          />
        </div>
      </div>

      <div className="card p-0 overflow-hidden">
        {loading ? (
          <PageLoader />
        ) : suppliers.length === 0 ? (
          <EmptyState
            title="No suppliers found"
            description={search ? 'Try a different search.' : 'Add your first supplier.'}
            action={!search && (
              <button onClick={openCreate} className="btn-primary flex items-center gap-2">
                <FiPlus className="w-4 h-4" /> Add Supplier
              </button>
            )}
          />
        ) : (
          <>
            <div className="table-container">
              <table className="table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Supplier</th>
                    <th>Email</th>
                    <th>Phone</th>
                    <th>Address</th>
                    <th>Created</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {suppliers.map((sup, idx) => (
                    <tr key={sup._id}>
                      <td className="text-slate-400 text-xs">{(page - 1) * limit + idx + 1}</td>
                      <td>
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 bg-teal-100 rounded-lg flex items-center justify-center">
                            <FiTruck className="w-4 h-4 text-teal-600" />
                          </div>
                          <span className="font-medium text-slate-900">{sup.name}</span>
                        </div>
                      </td>
                      <td>
                        <div className="flex items-center gap-1 text-slate-500 text-sm">
                          <FiMail className="w-3.5 h-3.5" />
                          {sup.email}
                        </div>
                      </td>
                      <td>
                        <div className="flex items-center gap-1 text-slate-500 text-sm">
                          <FiPhone className="w-3.5 h-3.5" />
                          {sup.phone}
                        </div>
                      </td>
                      <td className="text-slate-500 text-sm max-w-xs truncate">
                        {sup.address || <span className="text-slate-300">—</span>}
                      </td>
                      <td className="text-slate-500 text-xs">{formatDate(sup.createdAt)}</td>
                      <td>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => openEdit(sup)}
                            className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                          >
                            <FiEdit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setDeleteItem(sup)}
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

      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editItem ? 'Edit Supplier' : 'Add Supplier'}
      >
        <SupplierForm
          defaultValues={editItem ? { name: editItem.name, email: editItem.email, phone: editItem.phone, address: editItem.address } : undefined}
          onSubmit={handleSubmit}
          loading={submitting}
          onClose={() => setModalOpen(false)}
        />
      </Modal>

      <ConfirmDialog
        isOpen={!!deleteItem}
        onClose={() => setDeleteItem(null)}
        onConfirm={handleDelete}
        loading={deleting}
        title="Delete Supplier"
        message={`Are you sure you want to delete "${deleteItem?.name}"?`}
      />
    </div>
  );
};

export default Suppliers;
