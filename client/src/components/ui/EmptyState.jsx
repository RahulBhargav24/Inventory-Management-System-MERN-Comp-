import { FiPackage } from 'react-icons/fi';

const EmptyState = ({
  title = 'No data found',
  description = 'Get started by creating your first item.',
  action,
  icon: CustomIcon,
}) => {
  const Icon = CustomIcon || FiPackage;

  return (
    <div className="flex flex-col items-center justify-center py-20 px-8 text-center">
      {/* Icon container with layered depth */}
      <div className="relative mb-6">
        <div
          className="w-[72px] h-[72px] bg-[#F8FAFC] rounded-2xl flex items-center justify-center border border-[#E2E8F0]"
          style={{ boxShadow: '0 1px 3px rgba(15,23,42,0.06)' }}
        >
          <Icon className="w-8 h-8 text-slate-300" />
        </div>
        {/* Decorative accent dot */}
        <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-emerald-50 rounded-lg border border-emerald-100 flex items-center justify-center">
          <div className="w-1.5 h-1.5 bg-[#10B981] rounded-full" />
        </div>
      </div>

      {/* Text */}
      <h3 className="text-[#0F172A] font-semibold text-base">{title}</h3>
      <p className="text-[#64748B] text-sm mt-2 max-w-xs leading-relaxed">{description}</p>

      {/* Action */}
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
};

export default EmptyState;
