export const getCurrencySymbol = (currencyCode: string): string => {
  switch (currencyCode) {
    case 'USD': return '$';
    case 'EUR': return '€';
    case 'GBP': return '£';
    case 'JPY': return '¥';
    case 'INR':
    default: return '₹';
  }
};

export const formatCurrency = (amount: number, currencyCode: string = 'INR'): string => {
  const locale = currencyCode === 'INR' ? 'en-IN' : 'en-US';
  try {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: currencyCode,
      maximumFractionDigits: 0
    }).format(amount);
  } catch (e) {
    const symbol = getCurrencySymbol(currencyCode);
    return `${symbol}${amount.toLocaleString()}`;
  }
};

export const formatDate = (dateString: string, type: 'short' | 'full' = 'short'): string => {
  // Ensure date parsing doesn't shift timezone by treating the date string as local
  const [year, month, day] = dateString.split('-').map(Number);
  const date = new Date(year, month - 1, day);
  
  if (isNaN(date.getTime())) return dateString;
  
  if (type === 'short') {
    // "11 Aug"
    return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
  }
  // "11 August 2026"
  return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });
};

export const getMonthName = (monthNumber: number): string => {
  const date = new Date(2000, monthNumber - 1, 1);
  return date.toLocaleDateString('en-US', { month: 'long' });
};
