import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import {
  FiGrid,
  FiTag,
  FiBox,
  FiTruck,
  FiShoppingBag,
  FiUsers,
  FiSettings,
  FiLogOut,
  FiChevronLeft,
  FiChevronRight,
  FiX,
  FiBarChart2,
  FiClipboard,
} from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';

const navSections = [
  {
    label: 'Overview',
    items: [
      { path: '/dashboard', icon: FiGrid, label: 'Dashboard' },
    ],
  },
  {
    label: 'Inventory',
    items: [
      { path: '/categories', icon: FiTag, label: 'Categories', adminOnly: true },
      { path: '/products', icon: FiBox, label: 'Products' },
      { path: '/suppliers', icon: FiTruck, label: 'Suppliers', adminOnly: true },
    ],
  },
  {
    label: 'Transactions',
    items: [
      { path: '/orders', icon: FiShoppingBag, label: 'Sales Orders' },
      { path: '/purchase-orders', icon: FiClipboard, label: 'Purchase Orders', adminOnly: true },
    ],
  },
  {
    label: 'Management',
    items: [
      { path: '/users', icon: FiUsers, label: 'Users', adminOnly: true },
      { path: '/profile', icon: FiSettings, label: 'Profile' },
    ],
  },
];

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
      <div className={`flex items-center h-16 border-b border-white/5 flex-shrink-0 ${collapsed ? 'justify-center px-2' : 'gap-3 px-5'}`}>
        <div className="w-8 h-8 rounded-lg bg-indigo-500 flex items-center justify-center flex-shrink-0">
          <FiBarChart2 className="w-4 h-4 text-white" />
        </div>
        {!collapsed && (
          <div>
            <p className="text-white font-bold text-base leading-none tracking-wide">InvenPro</p>
            <p className="text-slate-400 text-[10px] mt-0.5 tracking-wider uppercase">Management</p>
          </div>
        )}
      </div>

      {/* Nav */}
      <div className="flex-1 overflow-y-auto py-4 px-3 space-y-5">
        {navSections.map((section) => {
          const visibleItems = section.items.filter(
            (item) => !item.adminOnly || isAdmin
          );
          if (visibleItems.length === 0) return null;

          return (
            <div key={section.label}>
              {!collapsed && (
                <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest px-2 mb-2">
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
                      `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 group
                      ${collapsed ? 'justify-center' : ''}
                      ${
                        isActive
                          ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-900/40'
                          : 'text-slate-400 hover:text-slate-100 hover:bg-white/5'
                      }`
                    }
                  >
                    {({ isActive }) => (
                      <>
                        <Icon className={`w-[17px] h-[17px] flex-shrink-0 ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-slate-300'}`} />
                        {!collapsed && <span>{label}</span>}
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
      <div className="flex-shrink-0 border-t border-white/5 p-3">
        {!collapsed && (
          <div className="flex items-center gap-3 px-2 py-2.5 mb-1 rounded-lg">
            <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center flex-shrink-0 overflow-hidden">
              {user?.avatar ? (
                <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
              ) : (
                <span className="text-white text-xs font-bold">
                  {user?.name?.charAt(0).toUpperCase()}
                </span>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-slate-100 text-sm font-semibold truncate leading-none">{user?.name}</p>
              <p className="text-slate-400 text-xs mt-0.5 capitalize">{user?.role}</p>
            </div>
          </div>
        )}
        <button
          onClick={handleLogout}
          title={collapsed ? 'Logout' : undefined}
          className={`flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-all duration-150 ${collapsed ? 'justify-center' : ''}`}
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
        className={`hidden lg:flex flex-col bg-[#0d1117] transition-all duration-300 ease-in-out relative border-r border-white/[0.06] ${
          collapsed ? 'w-[68px]' : 'w-[240px]'
        }`}
      >
        <button
          onClick={onToggle}
          className="absolute -right-3 top-[26px] z-10 w-6 h-6 bg-[#0d1117] border border-white/10 rounded-full flex items-center justify-center text-slate-400 hover:text-indigo-400 hover:border-indigo-500/40 transition-all shadow-sm"
        >
          {collapsed ? <FiChevronRight className="w-3.5 h-3.5" /> : <FiChevronLeft className="w-3.5 h-3.5" />}
        </button>
        <SidebarContent />
      </aside>

      {/* Mobile */}
      {mobileOpen && (
        <>
          <div className="lg:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-40" onClick={onMobileClose} />
          <aside className="lg:hidden fixed left-0 top-0 h-full w-[240px] bg-[#0d1117] z-50 flex flex-col border-r border-white/[0.06]">
            <button onClick={onMobileClose} className="absolute top-5 right-4 text-slate-400 hover:text-white">
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
