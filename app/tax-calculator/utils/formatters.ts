export const formatCurrency = (amount: number | undefined): string => {
  return new Intl.NumberFormat('th-TH').format(amount || 0);
};

export const formatThaiDate = (date: Date): string => {
  return new Intl.DateTimeFormat('th-TH', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(date);
};