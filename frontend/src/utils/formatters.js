/**
 * Format price display
 * @param {number} price - Price to format
 * @returns {string} Formatted price
 */
export const formatPrice = (price) => {
  if (typeof price === "number") {
    return `R$ ${price.toFixed(2).replace(".", ",")}`;
  }
  return "-";
};

/**
 * Get friendly supermarket name
 * @param {string} key - Supermarket key
 * @returns {string} Formatted supermarket name
 */
export const getSupermarketName = (key) => {
  const names = {
    atacadao: "Atacadão",
    spani: "Spani",
    tenda: "Tenda",
  };
  return names[key] || key;
};

/**
 * Sort results based on field and direction
 * @param {Array} results - Results to sort
 * @param {string} field - Field to sort by
 * @param {string} direction - Sort direction ('asc' or 'desc')
 * @returns {Array} Sorted results
 */
export const sortResults = (results, field, direction) => {
  return [...results].sort((a, b) => {
    let aValue = a[field];
    let bValue = b[field];
    
    // Handle string comparisons
    if (typeof aValue === 'string' && typeof bValue === 'string') {
      aValue = aValue.toLowerCase();
      bValue = bValue.toLowerCase();
    }
    
    // Handle price special case
    if (field === 'preco') {
      aValue = typeof aValue === 'number' ? aValue : Number.MAX_VALUE;
      bValue = typeof bValue === 'number' ? bValue : Number.MAX_VALUE;
    }
    
    if (aValue < bValue) return direction === 'asc' ? -1 : 1;
    if (aValue > bValue) return direction === 'asc' ? 1 : -1;
    return 0;
  });
};