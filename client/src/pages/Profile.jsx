import { useState, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { FiUser, FiMail, FiLock, FiCamera, FiSave, FiShield } from 'react-icons/fi';
import { toast } from 'react-toastify';
import { authAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { getErrorMessage } from '../utils/helpers';
import Spinner from '../components/ui/Spinner';

const Profile = () => {
  const { user, updateUser, loadUser } = useAuth();
  const [profileLoading, setProfileLoading] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState(user?.avatar || null);
  const [avatarFile, setAvatarFile] = useState(null);
  const fileRef = useRef();

  const {
    register: registerProfile,
    handleSubmit: handleProfileSubmit,
    formState: { errors: profileErrors },
  } = useForm({ defaultValues: { name: user?.name, email: user?.email } });

  const {
    register: registerPwd,
    handleSubmit: handlePasswordSubmit,
    watch,
    reset: resetPwd,
    formState: { errors: pwdErrors },
  } = useForm();

  const newPassword = watch('newPassword');

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAvatarFile(file);
      setAvatarPreview(URL.createObjectURL(file));
    }
  };

  const onUpdateProfile = async (data) => {
    setProfileLoading(true);
    try {
      const formData = new FormData();
      formData.append('name', data.name);
      formData.append('email', data.email);
      if (avatarFile) formData.append('avatar', avatarFile);

      const res = await authAPI.updateProfile(formData);
      updateUser(res.data.user);
      toast.success('Profile updated successfully');
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setProfileLoading(false);
    }
  };

  const onChangePassword = async (data) => {
    setPasswordLoading(true);
    try {
      await authAPI.changePassword({
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
      });
      toast.success('Password changed successfully');
      resetPwd();
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setPasswordLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Profile Settings</h1>
        <p className="text-slate-500 text-sm mt-1">Manage your account information</p>
      </div>

      {/* Profile Info Card */}
      <div className="card space-y-6">
        <div className="flex items-center gap-2 pb-4 border-b border-slate-100">
          <FiUser className="w-5 h-5 text-slate-500" />
          <h2 className="font-semibold text-slate-900">Personal Information</h2>
        </div>

        {/* Avatar */}
        <div className="flex items-center gap-5">
          <div className="relative">
            <div className="w-20 h-20 rounded-2xl bg-indigo-100 flex items-center justify-center overflow-hidden">
              {avatarPreview ? (
                <img src={avatarPreview} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                <span className="text-indigo-600 text-2xl font-bold">
                  {user?.name?.charAt(0).toUpperCase()}
                </span>
              )}
            </div>
            <button
              type="button"
              onClick={() => fileRef.current.click()}
              className="absolute -bottom-1 -right-1 w-7 h-7 bg-indigo-600 rounded-full flex items-center justify-center text-white hover:bg-indigo-700 transition-colors shadow-lg"
            >
              <FiCamera className="w-3.5 h-3.5" />
            </button>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              onChange={handleAvatarChange}
              className="hidden"
            />
          </div>
          <div>
            <p className="font-semibold text-slate-900 text-lg">{user?.name}</p>
            <div className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium mt-1 ${
              user?.role === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-slate-100 text-slate-600'
            }`}>
              <FiShield className="w-3 h-3" />
              {user?.role?.charAt(0).toUpperCase() + user?.role?.slice(1)}
            </div>
          </div>
        </div>

        <form onSubmit={handleProfileSubmit(onUpdateProfile)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Full Name</label>
            <div className="relative">
              <FiUser className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
              <input
                {...registerProfile('name', { required: 'Name is required' })}
                className="input-field pl-10"
              />
            </div>
            {profileErrors.name && <p className="text-red-500 text-xs mt-1">{profileErrors.name.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Email Address</label>
            <div className="relative">
              <FiMail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
              <input
                {...registerProfile('email', {
                  required: 'Email is required',
                  pattern: { value: /^\S+@\S+\.\S+$/, message: 'Invalid email' },
                })}
                type="email"
                className="input-field pl-10"
              />
            </div>
            {profileErrors.email && <p className="text-red-500 text-xs mt-1">{profileErrors.email.message}</p>}
          </div>

          <button
            type="submit"
            disabled={profileLoading}
            className="btn-primary flex items-center gap-2"
          >
            {profileLoading ? (
              <Spinner size="sm" className="border-white border-t-transparent" />
            ) : (
              <FiSave className="w-4 h-4" />
            )}
            Save Changes
          </button>
        </form>
      </div>

      {/* Change Password Card */}
      <div className="card space-y-6">
        <div className="flex items-center gap-2 pb-4 border-b border-slate-100">
          <FiLock className="w-5 h-5 text-slate-500" />
          <h2 className="font-semibold text-slate-900">Change Password</h2>
        </div>

        <form onSubmit={handlePasswordSubmit(onChangePassword)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Current Password</label>
            <div className="relative">
              <FiLock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
              <input
                {...registerPwd('currentPassword', { required: 'Current password is required' })}
                type="password"
                className="input-field pl-10"
                placeholder="••••••••"
              />
            </div>
            {pwdErrors.currentPassword && <p className="text-red-500 text-xs mt-1">{pwdErrors.currentPassword.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">New Password</label>
            <div className="relative">
              <FiLock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
              <input
                {...registerPwd('newPassword', {
                  required: 'New password is required',
                  minLength: { value: 6, message: 'At least 6 characters' },
                })}
                type="password"
                className="input-field pl-10"
                placeholder="••••••••"
              />
            </div>
            {pwdErrors.newPassword && <p className="text-red-500 text-xs mt-1">{pwdErrors.newPassword.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Confirm New Password</label>
            <div className="relative">
              <FiLock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
              <input
                {...registerPwd('confirmPassword', {
                  required: 'Please confirm new password',
                  validate: (val) => val === newPassword || 'Passwords do not match',
                })}
                type="password"
                className="input-field pl-10"
                placeholder="••••••••"
              />
            </div>
            {pwdErrors.confirmPassword && <p className="text-red-500 text-xs mt-1">{pwdErrors.confirmPassword.message}</p>}
          </div>

          <button
            type="submit"
            disabled={passwordLoading}
            className="btn-primary flex items-center gap-2"
          >
            {passwordLoading ? (
              <Spinner size="sm" className="border-white border-t-transparent" />
            ) : (
              <FiLock className="w-4 h-4" />
            )}
            Change Password
          </button>
        </form>
      </div>
    </div>
  );
};

export default Profile;
