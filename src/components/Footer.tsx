import React, { useState, useEffect } from 'react';
import {
  Instagram,
  Mail,
  MapPin,
  Sparkles,
  ShieldCheck,
  Footprints,
  ArrowUpRight,
  ExternalLink,
  BookOpen,
  Users,
  Compass,
  Moon,
  Sun
} from 'lucide-react';
import { BrandAvatar } from './BrandAvatar';
import { api, InstagramState } from '../services/api';
import { useTheme } from '../context/ThemeContext';

interface FooterProps {
  navigate: (route: string) => void;
  onOpenOrderModal: () => void;
}

export const Footer: React.FC<FooterProps> = ({ navigate, onOpenOrderModal }) => {
  const [instagramData, setInstagramData] = useState<InstagramState | null>(null);
  const { theme, toggleTheme } = useTheme();

  useEffect(() => {
    let isMounted = true;
    api.getInstagramProfile(false)
      .then((data) => {
        if (isMounted && data) {
          setInstagramData(data);
        }
      })
      .catch(() => {});

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <footer
      id="main-site-footer"
      className="relative bg-[#141211] text-[#FAF8F5] pt-16 pb-12 border-t border-white/10 overflow-hidden"
    >
      {/* Subtle background ambient glows matching header aesthetic */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-[#C2410C]/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-10 w-72 h-72 bg-[#bc1888]/5 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-8 lg:gap-10">
          {/* Brand Column (lg:col-span-4) */}
          <div className="lg:col-span-4 space-y-5">
            <button
              onClick={() => navigate('/')}
              className="flex items-center gap-3.5 text-left group cursor-pointer focus:outline-none"
              title="Veer • 2Shoes2Faar"
            >
              <BrandAvatar
                sizeClassName="w-12 h-12"
                ringClassName="p-[2px] bg-gradient-to-tr from-[#f09433] via-[#dc2743] to-[#bc1888] shadow-md group-hover:scale-105 transition-transform duration-300"
                alt="2Shoes2Faar • Channveer Shankad"
              />
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-editorial text-2xl font-bold tracking-tight text-[#FAF8F5] block leading-none">
                    2Shoes2Faar
                  </span>
                  {instagramData?.verified && (
                    <span className="w-2 h-2 rounded-full bg-[#dc2743]" title="Verified Creator" />
                  )}
                </div>
                <span className="text-[11px] tracking-wider uppercase font-semibold text-[#A8A29E] mt-0.5 block">
                  Channveer Shankad (Veer)
                </span>
              </div>
            </button>

            <p className="text-xs sm:text-sm text-[#A8A29E] leading-relaxed max-w-sm">
              One solo traveler walking across 28 Indian States in 28 Weeks. Chronicling India's untold kindnesses into a printed book and a living mosaic monument.
            </p>

            {/* Living Map Mission Highlight Banner */}
            <div className="p-3.5 bg-gradient-to-r from-white/[0.06] via-white/[0.03] to-white/[0.01] rounded-2xl border border-white/10 text-xs text-[#E7E2DA] flex items-center gap-2.5 max-w-md shadow-xs">
              <span className="p-1.5 rounded-lg bg-gradient-to-tr from-[#f09433]/20 via-[#dc2743]/20 to-[#bc1888]/20 text-[#f09433] shrink-0">
                <Sparkles className="w-3.5 h-3.5" />
              </span>
              <span className="text-[11px] font-medium tracking-wide leading-tight">
                <strong className="text-white font-semibold">ONE JOURNEY → 28 STATES → 1000 PEOPLE → ONE LIVING MAP OF INDIA</strong>
              </span>
            </div>
          </div>

          {/* Quick Links Column (lg:col-span-3) */}
          <div className="lg:col-span-3 space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#FAF8F5] flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#C2410C]" />
              <span>Exploration</span>
            </h4>
            <ul className="space-y-2.5 text-xs sm:text-sm text-[#A8A29E]">
              <li>
                <button
                  onClick={() => navigate('/')}
                  className="hover:text-white hover:translate-x-1 transition-all duration-200 flex items-center gap-2 cursor-pointer group"
                >
                  <Compass className="w-3.5 h-3.5 text-[#78716C] group-hover:text-[#C2410C] transition-colors" />
                  <span>The Story</span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => navigate('/journey')}
                  className="hover:text-white hover:translate-x-1 transition-all duration-200 flex items-center gap-2 cursor-pointer group"
                >
                  <MapPin className="w-3.5 h-3.5 text-[#78716C] group-hover:text-[#C2410C] transition-colors" />
                  <span>28 States Itinerary</span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => navigate('/mosaic')}
                  className="hover:text-white hover:translate-x-1 transition-all duration-200 flex items-center gap-2 cursor-pointer group"
                >
                  <Users className="w-3.5 h-3.5 text-[#78716C] group-hover:text-[#C2410C] transition-colors" />
                  <span>Living India Mosaic</span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => navigate('/supporters')}
                  className="hover:text-white hover:translate-x-1 transition-all duration-200 flex items-center gap-2 cursor-pointer group"
                >
                  <Users className="w-3.5 h-3.5 text-[#78716C] group-hover:text-[#C2410C] transition-colors" />
                  <span>Supporter Directory</span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => navigate('/about')}
                  className="hover:text-white hover:translate-x-1 transition-all duration-200 flex items-center gap-2 cursor-pointer group"
                >
                  <Footprints className="w-3.5 h-3.5 text-[#78716C] group-hover:text-[#C2410C] transition-colors" />
                  <span>About Veer</span>
                </button>
              </li>
            </ul>
          </div>

          {/* The Book & Community Column (lg:col-span-2) */}
          <div className="lg:col-span-2 space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#FAF8F5] flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#f09433]" />
              <span>The Book (₹499)</span>
            </h4>
            <ul className="space-y-2.5 text-xs sm:text-sm text-[#A8A29E]">
              <li>
                <button
                  onClick={() => navigate('/book')}
                  className="hover:text-white hover:translate-x-1 transition-all duration-200 flex items-center gap-2 cursor-pointer group"
                >
                  <BookOpen className="w-3.5 h-3.5 text-[#78716C] group-hover:text-[#f09433] transition-colors" />
                  <span>Book Overview</span>
                </button>
              </li>
              <li>
                <button
                  onClick={onOpenOrderModal}
                  className="text-[#f09433] hover:text-white font-semibold hover:translate-x-1 transition-all duration-200 flex items-center gap-1.5 cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Pre-order Copy (₹499)</span>
                </button>
              </li>
              <li>
                <a
                  href="https://forms.gle/Nj13LtV9ATqHt8EJA"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white hover:translate-x-1 transition-all duration-200 inline-flex items-center gap-1.5 text-xs group"
                >
                  <span>Google Form Order</span>
                  <ExternalLink className="w-3 h-3 text-[#78716C] group-hover:text-white" />
                </a>
              </li>
              <li>
                <button
                  onClick={() => navigate('/instagram')}
                  className="hover:text-white hover:translate-x-1 transition-all duration-200 flex items-center gap-2 cursor-pointer group"
                >
                  <Instagram className="w-3.5 h-3.5 text-[#dc2743] group-hover:scale-110 transition-transform" />
                  <span>Instagram Stories</span>
                </button>
              </li>
            </ul>
          </div>

          {/* Social, Connect & Admin Column (lg:col-span-3) */}
          <div className="lg:col-span-3 space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#FAF8F5] flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#dc2743]" />
              <span>Connect & Social</span>
            </h4>
            <div className="space-y-2.5 text-xs">
              <a
                href={instagramData?.url || 'https://instagram.com/2shoes2faar'}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between p-2.5 rounded-xl bg-white/[0.04] border border-white/10 hover:border-[#dc2743]/40 hover:bg-white/[0.07] transition-all group"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-[#f09433]/20 via-[#dc2743]/20 to-[#bc1888]/20 flex items-center justify-center text-[#dc2743] group-hover:scale-105 transition-transform">
                    <Instagram className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-xs font-medium text-[#FAF8F5] block leading-tight group-hover:text-[#f09433] transition-colors">
                      {instagramData?.handle || '@2shoes2faar'}
                    </span>
                    <span className="text-[10px] text-[#A8A29E]">
                      {instagramData?.followerCountFormatted ? `${instagramData.followerCountFormatted} wanderers` : 'Instagram Creator'}
                    </span>
                  </div>
                </div>
                <ArrowUpRight className="w-3.5 h-3.5 text-[#78716C] group-hover:text-white transition-colors" />
              </a>

              <div className="flex items-center gap-2.5 text-[#A8A29E] px-1 py-1">
                <Mail className="w-3.5 h-3.5 text-[#C2410C] shrink-0" />
                <span className="truncate">channveer.shankad@gmail.com</span>
              </div>

              <div className="flex items-center gap-2.5 text-[#A8A29E] px-1 py-0.5">
                <MapPin className="w-3.5 h-3.5 text-[#C2410C] shrink-0" />
                <span>Bengaluru, Karnataka, India</span>
              </div>

              <div className="pt-2 border-t border-white/5 flex items-center justify-between">
                <button
                  onClick={() => navigate('/admin')}
                  className="text-[11px] text-[#A8A29E] hover:text-white flex items-center gap-1.5 transition-colors cursor-pointer py-1 px-2 rounded-lg hover:bg-white/5"
                >
                  <ShieldCheck className="w-3.5 h-3.5 text-[#78716C]" />
                  <span>Admin & Webhooks</span>
                </button>
                <button
                  onClick={() => navigate('/contact')}
                  className="text-[11px] text-[#A8A29E] hover:text-white transition-colors cursor-pointer py-1 px-2 rounded-lg hover:bg-white/5"
                >
                  Talks & Inquiries
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#78716C]">
          <p className="text-center sm:text-left">
            © {new Date().getFullYear()} <strong className="text-[#A8A29E]">2Shoes2Faar</strong> • Channveer Shankad (Veer). All rights reserved.
          </p>
          <div className="flex items-center gap-4 text-[11px] flex-wrap justify-center sm:justify-end">
            <button
              onClick={toggleTheme}
              id="footer-theme-toggle-btn"
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white text-xs font-semibold border border-white/15 transition-colors cursor-pointer"
              title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            >
              {theme === 'dark' ? (
                <>
                  <Sun className="w-3.5 h-3.5 text-amber-400" />
                  <span>Light Mode</span>
                </>
              ) : (
                <>
                  <Moon className="w-3.5 h-3.5 text-amber-400" />
                  <span>Dark Mode</span>
                </>
              )}
            </button>
            <span className="text-stone-700 hidden sm:inline">•</span>
            <div className="flex items-center gap-1.5 text-stone-400">
              <span>Crafted for Indian wanderers & 1,000 mosaic souls</span>
              <Footprints className="w-3.5 h-3.5 text-[#C2410C]" />
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};
