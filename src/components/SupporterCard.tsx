import React from 'react';
import { MapPin, Sparkles, Quote, Instagram, BookOpen, ArrowRight, ShieldCheck } from 'lucide-react';
import { Supporter } from '../types';
import { SupporterAvatar } from './SupporterAvatar';

interface SupporterCardProps {
  supporter: Supporter;
  onSelect: (supporter: Supporter) => void;
  compact?: boolean;
}

export const SupporterCard: React.FC<SupporterCardProps> = ({
  supporter: sup,
  onSelect,
  compact = false
}) => {
  const locationDisplay = [sup.city, sup.state].filter(Boolean).join(', ') || 'India';
  const hasQuote = Boolean(sup.travelComment && sup.travelComment.trim());
  const cleanInsta = sup.instagramHandle?.trim();
  const hasValidInstagram =
    cleanInsta &&
    !['@not yet', '@no', '@none', '@n/a', '@na', 'none', 'n/a', 'no'].includes(cleanInsta.toLowerCase());

  return (
    <div
      onClick={() => onSelect(sup)}
      className="bg-white dark:bg-stone-900 rounded-3xl border border-[#E7E2DA] dark:border-stone-800 p-5 shadow-2xs hover:shadow-lg hover:border-[#C2410C]/50 dark:hover:border-amber-500/40 transition-all duration-200 cursor-pointer flex flex-col justify-between group relative overflow-hidden text-left"
    >
      {/* Dynamic top gradient accent line */}
      <div
        className={`absolute top-0 inset-x-0 h-1 transition-opacity ${
          sup.featured
            ? 'bg-gradient-to-r from-[#C2410C] via-[#EA580C] to-[#F59E0B] opacity-100'
            : 'bg-stone-300 dark:bg-stone-700 opacity-60 group-hover:opacity-100'
        }`}
      />

      <div className="space-y-4">
        {/* Top Bar: Number Pill & Feature Status Badge */}
        <div className="flex items-center justify-between gap-2">
          <span className="text-xs font-mono font-bold px-2.5 py-1 rounded-full bg-[#C2410C]/10 dark:bg-stone-800 text-[#C2410C] dark:text-amber-400 border border-[#C2410C]/20 dark:border-stone-700 flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-[#C2410C] dark:text-amber-400" />
            <span>#{sup.supporterNumber}</span>
          </span>

          {sup.featured ? (
            <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-amber-50 dark:bg-amber-950/60 text-amber-900 dark:text-amber-300 border border-amber-200 dark:border-amber-700/50 flex items-center gap-1 shrink-0">
              <Sparkles className="w-2.5 h-2.5 text-amber-600 dark:text-amber-400" />
              <span>Mosaic Featured</span>
            </span>
          ) : (
            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300 border border-stone-200 dark:border-stone-700 flex items-center gap-1 shrink-0">
              <BookOpen className="w-2.5 h-2.5 text-stone-500 dark:text-stone-400" />
              <span>Book Edition</span>
            </span>
          )}
        </div>

        {/* Profile Identification */}
        <div className="flex items-start gap-3.5">
          <SupporterAvatar
            photoUrl={sup.photoUrl}
            name={sup.fullName}
            supporterNumber={sup.supporterNumber}
            id={sup.id}
            size="lg"
            showVerifiedBadge={true}
          />

          <div className="min-w-0 flex-1 space-y-1">
            <h3 className="font-editorial text-lg font-bold text-[#1C1917] dark:text-stone-100 group-hover:text-[#C2410C] dark:group-hover:text-amber-400 transition-colors leading-tight line-clamp-1">
              {sup.fullName}
            </h3>

            {/* City & State */}
            <p className="text-xs text-[#78716C] dark:text-stone-400 flex items-center gap-1 truncate" title={locationDisplay}>
              <MapPin className="w-3.5 h-3.5 text-[#C2410C] dark:text-amber-500 shrink-0" />
              <span className="truncate">{locationDisplay}</span>
            </p>

            {/* Instagram Handle Pill */}
            {hasValidInstagram && (
              <div className="pt-0.5">
                <span
                  onClick={(e) => {
                    e.stopPropagation();
                    const cleanUsername = cleanInsta.replace('@', '').trim();
                    window.open(`https://instagram.com/${cleanUsername}`, '_blank');
                  }}
                  className="inline-flex items-center gap-1 text-[10px] font-semibold text-[#C2410C] dark:text-amber-400 bg-[#C2410C]/5 dark:bg-stone-800 hover:bg-[#C2410C]/15 dark:hover:bg-stone-700 px-2 py-0.5 rounded-full border border-[#C2410C]/15 dark:border-stone-700 transition-colors cursor-pointer"
                >
                  <Instagram className="w-2.5 h-2.5" />
                  <span className="truncate max-w-[110px]">{cleanInsta.startsWith('@') ? cleanInsta : `@${cleanInsta}`}</span>
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Travel Philosophy Quote Card */}
        <div className="bg-[#FAF8F5] dark:bg-stone-950/80 rounded-2xl p-3 border border-[#E7E2DA] dark:border-stone-800 relative space-y-1 min-h-[4.5rem] flex flex-col justify-center">
          <div className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-[#A8A29E] dark:text-stone-400">
            <Quote className="w-2.5 h-2.5 text-[#C2410C] dark:text-amber-500" />
            <span>Travel Philosophy</span>
          </div>
          <p className="font-editorial text-xs italic text-[#44403C] dark:text-stone-200 leading-relaxed line-clamp-3">
            {hasQuote ? `"${sup.travelComment?.trim()}"` : `"Exploring the diverse beauty of India with 2Shoes2Faar."`}
          </p>
        </div>
      </div>

      {/* Bottom Card Footer */}
      <div className="pt-3.5 mt-3.5 border-t border-[#F2ECE1] dark:border-stone-800 flex items-center justify-between text-xs">
        <div className="flex items-center gap-1.5 text-stone-500 dark:text-stone-400 text-[11px]">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
          <span>Verified Backer</span>
        </div>

        <span className="font-semibold text-[#C2410C] dark:text-amber-400 group-hover:translate-x-1 transition-transform flex items-center gap-1">
          <span>View Story</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </span>
      </div>
    </div>
  );
};
