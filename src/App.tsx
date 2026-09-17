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

const AppContent: React.FC = () => {
  const { currentPage, activeProductModal, closeProductModal, toast } = useApp();
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);

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
        {!['home', 'shop', 'pc-builder', 'fps-estimator', 'community-builds', 'services', 'about', 'faq', 'warranty-policy', 'return-policy', 'terms', 'privacy-policy', 'complaints', 'my-account', 'store-locator'].includes(currentPage) && (
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

      {/* Floating Toast Notification */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#16171B] border border-[#25D366] text-white px-4 py-3 rounded-xl shadow-[0_0_25px_rgba(37,211,102,0.3)] flex items-center gap-2.5 text-xs font-bold animate-in fade-in slide-in-from-bottom-3">
          <span className="w-2 h-2 rounded-full bg-[#25D366]" />
          <span>{toast}</span>
        </div>
      )}
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
