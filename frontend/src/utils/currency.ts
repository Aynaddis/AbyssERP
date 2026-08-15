/**
 * Formats a number as currency using the business's configured currency code
 * (from Settings → Finance). Falls back to a plain "CODE amount" string if
 * the browser's Intl doesn't recognize the code for some reason.
 */
export function formatCurrency(amount: number, currency: string = 'ETB'): string {
  try {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
      currencyDisplay: 'symbol',
    }).format(amount);
  } catch {
    return `${currency} ${amount.toFixed(2)}`;
  }
}

/**
 * Applies the business's configured tax rate (a percentage, e.g. 15) to a
 * subtotal and returns { taxAmount, total }. Returns zero tax if no rate is
 * configured (taxRate is null/undefined).
 */
export function applyTax(subtotal: number, taxRatePercent: number | null | undefined) {
  const rate = taxRatePercent ?? 0;
  const taxAmount = subtotal * (rate / 100);
  return { taxAmount, total: subtotal + taxAmount };
}