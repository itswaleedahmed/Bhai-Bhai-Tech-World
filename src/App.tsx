/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion } from 'motion/react';
import { AppProvider, useApp } from './context/AppContext';
import { ParticleProvider } from './components/ParticleBurst';
import { AnnouncementTicker } from './components/AnnouncementTicker';
import { Header } from './components/Header';
import { HeroBanner } from './components/HeroBanner';
import { TrustGuarantees } from './components/TrustGuarantees';
import { CategoryPillBar } from './components/CategoryPillBar';
import { FeaturedPCBuilds } from './components/FeaturedPCBuilds';
import { BestSellingCards } from './components/BestSellingCards';
import { ShopByCategoryGrid } from './components/ShopByCategoryGrid';
import { LatestProducts } from './components/LatestProducts';
import { ShopCatalogView } from './components/ShopCatalogView';
import { PCBuilderView } from './components/PCBuilderView';
import { FPSEstimatorView } from './components/FPSEstimatorView';
import { CommunityBuildsView } from './components/CommunityBuildsView';
import { ServicesView } from './components/ServicesView';
import { InformationViews } from './components/InformationViews';
import { ProductModal } from './components/ProductModal';
import { CartDrawer } from './components/CartDrawer';
import { CheckoutModal } from './components/CheckoutModal';
import { CompareModal } from './components/CompareModal';
import { CompareTray } from './components/CompareTray';
import { FloatingWhatsApp } from './components/FloatingWhatsApp';
import { Footer } from './components/Footer';
import { TradeInEstimatorModal } from './components/TradeInEstimatorModal';
import { VideoInspectionModal } from './components/VideoInspectionModal';
import { AdminDashboardView } from './components/AdminDashboardView';
import { AuthModal } from './components/AuthModal';
import { ToastNotificationView } from './components/ToastNotification';
import { scrollToTop } from './utils/scroll';

const AdminRouteGuard: React.FC = () => {
  const { user, isAuthLoading, setCurrentPage, showToast } = useApp();

  React.useEffect(() => {
    if (!isAuthLoading) {
      const isOwner = user?.email?.toLowerCase() === 'itswaleedahmed@gmail.com';
      if (!isOwner) {
        if (window.location.hash.toLowerCase() === '#admin') {
          history.replaceState(null, '', window.location.pathname + window.location.search);
        }
        setCurrentPage('home');
        showToast('Admin entrance restricted to verified owner (itswaleedahmed@gmail.com)');
      }
    }
  }, [user, isAuthLoading, setCurrentPage, showToast]);

  if (isAuthLoading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-3">
        <div className="w-8 h-8 rounded-full border-2 border-emerald-400 border-t-transparent animate-spin" />
        <span className="text-xs text-zinc-400 font-mono">Verifying store owner credentials...</span>
      </div>
    );
  }

  const isOwner = user?.email?.toLowerCase() === 'itswaleedahmed@gmail.com';
  if (!isOwner) {
    return null;
  }

  return <AdminDashboardView />;
};

