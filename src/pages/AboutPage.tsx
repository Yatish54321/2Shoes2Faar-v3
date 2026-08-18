import React from 'react';
import { Footprints, Camera, Heart, Sparkles, MapPin, Compass, ShieldCheck } from 'lucide-react';
import { SiteContent } from '../types';

interface AboutPageProps {
  content: SiteContent['about'];
  onOpenOrderModal: () => void;
}

export const AboutPage: React.FC<AboutPageProps> = ({ content, onOpenOrderModal }) => {
  return (
    <div id="about-page-root" className="pt-24 pb-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
      {/* Author Bio Header Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
        <div className="lg:col-span-5 relative">
          <div className="relative rounded-3xl overflow-hidden shadow-xl border border-[#E7E2DA]">
            <img
              src={content.authorPhoto}
              alt="Channveer Shankad (Veer)"
              className="w-full aspect-[4/5] object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
            <div className="absolute bottom-6 left-6 right-6 text-white">
              <span className="text-xs uppercase font-bold tracking-wider text-[#D97706] block">
                Travel Writer & Explorer
              </span>
              <h3 className="font-editorial text-2xl sm:text-3xl font-bold">
                Channveer Shankad (Veer)
              </h3>
              <p className="text-xs text-[#D6D3D1] mt-1">
                Founder, 2Shoes2Faar • Solo explorer across 28 Indian States
              </p>
            </div>
          </div>
        </div>

        <div className="lg:col-span-7 space-y-6">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-[#C2410C] dark:text-amber-400 bg-[#C2410C]/10 dark:bg-stone-800 px-3.5 py-1 rounded-full inline-flex items-center gap-1.5 mb-2 border border-[#C2410C]/20 dark:border-stone-700">
              <Footprints className="w-3.5 h-3.5" />
              The Backpacker Story
            </span>
            <h1 className="font-editorial text-3xl sm:text-5xl font-bold text-[#1C1917] dark:text-stone-100">
              {content.headline}
            </h1>
          </div>

          <div className="space-y-4 text-sm text-[#57534E] dark:text-stone-300 leading-relaxed">
            <p>{content.bioParagraph1}</p>
            <p>{content.bioParagraph2}</p>
            <p>{content.bioParagraph3}</p>
          </div>

          {/* Philosophy Banner */}
          <div className="p-4 sm:p-5 bg-white dark:bg-stone-900 rounded-2xl border border-[#E7E2DA] dark:border-stone-800 shadow-xs">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#C2410C] dark:text-amber-400 block mb-1">
              Core Travel Philosophy
            </span>
            <blockquote className="font-editorial text-base sm:text-lg italic text-[#1C1917] dark:text-stone-100 leading-relaxed">
              "{content.philosophy}"
            </blockquote>
          </div>

          <div className="pt-2 flex items-center gap-4">
            <button
              onClick={onOpenOrderModal}
              className="px-6 py-3 bg-[#C2410C] hover:bg-[#9A3412] text-white font-semibold text-xs rounded-full shadow-xs transition-colors cursor-pointer"
            >
              Pre-order the Memoir • ₹499
            </button>
          </div>
        </div>
      </div>

      {/* The Shoes and The Gear Section */}
      <div className="bg-white dark:bg-stone-900 rounded-3xl border border-[#E7E2DA] dark:border-stone-800 p-6 sm:p-10 shadow-xs space-y-8">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-[#78716C] dark:text-stone-400 flex items-center justify-center gap-1.5">
            <Camera className="w-3.5 h-3.5 text-[#C2410C] dark:text-amber-400" />
            What Was in the 45L Rucksack
          </span>
          <h2 className="font-editorial text-2xl sm:text-3xl font-bold text-[#1C1917] dark:text-stone-100">
            The Minimalist Travel Locker
          </h2>
          <p className="text-xs sm:text-sm text-[#57534E] dark:text-stone-300">
            Travelling across 28 states consecutively teaches you that the less you carry on your shoulders, the more you take in through your eyes.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {content.gearList.map((item, idx) => (
            <div
              key={idx}
              className="p-4 bg-[#FAF8F5] dark:bg-stone-800 rounded-2xl border border-[#E7E2DA] dark:border-stone-700 space-y-2"
            >
              <div className="w-8 h-8 rounded-xl bg-white dark:bg-stone-900 border border-[#D1C7B7] dark:border-stone-700 flex items-center justify-center text-xs font-bold text-[#C2410C] dark:text-amber-400">
                0{idx + 1}
              </div>
              <h4 className="font-bold text-sm text-[#1C1917] dark:text-stone-100">{item.item}</h4>
              <p className="text-xs text-[#78716C] dark:text-stone-400 leading-relaxed">{item.description}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
