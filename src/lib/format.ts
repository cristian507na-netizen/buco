export const formatCurrency = (amount: number | string): string => {
  const num = typeof amount === 'string' ? parseFloat(amount) : amount;
  if (isNaN(num)) return '$0.00';
  return num.toLocaleString('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
};

export const formatCurrencySimple = (amount: number | string): string => {
  const num = typeof amount === 'string' ? parseFloat(amount) : amount;
  if (isNaN(num)) return '0.00';
  return num.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
};

export const parseMoney = (value: string): string => {
  // Replace comma with dot for international support
  let normalized = value.replace(/,/g, ".");

  // If it's just a dot, allow it (for typing .5)
  if (normalized === ".") return "0.";

  // If it's empty, return empty
  if (normalized === "") return "";

  // Regular expression to check if it's a valid monetary format (up to 2 decimals)
  const regex = /^\d*\.?\d{0,2}$/;

  if (regex.test(normalized)) {
    return normalized;
  }

  // If invalid (e.g., more than 2 decimals), don't allow the change
  // In a real app, you might want to slice it, but for a controlled input onChange,
  // we just return a "cleaned" version or prevent the update.
  const parts = normalized.split(".");
  if (parts.length > 2) return parts[0] + "." + parts[1]; // Remove extra dots
  if (parts[1] && parts[1].length > 2) return parts[0] + "." + parts[1].slice(0, 2); // Truncate extra decimals

  // If it contains non-numeric chars, remove them
  return normalized.replace(/[^\d.]/g, "");
};

export const isValidDay = (day: string): boolean => {
  const num = parseInt(day, 10);
  return !isNaN(num) && num >= 1 && num <= 31;
};
