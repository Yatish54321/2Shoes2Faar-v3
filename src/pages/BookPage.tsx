import React from 'react';
import { BookOpen, Sparkles, Footprints, ShieldCheck, Heart, Truck, Gift, CheckCircle2, ArrowRight } from 'lucide-react';
import { BookShowcase } from '../components/BookShowcase';
import { SiteContent } from '../types';

interface BookPageProps {
  content: SiteContent['book'];
  onOpenOrderModal: () => void;
}

export const BookPage: React.FC<BookPageProps> = ({ content, onOpenOrderModal }) => {
  return (
    <div id="book-page-root" className="pt-24 pb-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
      {/* Top Banner */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <span className="text-xs font-bold uppercase tracking-wider text-[#C2410C] dark:text-amber-400 bg-[#C2410C]/10 dark:bg-stone-800 px-3.5 py-1 rounded-full inline-flex items-center gap-1.5 border border-[#C2410C]/20 dark:border-stone-700">
          <BookOpen className="w-3.5 h-3.5" />
          The Official Published Edition
        </span>
        <h1 className="font-editorial text-4xl sm:text-5xl font-bold text-[#1C1917] dark:text-stone-100">
          {content.title}
        </h1>
        <p className="text-base text-[#57534E] dark:text-stone-300 leading-relaxed">
          {content.description}
        </p>
      </div>

      {/* Main Showcase with 3D Book & Pre-Order CTA */}
      <BookShowcase content={content} onOpenOrderModal={onOpenOrderModal} />

      {/* Chapters & Journey Map Preview */}
      <div className="bg-white dark:bg-stone-900 rounded-3xl border border-[#E7E2DA] dark:border-stone-800 p-6 sm:p-10 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="font-editorial text-2xl sm:text-3xl font-bold text-[#1C1917] dark:text-stone-100">
              Table of Contents: The 28-Week Journey
            </h3>
            <p className="text-xs sm:text-sm text-[#78716C] dark:text-stone-400 mt-1">
              348 pages organized into four distinct overland exploration arcs.
            </p>
          </div>
          <span className="text-xs font-bold uppercase text-[#C2410C] dark:text-amber-400 bg-[#C2410C]/10 dark:bg-stone-800 px-3 py-1 rounded-full border border-[#C2410C]/20 self-start sm:self-center">
            28 States Chronology
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-xs text-[#292524] dark:text-stone-200">
          <div className="p-4 bg-[#FAF8F5] dark:bg-stone-800 rounded-2xl border border-[#E7E2DA] dark:border-stone-700 space-y-1.5 hover:border-[#C2410C]/40 transition-colors">
            <span className="text-[11px] font-bold text-[#C2410C] dark:text-amber-400 uppercase block">Part I: Southern Roots</span>
            <p className="font-bold text-sm text-[#1C1917] dark:text-stone-100">Karnataka • Goa • Maharashtra</p>
            <p className="text-[#78716C] dark:text-stone-400 text-xs leading-relaxed">
              From Hampi boulder trails to misty Western Ghats ridges and monsoon highways.
            </p>
          </div>

          <div className="p-4 bg-[#FAF8F5] dark:bg-stone-800 rounded-2xl border border-[#E7E2DA] dark:border-stone-700 space-y-1.5 hover:border-[#C2410C]/40 transition-colors">
            <span className="text-[11px] font-bold text-[#C2410C] dark:text-amber-400 uppercase block">Part II: Western Deserts</span>
            <p className="font-bold text-sm text-[#1C1917] dark:text-stone-100">Gujarat • Rajasthan • Punjab</p>
            <p className="text-[#78716C] dark:text-stone-400 text-xs leading-relaxed">
              White salt flats of Kutch, Thar desert dunes, border villages and golden temple langar hospitality.
            </p>
          </div>

          <div className="p-4 bg-[#FAF8F5] dark:bg-stone-800 rounded-2xl border border-[#E7E2DA] dark:border-stone-700 space-y-1.5 hover:border-[#C2410C]/40 transition-colors">
            <span className="text-[11px] font-bold text-[#C2410C] dark:text-amber-400 uppercase block">Part III: The High Valleys</span>
            <p className="font-bold text-sm text-[#1C1917] dark:text-stone-100">Himachal • Spiti • Uttarakhand</p>
            <p className="text-[#78716C] dark:text-stone-400 text-xs leading-relaxed">
              Ancient monasteries at 14,000 ft, roaring glacial sangams, and silence of the Greater Himalayas.
            </p>
          </div>

          <div className="p-4 bg-[#FAF8F5] dark:bg-stone-800 rounded-2xl border border-[#E7E2DA] dark:border-stone-700 space-y-1.5 hover:border-[#C2410C]/40 transition-colors">
            <span className="text-[11px] font-bold text-[#C2410C] dark:text-amber-400 uppercase block">Part IV: The Seven Sisters</span>
            <p className="font-bold text-sm text-[#1C1917] dark:text-stone-100">Assam • Meghalaya • Arunachal</p>
            <p className="text-[#78716C] dark:text-stone-400 text-xs leading-relaxed">
              Living root bridges in Cherrapunji, broad waters of the Brahmaputra, and mist-cloaked dawn monasteries.
            </p>
          </div>
        </div>
      </div>

      {/* Bottom Pre-Order Fast Action Banner */}
      <div className="p-6 sm:p-8 bg-gradient-to-r from-[#1C1917] to-[#292524] text-white rounded-3xl border border-stone-800 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-xl">
        <div className="space-y-1 text-center sm:text-left">
          <span className="text-xs uppercase font-bold text-[#D97706] tracking-wider">
            Limited Launch First Edition
          </span>
          <h4 className="font-editorial text-2xl sm:text-3xl font-bold">
            Be 1 of the 1,000 Immortalized Readers
          </h4>
          <p className="text-xs sm:text-sm text-stone-300 max-w-xl">
            Pre-order your physical hardcover copy for ₹499 and receive your permanent spot on the digital India Mosaic and printed book appendix.
          </p>
        </div>

        <button
          onClick={onOpenOrderModal}
          className="px-8 py-3.5 bg-[#C2410C] hover:bg-[#9A3412] text-white font-bold text-sm rounded-full shadow-lg transition-all flex items-center gap-2 cursor-pointer shrink-0"
        >
          <Sparkles className="w-4 h-4" />
          <span>Pre-order Now • ₹499</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
