require("dotenv").config();
const bcrypt = require("bcryptjs");
const connectDB = require("../config/db");
const { Category, Product, User, DeliveryZone, Restaurant } = require("../models");
const demoData = require("./demoData");

async function seed() {
  await connectDB();
  console.log("Seeding database with DEMO data (clearly marked, not real business data)...");

  // Categories
  await Category.deleteMany({});
  const createdCategories = await Category.insertMany(demoData.categories);
  const categoryBySlug = new Map(createdCategories.map((c) => [c.slug, c._id]));
  console.log(`Seeded ${createdCategories.length} categories`);

  // Products
  await Product.deleteMany({});
  const productsToInsert = demoData.products.map(({ categorySlug, ...rest }) => ({
    ...rest,
    category: categoryBySlug.get(categorySlug),
  }));
  const createdProducts = await Product.insertMany(productsToInsert);
  console.log(`Seeded ${createdProducts.length} demo products (prices set to ₹0 — update in Admin Panel)`);

  // Delivery zones
  await DeliveryZone.deleteMany({});
  const createdZones = await DeliveryZone.insertMany(demoData.deliveryZones);
  console.log(`Seeded ${createdZones.length} delivery zone(s)`);

  // Restaurant settings doc (singleton)
  const existingRestaurant = await Restaurant.findOne();
  if (!existingRestaurant) {
    await Restaurant.create({});
    console.log("Created default restaurant settings document — configure hours/phone/WhatsApp in Admin Panel");
  }

  // Admin user
  const adminPhone = process.env.SEED_ADMIN_PHONE || "9999999999";
  const adminPassword = process.env.SEED_ADMIN_PASSWORD || "ChangeThisPassword123";

  const existingAdmin = await User.findOne({ phone: adminPhone });
  if (!existingAdmin) {
    const passwordHash = await bcrypt.hash(adminPassword, 10);
    await User.create({
      name: "Admin",
      phone: adminPhone,
      passwordHash,
      role: "ADMIN",
    });
    console.log(`Created admin user — phone: ${adminPhone} (password set from SEED_ADMIN_PASSWORD env var)`);
  } else {
    console.log("Admin user already exists — skipped");
  }

  console.log("Seeding complete.");
  process.exit(0);
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
