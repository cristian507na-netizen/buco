import { cn } from "@/lib/utils";

interface CurrencyDisplayProps {
  amount: number;
  className?: string;
  decimalClassName?: string;
  locale?: string;
  showPlusMinus?: boolean;
  type?: 'income' | 'expense' | 'neutral';
}

export function CurrencyDisplay({
  amount,
  className,
  decimalClassName,
  locale = "en-US",
  showPlusMinus = false,
  type = 'neutral',
}: CurrencyDisplayProps) {
  const isNegative = amount < 0;
  const abs = Math.abs(amount);
  const formatted = abs.toLocaleString(locale, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  
  const dotIndex = formatted.lastIndexOf(".");
  const intPart = dotIndex !== -1 ? formatted.slice(0, dotIndex) : formatted;
  const decPart = dotIndex !== -1 ? formatted.slice(dotIndex) : "";

  let prefix = "$";
  if (showPlusMinus) {
    if (type === 'income' || amount > 0) prefix = "+$";
    else if (type === 'expense' || amount < 0) prefix = "-$";
  } else if (isNegative) {
    prefix = "-$";
  }

  const colorClass = type === 'income' ? "text-emerald-500" : type === 'expense' ? "text-red-500" : "";

  return (
    <span className={cn("inline-flex items-baseline", colorClass, className)}>
      <span>{prefix}{intPart}</span>
      {decPart && (
        <span className={cn("text-[0.55em] opacity-60 tracking-normal font-semibold", decimalClassName)}>
          {decPart}
        </span>
      )}
    </span>
  );
}