const AppContent: React.FC = () => {
  const {
    currentPage,
    setCurrentPage,
    activeProductModal,
    closeProductModal,
    toast,
    clearToast,
    user,
    isAuthLoading,
    showToast,
  } = useApp();
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);

  // Guarantee that every page opens from the top when navigating
  React.useEffect(() => {
    scrollToTop();
  }, [currentPage]);

  // Guard admin entrance: check if the logged-in user email is 'itswaleedahmed@gmail.com'. If not, redirect users trying to access the #admin URL back to the home page.
  React.useEffect(() => {
    const handleHash = () => {
      if (window.location.hash.toLowerCase() === '#admin') {
        if (isAuthLoading) return; // Wait for initial Firebase auth check
        const isOwner = user?.email?.toLowerCase() === 'itswaleedahmed@gmail.com';
        if (isOwner) {
          setCurrentPage('admin');
        } else {
          // Immediately clean URL hash and redirect back to home
          history.replaceState(null, '', window.location.pathname + window.location.search);
          setCurrentPage('home');
          showToast('Admin entrance restricted to verified owner (itswaleedahmed@gmail.com)');
        }
      }
    };

    handleHash();
    window.addEventListener('hashchange', handleHash);

    const handleKeyDown = (e: KeyboardEvent) => {
      // Secret key combination: Ctrl+Shift+A or Alt+A toggles staff admin desk ONLY for verified owner
      if (
        (e.ctrlKey && e.shiftKey && (e.key === 'A' || e.key === 'a')) ||
        (e.altKey && (e.key === 'A' || e.key === 'a'))
      ) {
        e.preventDefault();
        const isOwner = user?.email?.toLowerCase() === 'itswaleedahmed@gmail.com';
        if (isOwner) {
          setCurrentPage((prev) => (prev === 'admin' ? 'home' : 'admin'));
        } else {
          showToast('Admin desk requires verified store owner login.');
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('hashchange', handleHash);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [user, isAuthLoading, setCurrentPage, showToast]);

  return (
    <div className="min-h-screen bg-[#0B0B0C] text-zinc-100 flex flex-col font-sans selection:bg-[#25D366] selection:text-black">
      {/* Top Ticker */}
      <AnnouncementTicker />

      {/* Main Header & Nav */}
      <Header />

      {/* Main Routed Content */}
      <main className="flex-1">
        {currentPage === 'home' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.35, ease: 'easeOut' }}
          >
            <HeroBanner />
            <TrustGuarantees />
            <CategoryPillBar />
            <FeaturedPCBuilds />
            <BestSellingCards />
            <ShopByCategoryGrid />
            <LatestProducts />
          </motion.div>
        )}

        {currentPage === 'shop' && <ShopCatalogView />}
        {currentPage === 'pc-builder' && <PCBuilderView />}
        {currentPage === 'fps-estimator' && <FPSEstimatorView />}
        {currentPage === 'community-builds' && <CommunityBuildsView />}
        {currentPage === 'services' && <ServicesView />}
        {currentPage === 'admin' && <AdminRouteGuard />}

        {[
          'about',
          'faq',
          'warranty-policy',
          'return-policy',
          'terms',
          'privacy-policy',
          'complaints',
          'my-account',
          'store-locator',
        ].includes(currentPage) && (
          <InformationViews
            section={
              currentPage === 'store-locator'
                ? 'store-locator'
                : currentPage === 'my-account'
                ? 'my-account'
                : currentPage === 'complaints'
                ? 'complaints'
                : currentPage === 'warranty-policy' || currentPage === 'return-policy'
                ? 'warranty-policy'
                : currentPage === 'faq' || currentPage === 'terms' || currentPage === 'privacy-policy'
                ? 'faq'
                : 'about'
            }
          />
        )}

        {/* Fallback for other routes */}
        {!['home', 'shop', 'pc-builder', 'fps-estimator', 'community-builds', 'services', 'admin', 'about', 'faq', 'warranty-policy', 'return-policy', 'terms', 'privacy-policy', 'complaints', 'my-account', 'store-locator'].includes(currentPage) && (
          <ShopCatalogView />
        )}
      </main>

      {/* Footer */}
      <Footer />

      {/* Persistent Trays & Overlays */}
      <CompareTray />
      <FloatingWhatsApp />

      {/* Modals & Drawers */}
      <ProductModal product={activeProductModal} onClose={closeProductModal} />
      <CartDrawer onOpenCheckout={() => setIsCheckoutOpen(true)} />
      <CheckoutModal isOpen={isCheckoutOpen} onClose={() => setIsCheckoutOpen(false)} />
      <CompareModal />
      <TradeInEstimatorModal />
      <VideoInspectionModal />
      <AuthModal />

      {/* Floating Toast Notification System */}
      <ToastNotificationView toast={toast} onClose={clearToast} />
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <ParticleProvider>
        <AppContent />
      </ParticleProvider>
    </AppProvider>
  );
}
