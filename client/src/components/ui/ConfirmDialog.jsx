import { FiAlertTriangle } from 'react-icons/fi';
import Spinner from './Spinner';

const ConfirmDialog = ({ isOpen, onClose, onConfirm, title, message, loading = false }) => {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={!loading ? onClose : undefined}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6" onClick={(e) => e.stopPropagation()}>
        <div className="flex flex-col items-center text-center gap-4">
          <div className="w-14 h-14 bg-rose-50 rounded-full flex items-center justify-center">
            <FiAlertTriangle className="w-7 h-7 text-rose-500" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-800">{title || 'Confirm Delete'}</h3>
            <p className="text-slate-500 text-sm mt-1.5">{message || 'Are you sure? This action cannot be undone.'}</p>
          </div>
          <div className="flex gap-3 w-full">
            <button onClick={onClose} disabled={loading} className="flex-1 btn-secondary">Cancel</button>
            <button onClick={onConfirm} disabled={loading} className="flex-1 btn-danger flex items-center justify-center gap-2">
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
