import { useEffect, useState } from "react";
import API from "../utils/api";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";
import { FiShoppingCart, FiStar, FiZap } from "react-icons/fi";
import {
  MdOutlineLocalFireDepartment,
  MdOutlineLocalPizza,
  MdOutlineCake,
  MdOutlineLocalDrink,
  MdOutlineRiceBowl,
  MdOutlineFastfood,
  MdOutlineRestaurant,
} from "react-icons/md";

/* -----------------------------------------------
   CATEGORY META  (icon component instead of emoji)
----------------------------------------------- */
const CATEGORY_META = {
  Pizza:       { Icon: MdOutlineLocalPizza,    color: "bg-red-100 text-red-700",    iconColor: "#b91c1c" },
  Burgers:     { Icon: MdOutlineFastfood,       color: "bg-yellow-100 text-yellow-700", iconColor: "#b45309" },
  "Fast Food": { Icon: MdOutlineFastfood,       color: "bg-orange-100 text-orange-700", iconColor: "#c2410c" },
  Bakery:      { Icon: MdOutlineCake,           color: "bg-pink-100 text-pink-700",  iconColor: "#be185d" },
  Indian:      { Icon: MdOutlineRiceBowl,       color: "bg-amber-100 text-amber-700", iconColor: "#b45309" },
  Drinks:      { Icon: MdOutlineLocalDrink,     color: "bg-blue-100 text-blue-700",  iconColor: "#1d4ed8" },
};
const DEFAULT_META = { Icon: MdOutlineRestaurant, color: "bg-gray-100 text-gray-700", iconColor: "#6b7280" };

/* -----------------------------------------------
   CRAVE COMPASS MOODS  (icon component per mood)
----------------------------------------------- */
const MOODS = [
  {
    id: "spicy",
    label: "Feelin' Spicy",
    Icon: MdOutlineLocalFireDepartment,
    categories: ["Indian", "Fast Food"],
    from: "#ef4444",
    to: "#f97316",
    desc: "Bold & fiery flavours",
  },
  {
    id: "cheesy",
    label: "Cheesy Vibes",
    Icon: MdOutlineLocalPizza,
    categories: ["Pizza", "Burgers"],
    from: "#f59e0b",
    to: "#fbbf24",
    desc: "Melted gooey goodness",
  },
  {
    id: "sweet",
    label: "Sweet Tooth",
    Icon: MdOutlineCake,
    categories: ["Bakery"],
    from: "#ec4899",
    to: "#f43f5e",
    desc: "Sugar rush incoming",
  },
  {
    id: "thirsty",
    label: "Quench It",
    Icon: MdOutlineLocalDrink,
    categories: ["Drinks"],
    from: "#3b82f6",
    to: "#06b6d4",
    desc: "Cool & refreshing",
  },
  {
    id: "comfort",
    label: "Desi Comfort",
    Icon: MdOutlineRiceBowl,
    categories: ["Indian"],
    from: "#d97706",
    to: "#f59e0b",
    desc: "Warm soul food",
  },
  {
    id: "street",
    label: "Street Bites",
    Icon: MdOutlineFastfood,
    categories: ["Burgers", "Fast Food"],
    from: "#10b981",
    to: "#34d399",
    desc: "Quick street-style eats",
  },
];

/* -----------------------------------------------
   STAR RATING
----------------------------------------------- */
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

