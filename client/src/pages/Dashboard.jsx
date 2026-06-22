import { useState, useEffect } from 'react';
import {
  FiBox, FiTag, FiTruck, FiShoppingBag, FiDollarSign,
  FiAlertTriangle, FiXCircle, FiClipboard, FiArrowUpRight,
  FiArrowDownRight,
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
const PIE_COLORS = ['#6366f1', '#10b981', '#f59e0b', '#f43f5e', '#8b5cf6', '#06b6d4', '#f97316'];

const KpiCard = ({ title, value, icon: Icon, color, change, suffix = '' }) => {
  const colors = {
    indigo: 'bg-indigo-600',
    emerald: 'bg-emerald-500',
    amber: 'bg-amber-500',
    rose: 'bg-rose-500',
    violet: 'bg-violet-500',
    teal: 'bg-teal-500',
    sky: 'bg-sky-500',
    orange: 'bg-orange-500',
  };
  const bg = colors[color] || colors.indigo;
  const positive = change === undefined || change >= 0;

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 flex items-start gap-4 hover:shadow-md transition-shadow">
      <div className={`w-12 h-12 ${bg} rounded-xl flex items-center justify-center flex-shrink-0`}>
        <Icon className="w-6 h-6 text-white" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-slate-500 text-sm font-medium truncate">{title}</p>
        <p className="text-2xl font-bold text-slate-900 mt-0.5 tracking-tight">{suffix}{value}</p>
        {change !== undefined && (
          <div className={`flex items-center gap-1 mt-1.5 text-xs font-medium ${positive ? 'text-emerald-600' : 'text-rose-500'}`}>
            {positive ? <FiArrowUpRight className="w-3.5 h-3.5" /> : <FiArrowDownRight className="w-3.5 h-3.5" />}
            {Math.abs(change)}% vs last month
          </div>
        )}
      </div>
    </div>
  );
};

