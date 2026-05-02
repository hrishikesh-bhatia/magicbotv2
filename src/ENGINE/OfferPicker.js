// src/ENGINE/OfferPicker.js

/**
 * Selects the most compelling offer for the current message.
 * Prioritizes merchant-specific active offers over category-wide defaults[cite: 1, 20].
 */
export const pickBestOffer = (merchant, category) => {

  // 1. Resolve Active Merchant Offers
  const merchantOffers = merchant?.offers || [];
  const activeMerchantOffers = merchantOffers.filter(o => o.status === "active");

  if (activeMerchantOffers.length > 0) {
    // 🔥 STRATEGY: Prefer entry-level/low-friction offers to drive higher conversion
    return sortOffersByPrice(activeMerchantOffers)[0];
  }

  // 2. Resolve Category Fallback Catalog[cite: 1, 20]
  // Used when the merchant has no active offers or needs a more competitive hook[cite: 3].
  const catalogOffers = category?.offer_catalog || [];
  if (catalogOffers.length > 0) {
    return sortOffersByPrice(catalogOffers)[0];
  }

  // 3. Absolute Fallback (Safe default if data is missing)[cite: 1]
  return null;
};

/**
 * 🔧 Helper: Sorts a list of offers by price (ascending)
 * Focuses on extracting the numerical value from strings like "Cleaning @ ₹299"[cite: 20].
 */
const sortOffersByPrice = (offers) => {
  return [...offers].sort((a, b) => {
    const priceA = extractPrice(a.title || "");
    const priceB = extractPrice(b.title || "");
    return priceA - priceB;
  });
};

/**
 * 🔧 Helper: Extract numerical price from Indian currency strings
 * Handles: "₹299", "₹ 299", "Rs. 299", "at 299"[cite: 20].
 */
const extractPrice = (text) => {
  if (!text) return Infinity;

  // Regex matches various Indian currency notations[cite: 20]
  const match = text.match(/(?:₹|Rs\.?|at)\s?(\d+)/i);
  return match ? parseInt(match[1], 10) : Infinity;
};