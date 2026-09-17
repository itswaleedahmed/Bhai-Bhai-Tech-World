export function formatPKR(amount: number | undefined | null): string {
  if (amount === undefined || amount === null || isNaN(amount)) {
    return 'Rs 0';
  }
  return `Rs ${Math.round(amount).toLocaleString('en-PK')}`;
}
