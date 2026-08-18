import React, { useState } from 'react';
import { BookOpen, Sparkles, Check, ChevronDown, ChevronUp, ShieldCheck, Truck, Gift, Heart, Footprints, Award, MapPin, PackageCheck } from 'lucide-react';
import { SiteContent } from '../types';

interface BookShowcaseProps {
  content: SiteContent['book'];
  onOpenOrderModal: () => void;
}

export const BookShowcase: React.FC<BookShowcaseProps> = ({
  content,
  onOpenOrderModal
}) => {
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const faqs = [
    {
      q: 'How does getting featured on the Living India Mosaic work?',
      a: 'When you pre-order the book (₹499) and opt-in, you provide your photo, city, and a short answer to "What makes you travel?". Your profile gets a permanent slot on the interactive digital mosaic and your name & city will be printed in the book’s official Supporter Tribute appendix!'
    },
    {
      q: 'When will the printed book be delivered?',
      a: 'Pre-ordered copies are dispatched via India Post Speed Post directly to your delivery address. You will receive real-time dispatch tracking via WhatsApp and email.'
    },
    {
      q: 'Can I gift this book to another traveller?',
      a: 'Yes! Simply enter the recipient’s address in the delivery address field during checkout, and mention any custom author dedication note you would like Veer to handwrite inside the front cover.'
    },
    {
      q: 'Is shipping free across India?',
      a: 'Yes, standard Speed Post shipping is 100% free anywhere within India for all pre-orders.'
    }
  ];

  return (
    <div id="book-showcase-section" className="space-y-12">
      {/* Main Book Spotlight Grid */}
      <div className="bg-white dark:bg-stone-900 rounded-3xl border border-[#E7E2DA] dark:border-stone-800 p-6 sm:p-10 shadow-xs grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-14 items-center">
        {/* Book Realistic 3D Mockup Presentation */}
        <div className="lg:col-span-5 flex flex-col items-center justify-center">
          <div className="relative group max-w-[280px] sm:max-w-[320px] w-full">
            {/* Ambient Warm Golden Glow Behind Book */}
            <div className="absolute -inset-4 bg-gradient-to-tr from-[#FABD24]/25 via-[#C2410C]/20 to-[#D97706]/20 rounded-3xl blur-2xl opacity-70 group-hover:opacity-100 transition-opacity pointer-events-none" />

            {/* 3D Realistic Hardcover Presentation */}
            <div className="relative">
              {/* Hardcover Book Container */}
              <div className="relative rounded-2xl overflow-hidden shadow-[0_20px_50px_-10px_rgba(0,0,0,0.35)] dark:shadow-[0_25px_50px_-10px_rgba(0,0,0,0.7)] border border-stone-200/80 dark:border-stone-700/80 bg-[#FABD24] transform transition-transform duration-500 group-hover:-translate-y-1">
                {/* 100% Untouched Static Book Front Image */}
                <div className="relative w-full">
                  <img
                    src="/assets/book_front.jpg"
                    alt="India – 28 States in 28 Weeks by Channveer Shankad"
                    className="w-full h-auto object-contain block select-none"
                    loading="eager"
                  />

                  {/* Left Spine Book Crease Lighting (Realistic Hardcover Effect) */}
                  <div className="absolute top-0 bottom-0 left-0 w-4 bg-gradient-to-r from-black/30 via-black/10 to-transparent pointer-events-none" />
                  <div className="absolute top-0 bottom-0 left-[5px] w-[1.5px] bg-white/40 pointer-events-none" />

                  {/* Subtle Book Surface Light Sheen */}
                  <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-white/10 pointer-events-none" />
                </div>
              </div>

              {/* Realistic Paper Pages Edge on Right Side */}
              <div className="hidden sm:block absolute top-2 bottom-2 -right-2.5 w-2.5 bg-gradient-to-r from-stone-200 via-[#FAF8F5] to-stone-300 dark:from-stone-800 dark:via-stone-700 dark:to-stone-800 rounded-r-xs shadow-xs border-y border-r border-stone-300/80 dark:border-stone-700 pointer-events-none" />
            </div>

            {/* Physical Book Specifications Strip (Below Cover, Clean & Non-Overlapping) */}
            <div className="mt-5 grid grid-cols-3 gap-2 text-center">
              <div className="p-2 rounded-xl bg-[#FAF8F5] dark:bg-stone-800/80 border border-[#E7E2DA] dark:border-stone-700/60">
                <span className="text-[10px] uppercase font-bold text-[#78716C] dark:text-stone-400 block">Format</span>
                <span className="text-xs font-bold text-[#1C1917] dark:text-stone-100">Hardcover</span>
              </div>
              <div className="p-2 rounded-xl bg-[#FAF8F5] dark:bg-stone-800/80 border border-[#E7E2DA] dark:border-stone-700/60">
                <span className="text-[10px] uppercase font-bold text-[#78716C] dark:text-stone-400 block">Length</span>
                <span className="text-xs font-bold text-[#1C1917] dark:text-stone-100">{content.pageCount} Pages</span>
              </div>
              <div className="p-2 rounded-xl bg-[#FAF8F5] dark:bg-stone-800/80 border border-[#E7E2DA] dark:border-stone-700/60">
                <span className="text-[10px] uppercase font-bold text-[#78716C] dark:text-stone-400 block">Shipping</span>
                <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">Free India</span>
              </div>
            </div>
          </div>
        </div>

        {/* Book Story, Details, Pricing & Pre-Order CTA */}
        <div className="lg:col-span-7 space-y-6">
          {/* Header & Badges */}
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <span className="inline-flex items-center gap-1.5 bg-[#C2410C]/10 dark:bg-stone-800 text-[#C2410C] dark:text-amber-400 border border-[#C2410C]/20 dark:border-stone-700 text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full">
                <BookOpen className="w-3.5 h-3.5" />
                The Official Published Edition
              </span>
              <span className="inline-flex items-center gap-1 bg-amber-500/10 text-amber-700 dark:text-amber-300 text-xs font-bold px-2.5 py-1 rounded-full border border-amber-500/20">
                <Sparkles className="w-3 h-3 text-amber-500" />
                First 1,000 Print Run
              </span>
            </div>

            <h2 className="font-editorial text-3xl sm:text-4xl font-bold text-[#1C1917] dark:text-stone-100 leading-tight">
              {content.title}
            </h2>
            <p className="font-editorial text-base italic text-[#78716C] dark:text-stone-300 mt-1">
              "{content.subtitle}"
            </p>
            <p className="text-xs font-semibold text-[#57534E] dark:text-stone-400 mt-1.5 flex items-center gap-1.5">
              <span>By {content.author}</span>
              <span className="text-[#A8A29E]">•</span>
              <span className="text-[#C2410C] dark:text-amber-400 font-bold">2Shoes2Faar</span>
            </p>
          </div>

          {/* Pricing Highlight Card */}
          <div className="p-4 rounded-2xl bg-gradient-to-r from-[#FAF8F5] via-[#F5EFE6] to-[#FAF8F5] dark:from-stone-800/90 dark:via-stone-800/60 dark:to-stone-800/90 border border-[#E7E2DA] dark:border-stone-700 flex flex-wrap items-center justify-between gap-4">
            <div className="space-y-0.5">
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-extrabold text-[#C2410C] dark:text-amber-400">₹{content.price}</span>
                <span className="text-sm text-[#78716C] dark:text-stone-400 line-through">₹{content.originalPrice}</span>
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-md border border-emerald-200 dark:border-emerald-800">
                  Save 37%
                </span>
              </div>
              <p className="text-xs text-[#57534E] dark:text-stone-300 flex items-center gap-1">
                <Truck className="w-3.5 h-3.5 text-[#C2410C] dark:text-amber-400" />
                <span>Includes 100% Free Speed Post Shipping across India</span>
              </p>
            </div>

            <button
              onClick={onOpenOrderModal}
              className="px-6 py-3 bg-[#C2410C] hover:bg-[#9A3412] text-white font-bold text-sm rounded-full shadow-md hover:shadow-lg transition-all flex items-center gap-2 cursor-pointer"
            >
              <Sparkles className="w-4 h-4" />
              <span>Pre-order Copy • ₹499</span>
            </button>
          </div>

          {/* Book Synopsis */}
          <p className="text-sm text-[#57534E] dark:text-stone-300 leading-relaxed">
            {content.description}
          </p>

          {/* Reader Package Checklist */}
          <div className="space-y-2.5">
            <span className="text-xs font-bold uppercase tracking-wider text-[#1C1917] dark:text-stone-100 block">
              What's Included in Every Pre-Order:
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {content.highlights.map((item, index) => (
                <div
                  key={index}
                  className="flex items-start gap-2.5 p-3 rounded-xl bg-[#FAF8F5] dark:bg-stone-800 border border-[#E7E2DA] dark:border-stone-700 text-xs text-[#292524] dark:text-stone-200"
                >
                  <Check className="w-4 h-4 text-[#C2410C] dark:text-amber-400 shrink-0 mt-0.5" />
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Value Badges */}
          <div className="flex flex-wrap items-center gap-4 text-xs text-[#57534E] dark:text-stone-300 pt-1 border-t border-[#E7E2DA] dark:border-stone-800">
            <div className="flex items-center gap-1.5">
              <Gift className="w-4 h-4 text-[#C2410C] dark:text-amber-400" />
              <span>Hand-signed author dedication note</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-[#C2410C] dark:text-amber-400" />
              <span>Permanent Living Mosaic tile included</span>
            </div>
            <div className="flex items-center gap-1.5">
              <PackageCheck className="w-4 h-4 text-[#C2410C] dark:text-amber-400" />
              <span>Speed Post dispatch with SMS tracking</span>
            </div>
          </div>
        </div>
      </div>

      {/* Reader Excerpt Teaser Card */}
      <div className="p-6 sm:p-8 bg-[#243328] dark:bg-stone-900 border border-transparent dark:border-stone-800 text-white rounded-3xl relative overflow-hidden shadow-md">
        <div className="absolute -right-8 -bottom-8 opacity-10">
          <Footprints className="w-64 h-64 text-white" />
        </div>
        <div className="relative z-10 max-w-3xl space-y-3">
          <span className="text-xs font-bold uppercase tracking-wider text-[#D97706] dark:text-amber-400 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5" />
            Field Excerpt from Chapter 14: Sikkim
          </span>
          <blockquote className="font-editorial text-lg sm:text-xl italic leading-relaxed text-[#FAF8F5] dark:text-stone-100">
            "At 17,800 feet near Gurudongmar Lake, the air is thin enough that every breath feels deliberate. When you stand on the barren rooftop of India, you realize that frontiers are not made of barbed wire; they are made in our own minds. Two worn trekking boots carried me here, but it was the smiles of a hundred strangers that gave them wings."
          </blockquote>
          <span className="text-xs font-semibold text-[#A8A29E] dark:text-stone-400 block">
            — Channveer Shankad (Veer), Page 182
          </span>
        </div>
      </div>

      {/* FAQ Accordion */}
      <div className="bg-white dark:bg-stone-900 rounded-3xl border border-[#E7E2DA] dark:border-stone-800 p-6 sm:p-8 shadow-xs">
        <h3 className="font-editorial text-2xl font-bold text-[#1C1917] dark:text-stone-100 mb-6">
          Frequently Asked Questions
        </h3>
        <div className="space-y-3">
          {faqs.map((faq, idx) => {
            const isOpen = openFaq === idx;
            return (
              <div
                key={idx}
                className="border border-[#E7E2DA] dark:border-stone-800 rounded-2xl overflow-hidden transition-colors"
              >
                <button
                  onClick={() => setOpenFaq(isOpen ? null : idx)}
                  className="w-full p-4 text-left font-semibold text-sm text-[#1C1917] dark:text-stone-100 flex items-center justify-between gap-3 hover:bg-[#FAF8F5] dark:hover:bg-stone-800/80 transition-colors cursor-pointer"
                >
                  <span>{faq.q}</span>
                  {isOpen ? (
                    <ChevronUp className="w-4 h-4 text-[#C2410C] dark:text-amber-400 shrink-0" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-[#78716C] dark:text-stone-400 shrink-0" />
                  )}
                </button>
                {isOpen && (
                  <div className="px-4 pb-4 text-xs sm:text-sm text-[#57534E] dark:text-stone-300 leading-relaxed border-t border-[#F2ECE1] dark:border-stone-800 pt-3 bg-[#FAF8F5] dark:bg-stone-800/60">
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
