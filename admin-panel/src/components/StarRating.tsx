import { Star } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StarRatingProps {
  rating: number;
  max?: number;
  size?: number;
  interactive?: boolean;
  onChange?: (rating: number) => void;
  className?: string;
}

const StarRating = ({ rating, max = 5, size = 16, interactive = false, onChange, className }: StarRatingProps) => {
  return (
    <div className={cn('flex items-center gap-0.5', className)}>
      {Array.from({ length: max }, (_, i) => {
        const filled = i < Math.floor(rating);
        const half = !filled && i < rating;
        return (
          <button
            key={i}
            type="button"
            disabled={!interactive}
            onClick={() => interactive && onChange?.(i + 1)}
            className={cn(
              'transition-colors',
              interactive && 'cursor-pointer hover:scale-110',
              !interactive && 'cursor-default'
            )}
          >
            <Star
              size={size}
              className={cn(
                filled ? 'text-primary fill-primary' : half ? 'text-primary fill-primary/50' : 'text-muted-foreground/30'
              )}
            />
          </button>
        );
      })}
    </div>
  );
};

export default StarRating;
