import { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { FiMenu, FiBell, FiSearch } from 'react-icons/fi';
import Sidebar from './Sidebar';
import { useAuth } from '../context/AuthContext';

const pageTitles = {
  '/dashboard':      'Dashboard',
  '/categories':     'Categories',
  '/products':       'Products',
  '/suppliers':      'Suppliers',
  '/orders':         'Sales Orders',
  '/purchase-orders':'Purchase Orders',
  '/users':          'Users',
  '/profile':        'Profile',
};

/* Shared glass style used on every surface */
const topbarGlass = {
  background: 'rgba(255, 255, 255, 0.72)',
  backdropFilter: 'blur(24px)',
  WebkitBackdropFilter: 'blur(24px)',
  borderBottom: '1px solid rgba(255, 255, 255, 0.6)',
  boxShadow: 'inset 0 -1px 0 rgba(15,23,42,0.05), 0 2px 16px rgba(15,23,42,0.04)',
};

const DashboardLayout = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user } = useAuth();
  const location = useLocation();
  const pageTitle = pageTitles[location.pathname] || 'InvenPro';

  return (
    <div
      className="flex h-screen overflow-hidden"
      style={{
        background:
          'radial-gradient(ellipse 85% 55% at 12% 8%, rgba(16,185,129,0.13) 0%, transparent 65%),' +
          'radial-gradient(ellipse 65% 50% at 88% 92%, rgba(5,150,105,0.09) 0%, transparent 65%),' +
          'radial-gradient(ellipse 50% 40% at 55% 50%, rgba(16,185,129,0.04) 0%, transparent 70%),' +
          '#f0fdf4',
        backgroundAttachment: 'fixed',
      }}
    >
      <Sidebar
        collapsed={collapsed}
        onToggle={() => setCollapsed((c) => !c)}
        mobileOpen={mobileOpen}
        onMobileClose={() => setMobileOpen(false)}
      />

      <div className="flex-1 flex flex-col overflow-hidden min-w-0">

        {/* Glass top bar */}
        <header className="px-6 h-[57px] flex items-center justify-between flex-shrink-0 sticky top-0 z-10" style={topbarGlass}>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setMobileOpen(true)}
              className="lg:hidden p-2 rounded-lg transition-colors duration-200 text-slate-500"
              style={{ background: 'rgba(255,255,255,0.5)' }}
            >
              <FiMenu className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-[#0F172A] font-semibold text-[15px] leading-none">{pageTitle}</h1>
              <p className="text-[#94A3B8] text-[11px] mt-[3px]">
                {new Date().toLocaleDateString('en-US', {
                  weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
                })}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Glass search */}
            <div
              className="hidden md:flex items-center gap-2 rounded-[10px] px-3 py-[7px] w-56 transition-all duration-200 focus-within:ring-2 focus-within:ring-[#10B981]/20"
              style={{
                background: 'rgba(255,255,255,0.55)',
                backdropFilter: 'blur(12px)',
                WebkitBackdropFilter: 'blur(12px)',
                border: '1px solid rgba(255,255,255,0.7)',
                boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.9)',
              }}
            >
              <FiSearch className="w-3.5 h-3.5 text-[#94A3B8] flex-shrink-0" />
              <input
                type="text"
                placeholder="Search..."
                className="bg-transparent text-sm text-[#0F172A] placeholder:text-[#94A3B8] outline-none w-full"
              />
            </div>

            {/* Notification */}
            <button
              className="relative w-9 h-9 flex items-center justify-center rounded-lg transition-all duration-200"
              style={{ background: 'rgba(255,255,255,0.5)', border: '1px solid rgba(255,255,255,0.7)' }}
            >
              <FiBell className="w-[18px] h-[18px] text-[#64748B]" />
              <span className="absolute top-2 right-2 w-1.5 h-1.5 bg-[#10B981] rounded-full" />
            </button>

            <div className="w-px h-5 bg-black/[0.06] mx-1" />

            {/* User avatar */}
            <div className="flex items-center gap-2.5 cursor-pointer">
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center overflow-hidden flex-shrink-0"
                style={{
                  background: 'linear-gradient(180deg, #10B981 0%, #059669 100%)',
                  boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.3), 0 2px 8px rgba(5,150,105,0.3)',
                }}
              >
                {user?.avatar ? (
                  <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-white text-xs font-semibold">
                    {user?.name?.charAt(0).toUpperCase()}
                  </span>
                )}
              </div>
              <div className="hidden sm:block">
                <p className="text-sm font-semibold text-[#0F172A] leading-none">{user?.name}</p>
                <p className="text-xs text-[#64748B] capitalize mt-0.5">{user?.role}</p>
              </div>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
