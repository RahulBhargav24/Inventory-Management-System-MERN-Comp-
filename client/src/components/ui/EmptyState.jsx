import { FiInbox } from 'react-icons/fi';

const EmptyState = ({ title = 'No data found', description = 'Get started by creating your first item.', action }) => (
  <div className="flex flex-col items-center justify-center py-16 gap-4">
    <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center">
      <FiInbox className="w-8 h-8 text-slate-400" />
    </div>
    <div className="text-center">
      <h3 className="text-slate-700 font-semibold">{title}</h3>
      <p className="text-slate-400 text-sm mt-1">{description}</p>
    </div>
    {action && action}
  </div>
);

export default EmptyState;
