import { useState, useEffect } from 'react';
import {
  FiBox, FiTag, FiTruck, FiShoppingBag, FiDollarSign,
  FiAlertTriangle, FiXCircle, FiClipboard,
  FiArrowUpRight, FiArrowDownRight,
} from 'react-icons/fi';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, AreaChart, Area,
} from 'recharts';
import { dashboardAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { PageLoader } from '../components/ui/Spinner';
import { formatCurrency, formatDate, getOrderStatusBadge, getStockStatus } from '../utils/helpers';
import { toast } from 'react-toastify';

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const PIE_COLORS = ['#059669', '#0EA5E9', '#8B5CF6', '#F59E0B', '#F43F5E', '#14B8A6', '#F97316'];

/* ── Shared glass styles ──────────────────────────────── */
const glassCard = {
  background: 'rgba(255, 255, 255, 0.68)',
  backdropFilter: 'blur(24px)',
  WebkitBackdropFilter: 'blur(24px)',
  border: '1px solid rgba(255, 255, 255, 0.65)',
  boxShadow:
    'inset 0 1px 0 rgba(255,255,255,0.92),' +
    '0 8px 32px rgba(15,23,42,0.08),' +
    '0 2px 8px rgba(15,23,42,0.04)',
};

const glassCardHover = {
  ...glassCard,
  boxShadow:
    'inset 0 1px 0 rgba(255,255,255,0.95),' +
    '0 16px 48px rgba(15,23,42,0.1),' +
    '0 4px 12px rgba(15,23,42,0.06)',
};

/* ── KPI Card ─────────────────────────────────────────── */
const KpiCard = ({ title, value, icon: Icon, color, change }) => {
  const [hovered, setHovered] = useState(false);

  const iconMap = {
    indigo:  'bg-emerald-50 text-[#059669]',
    emerald: 'bg-emerald-50 text-emerald-600',
    amber:   'bg-amber-50 text-amber-600',
    rose:    'bg-rose-50 text-rose-600',
    violet:  'bg-violet-50 text-violet-600',
    teal:    'bg-teal-50 text-teal-600',
    sky:     'bg-sky-50 text-sky-600',
    orange:  'bg-orange-50 text-orange-600',
  };
  const iconCls = iconMap[color] || iconMap.emerald;
  const positive = change === undefined || change >= 0;

  return (
    <div
      className="rounded-2xl p-5 transition-all duration-200 cursor-default"
      style={hovered ? glassCardHover : glassCard}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div className="flex items-start justify-between mb-4">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${iconCls}`}
          style={{ backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.5)' }}
        >
          <Icon className="w-[18px] h-[18px]" />
        </div>
        {change !== undefined && (
          <div className={`flex items-center gap-0.5 text-xs font-semibold px-2 py-0.5 rounded-full
            ${positive ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-600'}`}
            style={{ border: `1px solid ${positive ? 'rgba(16,185,129,0.2)' : 'rgba(220,38,38,0.15)'}` }}
          >
            {positive
              ? <FiArrowUpRight className="w-3 h-3" />
              : <FiArrowDownRight className="w-3 h-3" />
            }
            {Math.abs(change)}%
          </div>
        )}
      </div>
      <p className="text-[22px] font-semibold text-[#0F172A] tracking-tight leading-none">{value}</p>
      <p className="text-[#64748B] text-sm mt-1.5">{title}</p>
    </div>
  );
};

/* ── Chart Tooltip ────────────────────────────────────── */
const CustomTooltip = ({ active, payload, label, currency }) => {
  if (!active || !payload?.length) return null;
  return (
    <div
      className="rounded-xl px-4 py-3 text-sm"
      style={{
        background: 'rgba(255,255,255,0.88)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        border: '1px solid rgba(255,255,255,0.75)',
        boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.9), 0 8px 24px rgba(15,23,42,0.12)',
      }}
    >
      <p className="font-semibold text-[#0F172A] mb-1.5">{label}</p>
      {payload.map((p) => (
        <p key={p.dataKey} style={{ color: p.color }} className="font-medium">
          {p.name}: {currency ? formatCurrency(p.value) : p.value}
        </p>
      ))}
    </div>
  );
};

