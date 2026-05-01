// src/ENGINE/OfferPicker.js

export const pickBestOffer = (merchant, category) => {

  // ✅ 1. Merchant active offers
  if (merchant?.offers?.length) {

    const activeOffers = merchant.offers.filter(
      o => o.status === "active"
    );

    if (activeOffers.length > 0) {

      // 🔥 Prefer cheapest / entry-level offer
      activeOffers.sort((a, b) => {
        const priceA = extractPrice(a.title);
        const priceB = extractPrice(b.title);
        return priceA - priceB;
      });

      return activeOffers[0];
    }
  }

  // ✅ 2. Category fallback (pick best known converting offer)
  if (category?.offer_catalog?.length) {

    const sorted = [...category.offer_catalog].sort((a, b) => {
      const priceA = extractPrice(a.title);
      const priceB = extractPrice(b.title);
      return priceA - priceB;
    });

    return sorted[0];
  }

  // ❌ 3. No offer found
  return null;
};


// 🔧 helper: extract ₹ price from string
const extractPrice = (text) => {
  if (!text) return Infinity;

  const match = text.match(/₹\s?(\d+)/);
  return match ? parseInt(match[1], 10) : Infinity;
};