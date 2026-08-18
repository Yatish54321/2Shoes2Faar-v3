import React from 'react';
import { Compass, MapPin, Footprints, Calendar, Sparkles } from 'lucide-react';
import { JourneyTimeline } from '../components/JourneyTimeline';
import { JOURNEY_STATES } from '../data/journeyStates';

interface JourneyPageProps {
  onOpenOrderModal: () => void;
}

export const JourneyPage: React.FC<JourneyPageProps> = ({ onOpenOrderModal }) => {
  const totalKm = JOURNEY_STATES.reduce((acc, s) => acc + s.distanceKm, 0);

  return (
    <div id="journey-page-root" className="pt-24 pb-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <span className="text-xs font-bold uppercase tracking-wider text-[#C2410C] dark:text-amber-400 bg-[#C2410C]/10 dark:bg-stone-800 px-3.5 py-1 rounded-full inline-flex items-center gap-1.5 border border-[#C2410C]/20 dark:border-stone-700">
          <Compass className="w-3.5 h-3.5" />
          The 28-Week Solo Expedition
        </span>
        <h1 className="font-editorial text-4xl sm:text-5xl font-bold text-[#1C1917] dark:text-stone-100">
          28 States Across India
        </h1>
        <p className="text-base text-[#57534E] dark:text-stone-300 leading-relaxed">
          From the cold mountain deserts of Ladakh to the tropical backwaters of Kerala and the living root bridges of the Northeast. Explore the raw field notes, food memories, and human kindness collected state by state.
        </p>

        {/* Stats Row */}
        <div className="flex items-center justify-center gap-6 pt-2 text-xs sm:text-sm font-semibold text-[#1C1917] dark:text-stone-200">
          <span className="flex items-center gap-1.5">
            <MapPin className="w-4 h-4 text-[#C2410C] dark:text-amber-400" />
            28 States Explored
          </span>
          <span className="text-stone-300 dark:text-stone-700">•</span>
          <span className="flex items-center gap-1.5">
            <Calendar className="w-4 h-4 text-[#C2410C] dark:text-amber-400" />
            28 Consecutive Weeks
          </span>
          <span className="text-stone-300 dark:text-stone-700">•</span>
          <span className="flex items-center gap-1.5">
            <Footprints className="w-4 h-4 text-[#C2410C] dark:text-amber-400" />
            ~{totalKm} km Documented
          </span>
        </div>
      </div>

      {/* Main Interactive Timeline */}
      <JourneyTimeline />

      {/* Book CTA */}
      <div className="p-8 sm:p-10 bg-white dark:bg-stone-900 rounded-3xl border border-[#E7E2DA] dark:border-stone-800 flex flex-col md:flex-row items-center justify-between gap-6 shadow-xs">
        <div className="space-y-2">
          <h3 className="font-editorial text-2xl font-bold text-[#1C1917] dark:text-stone-100">
            Read the Full Uncensored Field Notes in the Book
          </h3>
          <p className="text-xs sm:text-sm text-[#57534E] dark:text-stone-300">
            Get the full 348-page paperback *India – 28 States in 28 Weeks* with all photo plates and traveler stories for ₹499.
          </p>
        </div>
        <button
          onClick={onOpenOrderModal}
          className="px-8 py-3 bg-[#C2410C] hover:bg-[#9A3412] text-white font-semibold text-sm rounded-full shadow-xs transition-colors shrink-0 cursor-pointer"
        >
          Pre-order Book • ₹499
        </button>
      </div>
    </div>
  );
};
