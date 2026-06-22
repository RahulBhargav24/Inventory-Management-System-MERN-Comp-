const Spinner = ({ size = 'md', className = '' }) => {
  const sizes = {
    sm: 'w-4 h-4 border-2',
    md: 'w-8 h-8 border-4',
    lg: 'w-12 h-12 border-4',
  };

  return (
    <div
      className={`${sizes[size]} border-indigo-600 border-t-transparent rounded-full animate-spin ${className}`}
    />
  );
};

export const PageLoader = () => (
  <div className="flex items-center justify-center min-h-[400px]">
    <div className="flex flex-col items-center gap-3">
      <Spinner size="lg" />
      <p className="text-slate-500 text-sm">Loading...</p>
    </div>
  </div>
);

export default Spinner;