const CustomTooltip = ({ active, payload, label, currency }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-slate-200 rounded-xl shadow-lg px-4 py-3 text-sm">
      <p className="font-semibold text-slate-700 mb-1">{label}</p>
      {payload.map((p) => (
        <p key={p.dataKey} style={{ color: p.color }} className="font-medium">
          {p.name}: {currency ? formatCurrency(p.value) : p.value}
        </p>
      ))}
    </div>
  );
};

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

  if (!isAdmin) {
    return (
      <div className="space-y-5">
        <div className="bg-gradient-to-r from-indigo-600 to-violet-600 rounded-2xl p-8 text-white">
          <h2 className="text-2xl font-bold">Welcome back, {user?.name}!</h2>
          <p className="text-indigo-200 mt-1">Here's what you can do from the sidebar.</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[
            { icon: FiBox, label: 'Browse Products', desc: 'View the full product catalog', path: '/products' },
            { icon: FiShoppingBag, label: 'My Orders', desc: 'View and create sales orders', path: '/orders' },
          ].map(({ icon: Icon, label, desc }) => (
            <div key={label} className="bg-white rounded-xl border border-slate-200 p-5 flex items-center gap-4">
              <div className="w-12 h-12 bg-indigo-50 rounded-xl flex items-center justify-center">
                <Icon className="w-6 h-6 text-indigo-600" />
              </div>
              <div>
                <p className="font-semibold text-slate-800">{label}</p>
                <p className="text-slate-400 text-sm">{desc}</p>
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
      {/* Welcome banner */}
      <div className="bg-gradient-to-r from-indigo-600 via-indigo-700 to-violet-700 rounded-2xl p-6 flex items-center justify-between overflow-hidden relative">
        <div className="relative z-10">
          <h2 className="text-white font-bold text-xl">Welcome back, {user?.name}!</h2>
          <p className="text-indigo-200 text-sm mt-0.5">
            {formatDate(new Date())} — Here's your inventory overview
          </p>
        </div>
        <div className="hidden sm:flex items-center gap-4 relative z-10">
          <div className="text-center">
            <p className="text-indigo-200 text-xs">Total Revenue</p>
            <p className="text-white font-bold text-lg">{formatCurrency(s.revenue)}</p>
          </div>
          <div className="w-px h-10 bg-indigo-500" />
          <div className="text-center">
            <p className="text-indigo-200 text-xs">Total Orders</p>
            <p className="text-white font-bold text-lg">{s.totalOrders || 0}</p>
          </div>
        </div>
        {/* Decorative circles */}
        <div className="absolute -top-8 -right-8 w-40 h-40 bg-white/5 rounded-full" />
        <div className="absolute -bottom-10 -right-4 w-24 h-24 bg-white/5 rounded-full" />
      </div>

      {/* KPI Cards - Row 1 */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard title="Total Products" value={s.totalProducts || 0} icon={FiBox} color="indigo" />
        <KpiCard title="Categories" value={s.totalCategories || 0} icon={FiTag} color="violet" />
        <KpiCard title="Suppliers" value={s.totalSuppliers || 0} icon={FiTruck} color="teal" />
        <KpiCard title="Sales Orders" value={s.totalOrders || 0} icon={FiShoppingBag} color="sky" />
      </div>

      {/* KPI Cards - Row 2 */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard title="Revenue" value={formatCurrency(s.revenue)} icon={FiDollarSign} color="emerald" />
        <KpiCard title="Purchase Orders" value={s.totalPurchaseOrders || 0} icon={FiClipboard} color="orange" />
        <KpiCard title="Low Stock" value={s.lowStock || 0} icon={FiAlertTriangle} color="amber" />
        <KpiCard title="Out of Stock" value={s.outOfStock || 0} icon={FiXCircle} color="rose" />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Monthly Orders */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 p-5">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="font-bold text-slate-800">Sales Overview</h3>
              <p className="text-slate-400 text-xs mt-0.5">Monthly orders for the last 6 months</p>
            </div>
          </div>
          {monthlyData.length === 0 ? (
            <div className="h-52 flex items-center justify-center text-slate-400 text-sm">No data yet</div>
          ) : (
            <ResponsiveContainer width="100%" height={210}>
              <BarChart data={monthlyData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }} barSize={32}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 12, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: '#f8fafc' }} />
                <Bar dataKey="orders" name="Orders" fill="#6366f1" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Category Distribution */}
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <div className="mb-5">
            <h3 className="font-bold text-slate-800">Category Distribution</h3>
            <p className="text-slate-400 text-xs mt-0.5">Products by category</p>
          </div>
          {!data?.categoryDistribution?.length ? (
            <div className="h-52 flex items-center justify-center text-slate-400 text-sm">No data yet</div>
          ) : (
            <>
              <ResponsiveContainer width="100%" height={160}>
                <PieChart>
                  <Pie data={data.categoryDistribution} dataKey="count" nameKey="name" cx="50%" cy="50%" innerRadius={45} outerRadius={70}>
                    {data.categoryDistribution.map((_, i) => (
                      <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(v, n) => [v, n]} />
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-1.5 mt-3">
                {data.categoryDistribution.slice(0, 4).map((c, i) => (
                  <div key={c.name} className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-1.5">
                      <div className="w-2.5 h-2.5 rounded-full" style={{ background: PIE_COLORS[i % PIE_COLORS.length] }} />
                      <span className="text-slate-600 truncate max-w-[100px]">{c.name}</span>
                    </div>
                    <span className="font-semibold text-slate-700">{c.count}</span>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Revenue Area Chart */}
      <div className="bg-white rounded-xl border border-slate-200 p-5">
        <div className="mb-5">
          <h3 className="font-bold text-slate-800">Revenue Trend</h3>
          <p className="text-slate-400 text-xs mt-0.5">Monthly revenue for the last 6 months</p>
        </div>
        {monthlyData.length === 0 ? (
          <div className="h-40 flex items-center justify-center text-slate-400 text-sm">No data yet</div>
        ) : (
          <ResponsiveContainer width="100%" height={160}>
            <AreaChart data={monthlyData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 12, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip currency />} />
              <Area type="monotone" dataKey="revenue" name="Revenue" stroke="#6366f1" strokeWidth={2.5} fill="url(#revenueGrad)" dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Recent tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Recent Orders */}
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
            <h3 className="font-bold text-slate-800 text-sm">Recent Sales Orders</h3>
          </div>
          {!data?.recentOrders?.length ? (
            <p className="text-slate-400 text-sm text-center py-10">No orders yet</p>
          ) : (
            <div className="divide-y divide-slate-100">
              {data.recentOrders.map((order) => (
                <div key={order._id} className="flex items-center gap-3 px-5 py-3.5 hover:bg-slate-50 transition-colors">
                  <div className="w-9 h-9 bg-indigo-50 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-indigo-600 text-xs font-bold">
                      {order.customerName.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-slate-800 truncate">{order.customerName}</p>
                    <p className="text-xs text-slate-400 truncate">{order.product?.name}</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-sm font-bold text-slate-800">{formatCurrency(order.totalAmount)}</p>
                    <span className={`text-xs ${getOrderStatusBadge(order.status)}`}>
                      {order.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Products */}
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
            <h3 className="font-bold text-slate-800 text-sm">Recent Products</h3>
          </div>
          {!data?.recentProducts?.length ? (
            <p className="text-slate-400 text-sm text-center py-10">No products yet</p>
          ) : (
            <div className="divide-y divide-slate-100">
              {data.recentProducts.map((product) => {
                const stock = getStockStatus(product.quantity);
                return (
                  <div key={product._id} className="flex items-center gap-3 px-5 py-3.5 hover:bg-slate-50 transition-colors">
                    <div className="w-9 h-9 rounded-lg bg-slate-100 flex items-center justify-center overflow-hidden flex-shrink-0">
                      {product.image ? (
                        <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                      ) : (
                        <FiBox className="w-4 h-4 text-slate-400" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-slate-800 truncate">{product.name}</p>
                      <p className="text-xs text-slate-400">{product.category?.name}</p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="text-sm font-bold text-slate-800">{formatCurrency(product.price)}</p>
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
