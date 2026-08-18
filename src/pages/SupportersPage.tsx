import React, { useState, useMemo } from 'react';
import { Search, MapPin, Sparkles, Users, Quote, ArrowRight, Instagram, CheckCircle2, Compass, Filter, BookOpen, Star } from 'lucide-react';
import { Supporter } from '../types';
import { SupporterAvatar } from '../components/SupporterAvatar';
import { SupporterCard } from '../components/SupporterCard';
import { ALL_INDIAN_STATES_AND_UTS } from '../utils/stateUtils';

interface SupportersPageProps {
  supporters: Supporter[];
  onSelectSupporter: (supporter: Supporter) => void;
  onOpenOrderModal: () => void;
}

export const SupportersPage: React.FC<SupportersPageProps> = ({
  supporters,
  onSelectSupporter,
  onOpenOrderModal
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedState, setSelectedState] = useState('All');
  const [featureFilter, setFeatureFilter] = useState<'all' | 'featured' | 'unfeatured'>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 24;

  const approvedSupporters = useMemo(() => {
    return supporters.filter(s => s.approved);
  }, [supporters]);

  const featuredCount = useMemo(() => {
    return approvedSupporters.filter(s => s.featured).length;
  }, [approvedSupporters]);

  const unfeaturedCount = useMemo(() => {
    return approvedSupporters.filter(s => !s.featured).length;
  }, [approvedSupporters]);

  // Compute state counts dynamically from approved supporters
  const stateCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    approvedSupporters.forEach(s => {
      const st = s.state?.trim() || 'Other';
      counts[st] = (counts[st] || 0) + 1;
    });
    return counts;
  }, [approvedSupporters]);

  // Available states from active supporters sorted by count descending
  const activeStatesWithCounts = useMemo(() => {
    const entries = (Object.entries(stateCounts) as [string, number][]).sort((a, b) => Number(b[1]) - Number(a[1]));
    return entries;
  }, [stateCounts]);

  const filteredSupporters = useMemo(() => {
    return approvedSupporters.filter(s => {
      const q = searchQuery.toLowerCase().trim();
      const numMatch = q.startsWith('#') ? q.slice(1) : q;

      // Smart keyword detection for "featured" or "unfeatured/preorder"
      const isSearchingFeaturedKeyword = q === 'featured' || q === '#featured' || q === 'mosaic';
      const isSearchingUnfeaturedKeyword = q === 'unfeatured' || q === 'preorder' || q === 'pre-order' || q === 'book only' || q === 'book-only';

      let matchesSearch = false;
      if (q === '') {
        matchesSearch = true;
      } else if (isSearchingFeaturedKeyword) {
        matchesSearch = s.featured === true;
      } else if (isSearchingUnfeaturedKeyword) {
        matchesSearch = s.featured === false;
      } else {
        matchesSearch =
          s.fullName.toLowerCase().includes(q) ||
          (s.city && s.city.toLowerCase().includes(q)) ||
          (s.state && s.state.toLowerCase().includes(q)) ||
          (s.instagramHandle && s.instagramHandle.toLowerCase().includes(q)) ||
          (s.travelComment && s.travelComment.toLowerCase().includes(q)) ||
          String(s.supporterNumber) === numMatch ||
          String(s.supporterNumber).includes(numMatch);
      }

      // Feature Filter Tab match
      let matchesFeatureFilter = true;
      if (featureFilter === 'featured') {
        matchesFeatureFilter = s.featured === true;
      } else if (featureFilter === 'unfeatured') {
        matchesFeatureFilter = s.featured === false;
      }

      const matchesState = selectedState === 'All' || s.state === selectedState;
      return matchesSearch && matchesFeatureFilter && matchesState;
    });
  }, [approvedSupporters, searchQuery, featureFilter, selectedState]);

  const totalPages = Math.ceil(filteredSupporters.length / itemsPerPage);
  const paginatedSupporters = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredSupporters.slice(start, start + itemsPerPage);
  }, [filteredSupporters, currentPage, itemsPerPage]);

  return (
    <div id="supporters-page-root" className="pt-24 pb-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
      {/* Header Banner */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <span className="text-xs font-bold uppercase tracking-wider text-[#C2410C] dark:text-amber-400 bg-[#C2410C]/10 dark:bg-[#C2410C]/20 px-3.5 py-1.5 rounded-full inline-flex items-center gap-1.5 border border-[#C2410C]/20">
          <Users className="w-3.5 h-3.5 text-[#C2410C] dark:text-amber-400" />
          <span>The 1,000 Living Supporters Directory</span>
        </span>
        <h1 className="font-editorial text-4xl sm:text-5xl font-bold text-[#1C1917] dark:text-stone-100 tracking-tight">
          The Faces of the Journey
        </h1>
        <p className="text-sm sm:text-base text-[#57534E] dark:text-stone-400 leading-relaxed max-w-2xl mx-auto">
          Meet the fellow travelers, dreamers, and wanderers from across India's 28 States who backed Veer’s solo journey and are immortalized in the published memoir and Living India Mosaic.
        </p>
      </div>

      {/* Control Bar: Search, Feature Filter, State Filters, and Join CTA */}
      <div className="bg-white dark:bg-stone-900 rounded-3xl border border-[#E7E2DA] dark:border-stone-800 p-5 sm:p-6 shadow-2xs space-y-4">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-4">
          {/* Search Input */}
          <div className="relative flex-1 w-full max-w-lg">
            <Search className="w-4 h-4 text-[#78716C] dark:text-stone-400 absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Search by Supporter # (e.g. #1), Name, City, State, or 'featured'..."
              className="w-full pl-11 pr-4 py-2.5 text-xs sm:text-sm bg-[#FAF8F5] dark:bg-stone-800 border border-[#D1C7B7] dark:border-stone-700 rounded-full text-[#1C1917] dark:text-stone-100 placeholder:text-[#A8A29E] focus:ring-2 focus:ring-[#C2410C] focus:outline-none transition-shadow"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs text-[#78716C] hover:text-[#1C1917] dark:text-stone-400 dark:hover:text-stone-100 font-semibold bg-[#EAE4D9] dark:bg-stone-700 px-2 py-0.5 rounded-full"
              >
                Clear
              </button>
            )}
          </div>

          {/* State Dropdown + CTA */}
          <div className="flex items-center gap-3 w-full lg:w-auto justify-between lg:justify-end">
            <div className="flex items-center gap-2">
              <Filter className="w-3.5 h-3.5 text-[#78716C] dark:text-stone-400 hidden sm:inline" />
              <span className="text-xs font-semibold text-[#78716C] dark:text-stone-400 whitespace-nowrap">State:</span>
              <select
                value={selectedState}
                onChange={(e) => {
                  setSelectedState(e.target.value);
                  setCurrentPage(1);
                }}
                className="px-3 py-2 text-xs sm:text-sm bg-[#FAF8F5] dark:bg-stone-800 border border-[#D1C7B7] dark:border-stone-700 rounded-xl text-[#1C1917] dark:text-stone-100 font-medium focus:ring-2 focus:ring-[#C2410C] focus:outline-none cursor-pointer"
              >
                <option value="All">All States & UTs ({approvedSupporters.length})</option>
                <optgroup label="Active States in Directory">
                  {activeStatesWithCounts.map(([st, cnt]) => (
                    <option key={st} value={st}>
                      {st} ({cnt})
                    </option>
                  ))}
                </optgroup>
                <optgroup label="All Indian States & UTs">
                  {ALL_INDIAN_STATES_AND_UTS.map(st => (
                    <option key={st} value={st}>{st}</option>
                  ))}
                </optgroup>
              </select>
            </div>

            <button
              onClick={onOpenOrderModal}
              className="px-5 py-2.5 bg-[#C2410C] hover:bg-[#9A3412] text-white text-xs font-semibold rounded-full shadow-xs transition-colors shrink-0 cursor-pointer flex items-center gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>Claim Slot #{featuredCount + 1} (₹499)</span>
            </button>
          </div>
        </div>

        {/* Feature vs Unfeatured Preference Filter Tabs */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-[#F2ECE1] dark:border-stone-800">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-bold text-[#78716C] dark:text-stone-400 mr-1">View Type:</span>
            <button
              onClick={() => {
                setFeatureFilter('all');
                setCurrentPage(1);
              }}
              className={`px-3.5 py-1.5 text-xs font-semibold rounded-full transition-all cursor-pointer flex items-center gap-1.5 ${
                featureFilter === 'all'
                  ? 'bg-[#1C1917] text-white shadow-2xs'
                  : 'bg-[#FAF8F5] dark:bg-stone-800 text-[#57534E] dark:text-stone-300 hover:bg-[#EAE4D9] dark:hover:bg-stone-700 border border-[#E7E2DA] dark:border-stone-700'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>All Backers ({approvedSupporters.length})</span>
            </button>

            <button
              onClick={() => {
                setFeatureFilter('featured');
                setCurrentPage(1);
              }}
              className={`px-3.5 py-1.5 text-xs font-semibold rounded-full transition-all cursor-pointer flex items-center gap-1.5 ${
                featureFilter === 'featured'
                  ? 'bg-amber-600 text-white shadow-2xs font-bold'
                  : 'bg-[#FAF8F5] dark:bg-stone-800 text-amber-900 dark:text-amber-300 hover:bg-amber-50 dark:hover:bg-stone-700 border border-amber-200 dark:border-amber-900/60'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>✨ Featured on Mosaic ({featuredCount})</span>
            </button>

            <button
              onClick={() => {
                setFeatureFilter('unfeatured');
                setCurrentPage(1);
              }}
              className={`px-3.5 py-1.5 text-xs font-semibold rounded-full transition-all cursor-pointer flex items-center gap-1.5 ${
                featureFilter === 'unfeatured'
                  ? 'bg-[#57534E] text-white shadow-2xs font-bold'
                  : 'bg-[#FAF8F5] dark:bg-stone-800 text-[#57534E] dark:text-stone-300 hover:bg-[#EAE4D9] dark:hover:bg-stone-700 border border-[#E7E2DA] dark:border-stone-700'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>📖 Book Pre-Order Only ({unfeaturedCount})</span>
            </button>
          </div>

          <div className="text-xs text-[#78716C] dark:text-stone-400 font-mono">
            {featuredCount} of 1,000 Mosaic Slots Filled
          </div>
        </div>

        {/* Quick-Filter State Chips */}
        {activeStatesWithCounts.length > 0 && (
          <div className="flex items-center gap-1.5 flex-wrap pt-2 border-t border-[#F2ECE1] dark:border-stone-800">
            <span className="text-[11px] font-bold text-[#78716C] dark:text-stone-400 mr-1">Popular States:</span>
            <button
              onClick={() => {
                setSelectedState('All');
                setCurrentPage(1);
              }}
              className={`px-2.5 py-1 text-xs font-semibold rounded-full transition-all cursor-pointer ${
                selectedState === 'All'
                  ? 'bg-[#1C1917] text-white shadow-2xs'
                  : 'bg-[#FAF8F5] dark:bg-stone-800 text-[#57534E] dark:text-stone-300 hover:bg-[#EAE4D9] dark:hover:bg-stone-700 border border-[#E7E2DA] dark:border-stone-700'
              }`}
            >
              All
            </button>
            {activeStatesWithCounts.slice(0, 10).map(([st, count]) => (
              <button
                key={st}
                onClick={() => {
                  setSelectedState(st);
                  setCurrentPage(1);
                }}
                className={`px-2.5 py-1 text-xs font-semibold rounded-full transition-all cursor-pointer flex items-center gap-1 ${
                  selectedState === st
                    ? 'bg-[#C2410C] text-white shadow-2xs'
                    : 'bg-[#FAF8F5] dark:bg-stone-800 text-[#57534E] dark:text-stone-300 hover:bg-[#EAE4D9] dark:hover:bg-stone-700 border border-[#E7E2DA] dark:border-stone-700'
                }`}
              >
                <span>{st}</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                  selectedState === st ? 'bg-white/20 text-white' : 'bg-[#E7E2DA] dark:bg-stone-700 text-[#78716C] dark:text-stone-300'
                }`}>
                  {count}
                </span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Directory Count Indicator */}
      <div className="flex items-center justify-between text-xs text-[#78716C] dark:text-stone-400 px-1">
        <span className="font-semibold">
          Showing {filteredSupporters.length} supporter{filteredSupporters.length === 1 ? '' : 's'}
          {featureFilter === 'featured' && ' (✨ Featured on Mosaic only)'}
          {featureFilter === 'unfeatured' && ' (📖 Pre-Order Book only)'}
          {selectedState !== 'All' && ` in ${selectedState}`}
          {searchQuery && ` matching "${searchQuery}"`}
        </span>
        <span className="text-[11px] font-mono">
          Slots 1 – {featuredCount} of 1,000 Mosaic Filled
        </span>
      </div>

      {/* Supporters Cards Grid */}
      {paginatedSupporters.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {paginatedSupporters.map((sup) => (
            <SupporterCard
              key={sup.id}
              supporter={sup}
              onSelect={onSelectSupporter}
            />
          ))}
        </div>
      ) : (
        /* Empty Filter State */
        <div className="bg-white dark:bg-stone-900 rounded-3xl border border-[#E7E2DA] dark:border-stone-800 p-12 text-center max-w-md mx-auto space-y-4 shadow-2xs">
          <div className="w-14 h-14 rounded-2xl bg-[#C2410C]/10 text-[#C2410C] dark:text-amber-400 flex items-center justify-center mx-auto">
            <Users className="w-7 h-7" />
          </div>
          <div className="space-y-1">
            <h3 className="font-editorial text-xl font-bold text-[#1C1917] dark:text-stone-100">
              {searchQuery || selectedState !== 'All' || featureFilter !== 'all' ? 'No Matching Supporters' : 'Directory Empty'}
            </h3>
            <p className="text-xs text-[#78716C] dark:text-stone-400 leading-relaxed">
              {searchQuery || selectedState !== 'All' || featureFilter !== 'all'
                ? `No supporters found matching your current filters. Try resetting your search or filter options.`
                : 'As backers submit the Google Form, their verified details will immediately appear in this directory and on the Living India Mosaic.'}
            </p>
          </div>
          {(searchQuery || selectedState !== 'All' || featureFilter !== 'all') && (
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedState('All');
                setFeatureFilter('all');
              }}
              className="px-5 py-2 bg-[#FAF8F5] dark:bg-stone-800 border border-[#D1C7B7] dark:border-stone-700 text-xs font-semibold rounded-full text-[#1C1917] dark:text-stone-200 hover:bg-[#EAE4D9] dark:hover:bg-stone-700 cursor-pointer transition-colors"
            >
              Reset All Filters
            </button>
          )}
        </div>
      )}

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-4">
          <button
            onClick={() => {
              setCurrentPage(p => Math.max(1, p - 1));
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            disabled={currentPage === 1}
            className="px-4 py-2 bg-white dark:bg-stone-900 border border-[#E7E2DA] dark:border-stone-800 rounded-full text-xs font-semibold text-[#1C1917] dark:text-stone-200 hover:bg-[#FAF8F5] dark:hover:bg-stone-800 disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed transition-colors"
          >
            Previous
          </button>
          <span className="text-xs font-semibold text-[#78716C] dark:text-stone-400 px-3">
            Page {currentPage} of {totalPages}
          </span>
          <button
            onClick={() => {
              setCurrentPage(p => Math.min(totalPages, p + 1));
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            disabled={currentPage === totalPages}
            className="px-4 py-2 bg-white dark:bg-stone-900 border border-[#E7E2DA] dark:border-stone-800 rounded-full text-xs font-semibold text-[#1C1917] dark:text-stone-200 hover:bg-[#FAF8F5] dark:hover:bg-stone-800 disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed transition-colors"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};
