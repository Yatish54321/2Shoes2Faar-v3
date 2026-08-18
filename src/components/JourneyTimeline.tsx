import React, { useState } from 'react';
import { MapPin, Utensils, Compass, Footprints, Calendar, ArrowRight, Heart, Sparkles } from 'lucide-react';
import { JOURNEY_STATES } from '../data/journeyStates';
import { JourneyState } from '../types';

interface JourneyTimelineProps {
  onSelectState?: (state: JourneyState) => void;
}

export const JourneyTimeline: React.FC<JourneyTimelineProps> = ({ onSelectState }) => {
  const [selectedRegion, setSelectedRegion] = useState<string>('All');
  const [activeStateId, setActiveStateId] = useState<string>(JOURNEY_STATES[0].id);

  const regions = ['All', 'North', 'South', 'West', 'East', 'Central', 'North East'];

  const filteredStates = selectedRegion === 'All'
    ? JOURNEY_STATES
    : JOURNEY_STATES.filter(s => s.region === selectedRegion);

  const activeState = JOURNEY_STATES.find(s => s.id === activeStateId) || JOURNEY_STATES[0];

  return (
    <div id="journey-timeline-section" className="space-y-8">
      {/* Top Header & Regions */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <span className="text-xs uppercase font-bold tracking-wider text-[#C2410C] dark:text-amber-400 flex items-center gap-1.5 mb-1">
            <Compass className="w-4 h-4" />
            The 28-Week Solo Odyssey
          </span>
          <h2 className="font-editorial text-3xl sm:text-4xl font-bold text-[#1C1917] dark:text-stone-100">
            28 States in 28 Weeks
          </h2>
          <p className="text-sm text-[#57534E] dark:text-stone-300 max-w-xl mt-1">
            Chronicles of a solo backpacker walking across India with 2 shoes, 1 camera, and an open heart.
          </p>
        </div>

        {/* Region Filter Pills */}
        <div className="flex flex-wrap gap-1.5">
          {regions.map((reg) => (
            <button
              key={reg}
              onClick={() => setSelectedRegion(reg)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                selectedRegion === reg
                  ? 'bg-[#1C1917] dark:bg-stone-800 text-white shadow-xs border border-transparent dark:border-stone-700'
                  : 'bg-white dark:bg-stone-900 border border-[#E7E2DA] dark:border-stone-800 text-[#57534E] dark:text-stone-300 hover:bg-[#EAE4D9]/60 dark:hover:bg-stone-800'
              }`}
            >
              {reg}
            </button>
          ))}
        </div>
      </div>

      {/* Featured Active State Hero Card */}
      <div className="bg-white dark:bg-stone-900 rounded-3xl border border-[#E7E2DA] dark:border-stone-800 shadow-xs overflow-hidden grid grid-cols-1 lg:grid-cols-12 gap-0">
        {/* State Image Banner */}
        <div className="lg:col-span-7 relative min-h-[300px] lg:min-h-[440px] overflow-hidden bg-stone-900">
          <img
            src={activeState.coverImage}
            alt={activeState.name}
            onError={(e) => {
              // Fallback image if remote CDN fails
              (e.currentTarget as HTMLImageElement).src = 'https://images.unsplash.com/photo-1506461883276-594a12b11cf3?auto=format&fit=crop&w=1000&q=80';
            }}
            className="w-full h-full object-cover transition-transform duration-700 hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-transparent" />

          {/* Floating Badges */}
          <div className="absolute top-4 left-4 flex items-center gap-2">
            <span className="bg-black/60 backdrop-blur-md text-white text-xs font-bold px-3 py-1 rounded-full border border-white/20">
              Week {activeState.week} of 28
            </span>
            <span className="bg-[#C2410C] text-white text-xs font-bold px-3 py-1 rounded-full">
              State #{activeState.stateNumber}
            </span>
          </div>

          <div className="absolute bottom-5 left-5 right-5 text-white">
            <span className="text-xs uppercase tracking-wider text-[#D6D3D1] font-semibold flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-[#C2410C] dark:text-amber-400" />
              Capital: {activeState.capital} • {activeState.region} India
            </span>
            <h3 className="font-editorial text-3xl sm:text-4xl font-bold mt-1 text-white">
              {activeState.name}
            </h3>
            <p className="font-editorial text-sm italic text-[#FAF8F5]/90 mt-2 max-w-xl leading-relaxed">
              "{activeState.quote}"
            </p>
          </div>
        </div>

        {/* State Chronicles & Details */}
        <div className="lg:col-span-5 p-6 sm:p-8 flex flex-col justify-between space-y-5 bg-[#FAF8F5] dark:bg-stone-900">
          <div className="space-y-4">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#78716C] dark:text-stone-400">
                Field Notes & Field Story
              </span>
              <p className="text-sm text-[#292524] dark:text-stone-200 mt-1 leading-relaxed">
                {activeState.storySnippet}
              </p>
            </div>

            {/* Highlights List */}
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#78716C] dark:text-stone-400 block mb-1.5">
                Key Expeditions
              </span>
              <div className="flex flex-wrap gap-1.5">
                {activeState.highlights.map((h, i) => (
                  <span
                    key={i}
                    className="text-xs bg-white dark:bg-stone-800 border border-[#E7E2DA] dark:border-stone-700 px-2.5 py-1 rounded-lg text-[#1C1917] dark:text-stone-200 font-medium"
                  >
                    • {h}
                  </span>
                ))}
              </div>
            </div>

            {/* Memorable Human Encounter */}
            <div className="p-3.5 bg-white dark:bg-stone-800/80 rounded-2xl border border-[#E7E2DA] dark:border-stone-700">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#C2410C] dark:text-amber-400 flex items-center gap-1 mb-1">
                <Heart className="w-3 h-3 text-[#C2410C] dark:text-amber-400" />
                Unforgettable Stranger Encounter
              </span>
              <p className="text-xs text-[#57534E] dark:text-stone-300 italic">
                "{activeState.memorableEncounter}"
              </p>
            </div>

            {/* Food Memory */}
            <div className="flex items-center gap-2.5 text-xs text-[#57534E] dark:text-stone-300">
              <Utensils className="w-4 h-4 text-[#C2410C] dark:text-amber-400 shrink-0" />
              <span>
                <strong className="text-[#1C1917] dark:text-stone-200">Flavours:</strong> {activeState.localFood}
              </span>
            </div>
          </div>

          <div className="pt-3 border-t border-[#E7E2DA] dark:border-stone-800 flex items-center justify-between text-xs text-[#78716C] dark:text-stone-400">
            <span className="flex items-center gap-1">
              <Footprints className="w-3.5 h-3.5 text-[#C2410C] dark:text-amber-400" />
              ~{activeState.distanceKm} km on foot & overland transit
            </span>
            <span className="font-semibold text-[#1C1917] dark:text-stone-200">
              State {activeState.stateNumber} / 28
            </span>
          </div>
        </div>
      </div>

      {/* Horizontal State Selection Carousel */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs text-[#78716C] dark:text-stone-400 font-medium">
          <span>Click any state below to view chronicles:</span>
          <span>Showing {filteredStates.length} States</span>
        </div>

        <div className="flex gap-3 overflow-x-auto pb-4 pt-1 no-scrollbar scroll-smooth">
          {filteredStates.map((st) => {
            const isActive = st.id === activeState.id;
            return (
              <button
                key={st.id}
                onClick={() => {
                  setActiveStateId(st.id);
                  if (onSelectState) onSelectState(st);
                }}
                className={`flex-shrink-0 w-44 sm:w-52 rounded-2xl p-3 text-left border transition-all cursor-pointer ${
                  isActive
                    ? 'bg-[#1C1917] dark:bg-stone-800 text-white border-[#1C1917] dark:border-amber-500 shadow-md scale-102 ring-2 ring-[#C2410C]/40 dark:ring-amber-500/40'
                    : 'bg-white dark:bg-stone-900 hover:bg-[#FAF8F5] dark:hover:bg-stone-800 border-[#E7E2DA] dark:border-stone-800 text-[#1C1917] dark:text-stone-200'
                }`}
              >
                <div className="relative h-24 rounded-xl overflow-hidden mb-2.5 bg-stone-800">
                  <img
                    src={st.coverImage}
                    alt={st.name}
                    onError={(e) => {
                      (e.currentTarget as HTMLImageElement).src = 'https://images.unsplash.com/photo-1506461883276-594a12b11cf3?auto=format&fit=crop&w=800&q=80';
                    }}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-2 left-2 bg-black/70 backdrop-blur-xs text-white text-[10px] font-bold px-2 py-0.5 rounded-md">
                    W{st.week}
                  </div>
                </div>
                <div className="font-bold text-sm truncate">{st.name}</div>
                <div className={`text-xs truncate ${isActive ? 'text-[#D6D3D1] dark:text-stone-300' : 'text-[#78716C] dark:text-stone-400'}`}>
                  {st.capital} • {st.region}
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