/* ── Chart Card ───────────────────────────────────────── */
const ChartCard = ({ title, subtitle, children, className = '' }) => (
  <div className={`rounded-2xl p-6 ${className}`} style={glassCard}>
    <div className="mb-5">
      <h3 className="font-semibold text-[#0F172A] text-sm">{title}</h3>
      {subtitle && <p className="text-[#64748B] text-xs mt-0.5">{subtitle}</p>}
    </div>
    {children}
  </div>
);

/* ── No-data placeholder ──────────────────────────────── */
const NoData = ({ height = 'h-52' }) => (
  <div className={`${height} flex items-center justify-center text-[#94A3B8] text-sm`}>
    No data yet
  </div>
);

/* ── Dashboard ────────────────────────────────────────── */
const Dashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const { isAdmin, user } = useAuth();

  useEffect(() => {
    if (isAdmin) fetchStats();
    else setLoading(false);
  }, [isAdmin]);

  const fetchStats = async () => {
    try {
      const res = await dashboardAPI.getStats();
      setData(res.data.data);
    } catch {
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  /* Non-admin view */
  if (!isAdmin) {
    return (
      <div className="space-y-6">
        <div
          className="rounded-2xl p-8 text-white relative overflow-hidden"
          style={{
            background: 'rgba(15,23,42,0.82)',
            backdropFilter: 'blur(32px)',
            WebkitBackdropFilter: 'blur(32px)',
            border: '1px solid rgba(255,255,255,0.08)',
            boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.06), 0 8px 32px rgba(15,23,42,0.2)',
          }}
        >
          <div className="relative z-10">
            <p className="text-slate-400 text-sm font-medium mb-1">Welcome back</p>
            <h2 className="text-2xl font-semibold text-white">{user?.name}</h2>
            <p className="text-slate-400 text-sm mt-2 max-w-sm leading-relaxed">
              Use the navigation to browse products and manage your orders.
            </p>
          </div>
          <div className="absolute -top-8 -right-8 w-40 h-40 rounded-full" style={{ background: 'rgba(16,185,129,0.06)' }} />
          <div className="absolute -bottom-10 right-20 w-24 h-24 rounded-full" style={{ background: 'rgba(16,185,129,0.04)' }} />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[
            { icon: FiBox,         label: 'Browse Products', desc: 'View the full product catalog' },
            { icon: FiShoppingBag, label: 'My Orders',       desc: 'View and create sales orders' },
          ].map(({ icon: Icon, label, desc }) => (
            <div key={label} className="rounded-2xl p-5 flex items-center gap-4 transition-all duration-200 cursor-pointer" style={glassCard}>
              <div
                className="w-11 h-11 bg-emerald-50 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ border: '1px solid rgba(16,185,129,0.15)' }}
              >
                <Icon className="w-5 h-5 text-[#059669]" />
              </div>
              <div>
                <p className="font-semibold text-[#0F172A] text-sm">{label}</p>
                <p className="text-[#64748B] text-sm mt-0.5">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (loading) return <PageLoader />;

  const s = data?.stats || {};
  const monthlyData = (data?.monthlyOrders || []).map((m) => ({
    name: MONTHS[m._id.month - 1],
    orders: m.count,
    revenue: m.revenue,
  }));

  return (
    <div className="space-y-6">

      {/* Welcome banner — dark glass */}
      <div
        className="rounded-2xl p-6 flex items-center justify-between overflow-hidden relative"
        style={{
          background: 'rgba(15,23,42,0.82)',
          backdropFilter: 'blur(32px)',
          WebkitBackdropFilter: 'blur(32px)',
          border: '1px solid rgba(255,255,255,0.08)',
          boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.07), 0 8px 32px rgba(15,23,42,0.2)',
        }}
      >
        <div className="relative z-10">
          <p className="text-slate-500 text-xs font-medium mb-1 uppercase tracking-wider">
            {formatDate(new Date())}
          </p>
          <h2 className="text-white font-semibold text-xl">Welcome back, {user?.name}</h2>
          <p className="text-slate-400 text-sm mt-1">Here's your inventory overview for today.</p>
        </div>
        <div className="hidden sm:flex items-center gap-6 relative z-10">
          <div className="text-right">
            <p className="text-slate-500 text-xs mb-1">Total Revenue</p>
            <p className="text-white font-semibold text-lg leading-none">{formatCurrency(s.revenue)}</p>
          </div>
          <div className="w-px h-10" style={{ background: 'rgba(255,255,255,0.08)' }} />
          <div className="text-right">
            <p className="text-slate-500 text-xs mb-1">Total Orders</p>
            <p className="text-white font-semibold text-lg leading-none">{s.totalOrders || 0}</p>
          </div>
        </div>
        <div className="absolute -top-10 -right-10 w-48 h-48 rounded-full" style={{ background: 'rgba(16,185,129,0.06)' }} />
        <div className="absolute -bottom-12 right-24 w-28 h-28 rounded-full" style={{ background: 'rgba(16,185,129,0.04)' }} />
      </div>

      {/* KPI Cards — Row 1 */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard title="Total Products"  value={s.totalProducts || 0}  icon={FiBox}          color="indigo"  />
        <KpiCard title="Categories"      value={s.totalCategories || 0} icon={FiTag}         color="violet"  />
        <KpiCard title="Suppliers"       value={s.totalSuppliers || 0}  icon={FiTruck}       color="teal"    />
        <KpiCard title="Sales Orders"    value={s.totalOrders || 0}     icon={FiShoppingBag} color="sky"     />
      </div>

      {/* KPI Cards — Row 2 */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard title="Revenue"         value={formatCurrency(s.revenue)}      icon={FiDollarSign}    color="emerald" />
        <KpiCard title="Purchase Orders" value={s.totalPurchaseOrders || 0}     icon={FiClipboard}     color="orange"  />
        <KpiCard title="Low Stock"       value={s.lowStock || 0}                icon={FiAlertTriangle} color="amber"   />
        <KpiCard title="Out of Stock"    value={s.outOfStock || 0}              icon={FiXCircle}       color="rose"    />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <ChartCard title="Sales Overview" subtitle="Monthly orders for the last 6 months" className="lg:col-span-2">
          {monthlyData.length === 0 ? <NoData /> : (
            <ResponsiveContainer width="100%" height={216}>
              <BarChart data={monthlyData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }} barSize={28}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(15,23,42,0.05)" vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 12, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(16,185,129,0.06)', radius: 4 }} />
                <Bar dataKey="orders" name="Orders" fill="#059669" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </ChartCard>

        <ChartCard title="Category Distribution" subtitle="Products by category">
          {!data?.categoryDistribution?.length ? <NoData /> : (
            <>
              <ResponsiveContainer width="100%" height={164}>
                <PieChart>
                  <Pie data={data.categoryDistribution} dataKey="count" nameKey="name" cx="50%" cy="50%" innerRadius={46} outerRadius={72} strokeWidth={0}>
                    {data.categoryDistribution.map((_, i) => (
                      <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(v, n) => [v, n]} />
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-2 mt-3">
                {data.categoryDistribution.slice(0, 4).map((c, i) => (
                  <div key={c.name} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: PIE_COLORS[i % PIE_COLORS.length] }} />
                      <span className="text-[#64748B] text-xs truncate max-w-[110px]">{c.name}</span>
                    </div>
                    <span className="font-semibold text-[#0F172A] text-xs">{c.count}</span>
                  </div>
                ))}
              </div>
            </>
          )}
        </ChartCard>
      </div>

      {/* Revenue Trend */}
      <ChartCard title="Revenue Trend" subtitle="Monthly revenue for the last 6 months">
        {monthlyData.length === 0 ? <NoData height="h-40" /> : (
          <ResponsiveContainer width="100%" height={164}>
            <AreaChart data={monthlyData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#10B981" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#10B981" stopOpacity={0}   />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(15,23,42,0.05)" vertical={false} />
              <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 12, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip currency />} />
              <Area type="monotone" dataKey="revenue" name="Revenue" stroke="#059669" strokeWidth={2} fill="url(#revenueGrad)" dot={false} activeDot={{ r: 4, fill: '#059669', strokeWidth: 0 }} />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </ChartCard>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

        {/* Recent Orders */}
        <div className="rounded-2xl overflow-hidden" style={glassCard}>
          <div className="px-6 py-4 flex items-center justify-between" style={{ borderBottom: '1px solid rgba(15,23,42,0.05)' }}>
            <div>
              <h3 className="font-semibold text-[#0F172A] text-sm">Recent Sales Orders</h3>
              <p className="text-[#94A3B8] text-xs mt-0.5">Latest customer orders</p>
            </div>
          </div>
          {!data?.recentOrders?.length ? (
            <div className="flex items-center justify-center py-12 text-[#94A3B8] text-sm">No orders yet</div>
          ) : (
            <div>
              {data.recentOrders.map((order) => (
                <div
                  key={order._id}
                  className="flex items-center gap-3 px-6 py-3.5 transition-all duration-200"
                  style={{ borderBottom: '1px solid rgba(15,23,42,0.04)' }}
                  onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.4)'}
                  onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                >
                  <div className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0"
                    style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.15)' }}
                  >
                    <span className="text-[#059669] text-xs font-bold">{order.customerName.charAt(0).toUpperCase()}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-[#0F172A] truncate">{order.customerName}</p>
                    <p className="text-xs text-[#94A3B8] truncate">{order.product?.name}</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-sm font-semibold text-[#0F172A]">{formatCurrency(order.totalAmount)}</p>
                    <span className={`text-xs ${getOrderStatusBadge(order.status)}`}>{order.status}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Products */}
        <div className="rounded-2xl overflow-hidden" style={glassCard}>
          <div className="px-6 py-4 flex items-center justify-between" style={{ borderBottom: '1px solid rgba(15,23,42,0.05)' }}>
            <div>
              <h3 className="font-semibold text-[#0F172A] text-sm">Recent Products</h3>
              <p className="text-[#94A3B8] text-xs mt-0.5">Recently added inventory</p>
            </div>
          </div>
          {!data?.recentProducts?.length ? (
            <div className="flex items-center justify-center py-12 text-[#94A3B8] text-sm">No products yet</div>
          ) : (
            <div>
              {data.recentProducts.map((product) => {
                const stock = getStockStatus(product.quantity);
                return (
                  <div
                    key={product._id}
                    className="flex items-center gap-3 px-6 py-3.5 transition-all duration-200"
                    style={{ borderBottom: '1px solid rgba(15,23,42,0.04)' }}
                    onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.4)'}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                  >
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center overflow-hidden flex-shrink-0"
                      style={{ background: 'rgba(255,255,255,0.6)', border: '1px solid rgba(255,255,255,0.7)', backdropFilter: 'blur(8px)' }}
                    >
                      {product.image
                        ? <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                        : <FiBox className="w-4 h-4 text-slate-300" />
                      }
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-[#0F172A] truncate">{product.name}</p>
                      <p className="text-xs text-[#94A3B8]">{product.category?.name}</p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="text-sm font-semibold text-[#0F172A]">{formatCurrency(product.price)}</p>
                      <span className={`text-xs ${stock.className}`}>{stock.label}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
