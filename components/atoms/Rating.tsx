interface RatingProps {
  rating: number;
  total?: number;
  size?: 'sm' | 'md' | 'lg';
}

export const Rating = ({ rating, total, size = 'md' }: RatingProps) => {
  const sizeClasses = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base',
  };

  return (
    <div className={`flex items-center gap-1 ${sizeClasses[size]}`}>
      <span className="text-yellow-500">★</span>
      <span className="font-medium">{rating.toFixed(1)}</span>
      {total !== undefined && (
        <span className="text-gray-500">({total})</span>
      )}
    </div>
  );
};
