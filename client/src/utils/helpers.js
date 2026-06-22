export const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
  }).format(amount || 0);
};

export const formatDate = (date) => {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

export const formatDateTime = (date) => {
  return new Date(date).toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

export const getStockStatus = (quantity) => {
  if (quantity === 0) return { label: 'Out of Stock', className: 'badge-danger' };
  if (quantity < 10) return { label: 'Low Stock', className: 'badge-warning' };
  return { label: 'In Stock', className: 'badge-success' };
};

export const getOrderStatusBadge = (status) => {
  const map = {
    pending: 'badge-warning',
    processing: 'badge-info',
    completed: 'badge-success',
    cancelled: 'badge-danger',
  };
  return map[status] || 'badge-gray';
};

export const getImageUrl = (image) => {
  if (!image) return null;
  if (image.startsWith('http')) return image;
  return image;
};

export const generateSKUClient = (name, category) => {
  const prefix = (category || 'PRD').replace(/[^a-zA-Z]/g, '').substring(0, 3).toUpperCase();
  const namePart = (name || '').replace(/[^a-zA-Z0-9]/g, '').substring(0, 4).toUpperCase();
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  const ts = Date.now().toString().slice(-4);
  return `${prefix}-${namePart}-${random}${ts}`;
};

export const downloadCSV = (data, filename) => {
  if (!data || data.length === 0) return;
  const headers = Object.keys(data[0]);
  const csvContent = [
    headers.join(','),
    ...data.map((row) =>
      headers.map((h) => {
        const val = row[h];
        const str = val == null ? '' : String(val).replace(/"/g, '""');
        return str.includes(',') ? `"${str}"` : str;
      }).join(',')
    ),
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${filename}.csv`;
  link.click();
  URL.revokeObjectURL(url);
};

export const getErrorMessage = (error) => {
  return error?.response?.data?.message || error?.message || 'Something went wrong';
};
