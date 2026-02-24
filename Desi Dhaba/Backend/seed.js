/**
 * Seed Script – Desi Dhaba
 * Run: node seed.js
 *
 * Creates:
 *  • 1 default Admin user  (admin@dessidhaba.com / Admin@123)
 *  • 1 default Restaurant
 *  • 27 food items across 6 categories
 */

const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const dotenv = require("dotenv");
dotenv.config();

const connectDB = require("./config/db");
const User = require("./models/User");
const Restaurant = require("./models/Restaurant");
const FoodItem = require("./models/FoodItem");

const foodItems = [
  // ─── Pizza ───────────────────────────────────────────────────────────────
  {
    name: "Classic Margherita Pizza",
    description: "Fresh mozzarella, tomato sauce & basil on a crispy hand-tossed base",
    price: 299,
    category: "Pizza",
    rating: 4.5,
  },
  {
    name: "Pepperoni Pizza",
    description: "Loaded with premium pepperoni slices and mozzarella cheese",
    price: 449,
    category: "Pizza",
    rating: 4.7,
  },
  {
    name: "BBQ Chicken Pizza",
    description: "Smoky BBQ sauce, grilled chicken, onions & bell peppers",
    price: 499,
    category: "Pizza",
    rating: 4.6,
  },
  {
    name: "Paneer Tikka Pizza",
    description: "Tandoori-spiced paneer cubes with onion, capsicum & cheese",
    price: 389,
    category: "Pizza",
    rating: 4.4,
  },
  {
    name: "Veggie Supreme Pizza",
    description: "Garden-fresh veggies piled on zesty tomato sauce",
    price: 359,
    category: "Pizza",
    rating: 4.3,
  },

  // ─── Burgers ─────────────────────────────────────────────────────────────
  {
    name: "Classic Beef Burger",
    description: "Juicy beef patty, lettuce, tomato, pickles & special sauce",
    price: 199,
    category: "Burgers",
    rating: 4.5,
  },
  {
    name: "Crispy Chicken Burger",
    description: "Golden fried chicken fillet with coleslaw & mayo",
    price: 229,
    category: "Burgers",
    rating: 4.6,
  },
  {
    name: "Double Smash Burger",
    description: "Two smashed patties, double cheese, caramelised onions",
    price: 329,
    category: "Burgers",
    rating: 4.8,
  },
  {
    name: "Veggie Burger",
    description: "Crispy veg patty with avocado, lettuce & chipotle sauce",
    price: 179,
    category: "Burgers",
    rating: 4.2,
  },
  {
    name: "Paneer Burger",
    description: "Spiced paneer tikka patty with mint chutney & onion rings",
    price: 209,
    category: "Burgers",
    rating: 4.3,
  },

  // ─── Fast Food ───────────────────────────────────────────────────────────
  {
    name: "Masala French Fries",
    description: "Crispy fries tossed with chaat masala & green chutney dip",
    price: 99,
    category: "Fast Food",
    rating: 4.4,
  },
  {
    name: "Chicken Nuggets (6 pc)",
    description: "Golden breaded chicken nuggets with dipping sauce",
    price: 199,
    category: "Fast Food",
    rating: 4.5,
  },
  {
    name: "Loaded Nachos",
    description: "Tortilla chips with salsa, cheese sauce, jalapeños & sour cream",
    price: 249,
    category: "Fast Food",
    rating: 4.3,
  },
  {
    name: "Classic Hot Dog",
    description: "All-beef frankfurter in a toasted bun with mustard & ketchup",
    price: 149,
    category: "Fast Food",
    rating: 4.1,
  },
  {
    name: "Crispy Onion Rings",
    description: "Beer-battered onion rings, perfectly crunchy inside out",
    price: 129,
    category: "Fast Food",
    rating: 4.2,
  },

  // ─── Bakery ──────────────────────────────────────────────────────────────
  {
    name: "Chocolate Truffle Cake",
    description: "Rich dark chocolate ganache layered cake – pure indulgence",
    price: 399,
    category: "Bakery",
    rating: 4.8,
  },
  {
    name: "Blueberry Muffin",
    description: "Soft, fluffy muffin bursting with fresh blueberries",
    price: 89,
    category: "Bakery",
    rating: 4.5,
  },
  {
    name: "Butter Croissant",
    description: "Flaky, buttery French croissant baked fresh every morning",
    price: 79,
    category: "Bakery",
    rating: 4.4,
  },
  {
    name: "Cinnamon Roll",
    description: "Warm swirled roll with cinnamon sugar & cream cheese glaze",
    price: 119,
    category: "Bakery",
    rating: 4.6,
  },
  {
    name: "Red Velvet Cake",
    description: "Velvety red sponge with luscious cream cheese frosting",
    price: 349,
    category: "Bakery",
    rating: 4.7,
  },

  // ─── Indian ──────────────────────────────────────────────────────────────
  {
    name: "Butter Chicken",
    description: "Tender chicken in a creamy tomato-butter sauce – The classic",
    price: 349,
    category: "Indian",
    rating: 4.8,
  },
  {
    name: "Dal Makhani",
    description: "Slow-cooked black lentils simmered overnight in butter & cream",
    price: 249,
    category: "Indian",
    rating: 4.6,
  },
  {
    name: "Paneer Butter Masala",
    description: "Cottage cheese cubes in a silky, aromatic makhani gravy",
    price: 299,
    category: "Indian",
    rating: 4.7,
  },
  {
    name: "Chicken Biryani",
    description: "Fragrant basmati rice slow-cooked with spiced chicken – Dum style",
    price: 399,
    category: "Indian",
    rating: 4.9,
  },

  // ─── Drinks ──────────────────────────────────────────────────────────────
  {
    name: "Mango Lassi",
    description: "Chilled Alphonso mango blended with thick yoghurt & cardamom",
    price: 119,
    category: "Drinks",
    rating: 4.6,
  },
  {
    name: "Cold Coffee",
    description: "Creamy blended iced coffee with a hint of caramel",
    price: 129,
    category: "Drinks",
    rating: 4.4,
  },
  {
    name: "Fresh Lime Soda",
    description: "Zesty lime, rock salt and chilled soda – refreshingly simple",
    price: 79,
    category: "Drinks",
    rating: 4.3,
  },
];

