import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { FiUser, FiMail, FiLock, FiEye, FiEyeOff, FiBarChart2 } from 'react-icons/fi';
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

const Register = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { register: registerUser } = useAuth();
  const navigate = useNavigate();

  const { register, handleSubmit, watch, formState: { errors } } = useForm();
  const password = watch('password');

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      await registerUser({ name: data.name, email: data.email, password: data.password });
      toast.success('Account created!');
      navigate('/dashboard');
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6" style={pageBackground}>
      <div className="w-full max-w-sm">

        {/* Logo */}
        <div className="flex items-center justify-center gap-2.5 mb-8">
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center"
            style={{
              background: 'linear-gradient(180deg, #10B981 0%, #059669 100%)',
              boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.28), 0 4px 12px rgba(5,150,105,0.4)',
            }}
          >
            <FiBarChart2 className="w-5 h-5 text-white" />
          </div>
          <span className="text-[#0F172A] font-semibold text-xl">InvenPro</span>
        </div>

        {/* Glass form card */}
        <div className="rounded-2xl p-8" style={glassCard}>
          <h2 className="text-2xl font-semibold text-[#0F172A] tracking-tight">Create account</h2>
          <p className="text-[#64748B] text-sm mt-1.5 mb-7">Fill in your details to get started</p>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-[#0F172A] mb-1.5">Full Name</label>
              <div className="relative">
                <FiUser className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#94A3B8] w-4 h-4" />
                <input
                  {...register('name', { required: 'Name is required', minLength: { value: 2, message: 'Too short' } })}
                  placeholder="John Doe"
                  className="input-field pl-10"
                />
              </div>
              {errors.name && <p className="text-[#DC2626] text-xs mt-1.5">{errors.name.message}</p>}
            </div>

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
                  placeholder="john@example.com"
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
                  {...register('password', {
                    required: 'Password is required',
                    minLength: { value: 6, message: 'At least 6 characters' },
                  })}
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

            <div>
              <label className="block text-sm font-medium text-[#0F172A] mb-1.5">Confirm Password</label>
              <div className="relative">
                <FiLock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#94A3B8] w-4 h-4" />
                <input
                  {...register('confirmPassword', {
                    required: 'Please confirm password',
                    validate: (v) => v === password || 'Passwords do not match',
                  })}
                  type="password"
                  placeholder="••••••••"
                  className="input-field pl-10"
                />
              </div>
              {errors.confirmPassword && <p className="text-[#DC2626] text-xs mt-1.5">{errors.confirmPassword.message}</p>}
            </div>

            <button type="submit" disabled={loading} className="btn-primary w-full py-2.5 mt-1">
              {loading && <Spinner size="sm" className="border-white border-t-transparent" />}
              {loading ? 'Creating account...' : 'Create Account'}
            </button>
          </form>

          <p className="text-center text-sm text-[#64748B] mt-7">
            Already have an account?{' '}
            <Link to="/login" className="text-[#059669] font-semibold hover:text-[#047857] transition-colors duration-200">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
