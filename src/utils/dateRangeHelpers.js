/**
 * Utility functions for quick date range selection
 */

// Format date as YYYY-MM-DD
export const formatDate = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

// Get date range based on preset options
export const getDateRange = (rangeType) => {
  const today = new Date();
  let start, end;

  switch (rangeType) {
    case 'last7':
      start = new Date(today);
      start.setDate(start.getDate() - 7);
      end = today;
      break;
    case 'last30':
      start = new Date(today);
      start.setDate(start.getDate() - 30);
      end = today;
      break;
    case 'last90':
      start = new Date(today);
      start.setDate(start.getDate() - 90);
      end = today;
      break;
    case 'thisMonth':
      start = new Date(today.getFullYear(), today.getMonth(), 1);
      end = today;
      break;
    case 'lastMonth':
      start = new Date(today.getFullYear(), today.getMonth() - 1, 1);
      end = new Date(today.getFullYear(), today.getMonth(), 0);
      break;
    case 'thisYear':
      start = new Date(today.getFullYear(), 0, 1);
      end = today;
      break;
    default:
      return null;
  }

  return {
    startDate: formatDate(start),
    endDate: formatDate(end)
  };
};

// Quick filter button configuration
export const QUICK_FILTER_OPTIONS = [
  { id: 'last7', label: 'Last 7 Days', color: 'blue' },
  { id: 'last30', label: 'Last 30 Days', color: 'blue' },
  { id: 'last90', label: 'Last 90 Days', color: 'blue' },
  { id: 'thisMonth', label: 'This Month', color: 'green' },
  { id: 'lastMonth', label: 'Last Month', color: 'green' },
  { id: 'thisYear', label: 'This Year', color: 'purple' }
];

// Get button style based on color
export const getButtonClass = (color) => {
  const baseClass = 'px-4 py-2 rounded font-semibold hover:transition';
  const colorClasses = {
    blue: 'bg-blue-100 text-blue-700 hover:bg-blue-200',
    green: 'bg-green-100 text-green-700 hover:bg-green-200',
    purple: 'bg-purple-100 text-purple-700 hover:bg-purple-200'
  };
  return `${baseClass} ${colorClasses[color] || colorClasses.blue}`;
};
