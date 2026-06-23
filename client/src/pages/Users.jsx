import { useState, useEffect, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { FiPlus, FiEdit2, FiTrash2, FiSearch, FiUser, FiShield } from 'react-icons/fi';
import { toast } from 'react-toastify';
import { userAPI } from '../services/api';
import Modal from '../components/ui/Modal';
import ConfirmDialog from '../components/ui/ConfirmDialog';
import Pagination from '../components/ui/Pagination';
import EmptyState from '../components/ui/EmptyState';
import { PageLoader } from '../components/ui/Spinner';
import Spinner from '../components/ui/Spinner';
import { formatDate, getErrorMessage } from '../utils/helpers';
import usePagination from '../hooks/usePagination';
import { useAuth } from '../context/AuthContext';

const UserForm = ({ defaultValues, onSubmit, loading, onClose, isEdit }) => {
  const { register, handleSubmit, formState: { errors } } = useForm({ defaultValues });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">Full Name *</label>
        <input
          {...register('name', { required: 'Name is required' })}
          className="input-field"
          placeholder="John Doe"
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
          placeholder="user@example.com"
        />
        {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
      </div>
      {!isEdit && (
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Password *</label>
          <input
            {...register('password', {
              required: 'Password is required',
              minLength: { value: 6, message: 'At least 6 characters' },
            })}
            type="password"
            className="input-field"
            placeholder="••••••••"
          />
          {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>}
        </div>
      )}
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">Role</label>
        <select {...register('role')} className="input-field">
          <option value="user">User</option>
          <option value="admin">Admin</option>
        </select>
      </div>
      <div className="flex gap-3 pt-2">
        <button type="button" onClick={onClose} className="btn-secondary">Cancel</button>
        <button type="submit" disabled={loading} className="btn-primary flex items-center gap-2">
          {loading && <Spinner size="sm" className="border-white border-t-transparent" />}
          {isEdit ? 'Update User' : 'Create User'}
        </button>
      </div>
    </form>
  );
};

const Users = () => {
  const [users, setUsers] = useState([]);
  const [pagination, setPagination] = useState({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [deleteItem, setDeleteItem] = useState(null);
  const { page, limit, goToPage, resetPage } = usePagination();
  const { user: currentUser } = useAuth();

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const res = await userAPI.getAll({ search, page, limit });
      setUsers(res.data.data);
      setPagination(res.data.pagination);
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  }, [search, page, limit]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleSubmit = async (data) => {
    setSubmitting(true);
    try {
      if (editItem) {
        await userAPI.update(editItem._id, { name: data.name, email: data.email, role: data.role });
        toast.success('User updated successfully');
      } else {
        await userAPI.create(data);
        toast.success('User created successfully');
      }
      setModalOpen(false);
      setEditItem(null);
      fetchUsers();
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await userAPI.delete(deleteItem._id);
      toast.success('User deleted successfully');
      setDeleteItem(null);
      fetchUsers();
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
          <h1 className="text-2xl font-bold text-slate-900">User Management</h1>
          <p className="text-slate-500 text-sm mt-1">Manage system users and roles</p>
        </div>
        <button
          onClick={() => { setEditItem(null); setModalOpen(true); }}
          className="btn-primary flex items-center gap-2"
        >
          <FiPlus className="w-4 h-4" /> Add User
        </button>
      </div>

      <div className="card">
        <div className="relative max-w-sm">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
          <input
            type="text"
            value={search}
            onChange={(e) => { setSearch(e.target.value); resetPage(); }}
            placeholder="Search users..."
            className="input-field pl-10"
          />
        </div>
      </div>

      <div className="card p-0 overflow-hidden">
        {loading ? (
          <PageLoader />
        ) : users.length === 0 ? (
          <EmptyState title="No users found" description="Add your first user." />
        ) : (
          <>
            <div className="table-container">
              <table className="table">
                <thead>
                  <tr>
                    <th>User</th>
                    <th>Email</th>
                    <th>Role</th>
                    <th>Joined</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u) => (
                    <tr key={u._id}>
                      <td>
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-emerald-100 flex items-center justify-center overflow-hidden flex-shrslate-0">
                            {u.avatar ? (
                              <img src={u.avatar} alt={u.name} className="w-full h-full object-cover" />
                            ) : (
                              <span className="text-emerald-700 font-bold text-sm">
                                {u.name.charAt(0).toUpperCase()}
                              </span>
                            )}
                          </div>
                          <div>
                            <p className="font-medium text-slate-900 text-sm">{u.name}</p>
                            {u._id === currentUser?._id && (
                              <span className="text-xs text-emerald-600">(You)</span>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="text-sm text-slate-600">{u.email}</td>
                      <td>
                        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          u.role === 'admin'
                            ? 'bg-purple-100 text-purple-700'
                            : 'bg-slate-100 text-slate-600'
                        }`}>
                          {u.role === 'admin' ? <FiShield className="w-3 h-3" /> : <FiUser className="w-3 h-3" />}
                          {u.role.charAt(0).toUpperCase() + u.role.slice(1)}
                        </span>
                      </td>
                      <td className="text-xs text-slate-400">{formatDate(u.createdAt)}</td>
                      <td>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => { setEditItem(u); setModalOpen(true); }}
                            className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                          >
                            <FiEdit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setDeleteItem(u)}
                            disabled={u._id === currentUser?._id}
                            className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
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
        onClose={() => { setModalOpen(false); setEditItem(null); }}
        title={editItem ? 'Edit User' : 'Add User'}
      >
        <UserForm
          defaultValues={editItem ? { name: editItem.name, email: editItem.email, role: editItem.role } : { role: 'user' }}
          onSubmit={handleSubmit}
          loading={submitting}
          onClose={() => { setModalOpen(false); setEditItem(null); }}
          isEdit={!!editItem}
        />
      </Modal>

      <ConfirmDialog
        isOpen={!!deleteItem}
        onClose={() => setDeleteItem(null)}
        onConfirm={handleDelete}
        loading={deleting}
        title="Delete User"
        message={`Are you sure you want to delete "${deleteItem?.name}"?`}
      />
    </div>
  );
};

export default Users;
