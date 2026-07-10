import { useAppStore } from '@/lib/store';
import type { Currency } from '@/lib/types';

interface CurrencyTextProps {
  value: number;
  currency?: Currency;
  className?: string;
}

export function CurrencyText({ value, currency: overrideCurrency, className }: CurrencyTextProps) {
  const defaultCurrency = useAppStore((s) => s.defaultCurrency);
  const currency = overrideCurrency || defaultCurrency;

  const locale = currency === 'INR' ? 'en-IN' : currency === 'EUR' ? 'de-DE' : 'en-US';

  const formatted = new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(value);

  return <span className={className}>{formatted}</span>;
}
