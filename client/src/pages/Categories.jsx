import { useState, useEffect, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { FiPlus, FiEdit2, FiTrash2, FiSearch, FiTag } from 'react-icons/fi';
import { toast } from 'react-toastify';
import { categoryAPI } from '../services/api';
import Modal from '../components/ui/Modal';
import ConfirmDialog from '../components/ui/ConfirmDialog';
import Pagination from '../components/ui/Pagination';
import EmptyState from '../components/ui/EmptyState';
import { PageLoader } from '../components/ui/Spinner';
import Spinner from '../components/ui/Spinner';
import { formatDate, getErrorMessage } from '../utils/helpers';
import usePagination from '../hooks/usePagination';

const CategoryForm = ({ defaultValues, onSubmit, loading }) => {
  const { register, handleSubmit, formState: { errors } } = useForm({ defaultValues });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">Category Name *</label>
        <input
          {...register('name', { required: 'Name is required' })}
          className="input-field"
          placeholder="e.g. Electronics"
        />
        {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
        <textarea
          {...register('description')}
          className="input-field resize-none"
          rows={3}
          placeholder="Optional description..."
        />
      </div>
      <div className="flex gap-3 pt-2">
        <button type="submit" disabled={loading} className="btn-primary flex items-center gap-2">
          {loading && <Spinner size="sm" className="border-white border-t-transparent" />}
          {defaultValues ? 'Update Category' : 'Create Category'}
        </button>
      </div>
    </form>
  );
};

const Categories = () => {
  const [categories, setCategories] = useState([]);
  const [pagination, setPagination] = useState({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [deleteItem, setDeleteItem] = useState(null);
  const { page, limit, goToPage, resetPage } = usePagination();

  const fetchCategories = useCallback(async () => {
    setLoading(true);
    try {
      const res = await categoryAPI.getAll({ search, page, limit });
      setCategories(res.data.data);
      setPagination(res.data.pagination);
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  }, [search, page, limit]);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const handleSearchChange = (e) => {
    setSearch(e.target.value);
    resetPage();
  };

  const openCreate = () => {
    setEditItem(null);
    setModalOpen(true);
  };

  const openEdit = (category) => {
    setEditItem(category);
    setModalOpen(true);
  };

  const handleSubmit = async (data) => {
    setSubmitting(true);
    try {
      if (editItem) {
        await categoryAPI.update(editItem._id, data);
        toast.success('Category updated successfully');
      } else {
        await categoryAPI.create(data);
        toast.success('Category created successfully');
      }
      setModalOpen(false);
      fetchCategories();
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await categoryAPI.delete(deleteItem._id);
      toast.success('Category deleted successfully');
      setDeleteItem(null);
      fetchCategories();
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Categories</h1>
          <p className="text-slate-500 text-sm mt-1">Manage your product categories</p>
        </div>
        <button onClick={openCreate} className="btn-primary flex items-center gap-2">
          <FiPlus className="w-4 h-4" />
          Add Category
        </button>
      </div>

      {/* Search */}
      <div className="card">
        <div className="relative max-w-sm">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
          <input
            type="text"
            value={search}
            onChange={handleSearchChange}
            placeholder="Search categories..."
            className="input-field pl-10"
          />
        </div>
      </div>

      {/* Table */}
      <div className="card p-0 overflow-hidden">
        {loading ? (
          <PageLoader />
        ) : categories.length === 0 ? (
          <EmptyState
            title="No categories found"
            description={search ? 'Try a different search term.' : 'Create your first category.'}
            action={
              !search && (
                <button onClick={openCreate} className="btn-primary flex items-center gap-2">
                  <FiPlus className="w-4 h-4" /> Add Category
                </button>
              )
            }
          />
        ) : (
          <>
            <div className="table-container">
              <table className="table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Name</th>
                    <th>Description</th>
                    <th>Created At</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {categories.map((cat, idx) => (
                    <tr key={cat._id}>
                      <td className="text-slate-400 text-xs">{(page - 1) * limit + idx + 1}</td>
                      <td>
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                            <FiTag className="w-4 h-4 text-purple-600" />
                          </div>
                          <span className="font-medium text-slate-900">{cat.name}</span>
                        </div>
                      </td>
                      <td className="text-slate-500 max-w-xs truncate">
                        {cat.description || <span className="text-slate-300">—</span>}
                      </td>
                      <td className="text-slate-500 text-xs">{formatDate(cat.createdAt)}</td>
                      <td>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => openEdit(cat)}
                            className="p-1.5 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                          >
                            <FiEdit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setDeleteItem(cat)}
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

      {/* Create/Edit Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editItem ? 'Edit Category' : 'Add Category'}
      >
        <CategoryForm
          defaultValues={editItem ? { name: editItem.name, description: editItem.description } : undefined}
          onSubmit={handleSubmit}
          loading={submitting}
        />
      </Modal>

      {/* Delete Confirm */}
      <ConfirmDialog
        isOpen={!!deleteItem}
        onClose={() => setDeleteItem(null)}
        onConfirm={handleDelete}
        loading={deleting}
        title="Delete Category"
        message={`Are you sure you want to delete "${deleteItem?.name}"? This action cannot be undone.`}
      />
    </div>
  );
};

export default Categories;
