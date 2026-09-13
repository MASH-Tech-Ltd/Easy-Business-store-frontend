/**
 * Formats a price with a currency symbol and a space between them.
 * e.g. formatPrice(39869, 'BDT') => 'BDT 39,869'
 *      formatPrice(39869, '৳')   => '৳ 39,869'
 */
export function formatPrice(
  amount: number | string | undefined | null,
  currencySymbol: string | undefined | null = '৳'
): string {
  const symbol = currencySymbol || '৳';
  const value = Number(amount ?? 0);
  return `${symbol} ${value.toLocaleString()}`;
}
