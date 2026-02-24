import { useEffect, useState } from "react";
import API from "../utils/api";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";
import { FiShoppingCart, FiStar } from "react-icons/fi";

// Category emoji mapping
const CATEGORY_META = {
  Pizza: { emoji: "🍕", color: "bg-red-100 text-red-700" },
  Burgers: { emoji: "🍔", color: "bg-yellow-100 text-yellow-700" },
  "Fast Food": { emoji: "🍟", color: "bg-orange-100 text-orange-700" },
  Bakery: { emoji: "🧁", color: "bg-pink-100 text-pink-700" },
  Indian: { emoji: "🍛", color: "bg-amber-100 text-amber-700" },
  Drinks: { emoji: "🥤", color: "bg-blue-100 text-blue-700" },
};

const DEFAULT_META = { emoji: "🍽️", color: "bg-gray-100 text-gray-700" };

const StarRating = ({ rating }) => {
  const full = Math.floor(rating);
  const half = rating % 1 >= 0.5;
  return (
    <div className="flex items-center space-x-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <FiStar
          key={i}
          size={12}
          className={
            i <= full
              ? "text-yellow-400 fill-yellow-400"
              : i === full + 1 && half
              ? "text-yellow-400 fill-yellow-200"
              : "text-gray-300"
          }
        />
      ))}
      <span className="ml-1 text-xs text-gray-500 font-medium">{rating.toFixed(1)}</span>
    </div>
  );
};