/* -----------------------------------------------
   FOOD CARD
----------------------------------------------- */
const FoodCard = ({ food, onAddToCart, addingId }) => {
  const meta = CATEGORY_META[food.category] || DEFAULT_META;
  const { Icon: CatIcon, iconColor } = meta;
  return (
    <div className="bg-white rounded-2xl shadow-md hover:shadow-xl transition-shadow duration-300 overflow-hidden flex flex-col group">
      <div className="h-44 bg-gradient-to-br from-orange-50 to-amber-50 flex items-center justify-center overflow-hidden relative">
        {food.image ? (
          <img
            src={food.image}
            alt={food.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <CatIcon
            size={72}
            color={iconColor}
            className="opacity-60 group-hover:scale-110 transition-transform duration-300"
          />
        )}
        <span className={`absolute top-3 left-3 text-xs font-semibold px-2.5 py-1 rounded-full ${meta.color}`}>
          {food.category}
        </span>
      </div>
      <div className="p-4 flex flex-col flex-1">
        <h3 className="font-bold text-gray-800 text-base mb-1 leading-tight">{food.name}</h3>
        {food.description && (
          <p className="text-gray-500 text-xs mb-2 line-clamp-2 leading-relaxed">{food.description}</p>
        )}
        <StarRating rating={food.rating || 4.0} />
        <div className="flex items-center justify-between mt-auto pt-3">
          <span className="text-xl font-extrabold text-orange-600">&#8377;{food.price}</span>
          <button
            onClick={() => onAddToCart(food._id)}
            disabled={addingId === food._id}
            className="flex items-center space-x-1.5 bg-orange-600 hover:bg-orange-700 text-white text-sm font-medium px-3 py-2 rounded-xl transition disabled:opacity-60"
          >
            <FiShoppingCart size={14} />
            <span>{addingId === food._id ? "Adding..." : "Add"}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

/* -----------------------------------------------
   CRAVE COMPASS COMPONENT
----------------------------------------------- */
const CraveCompass = ({ activeMood, onMoodSelect }) => {
  return (
    <section
      className="relative rounded-3xl overflow-hidden mb-8"
      style={{ background: "linear-gradient(135deg, #0f0c29 0%, #302b63 50%, #24243e 100%)" }}
    >
      <div
        className="absolute -top-16 -left-16 w-64 h-64 rounded-full opacity-20 blur-3xl pointer-events-none"
        style={{ background: "radial-gradient(circle, #f97316, transparent)" }}
      />
      <div
        className="absolute -bottom-16 -right-16 w-64 h-64 rounded-full opacity-20 blur-3xl pointer-events-none"
        style={{ background: "radial-gradient(circle, #ec4899, transparent)" }}
      />

      <div className="relative z-10 px-6 py-8 md:px-10">
        {/* Header */}
        <div className="flex items-center space-x-3 mb-2">
          <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20">
            <FiZap size={18} className="text-yellow-300" />
          </div>
          <div>
            <h2 className="text-white text-xl font-extrabold tracking-tight">Crave Compass</h2>
            <p className="text-white/50 text-xs font-medium">{"What's your vibe right now?"}</p>
          </div>
          {activeMood && (
            <button
              onClick={() => onMoodSelect(null)}
              className="ml-auto text-xs text-white/40 hover:text-white/80 border border-white/20 hover:border-white/40 px-3 py-1 rounded-full transition"
            >
              Clear
            </button>
          )}
        </div>

        {/* Mood Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mt-5">
          {MOODS.map((mood) => {
            const isActive = activeMood?.id === mood.id;
            const MoodIcon = mood.Icon;
            return (
              <button
                key={mood.id}
                onClick={() => onMoodSelect(mood)}
                className="group relative rounded-2xl p-4 text-left focus:outline-none"
                style={{
                  background: isActive
                    ? `linear-gradient(135deg, ${mood.from}, ${mood.to})`
                    : "rgba(255,255,255,0.06)",
                  border: isActive
                    ? `2px solid ${mood.from}`
                    : "2px solid rgba(255,255,255,0.12)",
                  boxShadow: isActive ? `0 0 28px ${mood.from}66` : "none",
                  transform: isActive ? "scale(1.05)" : "scale(1)",
                  transition: "all 0.25s ease",
                }}
                onMouseEnter={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.background = "rgba(255,255,255,0.12)";
                    e.currentTarget.style.border = `2px solid ${mood.from}90`;
                    e.currentTarget.style.transform = "scale(1.03)";
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.background = "rgba(255,255,255,0.06)";
                    e.currentTarget.style.border = "2px solid rgba(255,255,255,0.12)";
                    e.currentTarget.style.transform = "scale(1)";
                  }
                }}
              >
                {isActive && (
                  <span className="absolute top-2.5 right-2.5 w-2.5 h-2.5 rounded-full bg-white animate-ping opacity-60" />
                )}
                {/* Icon instead of emoji */}
                <div className="mb-2 transition-transform duration-200 group-hover:scale-125">
                  <MoodIcon
                    size={32}
                    color={isActive ? "#ffffff" : mood.from}
                    style={{ filter: isActive ? "none" : `drop-shadow(0 0 6px ${mood.from}88)` }}
                  />
                </div>
                <p className={`text-xs font-bold leading-tight mb-0.5 ${isActive ? "text-white" : "text-white/80"}`}>
                  {mood.label}
                </p>
                <p className={`text-xs leading-tight ${isActive ? "text-white/80" : "text-white/40"}`}>
                  {mood.desc}
                </p>
              </button>
            );
          })}
        </div>

        {/* Active mood tag */}
        {activeMood && (
          <div
            className="mt-4 inline-flex items-center space-x-2 rounded-full px-4 py-1.5"
            style={{
              background: `linear-gradient(90deg, ${activeMood.from}33, ${activeMood.to}33)`,
              border: `1px solid ${activeMood.from}66`,
            }}
          >
            <activeMood.Icon size={14} color={activeMood.from} />
            <span className="text-white/90 text-xs font-semibold">
              Showing: {activeMood.categories.join(" / ")}
            </span>
          </div>
        )}
      </div>
    </section>
  );
};

