/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback } from 'react';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { MosaicSupporterModal } from './components/MosaicSupporterModal';
import { SupporterDetailModal } from './components/SupporterDetailModal';
import { OrderFormModal } from './components/OrderFormModal';
import { ThemeProvider } from './context/ThemeContext';

// Pages
import { HomePage } from './pages/HomePage';
import { JourneyPage } from './pages/JourneyPage';
import { MosaicPage } from './pages/MosaicPage';
import { SupportersPage } from './pages/SupportersPage';
import { BookPage } from './pages/BookPage';
import { AboutPage } from './pages/AboutPage';
import { InstagramPage } from './pages/InstagramPage';
import { ContactPage } from './pages/ContactPage';
import { AdminPage } from './pages/AdminPage';

// State & API
import { api } from './services/api';
import { INITIAL_SITE_CONTENT } from './data/initialContent';
import { Supporter, MosaicCell, SiteContent, BookOrder } from './types';

function AppContent() {
  const [currentRoute, setCurrentRoute] = useState<string>('/');
  const [content, setContent] = useState<SiteContent>(INITIAL_SITE_CONTENT);
  const [mosaicCells, setMosaicCells] = useState<MosaicCell[]>([]);
  const [supporters, setSupporters] = useState<Supporter[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Modals state: 2 separate modals for Mosaic page vs. Supporters directory webpage
  const [selectedMosaicSupporter, setSelectedMosaicSupporter] = useState<Supporter | null>(null);
  const [selectedDirectorySupporter, setSelectedDirectorySupporter] = useState<Supporter | null>(null);
  const [isOrderModalOpen, setIsOrderModalOpen] = useState<boolean>(false);

  // Initialize and load data
  const loadData = useCallback(async () => {
    try {
      await api.syncWithBackend();
      const cmsData = api.getContent();
      const cellsData = api.getMosaicCells();
      const supportersData = api.getSupporters();
      setContent(cmsData);
      setMosaicCells([...cellsData]);
      setSupporters([...supportersData]);
    } catch (err) {
      console.error('Failed to load application data', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();

    // Auto-refresh periodically so newly submitted supporters from Google Form webhook appear dynamically
    const interval = setInterval(() => {
      loadData();
    }, 6000);

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        loadData();
      }
    };

    window.addEventListener('focus', loadData);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      clearInterval(interval);
      window.removeEventListener('focus', loadData);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [loadData]);

  // Synchronize browser history and path routing
  useEffect(() => {
    const handlePopState = () => {
      const path = window.location.pathname || '/';
      setCurrentRoute(path);
    };

    // Initial path detection
    const initialPath = window.location.pathname || '/';
    setCurrentRoute(initialPath);

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigate = (route: string) => {
    if (route === currentRoute) return;
    window.history.pushState({}, '', route);
    setCurrentRoute(route);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOrderSuccess = (order: BookOrder, newSupporter?: Supporter) => {
    // Reload state so the new supporter and cell assignments refresh immediately
    loadData();
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF8F5] dark:bg-[#12100E] text-[#1C1917] dark:text-[#FAF8F5] font-sans selection:bg-[#C2410C]/20 selection:text-[#C2410C] transition-colors duration-200 relative">
      {/* Navigation Header */}
      <Navbar
        currentRoute={currentRoute}
        navigate={navigate}
        onOpenOrderModal={() => setIsOrderModalOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1 relative z-10">
        {loading ? (
          <div className="min-h-[70vh] flex flex-col items-center justify-center space-y-4">
            <div className="w-12 h-12 border-4 border-[#C2410C]/30 border-t-[#C2410C] rounded-full animate-spin" />
            <p className="font-editorial text-lg text-[#78716C] dark:text-stone-400 animate-pulse">
              Mapping 28 Indian States & 1,000 Living Stories...
            </p>
          </div>
        ) : (
          <>
            {currentRoute === '/' && (
              <HomePage
                content={content}
                mosaicCells={mosaicCells}
                supporters={supporters}
                onSelectMosaicSupporter={(s) => setSelectedMosaicSupporter(s)}
                onSelectDirectorySupporter={(s) => setSelectedDirectorySupporter(s)}
                onOpenOrderModal={() => setIsOrderModalOpen(true)}
                navigate={navigate}
              />
            )}

            {currentRoute === '/journey' && (
              <JourneyPage
                onOpenOrderModal={() => setIsOrderModalOpen(true)}
              />
            )}

            {currentRoute === '/mosaic' && (
              <MosaicPage
                cells={mosaicCells}
                supporters={supporters}
                onSelectSupporter={(s) => setSelectedMosaicSupporter(s)}
                onOpenOrderModal={() => setIsOrderModalOpen(true)}
              />
            )}

            {currentRoute === '/supporters' && (
              <SupportersPage
                supporters={supporters}
                onSelectSupporter={(s) => setSelectedDirectorySupporter(s)}
                onOpenOrderModal={() => setIsOrderModalOpen(true)}
              />
            )}

            {currentRoute === '/book' && (
              <BookPage
                content={content.book}
                onOpenOrderModal={() => setIsOrderModalOpen(true)}
              />
            )}

            {currentRoute === '/about' && (
              <AboutPage
                content={content.about}
                onOpenOrderModal={() => setIsOrderModalOpen(true)}
              />
            )}

            {currentRoute === '/instagram' && (
              <InstagramPage
                content={content.instagram}
              />
            )}

            {currentRoute === '/contact' && (
              <ContactPage
                content={content.contact}
              />
            )}

            {currentRoute === '/admin' && (
              <AdminPage
                onRefreshData={loadData}
              />
            )}
          </>
        )}
      </main>

      {/* 1. Dedicated Mosaic Supporter Spotlight Modal (For Living India Mosaic Map view) */}
      <MosaicSupporterModal
        supporter={selectedMosaicSupporter}
        allSupporters={supporters}
        onClose={() => setSelectedMosaicSupporter(null)}
        onSelectSupporter={(s) => setSelectedMosaicSupporter(s)}
        onOpenOrderModal={() => setIsOrderModalOpen(true)}
      />

      {/* 2. Original Supporter Detail Modal (For 1,000 Supporters Directory Webpage) */}
      <SupporterDetailModal
        supporter={selectedDirectorySupporter}
        onClose={() => setSelectedDirectorySupporter(null)}
        onOpenOrderModal={() => setIsOrderModalOpen(true)}
      />

      {/* Pre-Order / Slot Allocation Modal */}
      <OrderFormModal
        isOpen={isOrderModalOpen}
        onClose={() => setIsOrderModalOpen(false)}
        onOrderSuccess={handleOrderSuccess}
      />

      {/* Global Footer */}
      <Footer
        navigate={navigate}
        onOpenOrderModal={() => setIsOrderModalOpen(true)}
      />
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  );
}