const seed = async () => {
  await connectDB();

  console.log("🌱 Starting Desi Dhaba seed...\n");

  // ── Admin User ────────────────────────────────────────────────────────────
  let admin = await User.findOne({ email: "admin@desidhaba.com" });
  if (!admin) {
    const salt = await bcrypt.genSalt(10);
    const hashed = await bcrypt.hash("Admin@123", salt);
    admin = await User.create({
      name: "Admin",
      email: "admin@desidhaba.com",
      password: hashed,
      role: "admin",
    });
    console.log("✅ Admin user created  →  admin@desidhaba.com  /  Admin@123");
  } else {
    console.log("ℹ️  Admin user already exists – skipping");
  }

  // ── Default Restaurant ────────────────────────────────────────────────────
  let restaurant = await Restaurant.findOne({ name: "Desi Dhaba Kitchen" });
  if (!restaurant) {
    restaurant = await Restaurant.create({
      name: "Desi Dhaba Kitchen",
      description: "Your one-stop destination for the best global street food – delivered hot!",
      address: "123 Food Street, Flavour City",
      isActive: true,
    });
    console.log("✅ Default restaurant created");
  } else {
    console.log("ℹ️  Default restaurant already exists – skipping");
  }

  // ── Food Items ────────────────────────────────────────────────────────────
  const existing = await FoodItem.countDocuments({});
  if (existing === 0) {
    const docs = foodItems.map((f) => ({ ...f, restaurantId: restaurant._id, isAvailable: true }));
    await FoodItem.insertMany(docs);
    console.log(`✅ ${docs.length} food items seeded across 6 categories`);
  } else {
    console.log(`ℹ️  ${existing} food items already exist – skipping`);
  }

  console.log("\n🎉 Seed complete!");
  console.log("───────────────────────────────");
  console.log("Admin login → admin@desidhaba.com / Admin@123");
  console.log("───────────────────────────────\n");

  await mongoose.connection.close();
  process.exit(0);
};

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