const FoodCard = ({ food, onAddToCart, addingId }) => {
  const meta = CATEGORY_META[food.category] || DEFAULT_META;
  return (
    <div className="bg-white rounded-2xl shadow-md hover:shadow-xl transition-shadow duration-300 overflow-hidden flex flex-col group">
      {/* Image / Emoji area */}
      <div className="h-44 bg-gradient-to-br from-orange-50 to-amber-50 flex items-center justify-center overflow-hidden relative">
        {food.image ? (
          <img
            src={food.image}
            alt={food.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <span className="text-7xl select-none group-hover:scale-110 transition-transform duration-300">
            {meta.emoji}
          </span>
        )}
        {/* Category badge */}
        <span
          className={`absolute top-3 left-3 text-xs font-semibold px-2.5 py-1 rounded-full ${meta.color}`}
        >
          {food.category}
        </span>
      </div>

      {/* Content */}
      <div className="p-4 flex flex-col flex-1">
        <h3 className="font-bold text-gray-800 text-base mb-1 leading-tight">{food.name}</h3>
        {food.description && (
          <p className="text-gray-500 text-xs mb-2 line-clamp-2 leading-relaxed">
            {food.description}
          </p>
        )}
        <StarRating rating={food.rating || 4.0} />
        <div className="flex items-center justify-between mt-auto pt-3">
          <span className="text-xl font-extrabold text-orange-600">
            ₹{food.price}
          </span>
          <button
            onClick={() => onAddToCart(food._id)}
            disabled={addingId === food._id}
            className="flex items-center space-x-1.5 bg-orange-600 hover:bg-orange-700 text-white text-sm font-medium px-3 py-2 rounded-xl transition disabled:opacity-60"
          >
            <FiShoppingCart size={14} />
            <span>{addingId === food._id ? "Adding…" : "Add"}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

const Home = () => {
  const { user } = useAuth();
  const { addToCart } = useCart();
  const [foods, setFoods] = useState([]);
  const [categories, setCategories] = useState([]);
  const [activeCategory, setActiveCategory] = useState("All");
  const [loading, setLoading] = useState(true);
  const [addingId, setAddingId] = useState(null);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const { data } = await API.get("/foods");
        setFoods(data);
        // Derive unique sorted categories
        const cats = [...new Set(data.map((f) => f.category))].sort();
        setCategories(cats);
      } catch {
        toast.error("Could not load menu");
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, []);

  const handleAddToCart = async (foodId) => {
    if (!user) {
      toast.error("Please login to add items to cart");
      return;
    }
    setAddingId(foodId);
    try {
      await addToCart(foodId, 1);
      toast.success("Added to cart! 🛒");
    } catch {
      toast.error("Failed to add to cart");
    } finally {
      setAddingId(null);
    }
  };

  // Filter foods for display
  const displayFoods =
    activeCategory === "All" ? foods : foods.filter((f) => f.category === activeCategory);

  // Group by category when showing "All"
  const grouped =
    activeCategory === "All"
      ? categories.reduce((acc, cat) => {
          const items = foods.filter((f) => f.category === cat);
          if (items.length) acc[cat] = items;
          return acc;
        }, {})
      : null;

  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center h-64 space-y-3">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-orange-500 border-t-transparent" />
        <p className="text-gray-400 text-sm">Loading menu…</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
      {/* ── Hero ── */}
      <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-orange-500 via-red-500 to-pink-500 py-12 px-8 md:px-14 mt-6 mb-8 text-white shadow-xl">
        <div className="relative z-10">
          <p className="text-sm font-semibold uppercase tracking-widest opacity-80 mb-2">
            Fast · Fresh · Delicious
          </p>
          <h1 className="text-4xl md:text-5xl font-extrabold leading-tight mb-3">
            Craving Something<br />
            <span className="text-yellow-300">Delicious?</span> 🍛
          </h1>
          <p className="text-base md:text-lg opacity-90 max-w-xl">
            Explore our full menu — from crispy street bites to rich Indian curries. Order in
            minutes, delivered to your door!
          </p>
        </div>
        {/* decorative blobs */}
        <div className="absolute -right-8 -top-8 w-48 h-48 rounded-full bg-white opacity-10" />
        <div className="absolute right-24 -bottom-12 w-64 h-64 rounded-full bg-white opacity-10" />
      </div>

      {/* ── Category Tabs ── */}
      <div className="flex items-center space-x-2 overflow-x-auto pb-2 mb-8 scrollbar-hide">
        {["All", ...categories].map((cat) => {
          const meta = CATEGORY_META[cat] || DEFAULT_META;
          const isActive = activeCategory === cat;
          return (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`flex items-center space-x-1.5 whitespace-nowrap px-4 py-2 rounded-full text-sm font-semibold border-2 transition-all duration-200 ${
                isActive
                  ? "bg-orange-600 border-orange-600 text-white shadow-md scale-105"
                  : "bg-white border-gray-200 text-gray-600 hover:border-orange-300 hover:text-orange-600"
              }`}
            >
              <span>{cat === "All" ? "🍽️" : meta.emoji}</span>
              <span>{cat}</span>
            </button>
          );
        })}
      </div>

      {/* ── Food Grid ── */}
      {displayFoods.length === 0 ? (
        <p className="text-center text-gray-400 py-16 text-lg">No items found in this category.</p>
      ) : grouped ? (
        /* Show all categories with section headers */
        Object.entries(grouped).map(([cat, items]) => {
          const meta = CATEGORY_META[cat] || DEFAULT_META;
          return (
            <section key={cat} className="mb-12">
              <div className="flex items-center space-x-3 mb-5">
                <span className="text-3xl">{meta.emoji}</span>
                <h2 className="text-2xl font-extrabold text-gray-800">{cat}</h2>
                <span className="text-sm text-gray-400 font-medium">({items.length} items)</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                {items.map((food) => (
                  <FoodCard
                    key={food._id}
                    food={food}
                    onAddToCart={handleAddToCart}
                    addingId={addingId}
                  />
                ))}
              </div>
            </section>
          );
        })
      ) : (
        /* Filtered single category */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {displayFoods.map((food) => (
            <FoodCard
              key={food._id}
              food={food}
              onAddToCart={handleAddToCart}
              addingId={addingId}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default Home;
