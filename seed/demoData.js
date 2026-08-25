// Demo data ONLY — categories, sample products, one admin user, sample delivery zones.
// Real prices, phone numbers, and business details must be set via the Admin Panel.
// Image URLs below are placeholder/sample images (Unsplash) — replace with real restaurant photos.
// This script is safe to re-run: it clears and re-seeds the collections it touches.

module.exports = {
  categories: [
    { name: "Sweets", slug: "sweets", icon: "🍬", sortOrder: 1 },
    { name: "Breakfast", slug: "breakfast", icon: "🥘", sortOrder: 2 },
    { name: "Snacks", slug: "snacks", icon: "🥟", sortOrder: 3 },
    { name: "Main Course", slug: "main-course", icon: "🍲", sortOrder: 4 },
    { name: "Breads", slug: "breads", icon: "🫓", sortOrder: 5 },
    { name: "Rice", slug: "rice", icon: "🍚", sortOrder: 6 },
    { name: "Desserts", slug: "desserts", icon: "🍨", sortOrder: 7 },
    { name: "Beverages", slug: "beverages", icon: "🥤", sortOrder: 8 },
  ],

  // Demo products with sample images and indicative prices — update via Admin Panel before going live.
  products: [
    {
      name: "Motichoor Laddu",
      slug: "motichoor-laddu",
      description: "Soft, melt-in-mouth gram flour pearls soaked in cardamom-flavoured sugar syrup — a festive favourite.",
      categorySlug: "sweets",
      images: [
        "https://images.pexels.com/photos/19151511/pexels-photo-19151511.jpeg?w=800",
      ],
      variants: [
        { label: "250g", price: 180 },
        { label: "500g", price: 340 },
        { label: "1kg", price: 650 },
      ],
      isVeg: true,
      isBestseller: true,
    },
    {
      name: "Kaju Katli",
      slug: "kaju-katli",
      description: "Rich, diamond-cut cashew fudge topped with a thin layer of edible silver leaf.",
      categorySlug: "sweets",
      images: [
        "https://images.pexels.com/photos/7182054/pexels-photo-7182054.jpeg?w=800",
      ],
      variants: [
        { label: "250g", price: 320 },
        { label: "500g", price: 620 },
        { label: "1kg", price: 1200 },
      ],
      isVeg: true,
      isFeatured: true,
    },
    {
      name: "Aloo Paratha",
      slug: "aloo-paratha",
      description: "Whole wheat flatbread stuffed with spiced mashed potato, served hot with butter, curd and pickle.",
      categorySlug: "breakfast",
      images: [
        "https://images.pexels.com/photos/33428723/pexels-photo-33428723.jpeg?w=800",
      ],
      variants: [{ label: "Regular", price: 60 }],
      isVeg: true,
    },
    {
      name: "Samosa",
      slug: "samosa",
      description: "Crispy fried pastry filled with spiced potatoes and peas, served with tangy tamarind and mint chutney.",
      categorySlug: "snacks",
      images: [
        "https://images.pexels.com/photos/29037265/pexels-photo-29037265.jpeg?w=800",
      ],
      variants: [
        { label: "1 pc", price: 15 },
        { label: "6 pcs", price: 80 },
      ],
      isVeg: true,
      isBestseller: true,
    },
    {
      name: "Paneer Butter Masala",
      slug: "paneer-butter-masala",
      description: "Soft paneer cubes simmered in a rich, buttery tomato-cashew gravy.",
      categorySlug: "main-course",
      images: [
        "https://images.pexels.com/photos/20408432/pexels-photo-20408432.jpeg?w=800",
      ],
      variants: [
        { label: "Half", price: 140 },
        { label: "Full", price: 240 },
      ],
      isVeg: true,
    },
  ],

  deliveryZones: [
    {
      name: "Sahaswan Local",
      minimumOrder: 0,
      deliveryFee: 0,
      estimatedTime: "30-45 mins",
      areas: [], // empty = acts as default/fallback zone; configure real areas in Admin Panel
      isActive: true,
    },
  ],
};