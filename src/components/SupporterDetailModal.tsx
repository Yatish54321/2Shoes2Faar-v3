import React, { useState } from 'react';
import { X, MapPin, Instagram, Share2, CheckCircle2, Footprints, Sparkles, Copy, Check } from 'lucide-react';
import { Supporter } from '../types';
import { SupporterAvatar } from './SupporterAvatar';

interface SupporterDetailModalProps {
  supporter: Supporter | null;
  onClose: () => void;
  onOpenOrderModal: () => void;
}

export const SupporterDetailModal: React.FC<SupporterDetailModalProps> = ({
  supporter,
  onClose,
  onOpenOrderModal
}) => {
  const [copied, setCopied] = useState(false);

  if (!supporter) return null;

  const handleCopyShare = () => {
    const text = `Check out Supporter #${supporter.supporterNumber} (${supporter.fullName} from ${supporter.city || 'India'}) on 2Shoes2Faar's Living India Mosaic!`;
    navigator.clipboard.writeText(`${text} ${window.location.origin}/mosaic?supporter=${supporter.supporterNumber}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div
      id="supporter-detail-modal-backdrop"
      className="fixed inset-0 z-50 bg-black/75 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 md:p-6 animate-fadeIn overflow-y-auto"
      onClick={onClose}
    >
      <div
        id="supporter-detail-modal-card"
        className="bg-[#FAF8F5] dark:bg-stone-900 max-w-lg w-full max-h-[92vh] sm:max-h-[88vh] flex flex-col rounded-3xl border border-[#E7E2DA] dark:border-stone-800 shadow-2xl overflow-hidden relative animate-scaleUp text-[#1C1917] dark:text-[#FAF8F5] my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Floating Close Button */}
        <button
          onClick={onClose}
          className="absolute top-3.5 right-3.5 z-20 w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-black/60 hover:bg-black/90 text-white flex items-center justify-center transition-all cursor-pointer border border-white/20 shadow-md active:scale-95"
          aria-label="Close modal"
        >
          <X className="w-4 h-4 sm:w-5 sm:h-5" />
        </button>

        {/* Header Cover Banner (Fixed/Sticky at top of modal) */}
        <div className="relative h-36 sm:h-44 bg-gradient-to-tr from-[#1E2B22] to-[#C2410C] shrink-0 overflow-hidden">
          <div className="absolute inset-0 bg-cartography-grid opacity-30 pointer-events-none" />
          
          <div className="absolute top-3.5 left-4 flex items-center gap-2">
            <span className="bg-black/40 backdrop-blur-md text-white text-[11px] sm:text-xs font-semibold px-3 py-1 rounded-full flex items-center gap-1.5 border border-white/15">
              <Footprints className="w-3.5 h-3.5 text-amber-400" />
              1,000 Living India Mosaic
            </span>
          </div>

          {/* Supporter Badge Top Right / Bottom Right */}
          <div className="absolute bottom-3 right-4 bg-black/65 backdrop-blur-md text-white px-3 py-1 rounded-full text-xs font-bold border border-white/20 flex items-center gap-1.5 shadow-lg">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Supporter #{supporter.supporterNumber}</span>
          </div>
        </div>

        {/* Scrollable Content Body */}
        <div className="flex-1 overflow-y-auto overscroll-contain px-4 sm:px-6 pb-4 pt-0 relative -mt-12 sm:-mt-14 space-y-4">
          {/* Avatar & Social Actions Row */}
          <div className="flex items-end justify-between gap-2">
            <div className="relative">
              <SupporterAvatar
                photoUrl={supporter.photoUrl}
                name={supporter.fullName}
                supporterNumber={supporter.supporterNumber}
                id={supporter.id}
                size="2xl"
                showVerifiedBadge={true}
                className="shadow-xl ring-4 ring-[#FAF8F5] dark:ring-stone-900"
              />
            </div>

            {/* Social & Share Actions */}
            <div className="flex items-center gap-2 mb-1">
              {supporter.instagramHandle && !['@not yet', '@no', '@none', '@n/a', '@na', 'none', 'no'].includes(supporter.instagramHandle.toLowerCase()) && (
                <a
                  href={`https://instagram.com/${supporter.instagramHandle.replace('@', '').trim()}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1.5 bg-white dark:bg-stone-800 border border-[#E7E2DA] dark:border-stone-700 hover:border-[#C2410C] text-[#1C1917] dark:text-white rounded-full transition-all flex items-center gap-1.5 text-xs font-medium shadow-xs active:scale-95"
                >
                  <Instagram className="w-3.5 h-3.5 text-[#C2410C] dark:text-amber-400" />
                  <span className="font-semibold">{supporter.instagramHandle.startsWith('@') ? supporter.instagramHandle : `@${supporter.instagramHandle}`}</span>
                </a>
              )}

              <button
                onClick={handleCopyShare}
                className="p-2 sm:p-2.5 bg-white dark:bg-stone-800 border border-[#E7E2DA] dark:border-stone-700 hover:bg-[#EAE4D9]/60 dark:hover:bg-stone-700 text-[#1C1917] dark:text-white rounded-full transition-all cursor-pointer shadow-xs active:scale-95"
                title="Share this supporter profile"
                aria-label="Share"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Share2 className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Name & Location Info */}
          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-editorial text-xl sm:text-2xl font-bold text-[#1C1917] dark:text-white leading-tight">
                {supporter.fullName}
              </h3>
              <span className="text-xs font-bold bg-[#C2410C]/10 dark:bg-stone-800 text-[#C2410C] dark:text-amber-400 px-2.5 py-0.5 rounded-full border border-[#C2410C]/20 dark:border-stone-700 font-mono">
                #{supporter.supporterNumber}
              </span>
            </div>

            <div className="flex items-center gap-2 flex-wrap pt-0.5">
              <p className="text-xs sm:text-sm font-medium text-[#78716C] dark:text-stone-400 flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-[#C2410C] dark:text-amber-500 shrink-0" />
                <span>{[supporter.city, supporter.state].filter(Boolean).join(', ') || 'India'}</span>
              </p>
              
              {supporter.featured ? (
                <span className="text-[10px] sm:text-[11px] font-bold bg-amber-100 dark:bg-amber-950/70 text-amber-900 dark:text-amber-300 border border-amber-300 dark:border-amber-700/60 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-amber-700 dark:text-amber-400" />
                  <span>Featured on Mosaic & Book</span>
                </span>
              ) : (
                <span className="text-[10px] sm:text-[11px] font-semibold bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 border border-stone-300 dark:border-stone-700 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                  <span>📖 Memoir Pre-Order Backer</span>
                </span>
              )}
            </div>
          </div>

          {/* Travel Philosophy Quote Card */}
          <div className="p-3.5 sm:p-4 rounded-2xl bg-white dark:bg-stone-950/80 border border-[#E7E2DA] dark:border-stone-800 shadow-xs">
            <span className="text-[10px] uppercase tracking-wider font-bold text-[#78716C] dark:text-stone-400 block mb-1">
              "What makes you travel?"
            </span>
            <blockquote className="font-editorial text-sm sm:text-base italic text-[#1C1917] dark:text-stone-200 leading-relaxed">
              {supporter.travelComment?.trim() ? `"${supporter.travelComment.trim()}"` : `"Exploring the diverse beauty of India with 2Shoes2Faar."`}
            </blockquote>
          </div>

          {/* Journey Dedication Note */}
          <div className="p-3 sm:p-3.5 bg-[#243328]/5 dark:bg-stone-800/60 rounded-2xl border border-[#243328]/10 dark:border-stone-700 text-xs text-[#243328] dark:text-stone-300 space-y-1">
            <div className="flex items-center gap-2 font-bold text-[#243328] dark:text-white">
              <Footprints className="w-3.5 h-3.5 text-[#243328] dark:text-amber-400 shrink-0" />
              <span>
                {supporter.featured ? 'Permanent India Mosaic Backer' : 'Memoir Pre-Order Backer'}
              </span>
            </div>
            <p className="text-[11px] text-[#3E5244] dark:text-stone-400 leading-relaxed">
              {supporter.featured
                ? `Opted in to be immortalized on the Living India Mosaic (Slot #${supporter.supporterNumber}) and published in Veer's 28 States Memoir tribute appendix.`
                : `Backed Veer's 28-week solo journey across India with a memoir pre-order.`}
            </p>
          </div>
        </div>

        {/* Sticky Modal Bottom Action Footer */}
        <div className="shrink-0 bg-[#FAF8F5] dark:bg-stone-900 px-4 sm:px-6 py-3.5 border-t border-[#E7E2DA] dark:border-stone-800 flex items-center justify-between gap-3">
          <button
            onClick={onClose}
            className="px-3.5 py-2 text-xs font-semibold text-[#78716C] dark:text-stone-400 hover:text-[#1C1917] dark:hover:text-white transition-colors cursor-pointer rounded-xl hover:bg-stone-100 dark:hover:bg-stone-800"
          >
            Close Story
          </button>
          
          <button
            onClick={() => {
              onClose();
              onOpenOrderModal();
            }}
            className="px-4 sm:px-5 py-2 sm:py-2.5 bg-[#C2410C] hover:bg-[#9A3412] active:scale-95 text-white text-xs font-semibold rounded-full shadow-xs transition-all flex items-center gap-1.5 cursor-pointer ml-auto"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Claim Your Spot (₹499)</span>
          </button>
        </div>
      </div>
    </div>
  );
};
