import { Star } from 'lucide-react';

/**
 * Animated favorite star with gradient effect
 * @param {string} obraId - Unique ID for gradient definition
 * @param {number} size - Icon size in pixels
 * @param {string} className - Additional CSS classes
 */
function FavoriteStar({ obraId, size = 18, className = '' }) {
  const favGradientId = `favMetal-${obraId}`;

  return (
    <Star
      size={size}
      className={`favorite-star favorite-star--metal ${className}`}
      fill={`url(#${favGradientId})`}
      color={`url(#${favGradientId})`}
    >
      <defs>
        <linearGradient id={favGradientId} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="var(--accent-secondary)" />
          <stop offset="35%" stopColor="var(--accent-primary)" />
          <stop stopColor="var(--text-primary)" stopOpacity="0.95">
            <animate attributeName="offset" values="10%;90%;10%" dur="2.8s" repeatCount="indefinite" />
          </stop>
          <stop offset="65%" stopColor="var(--accent-primary)" />
          <stop offset="100%" stopColor="var(--accent-secondary)" />
        </linearGradient>
      </defs>
    </Star>
  );
}

export default FavoriteStar;
