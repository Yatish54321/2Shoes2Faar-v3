import React, { useEffect, useState, useMemo } from 'react';
import {
  Sparkles,
  Users,
  MapPin,
  ShieldCheck,
  Compass,
  ArrowRight,
  HelpCircle,
  Footprints,
  Layers,
  ChevronRight
} from 'lucide-react';
import { IndiaMosaic } from '../components/IndiaMosaic';
import { Supporter, MosaicCell } from '../types';
import { SupporterAvatar } from '../components/SupporterAvatar';
import { api } from '../services/api';

interface MosaicPageProps {
  cells: MosaicCell[];
  supporters: Supporter[];
  onSelectSupporter: (supporter: Supporter) => void;
  onOpenOrderModal: () => void;
}

export const MosaicPage: React.FC<MosaicPageProps> = ({
  cells,
  supporters,
  onSelectSupporter,
  onOpenOrderModal
}) => {
  const [highlightedCellId, setHighlightedCellId] = useState<string | null>(null);
  const [selectedSupporterId, setSelectedSupporterId] = useState<string | null>(null);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [topSupporterIds, setTopSupporterIds] = useState<string[]>([]);

  // Fetch top 10 cards order on mount (configured by Admin in Dashboard)
  useEffect(() => {
    let isMounted = true;
    api.getMosaicTopCards().then(ids => {
      if (isMounted && Array.isArray(ids) && ids.length > 0) {
        setTopSupporterIds(ids.slice(0, 10));
      }
    });
    return () => {
      isMounted = false;
    };
  }, [supporters]);

  // Check URL param for ?supporter=XXX
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const supporterParam = params.get('supporter');
    if (supporterParam) {
      const num = parseInt(supporterParam, 10);
      const matched = supporters.find(s => s.supporterNumber === num);
      if (matched) {
        onSelectSupporter(matched);
        setSelectedSupporterId(matched.id);
      }
    }
  }, [supporters, onSelectSupporter]);

  const featuredSupporters = useMemo(() => {
    return supporters.filter(s => s.approved && s.featured);
  }, [supporters]);

  const featuredCount = featuredSupporters.length;

  // Resolve top 10 supporters according to admin custom arrangement (Mosaic page only)
  const displayTopSupporters = useMemo(() => {
    const approved = supporters.filter(s => s.approved);
    if (approved.length === 0) return [];

    const ordered: Supporter[] = [];
    const usedIds = new Set<string>();

    // 1. First add according to saved custom arrangement
    for (const id of topSupporterIds) {
      const found = approved.find(s => s.id === id);
      if (found && !usedIds.has(found.id)) {
        ordered.push(found);
        usedIds.add(found.id);
      }
      if (ordered.length >= 10) break;
    }

    // 2. If fewer than 10, fill with other approved featured supporters
    if (ordered.length < 10) {
      for (const sup of featuredSupporters) {
        if (!usedIds.has(sup.id)) {
          ordered.push(sup);
          usedIds.add(sup.id);
        }
        if (ordered.length >= 10) break;
      }
    }

    // 3. If still fewer than 10, fill with remaining approved supporters
    if (ordered.length < 10) {
      for (const sup of approved) {
        if (!usedIds.has(sup.id)) {
          ordered.push(sup);
          usedIds.add(sup.id);
        }
        if (ordered.length >= 10) break;
      }
    }

    return ordered.slice(0, 10);
  }, [supporters, topSupporterIds, featuredSupporters]);

  const faqs = [
    {
      q: 'How does my photo and story get added to the India Mosaic?',
      a: 'When you pre-order India – 28 States in 28 Weeks (₹499), you can upload your portrait photograph, hometown, and answer "What makes you travel?". Your entry is assigned a unique supporter number (#001 to #1000) and mapped directly to a permanent coordinate cell on the India silhouette.'
    },
    {
      q: 'Will my name and photo be printed inside the physical book?',
      a: 'Yes! All 1,000 community supporters who claim a mosaic spot will have their names, hometowns, and quotes commemorated in the special "Living India Appendix" inside every physical edition of the book.'
    },
    {
      q: 'Can I zoom in and search for my tile?',
      a: 'Absolutely. Use the interactive search bar at the top of the map to type your name, supporter number (e.g., #1), or city. The map will smoothly zoom and pulse-highlight your exact coordinate tile.'
    },
    {
      q: 'Is there a limit on the number of spots?',
      a: 'Yes, exactly 1,000 spots are available. Once all 1,000 slots are filled, the digital monument and book appendix will be permanently locked.'
    }
  ];

  return (
    <div id="mosaic-page-root" className="pt-24 pb-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
      {/* Page Header */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <span className="text-xs font-bold uppercase tracking-wider text-[#C2410C] dark:text-amber-400 bg-[#C2410C]/10 dark:bg-stone-800 px-3.5 py-1 rounded-full inline-flex items-center gap-1.5 border border-[#C2410C]/20 dark:border-stone-700 shadow-2xs">
          <Sparkles className="w-3.5 h-3.5" />
          The Living India Monument
        </span>
        <h1 className="font-editorial text-4xl sm:text-5xl lg:text-6xl font-bold text-[#1C1917] dark:text-stone-100 tracking-tight">
          A Thousand Stories. One India.
        </h1>
        <p className="text-base sm:text-lg text-[#57534E] dark:text-stone-300 leading-relaxed">
          The first 1,000 supporters who pre-order *India – 28 States in 28 Weeks* become a permanent part of this odyssey through their photographs, hometowns, and travel philosophies.
        </p>

        {/* Live Counters */}
        <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-8 pt-3 text-xs sm:text-sm font-semibold text-[#1C1917] dark:text-stone-200">
          <span className="flex items-center gap-2 bg-white dark:bg-stone-900 px-4 py-2 rounded-2xl border border-[#E7E2DA] dark:border-stone-800 shadow-2xs">
            <Users className="w-4 h-4 text-[#C2410C] dark:text-amber-400" />
            <span><strong className="text-[#C2410C] dark:text-amber-400">{featuredCount}</strong> / 1,000 Spots Claimed</span>
          </span>
          <span className="flex items-center gap-2 bg-white dark:bg-stone-900 px-4 py-2 rounded-2xl border border-[#E7E2DA] dark:border-stone-800 shadow-2xs">
            <Compass className="w-4 h-4 text-[#C2410C] dark:text-amber-400" />
            <span><strong>28</strong> States Represented</span>
          </span>
          <span className="flex items-center gap-2 bg-white dark:bg-stone-900 px-4 py-2 rounded-2xl border border-[#E7E2DA] dark:border-stone-800 shadow-2xs">
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            <span>100% Verified Community</span>
          </span>
        </div>
      </div>

      {/* Flagship Interactive Mosaic Canvas */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-2">
          <div className="flex items-center gap-2 text-xs text-stone-500 font-semibold uppercase tracking-wider">
            <Layers className="w-4 h-4 text-[#C2410C]" />
            Live Interactive Monument
          </div>
          <div className="text-xs text-stone-500">
            Hover cell to inspect • Scroll/pinch to zoom • Click to claim
          </div>
        </div>

        <IndiaMosaic
          cells={cells}
          supporters={supporters}
          onSelectSupporter={onSelectSupporter}
          onOpenOrderModal={onOpenOrderModal}
          selectedSupporterId={selectedSupporterId}
          highlightedCellId={highlightedCellId}
        />
      </div>

      {/* Supporter Spotlight Section - Top 10 Community Faces (Clean Production UI) */}
      {displayTopSupporters.length > 0 && (
        <div
          id="mosaic-community-faces-section"
          className="bg-white dark:bg-stone-900 rounded-3xl border border-[#E7E2DA] dark:border-stone-800 p-6 sm:p-8 space-y-6 shadow-2xs"
        >
          {/* Section Heading */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-[#C2410C] dark:text-amber-400">
                Community Faces
              </span>
              <h3 className="font-editorial text-2xl font-bold text-[#1C1917] dark:text-stone-100">
                Top Featured Spots on the Monument
              </h3>
            </div>
          </div>

          {/* 10 Featured Community Cards Grid (2 rows of 5 on desktop, responsive on mobile) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3.5 sm:gap-4">
            {displayTopSupporters.map((sup) => {
              const cell = cells.find(c => c.supporterId === sup.id);

              return (
                <div
                  key={sup.id}
                  onClick={() => {
                    if (cell) {
                      setHighlightedCellId(cell.cellId);
                    }
                    onSelectSupporter(sup);
                  }}
                  className="p-3.5 sm:p-4 bg-stone-50 dark:bg-stone-800/60 rounded-2xl border border-stone-200 dark:border-stone-700/60 hover:border-[#C2410C] hover:shadow-md transition-all cursor-pointer group space-y-2.5 relative flex flex-col justify-between"
                >
                  <div className="space-y-2.5">
                    <div className="flex items-center gap-2.5">
                      <SupporterAvatar
                        photoUrl={sup.photoUrl}
                        name={sup.fullName}
                        supporterNumber={sup.supporterNumber}
                        id={sup.id}
                        size="sm"
                        className="group-hover:scale-105 transition-transform shrink-0"
                      />
                      <div className="min-w-0 flex-1">
                        <h4 className="font-bold text-xs text-[#1C1917] dark:text-stone-100 truncate" title={sup.fullName}>
                          {sup.fullName}
                        </h4>
                        <span className="text-[10px] font-bold text-[#C2410C] dark:text-amber-400 block">
                          Supporter #{sup.supporterNumber}
                        </span>
                      </div>
                    </div>

                    <p className="text-[11px] text-[#57534E] dark:text-stone-300 line-clamp-2 italic bg-white dark:bg-stone-900/80 p-2 rounded-xl border border-stone-200/50 dark:border-stone-700/50 min-h-[38px]">
                      "{sup.travelComment || 'Proud supporter of the 28-state solo Indian odyssey.'}"
                    </p>
                  </div>

                  <div className="flex items-center justify-between text-[10px] text-stone-400 font-semibold pt-1.5 border-t border-stone-200 dark:border-stone-700">
                    <span className="truncate flex items-center gap-1">
                      <MapPin className="w-2.5 h-2.5 text-[#C2410C] shrink-0" />
                      <span className="truncate">{sup.city}, {sup.state}</span>
                    </span>
                    <span className="text-[#C2410C] dark:text-amber-400 font-bold group-hover:underline flex items-center gap-0.5 shrink-0">
                      Locate <ChevronRight className="w-3 h-3" />
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* How it works info cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-stone-900 rounded-3xl border border-[#E7E2DA] dark:border-stone-800 p-6 sm:p-8 space-y-4 shadow-2xs">
          <div className="w-12 h-12 rounded-2xl bg-[#C2410C]/10 dark:bg-stone-800 text-[#C2410C] dark:text-amber-400 flex items-center justify-center font-bold text-lg border border-[#C2410C]/20 dark:border-stone-700">
            1
          </div>
          <h3 className="font-bold text-lg text-[#1C1917] dark:text-stone-100">
            Pre-order the Book (₹499)
          </h3>
          <p className="text-xs sm:text-sm text-[#57534E] dark:text-stone-300 leading-relaxed">
            Order your copy of *India – 28 States in 28 Weeks* and upload your favorite travel portrait, hometown, and answer what travel means to you.
          </p>
        </div>

        <div className="bg-white dark:bg-stone-900 rounded-3xl border border-[#E7E2DA] dark:border-stone-800 p-6 sm:p-8 space-y-4 shadow-2xs">
          <div className="w-12 h-12 rounded-2xl bg-[#C2410C]/10 dark:bg-stone-800 text-[#C2410C] dark:text-amber-400 flex items-center justify-center font-bold text-lg border border-[#C2410C]/20 dark:border-stone-700">
            2
          </div>
          <h3 className="font-bold text-lg text-[#1C1917] dark:text-stone-100">
            Get Your Permanent Slot
          </h3>
          <p className="text-xs sm:text-sm text-[#57534E] dark:text-stone-300 leading-relaxed">
            Your profile is assigned a unique supporter number (#001 to #1000) and mapped to a coordinate cell on the India silhouette.
          </p>
        </div>

        <div className="bg-white dark:bg-stone-900 rounded-3xl border border-[#E7E2DA] dark:border-stone-800 p-6 sm:p-8 space-y-4 shadow-2xs">
          <div className="w-12 h-12 rounded-2xl bg-[#C2410C]/10 dark:bg-stone-800 text-[#C2410C] dark:text-amber-400 flex items-center justify-center font-bold text-lg border border-[#C2410C]/20 dark:border-stone-700">
            3
          </div>
          <h3 className="font-bold text-lg text-[#1C1917] dark:text-stone-100">
            Printed in the Book Appendix
          </h3>
          <p className="text-xs sm:text-sm text-[#57534E] dark:text-stone-300 leading-relaxed">
            All 1,000 supporters will have their names, hometowns, and philosophies immortalized inside the printed book edition.
          </p>
        </div>
      </div>

      {/* Pre-Order CTA Banner */}
      <div className="rounded-3xl bg-gradient-to-r from-[#1C1917] via-[#2A1F1B] to-[#1C1917] text-white p-8 sm:p-12 border border-white/15 shadow-2xl relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-8">
        <div className="space-y-3 max-w-xl text-center md:text-left z-10">
          <span className="text-xs font-bold uppercase tracking-wider text-amber-400 bg-amber-500/15 px-3.5 py-1 rounded-full inline-flex items-center gap-1.5 border border-amber-500/30">
            <Footprints className="w-3.5 h-3.5" />
            Limited to First 1,000 Pre-Orders
          </span>
          <h3 className="font-editorial text-3xl sm:text-4xl font-bold tracking-tight">
            Claim Your Spot on the Living India Monument
          </h3>
          <p className="text-sm text-stone-300 leading-relaxed">
            Pre-order the hardcover edition of *India – 28 States in 28 Weeks* for ₹499 with free India-wide delivery and secure your immortalized tile on the map.
          </p>
        </div>

        <div className="flex flex-col items-center md:items-end gap-3 z-10 shrink-0">
          <div className="text-center md:text-right">
            <span className="text-xs text-stone-400 line-through mr-2">₹799</span>
            <span className="text-3xl font-black text-amber-400">₹499</span>
            <span className="text-xs text-stone-300 block">Free Speed Post Delivery Across India</span>
          </div>
          <button
            onClick={onOpenOrderModal}
            className="px-8 py-4 bg-[#C2410C] hover:bg-[#EA580C] text-white font-bold rounded-2xl text-base shadow-xl hover:scale-105 transition-all cursor-pointer flex items-center gap-2.5"
          >
            <span>Pre-order & Claim Spot</span>
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Frequently Asked Questions */}
      <div className="bg-white dark:bg-stone-900 rounded-3xl border border-[#E7E2DA] dark:border-stone-800 p-6 sm:p-10 space-y-6 shadow-2xs">
        <div className="text-center max-w-xl mx-auto space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-[#C2410C] dark:text-amber-400 flex items-center justify-center gap-1.5">
            <HelpCircle className="w-3.5 h-3.5" />
            Questions & Answers
          </span>
          <h3 className="font-editorial text-2xl sm:text-3xl font-bold text-[#1C1917] dark:text-stone-100">
            About the Living India Mosaic
          </h3>
        </div>

        <div className="max-w-3xl mx-auto space-y-3">
          {faqs.map((faq, idx) => {
            const isOpen = openFaq === idx;
            return (
              <div
                key={idx}
                className="border border-stone-200 dark:border-stone-800 rounded-2xl overflow-hidden transition-colors"
              >
                <button
                  onClick={() => setOpenFaq(isOpen ? null : idx)}
                  className="w-full px-6 py-4 text-left flex items-center justify-between gap-4 bg-stone-50/50 dark:bg-stone-800/40 hover:bg-stone-100/50 dark:hover:bg-stone-800 cursor-pointer font-bold text-sm sm:text-base text-[#1C1917] dark:text-stone-100"
                >
                  <span>{faq.q}</span>
                  <ChevronRight
                    className={`w-4 h-4 text-stone-400 shrink-0 transition-transform duration-200 ${
                      isOpen ? 'rotate-90 text-[#C2410C]' : ''
                    }`}
                  />
                </button>
                {isOpen && (
                  <div className="px-6 py-4 text-xs sm:text-sm text-[#57534E] dark:text-stone-300 leading-relaxed bg-white dark:bg-stone-900 border-t border-stone-200 dark:border-stone-800">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
