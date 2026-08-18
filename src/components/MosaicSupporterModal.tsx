import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  X,
  MapPin,
  Instagram,
  Share2,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Check,
  Footprints,
  ShieldCheck,
  Send,
  MessageCircle
} from 'lucide-react';
import { Supporter } from '../types';
import { TRAVELER_PALETTES } from './SupporterAvatar';
import { getRegionForLocation } from '../data/indiaGrid';

interface MosaicSupporterModalProps {
  supporter: Supporter | null;
  allSupporters?: Supporter[];
  onClose: () => void;
  onSelectSupporter?: (supporter: Supporter) => void;
  onOpenOrderModal: () => void;
}

export const MosaicSupporterModal: React.FC<MosaicSupporterModalProps> = ({
  supporter,
  allSupporters = [],
  onClose,
  onSelectSupporter,
  onOpenOrderModal
}) => {
  const [imageError, setImageError] = useState(false);
  const [copied, setCopied] = useState(false);
  const [touchStartX, setTouchStartX] = useState<number | null>(null);

  // Filter approved & featured supporters for sequence iteration
  const sortedSupporters = useMemo(() => {
    if (!allSupporters || allSupporters.length === 0) {
      return supporter ? [supporter] : [];
    }
    const filtered = allSupporters.filter(s => s.approved && (s.featured || s.mapCellId));
    return filtered.sort((a, b) => (a.supporterNumber || 0) - (b.supporterNumber || 0));
  }, [allSupporters, supporter]);

  const currentIndex = useMemo(() => {
    if (!supporter || sortedSupporters.length === 0) return -1;
    return sortedSupporters.findIndex(s => s.id === supporter.id || s.supporterNumber === supporter.supporterNumber);
  }, [supporter, sortedSupporters]);

  const hasMultiple = sortedSupporters.length > 1;

  // Reset image error state whenever supporter changes
  useEffect(() => {
    setImageError(false);
  }, [supporter?.id, supporter?.photoUrl]);

  const handlePrev = useCallback(() => {
    if (!hasMultiple || currentIndex === -1 || !onSelectSupporter) return;
    const prevIdx = (currentIndex - 1 + sortedSupporters.length) % sortedSupporters.length;
    onSelectSupporter(sortedSupporters[prevIdx]);
  }, [hasMultiple, currentIndex, sortedSupporters, onSelectSupporter]);

  const handleNext = useCallback(() => {
    if (!hasMultiple || currentIndex === -1 || !onSelectSupporter) return;
    const nextIdx = (currentIndex + 1) % sortedSupporters.length;
    onSelectSupporter(sortedSupporters[nextIdx]);
  }, [hasMultiple, currentIndex, sortedSupporters, onSelectSupporter]);

  // Keyboard navigation: ArrowLeft, ArrowRight, Escape
  useEffect(() => {
    if (!supporter) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        handlePrev();
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        handleNext();
      } else if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [supporter, handlePrev, handleNext, onClose]);

  if (!supporter) return null;

  // Share handlers
  const getShareUrl = () => {
    return `${window.location.origin}/mosaic?supporter=${supporter.supporterNumber}`;
  };

  const handleCopyShare = async () => {
    const text = `Meet Supporter #${supporter.supporterNumber} (${supporter.fullName} from ${supporter.city || 'India'}) on 2Shoes2Faar's Living India Mosaic!`;
    const url = getShareUrl();
    try {
      if (navigator.share && /mobile/i.test(navigator.userAgent)) {
        await navigator.share({
          title: `Supporter #${supporter.supporterNumber} - Living India Mosaic`,
          text: text,
          url: url
        });
      } else {
        await navigator.clipboard.writeText(`${text} ${url}`);
        setCopied(true);
        setTimeout(() => setCopied(false), 2500);
      }
    } catch {
      await navigator.clipboard.writeText(`${text} ${url}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const handleWhatsAppShare = () => {
    const text = encodeURIComponent(
      `Check out Supporter #${supporter.supporterNumber} (${supporter.fullName} from ${supporter.city || 'India'}) on the Living India Mosaic!\n\n${getShareUrl()}`
    );
    window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank');
  };

  // Clean Instagram handle
  const cleanInsta = supporter.instagramHandle?.trim();
  const hasValidInstagram =
    cleanInsta &&
    !['@not yet', '@no', '@none', '@n/a', '@na', 'none', 'n/a', 'no'].includes(cleanInsta.toLowerCase());

  // Location display
  const locationDisplay = [supporter.city, supporter.state].filter(Boolean).join(', ') || 'India';

  // Fallback palette
  const seed = (supporter.supporterNumber || 0) + (supporter.id ? supporter.id.charCodeAt(0) + supporter.id.length : 0);
  const paletteIndex = Math.abs(seed) % TRAVELER_PALETTES.length;
  const palette = TRAVELER_PALETTES[paletteIndex];

  const hasRealPhoto = Boolean(supporter.photoUrl && supporter.photoUrl.trim() && !imageError);

  // Touch swipe handling
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStartX(e.touches[0].clientX);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX === null) return;
    const touchEndX = e.changedTouches[0].clientX;
    const diffX = touchStartX - touchEndX;

    // Threshold 40px
    if (diffX > 40) {
      handleNext();
    } else if (diffX < -40) {
      handlePrev();
    }
    setTouchStartX(null);
  };

  return (
    <div
      id="mosaic-supporter-modal-backdrop"
      className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 md:p-6 animate-fadeIn overflow-y-auto"
      onClick={onClose}
    >
      {/* Outer Flex Container for Nav Chevrons + Modal Card */}
      <div
        className="relative flex items-center justify-center w-full max-w-lg mx-auto"
        onClick={(e) => e.stopPropagation()}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        {/* Floating Left Arrow (Iterate Previous Supporter) */}
        {hasMultiple && (
          <button
            id="mosaic-modal-prev-btn"
            onClick={handlePrev}
            className="hidden sm:flex absolute -left-14 lg:-left-16 z-30 w-11 h-11 rounded-full bg-black/70 hover:bg-black/95 text-white items-center justify-center transition-all cursor-pointer border border-white/20 shadow-2xl active:scale-90 hover:scale-105"
            title="Previous Supporter (Left Arrow)"
            aria-label="Previous Supporter"
          >
            <ChevronLeft className="w-6 h-6 text-stone-100" />
          </button>
        )}

        {/* Floating Right Arrow (Iterate Next Supporter) */}
        {hasMultiple && (
          <button
            id="mosaic-modal-next-btn"
            onClick={handleNext}
            className="hidden sm:flex absolute -right-14 lg:-right-16 z-30 w-11 h-11 rounded-full bg-black/70 hover:bg-black/95 text-white items-center justify-center transition-all cursor-pointer border border-white/20 shadow-2xl active:scale-90 hover:scale-105"
            title="Next Supporter (Right Arrow)"
            aria-label="Next Supporter"
          >
            <ChevronRight className="w-6 h-6 text-stone-100" />
          </button>
        )}

        {/* Main Supporter Card Container */}
        <div
          id="mosaic-supporter-spotlight-card"
          className="bg-white dark:bg-[#1C1917] w-full max-h-[92dvh] sm:max-h-[88vh] flex flex-col rounded-3xl border border-stone-200 dark:border-stone-800 shadow-2xl overflow-hidden relative text-[#1C1917] dark:text-[#FAF8F5] animate-scaleUp"
        >
          {/* Header Bar: Supporter #Number only and Close 'x' */}
          <div className="bg-white dark:bg-[#1C1917] px-4 sm:px-5 py-3 border-b border-stone-100 dark:border-stone-800/80 flex items-center justify-between gap-3 shrink-0 z-20">
            <div className="flex items-center gap-2 min-w-0">
              <span className="font-bold text-sm sm:text-base text-[#C2410C] dark:text-amber-400 font-mono tracking-tight">
                Supporter #{supporter.supporterNumber}
              </span>
            </div>

            {/* Top Close Button */}
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 text-stone-600 dark:text-stone-300 flex items-center justify-center transition-all cursor-pointer shrink-0 active:scale-95"
              aria-label="Close"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Scrollable Content (Photo + Details + Travel Philosophy + Actions) */}
          <div className="flex-1 overflow-y-auto overscroll-contain flex flex-col">
            {/* Big, Clear, High-Visibility Profile Photo Section with Upper-Center Crop */}
            <div className="relative w-full h-68 sm:h-76 md:h-80 bg-stone-950 overflow-hidden shrink-0 select-none">
              {hasRealPhoto ? (
                <img
                  src={supporter.photoUrl!}
                  alt={supporter.fullName}
                  onError={() => setImageError(true)}
                  className="w-full h-full object-cover object-[center_18%] transition-transform duration-300"
                />
              ) : (
                /* Fallback Stylized Artwork if no custom photo */
                <div
                  className={`w-full h-full relative overflow-hidden bg-gradient-to-br ${palette.bg} flex flex-col items-center justify-center text-white`}
                >
                  <svg
                    viewBox="0 0 64 64"
                    className="absolute inset-0 w-full h-full opacity-35 mix-blend-overlay pointer-events-none"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <circle cx="48" cy="18" r="8" fill={palette.skyAccent} fillOpacity="0.8" />
                    <path
                      d="M0 50 L18 26 L36 46 L48 32 L64 54 L64 64 L0 64 Z"
                      fill={palette.mountains}
                      fillOpacity="0.9"
                    />
                    <path
                      d="M28 38 C28 35 31 35 31 32 C31 30 29 29 29 27 C29 24.5 31 23 33 23 C35 23 37 24.5 37 27 C37 29 35 30 35 32 C35 35 38 35 38 38 L39 48 L35 48 L35 44 L31 44 L31 48 L27 48 Z"
                      fill="#FFFFFF"
                      fillOpacity="0.8"
                    />
                  </svg>
                  <div className="relative z-10 text-center space-y-1 px-4">
                    <span className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-md border border-white/30 text-2xl font-bold flex items-center justify-center mx-auto shadow-lg">
                      {supporter.fullName ? supporter.fullName.charAt(0).toUpperCase() : 'S'}
                    </span>
                    <p className="text-xs font-semibold tracking-wide uppercase opacity-90">
                      {palette.tag}
                    </p>
                  </div>
                </div>
              )}

              {/* Verified Mosaic Badge floating on photo (always visible top-left) */}
              <div className="absolute top-3 left-3 z-20 bg-black/75 backdrop-blur-md text-white text-xs font-semibold px-3 py-1.5 rounded-full border border-white/20 flex items-center gap-1.5 shadow-lg">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>Verified Backer</span>
              </div>

              {/* Supporter Number Badge floating on photo (always visible bottom-right) */}
              <div className="absolute bottom-3 right-3 z-20 bg-black/80 backdrop-blur-md text-amber-300 text-xs font-mono font-bold px-3 py-1.5 rounded-full border border-amber-400/30 flex items-center gap-1.5 shadow-lg">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>Slot #{supporter.supporterNumber}</span>
              </div>

              {/* Mobile Previous / Next Touch Buttons Overlay (for easy tapping on phone screens) */}
              {hasMultiple && (
                <div className="sm:hidden absolute inset-y-0 inset-x-0 z-20 flex items-center justify-between px-2 pointer-events-none">
                  <button
                    onClick={handlePrev}
                    className="w-9 h-9 rounded-full bg-black/65 backdrop-blur-md text-white flex items-center justify-center border border-white/20 pointer-events-auto active:scale-90 shadow-lg"
                    aria-label="Previous Supporter"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <button
                    onClick={handleNext}
                    className="w-9 h-9 rounded-full bg-black/65 backdrop-blur-md text-white flex items-center justify-center border border-white/20 pointer-events-auto active:scale-90 shadow-lg"
                    aria-label="Next Supporter"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
              )}
            </div>

            {/* Supporter Details Section */}
            <div className="p-4 sm:p-5 space-y-3.5 flex-1">
              {/* Info Row: Name, Supporter Number, Location, Instagram, Share */}
              <div className="flex flex-wrap items-center justify-between gap-2.5">
                <div className="space-y-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-editorial text-xl font-bold text-[#1C1917] dark:text-white leading-tight">
                      {supporter.fullName}
                    </h3>
                    <span className="text-xs font-mono font-bold bg-[#C2410C]/10 dark:bg-stone-800 text-[#C2410C] dark:text-amber-400 px-2 py-0.5 rounded-full border border-[#C2410C]/20 dark:border-stone-700">
                      #{supporter.supporterNumber}
                    </span>
                  </div>

                  {/* Location Info */}
                  <p className="text-xs text-[#78716C] dark:text-stone-400 flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-[#C2410C] dark:text-amber-500 shrink-0" />
                    <span className="font-medium">{locationDisplay}</span>
                    {(getRegionForLocation(supporter.city, supporter.state) || supporter.region) && (
                      <span className="text-[11px] text-stone-400 dark:text-stone-500 capitalize">
                        • {getRegionForLocation(supporter.city, supporter.state) || supporter.region} India
                      </span>
                    )}
                  </p>
                </div>

                {/* Social Actions: Instagram & Share */}
                <div className="flex items-center gap-2 shrink-0">
                  {hasValidInstagram && (
                    <a
                      href={`https://instagram.com/${cleanInsta.replace('@', '').trim()}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-1.5 bg-stone-100 dark:bg-stone-800 hover:bg-[#C2410C]/10 dark:hover:bg-stone-700 border border-stone-200 dark:border-stone-700 text-[#1C1917] dark:text-white rounded-full transition-all flex items-center gap-1.5 text-xs font-semibold cursor-pointer active:scale-95"
                      title={`Visit ${supporter.fullName}'s Instagram`}
                    >
                      <Instagram className="w-3.5 h-3.5 text-[#C2410C] dark:text-amber-400" />
                      <span className="max-w-[100px] truncate">
                        {cleanInsta.startsWith('@') ? cleanInsta : `@${cleanInsta}`}
                      </span>
                    </a>
                  )}

                  {/* Share button */}
                  <button
                    onClick={handleCopyShare}
                    className="p-2 bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 border border-stone-200 dark:border-stone-700 text-[#1C1917] dark:text-white rounded-full transition-all cursor-pointer active:scale-95"
                    title="Copy / Share profile link"
                    aria-label="Share Supporter Card"
                  >
                    {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Share2 className="w-4 h-4 text-stone-600 dark:text-stone-300" />}
                  </button>

                  {/* WhatsApp share */}
                  <button
                    onClick={handleWhatsAppShare}
                    className="p-2 bg-emerald-50 dark:bg-emerald-950/50 hover:bg-emerald-100 dark:hover:bg-emerald-900/50 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 rounded-full transition-all cursor-pointer active:scale-95"
                    title="Share on WhatsApp"
                    aria-label="Share on WhatsApp"
                  >
                    <MessageCircle className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* "What Makes You Travel?" Quote Card */}
              <div className="bg-[#FAF8F5] dark:bg-stone-900/90 rounded-2xl p-3.5 border border-[#E7E2DA] dark:border-stone-800 space-y-1">
                <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-[#78716C] dark:text-stone-400">
                  <Footprints className="w-3 h-3 text-[#C2410C] dark:text-amber-400" />
                  <span>"What makes you travel?"</span>
                </div>
                <blockquote className="font-editorial text-xs sm:text-sm italic text-[#1C1917] dark:text-stone-200 leading-relaxed">
                  {supporter.travelComment?.trim()
                    ? `"${supporter.travelComment.trim()}"`
                    : `"Exploring the rich diversity and authentic stories across India's 28 States."`}
                </blockquote>
              </div>

              {/* Sequential Navigator Indicator */}
              {hasMultiple && (
                <div className="flex items-center justify-between text-[11px] text-stone-400 dark:text-stone-500 pt-1 font-mono">
                  <span>
                    Backer {currentIndex + 1} of {sortedSupporters.length}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Sticky Bottom Action: Claim Your Spot CTA */}
          <div className="bg-white dark:bg-[#1C1917] px-4 sm:px-5 py-3 border-t border-stone-100 dark:border-stone-800 flex items-center justify-between gap-3 shrink-0">
            <button
              onClick={onClose}
              className="text-xs font-semibold text-stone-500 dark:text-stone-400 hover:text-stone-800 dark:hover:text-stone-200 transition-colors cursor-pointer px-2 py-1.5"
            >
              Close
            </button>

            <button
              onClick={() => {
                onClose();
                onOpenOrderModal();
              }}
              className="px-4 sm:px-5 py-2.5 bg-[#C2410C] hover:bg-[#9A3412] active:scale-95 text-white text-xs sm:text-sm font-bold rounded-full shadow-md transition-all flex items-center gap-2 cursor-pointer ml-auto"
            >
              <Sparkles className="w-4 h-4 text-amber-300" />
              <span>Claim Your Spot (₹499)</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
