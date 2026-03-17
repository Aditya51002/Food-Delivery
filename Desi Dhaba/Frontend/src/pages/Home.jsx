import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import API from "../utils/api";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";
import { FiShoppingCart, FiStar, FiZap, FiClock, FiTruck, FiSearch, FiMapPin } from "react-icons/fi";
import {
  MdOutlineLocalFireDepartment,
  MdOutlineLocalPizza,
  MdOutlineCake,
  MdOutlineLocalDrink,
  MdOutlineRiceBowl,
  MdOutlineFastfood,
  MdOutlineRestaurant,
} from "react-icons/md";

const CATEGORY_META = {
  Pizza:       { Icon: MdOutlineLocalPizza,    color: "bg-red-100 text-red-700",    iconColor: "#b91c1c" },
  Burgers:     { Icon: MdOutlineFastfood,       color: "bg-yellow-100 text-yellow-700", iconColor: "#b45309" },
  "Fast Food": { Icon: MdOutlineFastfood,       color: "bg-orange-100 text-orange-700", iconColor: "#c2410c" },
  Bakery:      { Icon: MdOutlineCake,           color: "bg-pink-100 text-pink-700",  iconColor: "#be185d" },
  Indian:      { Icon: MdOutlineRiceBowl,       color: "bg-amber-100 text-amber-700", iconColor: "#b45309" },
  Drinks:      { Icon: MdOutlineLocalDrink,     color: "bg-blue-100 text-blue-700",  iconColor: "#1d4ed8" },
};
const DEFAULT_META = { Icon: MdOutlineRestaurant, color: "bg-gray-100 text-gray-700", iconColor: "#6b7280" };

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

const StarRating = ({ rating, count }) => (
  <div className="flex items-center space-x-0.5">
    {[1,2,3,4,5].map((i) => (
      <FiStar key={i} size={11}
        className={i <= Math.floor(rating) ? "text-yellow-400 fill-yellow-400" : "text-gray-300"} />
    ))}
    <span className="ml-1 text-xs text-gray-500 font-medium">{rating?.toFixed(1)}</span>
    {count > 0 && <span className="text-[10px] text-gray-400 ml-0.5">({count})</span>}
  </div>
);

