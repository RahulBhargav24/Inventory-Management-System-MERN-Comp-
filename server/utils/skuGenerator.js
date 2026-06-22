const generateSKU = (productName, categoryName) => {
  const prefix = (categoryName || 'PRD')
    .replace(/[^a-zA-Z]/g, '')
    .substring(0, 3)
    .toUpperCase();
  const namePart = (productName || '')
    .replace(/[^a-zA-Z0-9]/g, '')
    .substring(0, 4)
    .toUpperCase();
  const randomPart = Math.random().toString(36).substring(2, 6).toUpperCase();
  const timestamp = Date.now().toString().slice(-4);
  return `${prefix}-${namePart}-${randomPart}${timestamp}`;
};

module.exports = generateSKU;
