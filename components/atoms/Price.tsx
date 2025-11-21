interface PriceProps {
  amount: number;
  currency?: string;
  showDecimals?: boolean;
  className?: string;
}

export const Price = ({
  amount,
  currency = 'ARS',
  showDecimals = false,
  className = '',
}: PriceProps) => {
  const formattedPrice = new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency,
    minimumFractionDigits: showDecimals ? 2 : 0,
    maximumFractionDigits: showDecimals ? 2 : 0,
  }).format(amount);

  return <span className={`font-semibold ${className}`}>{formattedPrice}</span>;
};
