import { FiTrendingUp, FiTrendingDown } from 'react-icons/fi';

const colorMap = {
  indigo:  'bg-emerald-50 text-[#059669]',
  blue:    'bg-sky-50 text-sky-600',
  green:   'bg-emerald-50 text-emerald-600',
  purple:  'bg-violet-50 text-violet-600',
  orange:  'bg-orange-50 text-orange-600',
  red:     'bg-rose-50 text-rose-600',
  yellow:  'bg-amber-50 text-amber-600',
  teal:    'bg-teal-50 text-teal-600',
  brand:   'bg-emerald-50 text-[#059669]',
};

const StatCard = ({ title, value, icon: Icon, color, trend, subtitle }) => (
  <div
    className="bg-white rounded-2xl border border-[#E2E8F0] p-5 transition-all duration-200 hover:border-slate-300"
    style={{ boxShadow: '0 1px 3px rgba(15,23,42,0.06)' }}
  >
    <div className="flex items-start justify-between mb-4">
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${colorMap[color] || colorMap.brand}`}>
        <Icon className="w-[18px] h-[18px]" />
      </div>
      {trend !== undefined && (
        <div className={`flex items-center gap-0.5 text-xs font-semibold px-2 py-0.5 rounded-full
          ${trend >= 0 ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-600'}`}
        >
          {trend >= 0
            ? <FiTrendingUp className="w-3 h-3" />
            : <FiTrendingDown className="w-3 h-3" />
          }
          {Math.abs(trend)}%
        </div>
      )}
    </div>
    <p className="text-[22px] font-semibold text-[#0F172A] tracking-tight leading-none">{value}</p>
    <p className="text-[#64748B] text-sm mt-1.5">{title}</p>
    {subtitle && <p className="text-[#94A3B8] text-xs mt-1">{subtitle}</p>}
  </div>
);

export default StatCard;
