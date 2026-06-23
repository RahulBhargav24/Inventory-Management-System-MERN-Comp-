import { useState, useEffect, useCallback, useRef } from 'react';
import { useForm } from 'react-hook-form';
import {
  FiPlus, FiEdit2, FiTrash2, FiSearch, FiPackage, FiFilter, FiRefreshCw, FiImage, FiDownload,
} from 'react-icons/fi';
import { toast } from 'react-toastify';
import { productAPI, categoryAPI, supplierAPI } from '../services/api';
import Modal from '../components/ui/Modal';
import ConfirmDialog from '../components/ui/ConfirmDialog';
import Pagination from '../components/ui/Pagination';
import EmptyState from '../components/ui/EmptyState';
import { PageLoader } from '../components/ui/Spinner';
import Spinner from '../components/ui/Spinner';
import { formatCurrency, formatDate, getStockStatus, getErrorMessage, generateSKUClient, downloadCSV } from '../utils/helpers';
import usePagination from '../hooks/usePagination';
import { useAuth } from '../context/AuthContext';

const ProductForm = ({ defaultValues, onSubmit, loading, onClose, categories, suppliers }) => {
  const [preview, setPreview] = useState(defaultValues?.image || null);
  const fileRef = useRef();
  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm({ defaultValues });
  const watchName = watch('name');
  const watchCategory = watch('category');

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setPreview(URL.createObjectURL(file));
    }
  };

  const autoSKU = () => {
    const catName = categories.find((c) => c._id === watchCategory)?.name || '';
    setValue('sku', generateSKUClient(watchName, catName));
  };

  const handleFormSubmit = (data) => {
    const formData = new FormData();
    Object.entries(data).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== '') formData.append(k, v);
    });
    if (fileRef.current?.files[0]) {
      formData.append('image', fileRef.current.files[0]);
    }
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="sm:col-span-2">
          <label className="block text-sm font-medium text-slate-700 mb-1">Product Name *</label>
          <input
            {...register('name', { required: 'Product name is required' })}
            className="input-field"
            placeholder="Product name"
          />
          {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Category *</label>
          <select
            {...register('category', { required: 'Category is required' })}
            className="input-field"
          >
            <option value="">Select category</option>
            {categories.map((c) => <option key={c._id} value={c._id}>{c.name}</option>)}
          </select>
          {errors.category && <p className="text-red-500 text-xs mt-1">{errors.category.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Supplier *</label>
          <select
            {...register('supplier', { required: 'Supplier is required' })}
            className="input-field"
          >
            <option value="">Select supplier</option>
            {suppliers.map((s) => <option key={s._id} value={s._id}>{s.name}</option>)}
          </select>
          {errors.supplier && <p className="text-red-500 text-xs mt-1">{errors.supplier.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">SKU</label>
          <div className="flex gap-2">
            <input {...register('sku')} className="input-field" placeholder="Auto-generated" />
            <button type="button" onClick={autoSKU} className="btn-secondary flex-shrslate-0 px-3" title="Generate SKU">
              <FiRefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Price ($) *</label>
          <input
            {...register('price', { required: 'Price is required', min: { value: 0, message: 'Price must be positive' } })}
            type="number"
            step="0.01"
            className="input-field"
            placeholder="0.00"
          />
          {errors.price && <p className="text-red-500 text-xs mt-1">{errors.price.message}</p>}
        </div>

        <div className="sm:col-span-2">
          <label className="block text-sm font-medium text-slate-700 mb-1">Quantity</label>
          <input
            {...register('quantity', { min: { value: 0, message: 'Quantity cannot be negative' } })}
            type="number"
            className="input-field"
            placeholder="0"
            defaultValue={0}
          />
          {errors.quantity && <p className="text-red-500 text-xs mt-1">{errors.quantity.message}</p>}
        </div>

        <div className="sm:col-span-2">
          <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
          <textarea
            {...register('description')}
            className="input-field resize-none"
            rows={2}
            placeholder="Product description..."
          />
        </div>

        {/* Image Upload */}
        <div className="sm:col-span-2">
          <label className="block text-sm font-medium text-slate-700 mb-1">Product Image</label>
          <div className="flex items-center gap-4">
            <div className="w-20 h-20 rounded-xl border-2 border-dashed border-slate-200 flex items-center justify-center overflow-hidden bg-slate-50 flex-shrslate-0">
              {preview ? (
                <img src={preview} alt="Preview" className="w-full h-full object-cover" />
              ) : (
                <FiImage className="w-8 h-8 text-slate-300" />
              )}
            </div>
            <div>
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
                id="product-image"
              />
              <label htmlFor="product-image" className="btn-secondary cursor-pointer text-sm">
                Choose Image
              </label>
              <p className="text-xs text-slate-400 mt-1">Max 5MB. JPG, PNG, GIF, WEBP</p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex gap-3 pt-2">
        <button type="button" onClick={onClose} className="btn-secondary">Cancel</button>
        <button type="submit" disabled={loading} className="btn-primary flex items-center gap-2">
          {loading && <Spinner size="sm" className="border-white border-t-transparent" />}
          {defaultValues ? 'Update Product' : 'Create Product'}
        </button>
      </div>
    </form>
  );
};

const Products = () => {
  const [products, setProducts] = useState([]);
  const [pagination, setPagination] = useState({});
  const [categories, setCategories] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [search, setSearch] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [filterStock, setFilterStock] = useState('');
  const [sortBy, setSortBy] = useState('createdAt');
  const [modalOpen, setModalOpen] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [deleteItem, setDeleteItem] = useState(null);
  const { page, limit, goToPage, resetPage } = usePagination();
  const { isAdmin } = useAuth();

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const params = { search, page, limit, sortBy };
      if (filterCategory) params.category = filterCategory;
      if (filterStock) params.stockStatus = filterStock;
      const res = await productAPI.getAll(params);
      setProducts(res.data.data);
      setPagination(res.data.pagination);
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  }, [search, page, limit, filterCategory, filterStock, sortBy]);

  const fetchFilters = useCallback(async () => {
    try {
      const [catRes, supRes] = await Promise.all([
        categoryAPI.getAll({ limit: 100 }),
        supplierAPI.getAll({ limit: 100 }),
      ]);
      setCategories(catRes.data.data);
      setSuppliers(supRes.data.data);
    } catch {}
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  useEffect(() => {
    fetchFilters();
  }, [fetchFilters]);

  const handleFilterChange = () => resetPage();

  const handleSubmit = async (formData) => {
    setSubmitting(true);
    try {
      if (editItem) {
        await productAPI.update(editItem._id, formData);
        toast.success('Product updated successfully');
      } else {
        await productAPI.create(formData);
        toast.success('Product created successfully');
      }
      setModalOpen(false);
      fetchProducts();
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await productAPI.delete(deleteItem._id);
      toast.success('Product deleted successfully');
      setDeleteItem(null);
      fetchProducts();
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setDeleting(false);
    }
  };

  const handleExportCSV = () => {
    const exportData = products.map((p) => ({
      Name: p.name,
      SKU: p.sku,
      Category: p.category?.name,
      Supplier: p.supplier?.name,
      Price: p.price,
      Quantity: p.quantity,
      Status: getStockStatus(p.quantity).label,
      Created: formatDate(p.createdAt),
    }));
    downloadCSV(exportData, 'products');
    toast.success('Exported to CSV');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Products</h1>
          <p className="text-slate-500 text-sm mt-1">Manage your inventory products</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={handleExportCSV} className="btn-secondary flex items-center gap-2 text-sm">
            <FiDownload className="w-4 h-4" /> Export CSV
          </button>
          {isAdmin && (
            <button onClick={() => { setEditItem(null); setModalOpen(true); }} className="btn-primary flex items-center gap-2">
              <FiPlus className="w-4 h-4" /> Add Product
            </button>
          )}
        </div>
      </div>

      {/* Filters */}
      <div className="card">
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[200px]">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
            <input
              type="text"
              value={search}
              onChange={(e) => { setSearch(e.target.value); handleFilterChange(); }}
              placeholder="Search products..."
              className="input-field pl-10"
            />
          </div>
          <select
            value={filterCategory}
            onChange={(e) => { setFilterCategory(e.target.value); handleFilterChange(); }}
            className="input-field w-auto"
          >
            <option value="">All Categories</option>
            {categories.map((c) => <option key={c._id} value={c._id}>{c.name}</option>)}
          </select>
          <select
            value={filterStock}
            onChange={(e) => { setFilterStock(e.target.value); handleFilterChange(); }}
            className="input-field w-auto"
          >
            <option value="">All Stock</option>
            <option value="in_stock">In Stock</option>
            <option value="low_stock">Low Stock</option>
            <option value="out_of_stock">Out of Stock</option>
          </select>
          <select
            value={sortBy}
            onChange={(e) => { setSortBy(e.target.value); handleFilterChange(); }}
            className="input-field w-auto"
          >
            <option value="createdAt">Newest</option>
            <option value="name">Name</option>
            <option value="price">Price</option>
            <option value="quantity">Quantity</option>
          </select>
        </div>
      </div>

      <div className="card p-0 overflow-hidden">
        {loading ? (
          <PageLoader />
        ) : products.length === 0 ? (
          <EmptyState
            title="No products found"
            description="Add your first product to get started."
            action={
              isAdmin && (
                <button onClick={() => { setEditItem(null); setModalOpen(true); }} className="btn-primary flex items-center gap-2">
                  <FiPlus className="w-4 h-4" /> Add Product
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
                    <th>Product</th>
                    <th>SKU</th>
                    <th>Category</th>
                    <th>Supplier</th>
                    <th>Price</th>
                    <th>Qty</th>
                    <th>Status</th>
                    {isAdmin && <th>Actions</th>}
                  </tr>
                </thead>
                <tbody>
                  {products.map((product) => {
                    const stock = getStockStatus(product.quantity);
                    return (
                      <tr key={product._id}>
                        <td>
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center overflow-hidden flex-shrslate-0">
                              {product.image ? (
                                <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                              ) : (
                                <FiPackage className="w-5 h-5 text-slate-400" />
                              )}
                            </div>
                            <div>
                              <p className="font-medium text-slate-900 text-sm">{product.name}</p>
                              <p className="text-xs text-slate-400 line-clamp-1">{product.description}</p>
                            </div>
                          </div>
                        </td>
                        <td>
                          <span className="font-mono text-xs bg-slate-100 text-slate-600 px-2 py-1 rounded">
                            {product.sku}
                          </span>
                        </td>
                        <td className="text-sm text-slate-600">{product.category?.name}</td>
                        <td className="text-sm text-slate-600">{product.supplier?.name}</td>
                        <td className="font-semibold text-slate-900 text-sm">{formatCurrency(product.price)}</td>
                        <td className="font-medium text-slate-900 text-sm">{product.quantity}</td>
                        <td>
                          <span className={stock.className}>{stock.label}</span>
                        </td>
                        {isAdmin && (
                          <td>
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => { setEditItem(product); setModalOpen(true); }}
                                className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                              >
                                <FiEdit2 className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => setDeleteItem(product)}
                                className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                              >
                                <FiTrash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        )}
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

      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editItem ? 'Edit Product' : 'Add Product'}
        size="lg"
      >
        <ProductForm
          defaultValues={editItem ? {
            name: editItem.name,
            category: editItem.category?._id,
            supplier: editItem.supplier?._id,
            sku: editItem.sku,
            price: editItem.price,
            quantity: editItem.quantity,
            description: editItem.description,
            image: editItem.image,
          } : undefined}
          onSubmit={handleSubmit}
          loading={submitting}
          onClose={() => setModalOpen(false)}
          categories={categories}
          suppliers={suppliers}
        />
      </Modal>

      <ConfirmDialog
        isOpen={!!deleteItem}
        onClose={() => setDeleteItem(null)}
        onConfirm={handleDelete}
        loading={deleting}
        title="Delete Product"
        message={`Delete "${deleteItem?.name}"? This action cannot be undone.`}
      />
    </div>
  );
};

export default Products;
