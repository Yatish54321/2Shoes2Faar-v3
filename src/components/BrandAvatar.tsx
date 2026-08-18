import React, { useState, useEffect, useMemo } from 'react';
import { Footprints } from 'lucide-react';
import { api, InstagramState } from '../services/api';

interface BrandAvatarProps {
  sizeClassName?: string;
  ringClassName?: string;
  showGradientRing?: boolean;
  className?: string;
  alt?: string;
  onClick?: () => void;
}

export const BrandAvatar: React.FC<BrandAvatarProps> = ({
  sizeClassName = 'w-10 h-10',
  ringClassName,
  showGradientRing = true,
  className = '',
  alt = '2Shoes2Faar • Channveer Shankad',
  onClick
}) => {
  const [instagramData, setInstagramData] = useState<InstagramState | null>(null);
  const [avatarError, setAvatarError] = useState(false);
  const [avatarTriedProxy, setAvatarTriedProxy] = useState(false);

  useEffect(() => {
    let isMounted = true;
    api.getInstagramProfile(false)
      .then((data) => {
        if (isMounted && data) {
          setInstagramData(data);
        }
      })
      .catch(() => {});

    return () => {
      isMounted = false;
    };
  }, []);

  const rawAvatarUrl = instagramData?.profilePicture || instagramData?.avatarUrl;

  const currentAvatarUrl = useMemo(() => {
    if (!rawAvatarUrl || avatarError) return null;
    if (avatarTriedProxy) {
      return `/api/instagram/media-proxy?url=${encodeURIComponent(rawAvatarUrl)}`;
    }
    return rawAvatarUrl;
  }, [rawAvatarUrl, avatarTriedProxy, avatarError]);

  const handleAvatarError = () => {
    if (!avatarTriedProxy && rawAvatarUrl) {
      setAvatarTriedProxy(true);
    } else {
      setAvatarError(true);
    }
  };

  const ringStyle = showGradientRing
    ? ringClassName || 'p-[2px] bg-gradient-to-tr from-[#f09433] via-[#dc2743] to-[#bc1888] shadow-xs'
    : 'p-[1px] bg-white/15';

  return (
    <div
      className={`relative ${sizeClassName} rounded-full ${ringStyle} shrink-0 transition-transform duration-300 ${className}`}
      onClick={onClick}
    >
      <div className="w-full h-full rounded-full overflow-hidden bg-[#1C1917] flex items-center justify-center">
        {!avatarError && currentAvatarUrl ? (
          <img
            src={currentAvatarUrl}
            alt={alt}
            referrerPolicy="no-referrer"
            decoding="async"
            onError={handleAvatarError}
            className="w-full h-full object-cover"
          />
        ) : (
          <Footprints className="w-1/2 h-1/2 text-[#FAF8F5]" />
        )}
      </div>
    </div>
  );
};
