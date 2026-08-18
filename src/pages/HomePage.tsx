import React from 'react';
import { Footprints, MapPin, Sparkles, BookOpen, Users, Compass, ArrowRight, Heart, Star, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { HeroVisual } from '../components/HeroVisual';
import { IndiaMosaic } from '../components/IndiaMosaic';
import { JourneyTimeline } from '../components/JourneyTimeline';
import { BookShowcase } from '../components/BookShowcase';
import { InstagramFeed } from '../components/InstagramFeed';
import { SupporterCard } from '../components/SupporterCard';
import { SiteContent, Supporter, MosaicCell } from '../types';

interface HomePageProps {
  content: SiteContent;
  mosaicCells: MosaicCell[];
  supporters: Supporter[];
  onSelectMosaicSupporter?: (supporter: Supporter) => void;
  onSelectDirectorySupporter?: (supporter: Supporter) => void;
  onSelectSupporter?: (supporter: Supporter) => void;
  onOpenOrderModal: () => void;
  navigate: (route: string) => void;
}

export const HomePage: React.FC<HomePageProps> = ({
  content,
  mosaicCells,
  supporters,
  onSelectMosaicSupporter,
  onSelectDirectorySupporter,
  onSelectSupporter,
  onOpenOrderModal,
  navigate
}) => {
  const featuredQuotes = supporters.slice(0, 6);
  const handleMosaicSelect = onSelectMosaicSupporter || onSelectSupporter || (() => {});
  const handleDirectorySelect = onSelectDirectorySupporter || onSelectSupporter || (() => {});

  return (
    <div id="home-page-root" className="space-y-20 sm:space-y-28">
      {/* CINEMATIC HERO SECTION */}
      <section className="relative min-h-[90vh] flex items-center justify-center pt-24 pb-16 overflow-hidden">
        {/* Background Visual & Route Constellation */}
        <HeroVisual />

        {/* Ambient Warm Gradient Glows */}
        <div className="absolute top-1/4 -left-32 w-96 h-96 bg-[#C2410C]/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-10 -right-32 w-96 h-96 bg-[#D97706]/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-8">
          {/* Author Badge with Signature Shades Motif */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/90 dark:bg-stone-900/90 backdrop-blur-md border border-[#E7E2DA] dark:border-stone-800 shadow-xs animate-fadeIn">
            <span className="w-2 h-2 rounded-full bg-[#C2410C] animate-pulse" />
            <span className="text-xs font-bold uppercase tracking-wider text-[#1C1917] dark:text-stone-100">
              {content.hero.authorName}
            </span>
            <span className="text-[#A8A29E]">•</span>
            <span className="text-xs font-semibold text-[#78716C] dark:text-stone-300">
              2Shoes2Faar
            </span>
          </div>

          {/* Main Headline */}
          <div className="space-y-4">
            <h1 className="font-editorial text-4xl sm:text-6xl lg:text-7xl font-bold tracking-tight text-[#1C1917] dark:text-stone-50 leading-[1.08] max-w-4xl mx-auto">
              28 States. 28 Weeks.{' '}
              <span className="text-[#C2410C] dark:text-amber-400 italic block sm:inline">
                One Living Mosaic.
              </span>
            </h1>

            <p className="text-base sm:text-lg text-[#57534E] dark:text-stone-300 max-w-2xl mx-auto leading-relaxed">
              {content.hero.subtitle}
            </p>
          </div>

          {/* Core Emotional Banner */}
          <div className="p-3 sm:p-3.5 bg-gradient-to-r from-[#243328]/10 via-[#C2410C]/10 to-[#243328]/10 dark:from-stone-900/90 dark:via-stone-900/60 dark:to-stone-900/90 rounded-2xl border border-[#C2410C]/20 dark:border-stone-700 max-w-2xl mx-auto text-xs sm:text-sm font-bold text-[#1C1917] dark:text-stone-200 tracking-wide">
            {content.hero.highlightText}
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
            <button
              id="hero-explore-mosaic-cta"
              onClick={() => navigate('/mosaic')}
              className="w-full sm:w-auto px-8 py-3.5 bg-[#1C1917] dark:bg-stone-800 hover:bg-[#C2410C] dark:hover:bg-[#C2410C] text-white font-semibold text-sm rounded-full shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer border border-transparent dark:border-stone-700"
            >
              <Users className="w-4 h-4" />
              <span>Explore 1,000 Mosaic</span>
            </button>

            <button
              id="hero-pre-order-book-cta"
              onClick={onOpenOrderModal}
              className="w-full sm:w-auto px-8 py-3.5 bg-[#C2410C] hover:bg-[#9A3412] text-white font-semibold text-sm rounded-full shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Sparkles className="w-4 h-4" />
              <span>Pre-order Book • ₹499</span>
            </button>
          </div>

          {/* Key Quick Stats Strip */}
          <div className="pt-8 grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-6 max-w-4xl mx-auto">
            <div className="p-4 bg-white/90 dark:bg-stone-900/90 backdrop-blur-md rounded-2xl border border-[#E7E2DA] dark:border-stone-800 shadow-2xs">
              <span className="font-editorial text-2xl sm:text-3xl font-bold text-[#1C1917] dark:text-stone-100 block">
                28
              </span>
              <span className="text-[11px] uppercase font-bold text-[#78716C] dark:text-stone-400 tracking-wider">
                Indian States
              </span>
            </div>

            <div className="p-4 bg-white/90 dark:bg-stone-900/90 backdrop-blur-md rounded-2xl border border-[#E7E2DA] dark:border-stone-800 shadow-2xs">
              <span className="font-editorial text-2xl sm:text-3xl font-bold text-[#1C1917] dark:text-stone-100 block">
                28
              </span>
              <span className="text-[11px] uppercase font-bold text-[#78716C] dark:text-stone-400 tracking-wider">
                Consecutive Weeks
              </span>
            </div>

            <div className="p-4 bg-white/90 dark:bg-stone-900/90 backdrop-blur-md rounded-2xl border border-[#E7E2DA] dark:border-stone-800 shadow-2xs">
              <span className="font-editorial text-2xl sm:text-3xl font-bold text-[#1C1917] dark:text-stone-100 block">
                ~2,800 KM
              </span>
              <span className="text-[11px] uppercase font-bold text-[#78716C] dark:text-stone-400 tracking-wider">
                Solo Overland
              </span>
            </div>

            <div className="p-4 bg-white/90 dark:bg-stone-900/90 backdrop-blur-md rounded-2xl border border-[#E7E2DA] dark:border-stone-800 shadow-2xs">
              <span className="font-editorial text-2xl sm:text-3xl font-bold text-[#C2410C] dark:text-amber-400 block">
                1,000
              </span>
              <span className="text-[11px] uppercase font-bold text-[#78716C] dark:text-stone-400 tracking-wider">
                Living Supporters
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION: THE SIGNATURE LIVING INDIA MOSAIC */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-8 space-y-2">
          <span className="text-xs uppercase font-bold tracking-wider text-[#C2410C] dark:text-amber-400 flex items-center justify-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5" />
            The Signature Community Monument
          </span>
          <h2 className="font-editorial text-3xl sm:text-4xl font-bold text-[#1C1917] dark:text-stone-100">
            A Thousand Stories. One India.
          </h2>
          <p className="text-sm text-[#57534E] dark:text-stone-300">
            Hover or tap across the map to discover the real faces, hometowns, and travel philosophies of the first 1,000 supporters.
          </p>
        </div>

        <IndiaMosaic
          cells={mosaicCells}
          supporters={supporters}
          onSelectSupporter={handleMosaicSelect}
          onOpenOrderModal={onOpenOrderModal}
        />
      </section>

      {/* SECTION: 28 STATES JOURNEY EXPLORER */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <JourneyTimeline />
      </section>

      {/* SECTION: THE BOOK PRESENTATION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <BookShowcase
          content={content.book}
          onOpenOrderModal={onOpenOrderModal}
        />
      </section>

      {/* SECTION: VOICES OF SUPPORTERS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-10 space-y-2">
          <span className="text-xs uppercase font-bold tracking-wider text-[#C2410C] flex items-center justify-center gap-1.5">
            <Heart className="w-3.5 h-3.5" />
            Voices from the Living Mosaic
          </span>
          <h2 className="font-editorial text-3xl sm:text-4xl font-bold text-[#1C1917] dark:text-stone-100">
            What Makes Us Travel?
          </h2>
          <p className="text-sm text-[#57534E] dark:text-stone-400">
            Supporters across every corner of India share the deeper reasons why stepping onto the road transforms us.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {featuredQuotes.map((sup) => (
            <SupporterCard
              key={sup.id}
              supporter={sup}
              onSelect={handleDirectorySelect}
            />
          ))}
        </div>

        <div className="mt-10 text-center">
          <button
            onClick={() => {
              navigate('/supporters');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className="inline-flex items-center gap-2 px-8 py-3.5 bg-white dark:bg-stone-900 border border-[#E7E2DA] dark:border-stone-800 hover:border-[#C2410C] hover:bg-[#FAF8F5] dark:hover:bg-stone-800 text-[#1C1917] dark:text-stone-100 font-bold text-xs sm:text-sm rounded-full shadow-2xs hover:shadow-md transition-all cursor-pointer group"
          >
            <span>Explore All 1,000 Supporters Directory ({supporters.length} Backers)</span>
            <ArrowRight className="w-4 h-4 text-[#C2410C] dark:text-amber-400 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </section>

      {/* SECTION: INSTAGRAM @2SHOES2FAAR */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <InstagramFeed instagram={content.instagram} />
      </section>

      {/* FINAL PRE-ORDER HERO BANNER */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        <div className="bg-gradient-to-r from-[#1C1917] via-[#243328] to-[#1C1917] rounded-3xl text-white p-8 sm:p-14 text-center space-y-6 relative overflow-hidden shadow-xl">
          <div className="absolute inset-0 bg-cartography-grid opacity-20" />
          <div className="relative z-10 max-w-2xl mx-auto space-y-4">
            <span className="text-xs uppercase font-bold tracking-wider text-[#D97706] flex items-center justify-center gap-1.5">
              <Footprints className="w-4 h-4" />
              Limited First 1,000 Print Edition
            </span>
            <h2 className="font-editorial text-3xl sm:text-5xl font-bold leading-tight">
              Hold the 28-State Odyssey in Your Hands.
            </h2>
            <p className="text-sm text-[#D6D3D1] leading-relaxed">
              Pre-order your signed copy of *India – 28 States in 28 Weeks* for ₹499 with free shipping across India. Claim your permanent photographic tile on the Living Mosaic.
            </p>

            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-4">
              <button
                onClick={onOpenOrderModal}
                className="w-full sm:w-auto px-8 py-3.5 bg-[#C2410C] hover:bg-[#EA580C] text-white font-bold text-sm rounded-full shadow-lg transition-all cursor-pointer"
              >
                Pre-order Book Now • ₹499
              </button>
              <a
                href="https://forms.gle/Nj13LtV9ATqHt8EJA"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto px-6 py-3.5 bg-white/10 hover:bg-white/20 text-white font-semibold text-sm rounded-full border border-white/20 transition-colors"
              >
                Or Open Google Form
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