/* -----------------------------------------------
   HOME PAGE
----------------------------------------------- */
const Home = () => {
  const { user } = useAuth();
  const { incrementItem } = useCart();
  const [foods, setFoods] = useState([]);
  const [categories, setCategories] = useState([]);
  const [activeCategory, setActiveCategory] = useState("All");
  const [activeMood, setActiveMood] = useState(null);
  const [loading, setLoading] = useState(true);
  const [addingId, setAddingId] = useState(null);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const { data } = await API.get("/foods");
        setFoods(data);
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
      await incrementItem(foodId);
      toast.success("Added to cart!");
    } catch {
      toast.error("Failed to add to cart");
    } finally {
      setAddingId(null);
    }
  };

  const handleMoodSelect = (mood) => {
    if (!mood || activeMood?.id === mood.id) {
      setActiveMood(null);
    } else {
      setActiveMood(mood);
      setActiveCategory("All");
    }
  };

  const handleCategorySelect = (cat) => {
    setActiveCategory(cat);
    setActiveMood(null);
  };

  const displayFoods = activeMood
    ? foods.filter((f) => activeMood.categories.includes(f.category))
    : activeCategory === "All"
    ? foods
    : foods.filter((f) => f.category === activeCategory);

  const grouped =
    !activeMood && activeCategory === "All"
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
        <p className="text-gray-400 text-sm">Loading menu...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
      {/* Hero */}
      <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-orange-500 via-red-500 to-pink-500 py-12 px-8 md:px-14 mt-6 mb-8 text-white shadow-xl">
        <div className="relative z-10">
          <p className="text-sm font-semibold uppercase tracking-widest opacity-80 mb-2">
            Fast &middot; Fresh &middot; Delicious
          </p>
          <h1 className="text-4xl md:text-5xl font-extrabold leading-tight mb-3">
            Craving Something<br />
            <span className="text-yellow-300">Delicious?</span>
          </h1>
          <p className="text-base md:text-lg opacity-90 max-w-xl">
            Explore our full menu &mdash; from crispy street bites to rich Indian curries.
            Order in minutes, delivered to your door!
          </p>
        </div>
        <div className="absolute -right-8 -top-8 w-48 h-48 rounded-full bg-white opacity-10" />
        <div className="absolute right-24 -bottom-12 w-64 h-64 rounded-full bg-white opacity-10" />
      </div>

      {/* Crave Compass */}
      <CraveCompass activeMood={activeMood} onMoodSelect={handleMoodSelect} />

      {/* Category Tabs */}
      {!activeMood && (
        <div className="flex items-center space-x-2 overflow-x-auto pb-2 mb-8 scrollbar-hide">
          {["All", ...categories].map((cat) => {
            const meta = CATEGORY_META[cat] || DEFAULT_META;
            const CatIcon = meta.Icon;
            const isActive = activeCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => handleCategorySelect(cat)}
                className={`flex items-center space-x-1.5 whitespace-nowrap px-4 py-2 rounded-full text-sm font-semibold border-2 transition-all duration-200 ${
                  isActive
                    ? "bg-orange-600 border-orange-600 text-white shadow-md scale-105"
                    : "bg-white border-gray-200 text-gray-600 hover:border-orange-300 hover:text-orange-600"
                }`}
              >
                {cat === "All" ? (
                  <MdOutlineRestaurant size={16} />
                ) : (
                  <CatIcon size={16} color={isActive ? "#ffffff" : meta.iconColor} />
                )}
                <span>{cat}</span>
              </button>
            );
          })}
        </div>
      )}

      {/* Food Grid */}
      {displayFoods.length === 0 ? (
        <p className="text-center text-gray-400 py-16 text-lg">No items found.</p>
      ) : grouped ? (
        Object.entries(grouped).map(([cat, items]) => {
          const meta = CATEGORY_META[cat] || DEFAULT_META;
          const SectionIcon = meta.Icon;
          return (
            <section key={cat} className="mb-12">
              <div className="flex items-center space-x-3 mb-5">
                <SectionIcon size={32} color={meta.iconColor} />
                <h2 className="text-2xl font-extrabold text-gray-800">{cat}</h2>
                <span className="text-sm text-gray-400 font-medium">({items.length} items)</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                {items.map((food) => (
                  <FoodCard key={food._id} food={food} onAddToCart={handleAddToCart} addingId={addingId} />
                ))}
              </div>
            </section>
          );
        })
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {displayFoods.map((food) => (
            <FoodCard key={food._id} food={food} onAddToCart={handleAddToCart} addingId={addingId} />
          ))}
        </div>
      )}
    </div>
  );
};

export default Home;