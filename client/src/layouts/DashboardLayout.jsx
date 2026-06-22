import { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { FiMenu, FiBell, FiSearch } from 'react-icons/fi';
import Sidebar from './Sidebar';
import { useAuth } from '../context/AuthContext';

const pageTitles = {
  '/dashboard': 'Dashboard',
  '/categories': 'Categories',
  '/products': 'Products',
  '/suppliers': 'Suppliers',
  '/orders': 'Sales Orders',
  '/purchase-orders': 'Purchase Orders',
  '/users': 'Users',
  '/profile': 'Profile',
};

const DashboardLayout = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user } = useAuth();
  const location = useLocation();
  const pageTitle = pageTitles[location.pathname] || 'InvenPro';

  return (
    <div className="flex h-screen overflow-hidden bg-[#f5f6fa]">
      <Sidebar
        collapsed={collapsed}
        onToggle={() => setCollapsed((c) => !c)}
        mobileOpen={mobileOpen}
        onMobileClose={() => setMobileOpen(false)}
      />

      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top bar */}
        <header className="bg-white border-b border-slate-200 px-5 h-16 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setMobileOpen(true)}
              className="lg:hidden p-2 rounded-lg hover:bg-slate-100 transition-colors"
            >
              <FiMenu className="w-5 h-5 text-slate-600" />
            </button>
            <div>
              <h1 className="text-slate-800 font-bold text-lg leading-none">{pageTitle}</h1>
              <p className="text-slate-400 text-xs mt-0.5">
                {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Search */}
            <div className="hidden md:flex items-center gap-2 bg-slate-100 rounded-lg px-3 py-2 w-52">
              <FiSearch className="w-4 h-4 text-slate-400 flex-shrink-0" />
              <input
                type="text"
                placeholder="Search..."
                className="bg-transparent text-sm text-slate-600 placeholder:text-slate-400 outline-none w-full"
              />
            </div>

            {/* Notification */}
            <button className="relative w-9 h-9 flex items-center justify-center rounded-lg hover:bg-slate-100 transition-colors">
              <FiBell className="w-5 h-5 text-slate-500" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-indigo-600 rounded-full" />
            </button>

            <div className="w-px h-6 bg-slate-200 mx-1" />

            {/* User */}
            <div className="flex items-center gap-2.5 cursor-pointer group">
              <div className="w-9 h-9 rounded-full bg-indigo-600 flex items-center justify-center overflow-hidden">
                {user?.avatar ? (
                  <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-white text-sm font-bold">
                    {user?.name?.charAt(0).toUpperCase()}
                  </span>
                )}
              </div>
              <div className="hidden sm:block">
                <p className="text-sm font-semibold text-slate-700 leading-none">{user?.name}</p>
                <p className="text-xs text-slate-400 capitalize mt-0.5">{user?.role}</p>
              </div>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-5 lg:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
