import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { FiMail, FiLock, FiEye, FiEyeOff, FiBarChart2, FiCheck } from 'react-icons/fi';
import { toast } from 'react-toastify';
import { useAuth } from '../../context/AuthContext';
import { getErrorMessage } from '../../utils/helpers';
import Spinner from '../../components/ui/Spinner';

const pageBackground = {
  background:
    'radial-gradient(ellipse 85% 55% at 12% 8%,  rgba(16,185,129,0.14) 0%, transparent 65%),' +
    'radial-gradient(ellipse 65% 50% at 88% 92%, rgba(5,150,105,0.10)  0%, transparent 65%),' +
    'radial-gradient(ellipse 50% 40% at 55% 50%, rgba(16,185,129,0.05) 0%, transparent 70%),' +
    '#f0fdf4',
  backgroundAttachment: 'fixed',
};

const glassCard = {
  background: 'rgba(255, 255, 255, 0.72)',
  backdropFilter: 'blur(30px)',
  WebkitBackdropFilter: 'blur(30px)',
  border: '1px solid rgba(255, 255, 255, 0.72)',
  boxShadow:
    'inset 0 1px 0 rgba(255,255,255,0.95),' +
    '0 16px 48px rgba(15,23,42,0.1),' +
    '0 4px 12px rgba(15,23,42,0.06)',
};

const Login = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/dashboard';

  const { register, handleSubmit, formState: { errors } } = useForm();

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      await login(data);
      toast.success('Welcome back!');
      navigate(from, { replace: true });
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex" style={pageBackground}>

      {/* Left brand panel — dark frosted glass */}
      <div
        className="hidden lg:flex flex-col justify-between w-[440px] p-12 flex-shrink-0 relative overflow-hidden"
        style={{
          background: 'rgba(15, 23, 42, 0.85)',
          backdropFilter: 'blur(32px)',
          WebkitBackdropFilter: 'blur(32px)',
          borderRight: '1px solid rgba(255,255,255,0.07)',
        }}
      >
        {/* Logo */}
        <div className="flex items-center gap-3 relative z-10">
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center"
            style={{
              background: 'linear-gradient(180deg, #10B981 0%, #059669 100%)',
              boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.28), 0 4px 12px rgba(5,150,105,0.4)',
            }}
          >
            <FiBarChart2 className="w-5 h-5 text-white" />
          </div>
          <span className="text-white font-semibold text-xl tracking-tight">InvenPro</span>
        </div>

        {/* Headline */}
        <div className="relative z-10">
          <h2 className="text-white text-[32px] font-semibold leading-tight tracking-tight">
            Manage your inventory<br />with confidence.
          </h2>
          <p className="text-slate-400 mt-4 text-sm leading-relaxed max-w-xs">
            Real-time stock tracking, purchase orders, sales analytics, and role-based access — all in one place.
          </p>
          <div className="grid grid-cols-2 gap-3 mt-10">
            {['Products', 'Categories', 'Suppliers', 'Orders', 'Purchase Orders', 'Analytics'].map((f) => (
              <div key={f} className="flex items-center gap-2.5 text-slate-300 text-sm">
                <div
                  className="w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0"
                  style={{ background: 'rgba(16,185,129,0.2)', border: '1px solid rgba(16,185,129,0.3)' }}
                >
                  <FiCheck className="w-2.5 h-2.5 text-[#34D399]" />
                </div>
                {f}
              </div>
            ))}
          </div>
        </div>

        <p className="text-slate-500 text-xs relative z-10">© 2024 InvenPro. All rights reserved.</p>

        {/* Decorative glow */}
        <div className="absolute -top-16 -right-16 w-56 h-56 rounded-full pointer-events-none"
          style={{ background: 'radial-gradient(circle, rgba(16,185,129,0.08) 0%, transparent 70%)' }} />
        <div className="absolute bottom-24 -right-10 w-32 h-32 rounded-full pointer-events-none"
          style={{ background: 'radial-gradient(circle, rgba(16,185,129,0.05) 0%, transparent 70%)' }} />
      </div>

      {/* Right form panel */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-sm">

          {/* Mobile logo */}
          <div className="lg:hidden flex items-center justify-center gap-2.5 mb-8">
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center"
              style={{
                background: 'linear-gradient(180deg, #10B981 0%, #059669 100%)',
                boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.28)',
              }}
            >
              <FiBarChart2 className="w-5 h-5 text-white" />
            </div>
            <span className="text-[#0F172A] font-semibold text-xl">InvenPro</span>
          </div>

          {/* Glass form card */}
          <div className="rounded-2xl p-8" style={glassCard}>
            <h2 className="text-2xl font-semibold text-[#0F172A] tracking-tight">Sign in</h2>
            <p className="text-[#64748B] text-sm mt-1.5 mb-7">Enter your credentials to continue</p>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-[#0F172A] mb-1.5">Email</label>
                <div className="relative">
                  <FiMail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#94A3B8] w-4 h-4" />
                  <input
                    {...register('email', {
                      required: 'Email is required',
                      pattern: { value: /^\S+@\S+\.\S+$/, message: 'Invalid email' },
                    })}
                    type="email"
                    placeholder="admin@example.com"
                    className="input-field pl-10"
                  />
                </div>
                {errors.email && <p className="text-[#DC2626] text-xs mt-1.5">{errors.email.message}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-[#0F172A] mb-1.5">Password</label>
                <div className="relative">
                  <FiLock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#94A3B8] w-4 h-4" />
                  <input
                    {...register('password', { required: 'Password is required' })}
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    className="input-field pl-10 pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((s) => !s)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#94A3B8] hover:text-[#64748B] transition-colors duration-200"
                  >
                    {showPassword ? <FiEyeOff className="w-4 h-4" /> : <FiEye className="w-4 h-4" />}
                  </button>
                </div>
                {errors.password && <p className="text-[#DC2626] text-xs mt-1.5">{errors.password.message}</p>}
              </div>

              <button type="submit" disabled={loading} className="btn-primary w-full py-2.5 mt-1">
                {loading && <Spinner size="sm" className="border-white border-t-transparent" />}
                {loading ? 'Signing in...' : 'Sign In'}
              </button>
            </form>

            <p className="text-center text-sm text-[#64748B] mt-7">
              Don't have an account?{' '}
              <Link to="/register" className="text-[#059669] font-semibold hover:text-[#047857] transition-colors duration-200">
                Create account
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
