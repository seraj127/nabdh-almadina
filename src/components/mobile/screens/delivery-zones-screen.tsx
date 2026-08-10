'use client';

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguageStore } from '@/stores/language-store';
import { useCartStore } from '@/stores/cart-store';
import { useMobileStore } from '../lib/mobile-store';
import { DELIVERY_REGIONS, DELIVERY_PRICE_RANGE } from '../lib/delivery-zones';
import type { DeliveryRegion, DeliveryZone } from '../lib/delivery-zones';
import {
  ArrowLeft,
  MapPin,
  Search,
  X,
  Truck,
  Clock,
  ChevronRight,
  ChevronLeft,
  Check,
  Info,
} from 'lucide-react';

// ─── Animation Variants ──────────────────────────────────────────────
const slideVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 300 : -300,
    opacity: 0,
  }),
  center: {
    x: 0,
    opacity: 1,
  },
  exit: (direction: number) => ({
    x: direction > 0 ? -300 : 300,
    opacity: 0,
  }),
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.04, duration: 0.3 },
  }),
};

// ─── DeliveryZonesScreen ─────────────────────────────────────────────
export function DeliveryZonesScreen() {
  const { language, direction, t } = useLanguageStore();
  const { deliveryArea, setDeliveryFee } = useCartStore();
  const { setScreen, setActiveTab } = useMobileStore();

  const [selectedRegion, setSelectedRegion] = useState<DeliveryRegion | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [animDirection, setAnimDirection] = useState(1);

  const isRtl = direction === 'rtl';

  // Find the currently selected zone (from cart store)
  const currentSelectedZone = useMemo(() => {
    if (!deliveryArea) return null;
    for (const region of DELIVERY_REGIONS) {
      const found = region.zones.find(
        (z) => z.nameAr === deliveryArea || z.nameEn === deliveryArea
      );
      if (found) return found;
    }
    return null;
  }, [deliveryArea]);

  // Filter zones by search query
  const filteredZones = useMemo(() => {
    if (!selectedRegion) return [];
    if (!searchQuery.trim()) return selectedRegion.zones;
    const q = searchQuery.trim().toLowerCase();
    return selectedRegion.zones.filter(
      (z) =>
        z.nameAr.includes(searchQuery.trim()) ||
        z.nameEn.toLowerCase().includes(q)
    );
  }, [selectedRegion, searchQuery]);

  // Get price range for a region
  const getRegionPriceRange = (region: DeliveryRegion) => {
    const prices = region.zones.map((z) => z.price);
    return {
      min: Math.min(...prices),
      max: Math.max(...prices),
    };
  };

  // Handle region selection
  const handleSelectRegion = (region: DeliveryRegion) => {
    setAnimDirection(1);
    setSelectedRegion(region);
    setSearchQuery('');
  };

  // Handle back to regions
  const handleBackToRegions = () => {
    setAnimDirection(-1);
    setSelectedRegion(null);
    setSearchQuery('');
  };

  // Handle zone selection
  const handleSelectZone = (zone: DeliveryZone) => {
    const zoneName = language === 'ar' ? zone.nameAr : zone.nameEn;
    const duration = language === 'ar' ? zone.durationAr : zone.durationEn;
    setDeliveryFee(zone.price, zoneName);
    // Navigate back to main screen and switch to cart tab
    setScreen('main');
    setActiveTab('cart');
  };

  // Handle back button
  const handleBack = () => {
    if (selectedRegion) {
      handleBackToRegions();
    } else {
      setScreen('main');
      setActiveTab('cart');
    }
  };

  // Check if a zone is currently selected
  const isZoneSelected = (zone: DeliveryZone) => {
    return deliveryArea === zone.nameAr || deliveryArea === zone.nameEn;
  };

  return (
    <div
      dir={direction}
      className="flex flex-col min-h-screen"
      style={{
        background: 'linear-gradient(180deg, #003545 0%, #004B63 40%, #00897B 100%)',
      }}
    >
      {/* ─── Header ─── */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative px-4 pt-12 pb-6"
      >
        {/* Back button */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleBack}
          className="absolute top-12 z-10 w-10 h-10 rounded-full flex items-center justify-center"
          style={{
            [isRtl ? 'right' : 'left']: 16,
            background: 'rgba(255,255,255,0.15)',
            backdropFilter: 'blur(12px)',
          }}
        >
          {isRtl ? (
            <ChevronRight className="w-5 h-5 text-white" />
          ) : (
            <ArrowLeft className="w-5 h-5 text-white" />
          )}
        </motion.button>

        {/* Title */}
        <div className="text-center">
          <motion.h1
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-xl font-bold text-white"
          >
            {t('mobile.cart.selectDeliveryArea')}
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-sm text-white/70 mt-1"
          >
            {t('mobile.cart.deliveryFeeBasedOnArea')}
          </motion.p>
        </div>

        {/* Decorative circles */}
        <div className="absolute top-4 right-8 w-20 h-20 rounded-full opacity-10 bg-white" />
        <div className="absolute top-16 left-4 w-12 h-12 rounded-full opacity-5 bg-white" />
      </motion.div>

      {/* ─── Content ─── */}
      <div className="flex-1 bg-white dark:bg-[#0B1120] rounded-t-3xl overflow-hidden">
        <AnimatePresence mode="wait" custom={animDirection}>
          {!selectedRegion ? (
            // ─── Region Selection View ───
            <motion.div
              key="regions"
              custom={animDirection}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.3, ease: 'easeInOut' as const }}
              className="p-4 pb-24"
            >
              {/* Info bar */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 }}
                className="flex items-center gap-2 px-3 py-2.5 rounded-xl mb-4"
                style={{
                  background:
                    'linear-gradient(135deg, rgba(0,75,99,0.08), rgba(0,137,123,0.08))',
                }}
              >
                <Info className="w-4 h-4 text-[#00897B] shrink-0" />
                <p className="text-xs text-[#004B63] dark:text-[#00897B]">
                  {t('mobile.cart.deliveryZoneInfo')}
                </p>
              </motion.div>

              {/* Price range badge */}
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 }}
                className="flex items-center justify-center gap-2 mb-4"
              >
                <Truck className="w-4 h-4 text-[#FF6F61]" />
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {DELIVERY_PRICE_RANGE.min} - {DELIVERY_PRICE_RANGE.max} LYD
                </span>
              </motion.div>

              {/* Region Cards */}
              <div className="space-y-3">
                {DELIVERY_REGIONS.map((region, index) => {
                  const priceRange = getRegionPriceRange(region);
                  const isSelected = deliveryArea
                    ? region.zones.some(
                        (z) =>
                          z.nameAr === deliveryArea ||
                          z.nameEn === deliveryArea
                      )
                    : false;

                  return (
                    <motion.button
                      key={region.id}
                      custom={index}
                      variants={itemVariants}
                      initial="hidden"
                      animate="visible"
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handleSelectRegion(region)}
                      className="w-full text-start rounded-2xl p-4 transition-all duration-200"
                      style={{
                        background: isSelected
                          ? 'linear-gradient(135deg, #004B63, #00897B)'
                          : 'linear-gradient(135deg, rgba(0,75,99,0.04), rgba(0,137,123,0.04))',
                        border: isSelected
                          ? '2px solid #00897B'
                          : '2px solid rgba(0,75,99,0.1)',
                      }}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          {/* Region icon */}
                          <div
                            className="w-11 h-11 rounded-xl flex items-center justify-center"
                            style={{
                              background: isSelected
                                ? 'rgba(255,255,255,0.2)'
                                : 'linear-gradient(135deg, #004B63, #00897B)',
                            }}
                          >
                            <MapPin
                              className={`w-5 h-5 ${
                                isSelected ? 'text-white' : 'text-white'
                              }`}
                            />
                          </div>

                          {/* Region info */}
                          <div>
                            <h3
                              className={`font-bold text-sm ${
                                isSelected
                                  ? 'text-white'
                                  : 'text-gray-800 dark:text-gray-100'
                              }`}
                            >
                              {language === 'ar'
                                ? region.nameAr
                                : region.nameEn}
                            </h3>
                            <div className="flex items-center gap-2 mt-0.5">
                              <span
                                className={`text-xs ${
                                  isSelected
                                    ? 'text-white/80'
                                    : 'text-gray-500 dark:text-gray-400'
                                }`}
                              >
                                {region.zones.length} {t('mobile.cart.areasCount')}
                              </span>
                              <span
                                className={`text-xs ${
                                  isSelected
                                    ? 'text-white/60'
                                    : 'text-gray-400 dark:text-[#6B7F96]'
                                }`}
                              >
                                •
                              </span>
                              <span
                                className={`text-xs font-semibold ${
                                  isSelected
                                    ? 'text-white/90'
                                    : 'text-[#FF6F61]'
                                }`}
                              >
                                {priceRange.min === priceRange.max
                                  ? `${priceRange.min} LYD`
                                  : `${priceRange.min}-${priceRange.max} LYD`}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Arrow / Check */}
                        {isSelected ? (
                          <div className="w-8 h-8 rounded-full bg-[#238636] flex items-center justify-center">
                            <Check className="w-4 h-4 text-white" />
                          </div>
                        ) : (
                          <div
                            className="w-8 h-8 rounded-full flex items-center justify-center"
                            style={{
                              background: 'rgba(0,75,99,0.08)',
                            }}
                          >
                            {isRtl ? (
                              <ChevronLeft className="w-4 h-4 text-[#004B63] dark:text-[#00897B]" />
                            ) : (
                              <ChevronRight className="w-4 h-4 text-[#004B63] dark:text-[#00897B]" />
                            )}
                          </div>
                        )}
                      </div>
                    </motion.button>
                  );
                })}
              </div>
            </motion.div>
          ) : (
            // ─── Zone Selection View ───
            <motion.div
              key="zones"
              custom={animDirection}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.3, ease: 'easeInOut' as const }}
              className="flex flex-col h-full"
            >
              {/* Region breadcrumb */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="px-4 pt-4 pb-2"
              >
                <button
                  onClick={handleBackToRegions}
                  className="flex items-center gap-1 text-sm text-[#004B63] dark:text-[#00897B] font-medium"
                >
                  {isRtl ? (
                    <ChevronRight className="w-4 h-4" />
                  ) : (
                    <ChevronLeft className="w-4 h-4" />
                  )}
                  <span>
                    {language === 'ar'
                      ? selectedRegion.nameAr
                      : selectedRegion.nameEn}
                  </span>
                </button>
              </motion.div>

              {/* Search bar */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="px-4 pb-3"
              >
                <div className="relative">
                  <Search
                    className={`absolute top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 ${
                      isRtl ? 'right-3' : 'left-3'
                    }`}
                  />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder={t('mobile.cart.searchArea')}
                    className={`w-full py-2.5 rounded-xl text-sm bg-gray-50 dark:bg-[#151D2E] border border-gray-200 dark:border-[#1E2A42] text-gray-800 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:border-[#00897B] focus:ring-1 focus:ring-[#00897B] transition-colors ${
                      isRtl ? 'pr-10 pl-10' : 'pl-10 pr-10'
                    }`}
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className={`absolute top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-gray-200 dark:bg-[#1E2A42] flex items-center justify-center ${
                        isRtl ? 'left-2' : 'right-2'
                      }`}
                    >
                      <X className="w-3.5 h-3.5 text-gray-500 dark:text-gray-400" />
                    </button>
                  )}
                </div>

                {/* Results count */}
                {searchQuery && (
                  <p className="text-xs text-gray-400 dark:text-[#6B7F96] mt-1.5 px-1">
                    {filteredZones.length} {t('mobile.cart.areasResultCount')}
                  </p>
                )}
              </motion.div>

              {/* Zones list */}
              <div className="flex-1 overflow-y-auto px-4 pb-24 max-h-[calc(100vh-280px)]" style={{ scrollbarWidth: 'thin' }}>
                {filteredZones.length === 0 ? (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex flex-col items-center justify-center py-12"
                  >
                    <div className="w-16 h-16 rounded-full bg-gray-100 dark:bg-[#151D2E] flex items-center justify-center mb-3">
                      <MapPin className="w-8 h-8 text-gray-300 dark:text-gray-600" />
                    </div>
                    <p className="text-sm text-gray-400 dark:text-[#6B7F96]">
                      {t('mobile.cart.noAreasFound')}
                    </p>
                  </motion.div>
                ) : (
                  <div className="space-y-2">
                    {filteredZones.map((zone, index) => {
                      const selected = isZoneSelected(zone);
                      return (
                        <motion.button
                          key={zone.id}
                          custom={index}
                          variants={itemVariants}
                          initial="hidden"
                          animate="visible"
                          whileHover={{ scale: 1.005 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => handleSelectZone(zone)}
                          className="w-full text-start rounded-xl p-3 transition-all duration-200"
                          style={{
                            background: selected
                              ? 'linear-gradient(135deg, #004B63, #00897B)'
                              : index % 2 === 0
                              ? 'rgba(0,75,99,0.03)'
                              : 'transparent',
                            border: selected
                              ? '2px solid #00897B'
                              : '2px solid transparent',
                          }}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3 flex-1 min-w-0">
                              {/* Zone icon */}
                              <div
                                className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${
                                  selected
                                    ? 'bg-white/20'
                                    : 'bg-gray-100 dark:bg-[#151D2E]'
                                }`}
                              >
                                <MapPin
                                  className={`w-4 h-4 ${
                                    selected
                                      ? 'text-white'
                                      : 'text-[#00897B]'
                                  }`}
                                />
                              </div>

                              {/* Zone name + duration */}
                              <div className="min-w-0">
                                <h4
                                  className={`text-sm font-semibold truncate ${
                                    selected
                                      ? 'text-white'
                                      : 'text-gray-800 dark:text-gray-100'
                                  }`}
                                >
                                  {language === 'ar'
                                    ? zone.nameAr
                                    : zone.nameEn}
                                </h4>
                                <div className="flex items-center gap-1 mt-0.5">
                                  <Clock
                                    className={`w-3 h-3 ${
                                      selected
                                        ? 'text-white/60'
                                        : 'text-gray-400 dark:text-[#6B7F96]'
                                    }`}
                                  />
                                  <span
                                    className={`text-xs ${
                                      selected
                                        ? 'text-white/70'
                                        : 'text-gray-400 dark:text-[#6B7F96]'
                                    }`}
                                  >
                                    {language === 'ar'
                                      ? zone.durationAr
                                      : zone.durationEn}
                                  </span>
                                </div>
                              </div>
                            </div>

                            {/* Price badge + check */}
                            <div className="flex items-center gap-2 shrink-0">
                              <span
                                className={`text-xs font-bold px-2.5 py-1 rounded-lg ${
                                  selected
                                    ? 'bg-white/20 text-white'
                                    : 'bg-[#FF6F61]/10 text-[#FF6F61]'
                                }`}
                              >
                                {zone.price} LYD
                              </span>
                              {selected && (
                                <motion.div
                                  initial={{ scale: 0 }}
                                  animate={{ scale: 1 }}
                                  transition={{
                                    type: 'spring' as const,
                                    stiffness: 500,
                                    damping: 30,
                                  }}
                                  className="w-6 h-6 rounded-full bg-[#238636] flex items-center justify-center"
                                >
                                  <Check className="w-3.5 h-3.5 text-white" />
                                </motion.div>
                              )}
                            </div>
                          </div>
                        </motion.button>
                      );
                    })}
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ─── Bottom Info Bar ─── */}
      {currentSelectedZone && (
        <motion.div
          initial={{ y: 100 }}
          animate={{ y: 0 }}
          exit={{ y: 100 }}
          transition={{ type: 'spring' as const, stiffness: 400, damping: 30 }}
          className="fixed bottom-0 inset-x-0 z-50"
        >
          <div
            className="mx-3 mb-3 rounded-2xl p-3 shadow-lg"
            style={{
              background: 'linear-gradient(135deg, #004B63, #00897B)',
            }}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 min-w-0 flex-1">
                <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center shrink-0">
                  <Truck className="w-4 h-4 text-white" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs text-white/70 truncate">
                    {language === 'ar' ? 'التوصيل إلى' : 'Delivering to'}
                  </p>
                  <p className="text-sm text-white font-bold truncate">
                    {deliveryArea}
                  </p>
                </div>
              </div>
              <div className="text-end shrink-0">
                <p className="text-xs text-white/70">
                  {language === 'ar'
                    ? currentSelectedZone.durationAr
                    : currentSelectedZone.durationEn}
                </p>
                <p className="text-sm text-white font-bold">
                  {currentSelectedZone.price} LYD
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}
