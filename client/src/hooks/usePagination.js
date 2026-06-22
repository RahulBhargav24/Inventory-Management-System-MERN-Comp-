import { useState } from 'react';

const usePagination = (initialLimit = 10) => {
  const [page, setPage] = useState(1);
  const [limit] = useState(initialLimit);

  const goToPage = (newPage) => setPage(newPage);
  const nextPage = (totalPages) => setPage((p) => Math.min(p + 1, totalPages));
  const prevPage = () => setPage((p) => Math.max(p - 1, 1));
  const resetPage = () => setPage(1);

  return { page, limit, goToPage, nextPage, prevPage, resetPage };
};

export default usePagination;
