/**
 * Format date to Indonesian locale (YYYY-MM-DD -> dd MMMM yyyy, dddd)
 */
export const formatDateLabel = (dateString) => {
  if (!dateString) return '';
  
  const date = new Date(dateString);
  const options = { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric',
    weekday: 'long'
  };
  
  return date.toLocaleDateString('id-ID', options);
};

/**
 * Extract date from datetime string (YYYY-MM-DD HH:MM:SS -> YYYY-MM-DD)
 */
export const extractDate = (dateTimeString) => {
  if (!dateTimeString) return null;
  return dateTimeString.split(' ')[0];
};

/**
 * Group array of items by their date
 * Returns: { [date]: [items] }
 */
export const groupByDate = (items, dateField = 'created_at') => {
  const grouped = {};
  
  items.forEach(item => {
    const date = extractDate(item[dateField]);
    if (date) {
      if (!grouped[date]) {
        grouped[date] = [];
      }
      grouped[date].push(item);
    }
  });
  
  // Sort dates in descending order (newest first)
  const sortedDates = Object.keys(grouped).sort().reverse();
  
  return { grouped, sortedDates };
};

/**
 * Format short date for display (YYYY-MM-DD -> dd/MM/yyyy)
 */
export const formatDateShort = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
};