const RestaurantCard = ({ restaurant }) => (
  <Link
    to={`/restaurant/${restaurant._id}`}
    className="bg-white rounded-2xl shadow-sm hover:shadow-xl border border-gray-100 transition-all duration-300 overflow-hidden group block"
  >
    <div className="h-40 bg-gray-100 overflow-hidden relative">
      {restaurant.image ? (
        <img src={restaurant.image} alt={restaurant.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
      ) : (
        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-orange-100 to-amber-100">
          <MdOutlineRestaurant size={52} className="text-orange-300" />
        </div>
      )}
      {!restaurant.isOpen && (
        <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
          <span className="bg-red-500 text-white text-xs px-3 py-1 rounded-full font-semibold">Closed</span>
        </div>
      )}
    </div>
    <div className="p-4">
      <div className="flex justify-between items-start mb-1">
        <h3 className="font-bold text-gray-800 text-base leading-tight truncate pr-2">{restaurant.name}</h3>
        <div className="flex items-center space-x-0.5 flex-shrink-0">
          <FiStar size={12} className="text-yellow-400 fill-yellow-400" />
          <span className="text-xs font-semibold text-gray-700">{restaurant.rating?.toFixed(1) || "4.0"}</span>
        </div>
      </div>
      {restaurant.cuisine?.length > 0 && (
        <p className="text-xs text-gray-400 mb-2 truncate">{restaurant.cuisine.join(" • ")}</p>
      )}
      <div className="flex items-center justify-between text-xs text-gray-500">
        <div className="flex items-center space-x-1"><FiClock size={11} /><span>{restaurant.deliveryTime || "30-40 min"}</span></div>
        <div className="flex items-center space-x-1"><FiTruck size={11} /><span>{restaurant.deliveryFee > 0 ? `₹${restaurant.deliveryFee}` : "Free"}</span></div>
      </div>
    </div>
  </Link>
);

const SkeletonCard = () => (
  <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden animate-pulse">
    <div className="h-44 bg-gray-200" />
    <div className="p-4 space-y-2">
      <div className="h-3 bg-gray-200 rounded w-3/4" />
      <div className="h-3 bg-gray-200 rounded w-1/2" />
      <div className="h-8 bg-gray-200 rounded-xl mt-3" />
    </div>
  </div>
);

const FoodCard = ({ food, onAddToCart, addingId }) => {
  const meta = CATEGORY_META[food.category] || DEFAULT_META;
  const { Icon: CatIcon, iconColor } = meta;
  return (
    <div className="bg-white rounded-2xl shadow-sm hover:shadow-xl border border-gray-100 transition-all duration-300 overflow-hidden flex flex-col group">
      <div className="h-44 bg-gradient-to-br from-orange-50 to-amber-50 flex items-center justify-center overflow-hidden relative">
        {food.image ? (
          <img src={food.image} alt={food.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
        ) : (
          <CatIcon size={72} color={iconColor} className="opacity-50" />
        )}
        <div className="absolute top-2.5 left-2.5 flex flex-col space-y-1">
          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${meta.color}`}>{food.category}</span>
          {food.isBestSeller && (
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-yellow-400 text-yellow-900">🏆 Best Seller</span>
          )}
        </div>
        <div className="absolute top-2.5 right-2.5">
          <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${food.isVeg !== false ? "border-green-600" : "border-red-600"}`}>
            <div className={`w-2.5 h-2.5 rounded-full ${food.isVeg !== false ? "bg-green-600" : "bg-red-600"}`} />
          </div>
        </div>
      </div>
      <div className="p-3.5 flex flex-col flex-1">
        <h3 className="font-bold text-gray-800 text-sm mb-0.5 leading-tight line-clamp-1">{food.name}</h3>
        {food.description && (
          <p className="text-gray-400 text-[11px] mb-1.5 line-clamp-2 leading-relaxed">{food.description}</p>
        )}
        <StarRating rating={food.rating || 4.0} count={food.numRatings} />
        {food.preparationTime && (
          <div className="flex items-center space-x-1 mt-1 text-[11px] text-gray-400">
            <FiClock size={11} /><span>{food.preparationTime}</span>
          </div>
        )}
        <div className="flex items-center justify-between mt-auto pt-3">
          <div>
            <span className="text-lg font-extrabold text-orange-600">₹{food.price}</span>
            {food.originalPrice && food.originalPrice > food.price && (
              <span className="text-xs text-gray-400 line-through ml-1.5">₹{food.originalPrice}</span>
            )}
          </div>
          <button
            onClick={() => onAddToCart(food._id)}
            disabled={addingId === food._id}
            className="flex items-center space-x-1.5 bg-orange-600 hover:bg-orange-700 text-white text-xs font-semibold px-3 py-2 rounded-xl transition disabled:opacity-60 active:scale-95"
          >
            <FiShoppingCart size={13} />
            <span>{addingId === food._id ? "Adding…" : "Add"}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

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

const Home = () => {
  const { user } = useAuth();
  const { incrementItem } = useCart();
  const [searchParams] = useSearchParams();
  const [restaurants, setRestaurants] = useState([]);
  const [foods, setFoods] = useState([]);
  const [categories, setCategories] = useState([]);
  const [activeCategory, setActiveCategory] = useState("All");
  const [activeMood, setActiveMood] = useState(null);
  const [restaurantSearch, setRestaurantSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [addingId, setAddingId] = useState(null);
  const [activeTab, setActiveTab] = useState("food");

  const urlSearch = searchParams.get("search") || "";

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [foodRes, resRes] = await Promise.all([
          API.get("/foods"),
          API.get("/restaurants"),
        ]);
        setFoods(foodRes.data);
        const restList = Array.isArray(resRes.data) ? resRes.data : resRes.data.restaurants || [];
        setRestaurants(restList);
        const cats = [...new Set(foodRes.data.map((f) => f.category))].sort();
        setCategories(cats);
      } catch {
        toast.error("Could not load data");
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, []);

  useEffect(() => {
    if (urlSearch) { setRestaurantSearch(urlSearch); setActiveTab("restaurants"); }
  }, [urlSearch]);

  const handleAddToCart = async (foodId) => {
    if (!user) return toast.error("Please login to add items to cart");
    setAddingId(foodId);
    try {
      await incrementItem(foodId);
      toast.success("Added to cart!");
    } catch { toast.error("Failed to add to cart"); }
    finally { setAddingId(null); }
  };

  const handleMoodSelect = (mood) => {
    setActiveMood(!mood || activeMood?.id === mood.id ? null : mood);
    setActiveCategory("All");
  };

  const displayFoods = activeMood
    ? foods.filter((f) => activeMood.categories.includes(f.category))
    : activeCategory === "All" ? foods : foods.filter((f) => f.category === activeCategory);

  const filteredRestaurants = restaurants.filter((r) => {
    if (!restaurantSearch) return true;
    const q = restaurantSearch.toLowerCase();
    return r.name.toLowerCase().includes(q) || r.cuisine?.some((c) => c.toLowerCase().includes(q));
  });

  const grouped = !activeMood && activeCategory === "All"
    ? categories.reduce((acc, cat) => {
        const items = displayFoods.filter((f) => f.category === cat);
        if (items.length) acc[cat] = items;
        return acc;
      }, {})
    : null;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="relative overflow-hidden" style={{ background: "linear-gradient(135deg, #c2410c 0%, #ea580c 40%, #f97316 70%, #fb923c 100%)" }}>
        <div className="absolute -top-20 -right-20 w-96 h-96 rounded-full bg-white/10" />
        <div className="absolute -bottom-24 -left-16 w-72 h-72 rounded-full bg-white/10" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 md:py-20 relative z-10">
          <div className="max-w-2xl">
            <span className="inline-block bg-white/20 text-white text-xs font-bold px-3 py-1 rounded-full mb-4 tracking-widest uppercase border border-white/30">
              🚀 Fast • Fresh • Delicious
            </span>
            <h1 className="text-4xl md:text-6xl font-extrabold text-white leading-tight mb-4">
              Authentic Desi<br />
              Flavours, <span className="text-yellow-300">Delivered.</span>
            </h1>
            <p className="text-white/80 text-base md:text-lg mb-8 leading-relaxed">
              From crispy street bites to rich Indian curries — order from the best restaurants and get it delivered fast.
            </p>
            <div className="flex items-center bg-white rounded-2xl shadow-2xl overflow-hidden max-w-lg">
              <div className="pl-4 text-orange-500"><FiMapPin size={18} /></div>
              <input
                value={restaurantSearch}
                onChange={(e) => { setRestaurantSearch(e.target.value); setActiveTab("restaurants"); }}
                placeholder="Search restaurants, cuisines..."
                className="flex-1 px-3 py-3.5 text-gray-800 text-sm outline-none placeholder:text-gray-400"
              />
              <button
                onClick={() => setActiveTab("restaurants")}
                className="m-1.5 bg-orange-600 hover:bg-orange-700 text-white px-5 py-2.5 rounded-xl font-semibold flex items-center space-x-2 transition text-sm"
              >
                <FiSearch size={16} /><span>Search</span>
              </button>
            </div>
            <div className="flex items-center space-x-6 mt-8 text-white/70 text-sm">
              {[{ value: `${restaurants.length}+`, label: "Restaurants" }, { value: `${foods.length}+`, label: "Menu Items" }, { value: "30 min", label: "Avg Delivery" }].map((s) => (
                <div key={s.label} className="text-center">
                  <p className="text-xl font-extrabold text-white">{s.value}</p>
                  <p className="text-xs">{s.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16 pt-8">
        <div className="flex items-center space-x-1 bg-gray-200 p-1 rounded-xl w-fit mb-8">
          {[{ key: "food", label: "🍛  Food Menu" }, { key: "restaurants", label: "🏪  Restaurants" }].map((tab) => (
            <button key={tab.key} onClick={() => setActiveTab(tab.key)}
              className={`px-5 py-2 rounded-lg text-sm font-semibold transition-all ${
                activeTab === tab.key ? "bg-white text-orange-600 shadow-sm" : "text-gray-500 hover:text-gray-700"
              }`}
            >{tab.label}</button>
          ))}
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="bg-white rounded-2xl border border-gray-100 overflow-hidden animate-pulse">
                <div className="h-44 bg-gray-200" />
                <div className="p-4 space-y-2">
                  <div className="h-3 bg-gray-200 rounded w-3/4" />
                  <div className="h-3 bg-gray-200 rounded w-1/2" />
                  <div className="h-8 bg-gray-200 rounded-xl mt-3" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <>
            {activeTab === "restaurants" && (
              <>
                <div className="flex items-center justify-between mb-5">
                  <h2 className="text-2xl font-extrabold text-gray-800">
                    {restaurantSearch ? `Results for "${restaurantSearch}"` : "All Restaurants"}
                  </h2>
                  <span className="text-sm text-gray-400">{filteredRestaurants.length} found</span>
                </div>
                {filteredRestaurants.length === 0 ? (
                  <div className="text-center py-20">
                    <MdOutlineRestaurant size={64} className="mx-auto text-gray-300 mb-4" />
                    <h3 className="text-xl font-semibold text-gray-500">No restaurants found</h3>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                    {filteredRestaurants.map((r) => <RestaurantCard key={r._id} restaurant={r} />)}
                  </div>
                )}
              </>
            )}

            {activeTab === "food" && (
              <>
                <CraveCompass activeMood={activeMood} onMoodSelect={handleMoodSelect} />
                {!activeMood && (
                  <div className="flex items-center space-x-2 overflow-x-auto pb-2 mb-8">
                    {["All", ...categories].map((cat) => {
                      const meta = CATEGORY_META[cat] || DEFAULT_META;
                      const CatIcon = meta.Icon;
                      const isActive = activeCategory === cat;
                      return (
                        <button key={cat} onClick={() => { setActiveCategory(cat); setActiveMood(null); }}
                          className={`flex items-center space-x-1.5 whitespace-nowrap px-4 py-2 rounded-full text-sm font-semibold border-2 transition-all ${
                            isActive ? "bg-orange-600 border-orange-600 text-white shadow-md" : "bg-white border-gray-200 text-gray-600 hover:border-orange-300"
                          }`}
                        >
                          {cat === "All" ? <MdOutlineRestaurant size={16} /> : <CatIcon size={16} color={isActive ? "#ffffff" : meta.iconColor} />}
                          <span>{cat}</span>
                        </button>
                      );
                    })}
                  </div>
                )}
                {displayFoods.length === 0 ? (
                  <p className="text-center text-gray-400 py-16 text-lg">No items found.</p>
                ) : grouped ? (
                  Object.entries(grouped).map(([cat, items]) => {
                    const meta = CATEGORY_META[cat] || DEFAULT_META;
                    return (
                      <section key={cat} className="mb-12">
                        <div className="flex items-center space-x-3 mb-5">
                          <meta.Icon size={30} color={meta.iconColor} />
                          <h2 className="text-2xl font-extrabold text-gray-800">{cat}</h2>
                          <span className="text-sm text-gray-400">({items.length} items)</span>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                          {items.map((food) => <FoodCard key={food._id} food={food} onAddToCart={handleAddToCart} addingId={addingId} />)}
                        </div>
                      </section>
                    );
                  })
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                    {displayFoods.map((food) => <FoodCard key={food._id} food={food} onAddToCart={handleAddToCart} addingId={addingId} />)}
                  </div>
                )}
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Home;
