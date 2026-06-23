import { FiAlertTriangle } from 'react-icons/fi';
import Spinner from './Spinner';

const ConfirmDialog = ({ isOpen, onClose, onConfirm, title, message, loading = false }) => {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={!loading ? onClose : undefined}>
      <div
        className="bg-white rounded-2xl w-full max-w-sm p-7"
        style={{ boxShadow: '0 20px 60px rgba(15,23,42,0.15), 0 4px 16px rgba(15,23,42,0.08)' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex flex-col items-center text-center gap-4">
          <div className="w-12 h-12 bg-rose-50 rounded-xl flex items-center justify-center">
            <FiAlertTriangle className="w-6 h-6 text-[#DC2626]" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-[#0F172A]">{title || 'Confirm Delete'}</h3>
            <p className="text-[#64748B] text-sm mt-2 leading-relaxed">
              {message || 'Are you sure? This action cannot be undone.'}
            </p>
          </div>
          <div className="flex gap-3 w-full mt-1">
            <button onClick={onClose} disabled={loading} className="flex-1 btn-secondary">
              Cancel
            </button>
            <button
              onClick={onConfirm}
              disabled={loading}
              className="flex-1 btn-danger"
            >
              {loading && <Spinner size="sm" className="border-white border-t-transparent" />}
              Delete
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDialog;
