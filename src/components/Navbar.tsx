import React, { useState, useEffect } from 'react';
import {
  Compass,
  BookOpen,
  Users,
  MapPin,
  Instagram,
  Menu,
  X,
  ShieldCheck,
  Footprints,
  Sparkles,
  Sun,
  Moon,
  ChevronRight
} from 'lucide-react';
import { BrandAvatar } from './BrandAvatar';
import { api, InstagramState } from '../services/api';
import { useTheme } from '../context/ThemeContext';

interface NavbarProps {
  currentRoute: string;
  navigate: (route: string) => void;
  onOpenOrderModal: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentRoute, navigate, onOpenOrderModal }) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [instagramData, setInstagramData] = useState<InstagramState | null>(null);
  const [isAdmin, setIsAdmin] = useState(() => api.isAdminAuthenticated());
  const { isDark, toggleTheme } = useTheme();

  const supporterCount = api.getApprovedFeaturedCount();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 15);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Listen to admin auth state changes
  useEffect(() => {
    const handleAuthChange = (e: any) => {
      setIsAdmin(e.detail?.isAuthenticated ?? api.isAdminAuthenticated());
    };
    window.addEventListener('admin_auth_changed', handleAuthChange);
    return () => window.removeEventListener('admin_auth_changed', handleAuthChange);
  }, []);

  // Fetch real Instagram profile data from server
  useEffect(() => {
    let isMounted = true;
    api.getInstagramProfile(false)
      .then((data) => {
        if (isMounted) {
          setInstagramData(data);
        }
      })
      .catch(() => {
        // Fallback silently
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const navItems = [
    { id: 'home', label: 'Story', path: '/', icon: Compass },
    { id: 'journey', label: '28 States', path: '/journey', icon: MapPin },
    { id: 'mosaic', label: 'Living Mosaic', path: '/mosaic', icon: Users, badge: `${supporterCount}/1000` },
    { id: 'supporters', label: 'Supporters', path: '/supporters', icon: Users },
    { id: 'book', label: 'The Book', path: '/book', icon: BookOpen },
    { id: 'about', label: 'Veer', path: '/about', icon: Footprints },
    { id: 'instagram', label: 'Instagram', path: '/instagram', icon: Instagram, isInstagram: true }
  ];

  return (
    <header
      id="main-navigation-header"
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? 'bg-[#FAF8F5]/95 dark:bg-stone-900/95 backdrop-blur-md shadow-sm border-b border-[#E7E2DA] dark:border-stone-800 py-2.5'
          : 'bg-[#FAF8F5]/90 dark:bg-stone-900/90 backdrop-blur-xs border-b border-transparent py-3'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-2 sm:gap-4">
          
          {/* Brand Logo & Title */}
          <button
            id="brand-logo-button"
            onClick={() => {
              navigate('/');
              setMobileMenuOpen(false);
            }}
            className="flex items-center gap-2.5 sm:gap-3 text-left group cursor-pointer focus:outline-none shrink-0"
            title="Veer • 2Shoes2Faar"
          >
            <BrandAvatar
              sizeClassName="w-9 h-9 sm:w-10 sm:h-10"
              ringClassName="p-[2px] bg-gradient-to-tr from-[#f09433] via-[#dc2743] to-[#bc1888] shadow-xs group-hover:scale-105 transition-transform duration-300"
              alt={instagramData?.handle || '2shoes2faar'}
            />
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-editorial text-lg sm:text-xl font-bold tracking-tight text-[#1C1917] dark:text-stone-100 block leading-none">
                  2Shoes2Faar
                </span>
                {instagramData?.verified && (
                  <span className="w-2 h-2 rounded-full bg-[#dc2743]" title="Verified" />
                )}
              </div>
              <span className="text-[10px] sm:text-[11px] tracking-wider uppercase font-semibold text-[#78716C] dark:text-stone-400 block mt-0.5">
                Channveer Shankad
              </span>
            </div>
          </button>

          {/* Desktop Navigation Links (Visible on Large Screens >= 1024px) */}
          <nav className="hidden lg:flex items-center gap-1 xl:gap-1.5">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentRoute === item.path;
              return (
                <button
                  key={item.id}
                  id={`nav-link-${item.id}`}
                  onClick={() => navigate(item.path)}
                  className={`h-9 px-3 xl:px-3.5 rounded-full text-xs font-semibold transition-all duration-200 flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
                    isActive
                      ? item.isInstagram
                        ? 'bg-gradient-to-r from-[#f09433] via-[#dc2743] to-[#bc1888] text-white shadow-xs'
                        : 'bg-[#1C1917] dark:bg-stone-100 text-[#FAF8F5] dark:text-stone-900 shadow-xs'
                      : item.isInstagram
                        ? 'text-[#57534E] dark:text-stone-300 hover:text-[#dc2743] hover:bg-[#dc2743]/10'
                        : 'text-[#57534E] dark:text-stone-300 hover:text-[#1C1917] dark:hover:text-stone-100 hover:bg-[#EAE4D9]/60 dark:hover:bg-stone-800'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 shrink-0 ${item.isInstagram && !isActive ? 'text-[#dc2743]' : ''}`} />
                  <span>{item.label}</span>
                  
                  {item.badge && (
                    <span
                      className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold leading-none shrink-0 ${
                        isActive
                          ? 'bg-[#C2410C] text-white'
                          : 'bg-[#C2410C]/15 dark:bg-[#C2410C]/30 text-[#C2410C] dark:text-amber-400'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}

                  {item.isInstagram && instagramData?.followerCountFormatted && (
                    <span
                      className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold leading-none shrink-0 ${
                        isActive
                          ? 'bg-white/25 text-white'
                          : 'bg-[#dc2743]/15 text-[#dc2743]'
                      }`}
                    >
                      {instagramData.followerCountFormatted}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Right Action Bar (Responsive across all screens) */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            
            {/* Theme Toggle (Dark/Light) */}
            <button
              id="header-theme-toggle-btn"
              onClick={toggleTheme}
              title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              className="h-9 px-2.5 sm:px-3 rounded-full text-xs font-semibold bg-[#FAF8F5] dark:bg-stone-800 hover:bg-[#EAE4D9] dark:hover:bg-stone-700 text-[#1C1917] dark:text-stone-100 transition-colors cursor-pointer border border-[#E7E2DA] dark:border-stone-700 flex items-center gap-1.5"
            >
              {isDark ? (
                <>
                  <Sun className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  <span className="hidden sm:inline text-[11px]">Light</span>
                </>
              ) : (
                <>
                  <Moon className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                  <span className="hidden sm:inline text-[11px]">Dark</span>
                </>
              )}
            </button>

            {/* Admin Shield with Live Auth Status Indicator */}
            <button
              id="header-admin-link-button"
              onClick={() => {
                navigate('/admin');
                setMobileMenuOpen(false);
              }}
              title={isAdmin ? 'Admin Authenticated (Author Portal)' : 'Admin Portal & Integrations'}
              className="h-9 w-9 rounded-full text-[#78716C] dark:text-stone-400 hover:text-[#1C1917] dark:hover:text-stone-100 hover:bg-[#EAE4D9]/60 dark:hover:bg-stone-800 transition-colors cursor-pointer flex items-center justify-center relative border border-transparent hover:border-[#E7E2DA] dark:hover:border-stone-700"
            >
              <ShieldCheck className={`w-4 h-4 ${isAdmin ? 'text-emerald-500 dark:text-emerald-400' : ''}`} />
              {isAdmin && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-emerald-500 ring-2 ring-white dark:ring-stone-900" />
              )}
            </button>

            {/* Primary Order CTA Button */}
            <button
              id="header-order-book-cta"
              onClick={onOpenOrderModal}
              className="h-9 bg-[#C2410C] hover:bg-[#9A3412] text-white text-xs sm:text-xs font-bold px-3 sm:px-4 rounded-full shadow-xs hover:shadow-md transition-all duration-200 flex items-center gap-1.5 cursor-pointer shrink-0"
            >
              <Sparkles className="w-3.5 h-3.5 shrink-0" />
              <span className="hidden xs:inline sm:inline">Get Book • ₹499</span>
              <span className="inline xs:hidden sm:hidden">₹499</span>
            </button>

            {/* Hamburger Button (Visible on screens < 1024px where desktop pills are hidden) */}
            <button
              id="mobile-menu-toggle-button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden h-9 w-9 flex items-center justify-center text-[#1C1917] dark:text-stone-200 bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 rounded-full focus:outline-none transition-colors cursor-pointer border border-[#E7E2DA] dark:border-stone-700"
              aria-label="Toggle Navigation Menu"
            >
              {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </div>

      {/* Responsive Slide-Down Drawer Menu (for Mobile & Tablet Screens) */}
      {mobileMenuOpen && (
        <div
          id="mobile-navigation-drawer"
          className="lg:hidden bg-[#FAF8F5] dark:bg-stone-900 border-b border-[#E7E2DA] dark:border-stone-800 px-4 pt-3 pb-6 space-y-2 animate-fadeIn shadow-xl"
        >
          <div className="text-[11px] font-bold uppercase tracking-wider text-stone-400 dark:text-stone-500 px-3 pb-1">
            Navigation Menu
          </div>

          <div className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentRoute === item.path;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    navigate(item.path);
                    setMobileMenuOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-left text-xs sm:text-sm font-semibold transition-colors cursor-pointer ${
                    isActive
                      ? item.isInstagram
                        ? 'bg-gradient-to-r from-[#f09433] via-[#dc2743] to-[#bc1888] text-white shadow-xs'
                        : 'bg-[#1C1917] dark:bg-stone-800 text-white'
                      : 'text-[#292524] dark:text-stone-200 hover:bg-[#EAE4D9]/60 dark:hover:bg-stone-800/80'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`w-4 h-4 ${item.isInstagram && !isActive ? 'text-[#dc2743]' : ''}`} />
                    <span>{item.label}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    {item.badge && (
                      <span className="text-[10px] font-bold bg-[#C2410C] text-white px-2 py-0.5 rounded-full">
                        {item.badge}
                      </span>
                    )}
                    {item.isInstagram && instagramData?.followerCountFormatted && (
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          isActive
                            ? 'bg-white/25 text-white'
                            : 'bg-[#dc2743]/15 text-[#dc2743]'
                        }`}
                      >
                        {instagramData.followerCountFormatted}
                      </span>
                    )}
                    <ChevronRight className="w-3.5 h-3.5 opacity-40" />
                  </div>
                </button>
              );
            })}
          </div>

          {/* Drawer Footer Links */}
          <div className="pt-3 border-t border-[#E7E2DA] dark:border-stone-800 flex items-center justify-between px-2 text-xs">
            <button
              onClick={() => {
                navigate('/admin');
                setMobileMenuOpen(false);
              }}
              className="text-[#78716C] dark:text-stone-400 hover:text-[#1C1917] dark:hover:text-stone-200 flex items-center gap-1.5 py-1.5 cursor-pointer font-medium"
            >
              <ShieldCheck className={`w-3.5 h-3.5 ${isAdmin ? 'text-emerald-500' : 'text-[#C2410C]'}`} />
              <span>Admin Portal {isAdmin && '✓ Logged In'}</span>
            </button>

            <button
              onClick={() => {
                navigate('/contact');
                setMobileMenuOpen(false);
              }}
              className="text-[#78716C] dark:text-stone-400 hover:text-[#1C1917] dark:hover:text-stone-200 py-1.5 cursor-pointer font-medium"
            >
              Speaking & Contact
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
