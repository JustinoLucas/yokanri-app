import { Star } from 'lucide-react';
import { normalizeRating } from '../utils';

/**
 * Star rating display component
 * @param {number} rating - Rating value (0-10)
 * @param {number} size - Star size in pixels
 * @param {boolean} showValue - Whether to show numeric value
 * @param {string} className - Additional CSS classes
 */
function RatingStars({ rating, size = 14, showValue = true, className = '' }) {
  if (!rating || rating === 0) return null;

  const normalizedRating = normalizeRating(rating);
  const stars = [];
  const fullStars = Math.floor(normalizedRating);
  const hasHalfStar = normalizedRating % 1 >= 0.25 && normalizedRating % 1 < 0.75;
  const hasThreeQuarterStar = normalizedRating % 1 >= 0.75;

  for (let i = 1; i <= 5; i++) {
    if (i <= fullStars) {
      stars.push(<Star key={i} size={size} fill="#fbbf24" color="#fbbf24" />);
    } else if (i === fullStars + 1 && (hasHalfStar || hasThreeQuarterStar)) {
      stars.push(
        <Star
          key={i}
          size={size}
          fill="#fbbf24"
          color="#fbbf24"
          style={{ opacity: hasThreeQuarterStar ? 0.75 : 0.5 }}
        />
      );
    } else {
      stars.push(<Star key={i} size={size} fill="none" color="#fbbf24" style={{ opacity: 0.3 }} />);
    }
  }

  return (
    <div className={`user-rating-stars ${className}`}>
      {stars}
      {showValue && (
        <span style={{ marginLeft: '4px', fontSize: '12px', fontWeight: '500', color: '#fbbf24' }}>
          {normalizedRating.toFixed(1)}/5
        </span>
      )}
    </div>
  );
}

export default RatingStars;
