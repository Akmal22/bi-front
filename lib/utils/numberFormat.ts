/**
 * Formats a number with space separators for readability
 * Example: 3000000 -> "3 000 000"
 */
export function formatNumber(value: number | string | undefined | null): string {
  if (value === undefined || value === null || value === '') {
    return '';
  }
  
  // Convert to string and remove any existing formatting
  const numStr = String(value).replace(/\s/g, '');
  
  // Handle empty string
  if (numStr === '') {
    return '';
  }
  
  // Split into integer and decimal parts
  const parts = numStr.split('.');
  const integerPart = parts[0];
  const decimalPart = parts[1];
  
  // Add space separators every 3 digits from right to left
  const formattedInteger = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
  
  // Combine integer and decimal parts
  return decimalPart !== undefined ? `${formattedInteger}.${decimalPart}` : formattedInteger;
}

/**
 * Parses a formatted number string back to a number
 * Example: "3 000 000" -> 3000000
 */
export function parseNumber(value: string): number | undefined {
  if (!value || value.trim() === '') {
    return undefined;
  }
  
  // Remove all spaces and parse
  const cleaned = value.replace(/\s/g, '');
  const parsed = parseFloat(cleaned);
  
  return isNaN(parsed) ? undefined : parsed;
}

/**
 * Parses a formatted number string to an integer
 */
export function parseInteger(value: string): number | undefined {
  if (!value || value.trim() === '') {
    return undefined;
  }
  
  // Remove all spaces and parse
  const cleaned = value.replace(/\s/g, '');
  const parsed = parseInt(cleaned, 10);
  
  return isNaN(parsed) ? undefined : parsed;
}
