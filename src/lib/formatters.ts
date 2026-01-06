/**
 * Utility functions for formatting dates, currency, and other data
 */

/**
 * Format amount as PLN currency
 */
export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat("pl-PL", {
    style: "currency",
    currency: "PLN",
  }).format(amount);
};

/**
 * Get month name from month number (1-12)
 */
export const getMonthName = (month: number): string => {
  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];
  return monthNames[month - 1] || "";
};

/**
 * Format month and year for display
 */
export const formatMonthYear = (month: number, year: number): string => {
  const date = new Date(year, month - 1);
  return new Intl.DateTimeFormat("en-US", {
    month: "long",
    year: "numeric",
  }).format(date);
};

/**
 * Format date for display
 */
export const formatDate = (date: string | Date): string => {
  return new Date(date).toLocaleDateString();
};

