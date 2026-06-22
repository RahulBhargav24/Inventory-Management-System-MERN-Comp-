import { Link } from 'react-router-dom';
import { FiArrowLeft } from 'react-icons/fi';

const NotFound = () => (
  <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
    <div className="text-center">
      <h1 className="text-8xl font-bold text-slate-200">404</h1>
      <h2 className="text-2xl font-bold text-slate-800 mt-4">Page Not Found</h2>
      <p className="text-slate-500 mt-2">The page you're looking for doesn't exist.</p>
      <Link to="/dashboard" className="btn-primary inline-flex items-center gap-2 mt-6">
        <FiArrowLeft className="w-4 h-4" /> Back to Dashboard
      </Link>
    </div>
  </div>
);

export default NotFound;
