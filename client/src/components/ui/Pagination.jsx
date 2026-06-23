import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';

const Pagination = ({ page, pages, total, limit, onPageChange }) => {
  if (!pages || pages <= 1) return null;

  const start = (page - 1) * limit + 1;
  const end   = Math.min(page * limit, total);

  const getPages = () => {
    const delta = 2;
    const range = [];
    for (let i = Math.max(2, page - delta); i <= Math.min(pages - 1, page + delta); i++) {
      range.push(i);
    }
    if (page - delta > 2)        range.unshift('...');
    if (page + delta < pages - 1) range.push('...');
    range.unshift(1);
    if (pages > 1) range.push(pages);
    return range;
  };

  return (
    <div className="flex items-center justify-between px-5 py-3.5 border-t border-[#F1F5F9]">
      <p className="text-xs text-[#64748B]">
        Showing{' '}
        <span className="font-semibold text-[#0F172A]">{start}–{end}</span>
        {' '}of{' '}
        <span className="font-semibold text-[#0F172A]">{total}</span>
        {' '}results
      </p>

      <div className="flex items-center gap-1">
        <button
          onClick={() => onPageChange(page - 1)}
          disabled={page === 1}
          className="p-1.5 rounded-lg text-[#64748B] hover:bg-slate-100 disabled:opacity-35 disabled:cursor-not-allowed transition-colors duration-200"
        >
          <FiChevronLeft className="w-4 h-4" />
        </button>

        {getPages().map((p, idx) =>
          p === '...' ? (
            <span key={`e${idx}`} className="w-8 text-center text-[#94A3B8] text-sm">…</span>
          ) : (
            <button
              key={p}
              onClick={() => onPageChange(p)}
              className={`w-8 h-8 rounded-lg text-sm font-medium transition-all duration-200 ${
                p === page
                  ? 'text-white'
                  : 'text-[#64748B] hover:bg-slate-100'
              }`}
              style={p === page ? { backgroundImage: 'linear-gradient(180deg, #10B981 0%, #059669 100%)' } : undefined}
            >
              {p}
            </button>
          )
        )}

        <button
          onClick={() => onPageChange(page + 1)}
          disabled={page === pages}
          className="p-1.5 rounded-lg text-[#64748B] hover:bg-slate-100 disabled:opacity-35 disabled:cursor-not-allowed transition-colors duration-200"
        >
          <FiChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default Pagination;
