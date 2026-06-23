import { NavLink, useNavigate } from 'react-router-dom';
import {
  FiGrid, FiTag, FiBox, FiTruck, FiShoppingBag,
  FiUsers, FiSettings, FiLogOut, FiChevronLeft,
  FiChevronRight, FiX, FiBarChart2, FiClipboard,
} from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';

const navSections = [
  {
    label: 'Overview',
    items: [{ path: '/dashboard', icon: FiGrid, label: 'Dashboard' }],
  },
  {
    label: 'Inventory',
    items: [
      { path: '/categories', icon: FiTag,   label: 'Categories',      adminOnly: true },
      { path: '/products',   icon: FiBox,   label: 'Products' },
      { path: '/suppliers',  icon: FiTruck, label: 'Suppliers',        adminOnly: true },
    ],
  },
  {
    label: 'Transactions',
    items: [
      { path: '/orders',          icon: FiShoppingBag, label: 'Sales Orders' },
      { path: '/purchase-orders', icon: FiClipboard,   label: 'Purchase Orders', adminOnly: true },
    ],
  },
  {
    label: 'Management',
    items: [
      { path: '/users',   icon: FiUsers,    label: 'Users',   adminOnly: true },
      { path: '/profile', icon: FiSettings, label: 'Profile' },
    ],
  },
];

/* Dark frosted-glass sidebar style */
const sidebarStyle = {
  background: 'rgba(15, 23, 42, 0.88)',
  backdropFilter: 'blur(32px)',
  WebkitBackdropFilter: 'blur(32px)',
  borderRight: '1px solid rgba(255, 255, 255, 0.06)',
};

/* Active nav item glass pill */
const activeItemStyle = {
  background: 'rgba(16, 185, 129, 0.12)',
  backdropFilter: 'blur(8px)',
  WebkitBackdropFilter: 'blur(8px)',
  border: '1px solid rgba(16, 185, 129, 0.18)',
};

const Sidebar = ({ collapsed, onToggle, mobileOpen, onMobileClose }) => {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full overflow-hidden">

      {/* Logo */}
      <div
        className={`flex items-center h-[57px] flex-shrink-0 ${collapsed ? 'justify-center px-2' : 'gap-3 px-5'}`}
        style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}
      >
        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
          style={{
            background: 'linear-gradient(180deg, #10B981 0%, #059669 100%)',
            boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.28), 0 4px 12px rgba(5,150,105,0.4)',
          }}
        >
          <FiBarChart2 className="w-[15px] h-[15px] text-white" />
        </div>
        {!collapsed && (
          <div>
            <p className="text-white font-semibold text-sm leading-none">InvenPro</p>
            <p className="text-slate-500 text-[10px] mt-0.5 tracking-wide">Inventory System</p>
          </div>
        )}
      </div>

      {/* Nav */}
      <div className="flex-1 overflow-y-auto py-4 px-3 space-y-5">
        {navSections.map((section) => {
          const visibleItems = section.items.filter((item) => !item.adminOnly || isAdmin);
          if (visibleItems.length === 0) return null;
          return (
            <div key={section.label}>
              {!collapsed && (
                <p className="text-[9px] font-semibold text-slate-600 uppercase tracking-[0.12em] px-3 mb-1.5">
                  {section.label}
                </p>
              )}
              <div className="space-y-0.5">
                {visibleItems.map(({ path, icon: Icon, label }) => (
                  <NavLink
                    key={path}
                    to={path}
                    onClick={onMobileClose}
                    title={collapsed ? label : undefined}
                    className={({ isActive }) =>
                      `relative flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group
                       ${collapsed ? 'justify-center' : ''}
                       ${!isActive ? 'text-slate-400 hover:text-slate-200' : 'text-white'}`
                    }
                    style={({ isActive }) => isActive ? activeItemStyle : undefined}
                  >
                    {({ isActive }) => (
                      <>
                        {/* Hover glass on inactive */}
                        {!isActive && (
                          <span
                            className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                            style={{
                              background: 'rgba(255,255,255,0.04)',
                              border: '1px solid rgba(255,255,255,0.06)',
                            }}
                          />
                        )}
                        {/* Left active indicator */}
                        {isActive && !collapsed && (
                          <span
                            className="absolute left-0 top-[9px] bottom-[9px] w-[3px] rounded-r-full"
                            style={{
                              background: 'linear-gradient(180deg, #34D399 0%, #10B981 100%)',
                              boxShadow: '0 0 6px rgba(16,185,129,0.5)',
                            }}
                          />
                        )}
                        <Icon
                          className={`w-[17px] h-[17px] flex-shrink-0 relative z-10 transition-colors duration-200 ${
                            isActive ? 'text-[#34D399]' : 'text-slate-500 group-hover:text-slate-300'
                          }`}
                        />
                        {!collapsed && <span className="relative z-10">{label}</span>}
                      </>
                    )}
                  </NavLink>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Bottom: User + Logout */}
      <div className="flex-shrink-0 p-3 space-y-0.5" style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
        {!collapsed && (
          <div className="flex items-center gap-3 px-3 py-2.5 mb-0.5 rounded-xl"
            style={{ background: 'rgba(255,255,255,0.04)' }}
          >
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 overflow-hidden"
              style={{
                background: 'linear-gradient(180deg, #10B981 0%, #059669 100%)',
                boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.25)',
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
            <div className="flex-1 min-w-0">
              <p className="text-slate-200 text-sm font-medium truncate leading-none">{user?.name}</p>
              <p className="text-slate-500 text-xs mt-0.5 capitalize">{user?.role}</p>
            </div>
          </div>
        )}
        <button
          onClick={handleLogout}
          title={collapsed ? 'Logout' : undefined}
          className={`flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm font-medium
                      text-slate-500 hover:text-rose-400 transition-all duration-200 group
                      ${collapsed ? 'justify-center' : ''}`}
          style={{ background: 'transparent' }}
          onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(239,68,68,0.07)'}
          onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
        >
          <FiLogOut className="w-[17px] h-[17px] flex-shrink-0" />
          {!collapsed && <span>Logout</span>}
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop */}
      <aside
        className={`hidden lg:flex flex-col transition-all duration-300 ease-in-out relative flex-shrink-0
                    ${collapsed ? 'w-[68px]' : 'w-[240px]'}`}
        style={sidebarStyle}
      >
        <button
          onClick={onToggle}
          className="absolute -right-3 top-[26px] z-10 w-6 h-6 rounded-full flex items-center justify-center text-slate-500 hover:text-emerald-400 transition-all duration-200"
          style={{
            background: 'rgba(15,23,42,0.88)',
            backdropFilter: 'blur(12px)',
            border: '1px solid rgba(255,255,255,0.1)',
            boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
          }}
        >
          {collapsed
            ? <FiChevronRight className="w-3.5 h-3.5" />
            : <FiChevronLeft  className="w-3.5 h-3.5" />
          }
        </button>
        <SidebarContent />
      </aside>

      {/* Mobile */}
      {mobileOpen && (
        <>
          <div
            className="lg:hidden fixed inset-0 z-40"
            style={{ background: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(4px)' }}
            onClick={onMobileClose}
          />
          <aside
            className="lg:hidden fixed left-0 top-0 h-full w-[240px] z-50 flex flex-col"
            style={sidebarStyle}
          >
            <button
              onClick={onMobileClose}
              className="absolute top-5 right-4 text-slate-500 hover:text-white transition-colors duration-200"
            >
              <FiX className="w-5 h-5" />
            </button>
            <SidebarContent />
          </aside>
        </>
      )}
    </>
  );
};

export default Sidebar;
