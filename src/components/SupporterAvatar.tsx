import React, { useState } from 'react';
import { Sparkles } from 'lucide-react';

interface SupporterAvatarProps {
  photoUrl?: string | null;
  name: string;
  supporterNumber?: number;
  id?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  className?: string;
  showVerifiedBadge?: boolean;
}

// 8 Curated Gender-Neutral Stylized Traveler Anime / Illustration Avatars
export const TRAVELER_PALETTES = [
  {
    name: 'Himalayan Sunrise',
    bg: 'from-[#C2410C] via-[#EA580C] to-[#F59E0B]',
    mountains: '#78350F',
    skyAccent: '#FEF3C7',
    tag: 'Mountain Seeker'
  },
  {
    name: 'Starry Twilight',
    bg: 'from-[#1E1B4B] via-[#312E81] to-[#4338CA]',
    mountains: '#0F172A',
    skyAccent: '#FDE047',
    tag: 'Night Wanderer'
  },
  {
    name: 'Golden Desert Dunes',
    bg: 'from-[#D97706] via-[#B45309] to-[#78350F]',
    mountains: '#451A03',
    skyAccent: '#FEF08A',
    tag: 'Desert Nomad'
  },
  {
    name: 'Emerald Forest Valley',
    bg: 'from-[#065F46] via-[#047857] to-[#10B981]',
    mountains: '#064E3B',
    skyAccent: '#D1FAE5',
    tag: 'Trail Explorer'
  },
  {
    name: 'Coastal Horizon',
    bg: 'from-[#0369A1] via-[#0284C7] to-[#38BDF8]',
    mountains: '#0C4A6E',
    skyAccent: '#E0F2FE',
    tag: 'Coast Voyager'
  },
  {
    name: 'Terracotta Journal',
    bg: 'from-[#9A3412] via-[#C2410C] to-[#FB923C]',
    mountains: '#431407',
    skyAccent: '#FFEDD5',
    tag: 'Story Chronicler'
  },
  {
    name: 'Vintage Compass',
    bg: 'from-[#334155] via-[#475569] to-[#64748B]',
    mountains: '#0F172A',
    skyAccent: '#F1F5F9',
    tag: 'Compass Wayfarer'
  },
  {
    name: 'Alpine Mystic',
    bg: 'from-[#581C87] via-[#6B21A8] to-[#9333EA]',
    mountains: '#3B0764',
    skyAccent: '#F3E8FF',
    tag: 'Zen Wanderer'
  }
];

export const SupporterAvatar: React.FC<SupporterAvatarProps> = ({
  photoUrl,
  name,
  supporterNumber = 1,
  id = '',
  size = 'md',
  className = '',
  showVerifiedBadge = false
}) => {
  const [imageError, setImageError] = useState(false);

  // Pick deterministic palette based on supporterNumber or hash of name/id
  const seed = (supporterNumber || 0) + (id ? id.charCodeAt(0) + id.length : 0) + (name ? name.charCodeAt(0) : 0);
  const paletteIndex = Math.abs(seed) % TRAVELER_PALETTES.length;
  const palette = TRAVELER_PALETTES[paletteIndex];

  const initial = (name ? name.trim().charAt(0).toUpperCase() : 'S') || 'S';

  const sizeClasses = {
    xs: 'w-6 h-6 text-[10px] rounded-lg',
    sm: 'w-8 h-8 text-xs rounded-xl',
    md: 'w-12 h-12 text-sm rounded-2xl',
    lg: 'w-16 h-16 text-base rounded-2xl',
    xl: 'w-20 h-20 text-lg rounded-3xl',
    '2xl': 'w-28 h-28 text-2xl rounded-3xl'
  };

  const badgeSizeClasses = {
    xs: 'w-2 h-2 -bottom-0.5 -right-0.5',
    sm: 'w-2.5 h-2.5 -bottom-0.5 -right-0.5',
    md: 'w-3.5 h-3.5 -bottom-1 -right-1',
    lg: 'w-4 h-4 -bottom-1 -right-1',
    xl: 'w-5 h-5 -bottom-1 -right-1',
    '2xl': 'w-6 h-6 -bottom-1.5 -right-1.5'
  };

  const hasRealPhoto = Boolean(photoUrl && photoUrl.trim() && !imageError);

  return (
    <div className={`relative inline-block shrink-0 select-none ${className}`}>
      {hasRealPhoto ? (
        <img
          src={photoUrl!}
          alt={name}
          referrerPolicy="no-referrer"
          onError={() => setImageError(true)}
          className={`${sizeClasses[size]} object-cover object-top border-2 border-[#C2410C] shadow-xs bg-[#FAF8F5] transition-transform duration-300 group-hover:scale-105`}
        />
      ) : (
        /* Stylized Traveler Anime / Illustration Fallback */
        <div
          className={`${sizeClasses[size]} relative overflow-hidden bg-gradient-to-br ${palette.bg} border-2 border-[#C2410C]/40 shadow-xs flex items-center justify-center transition-transform duration-300 group-hover:scale-105`}
          title={`${name} • ${palette.tag}`}
        >
          {/* Subtle artistic vector backdrop representing traveler horizon */}
          <svg
            viewBox="0 0 64 64"
            className="absolute inset-0 w-full h-full opacity-40 mix-blend-overlay pointer-events-none"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* Celestial sun / moon */}
            <circle cx="48" cy="18" r="8" fill={palette.skyAccent} fillOpacity="0.8" />
            
            {/* Distant mountains */}
            <path
              d="M0 50 L18 26 L36 46 L48 32 L64 54 L64 64 L0 64 Z"
              fill={palette.mountains}
              fillOpacity="0.9"
            />
            {/* Traveler silhouette with backpack */}
            <path
              d="M28 38 C28 35 31 35 31 32 C31 30 29 29 29 27 C29 24.5 31 23 33 23 C35 23 37 24.5 37 27 C37 29 35 30 35 32 C35 35 38 35 38 38 L39 48 L35 48 L35 44 L31 44 L31 48 L27 48 Z"
              fill="#FFFFFF"
              fillOpacity="0.65"
            />
          </svg>

          {/* Supporter Initial Stamp */}
          <div className="relative z-10 font-bold font-editorial text-white drop-shadow-md flex items-center justify-center">
            <span>{initial}</span>
          </div>

          {/* Micro backpack sparkle indicator */}
          <div className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-white/70 animate-pulse" />
        </div>
      )}

      {/* Optional Verified Living Supporter Stamp */}
      {showVerifiedBadge && (
        <div
          className={`absolute ${badgeSizeClasses[size]} bg-[#C2410C] text-white rounded-full flex items-center justify-center ring-2 ring-white shadow-2xs`}
          title="Verified 1,000 Mosaic Supporter"
        >
          <Sparkles className="w-full h-full p-0.5" />
        </div>
      )}
    </div>
  );
};
