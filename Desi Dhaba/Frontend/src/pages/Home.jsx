import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import API from "../utils/api";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";
import Lottie from "lottie-react";
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
  Pizza:       { Icon: MdOutlineLocalPizza,    color: "bg-red-500/20 text-red-400 border border-red-500/30",    iconColor: "#f87171" },
  Burgers:     { Icon: MdOutlineFastfood,       color: "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30", iconColor: "#facc15" },
  "Fast Food": { Icon: MdOutlineFastfood,       color: "bg-orange-500/20 text-orange-400 border border-orange-500/30", iconColor: "#fb923c" },
  Bakery:      { Icon: MdOutlineCake,           color: "bg-pink-500/20 text-pink-400 border border-pink-500/30",  iconColor: "#f472b6" },
  Indian:      { Icon: MdOutlineRiceBowl,       color: "bg-amber-500/20 text-amber-400 border border-amber-500/30", iconColor: "#fbbf24" },
  Drinks:      { Icon: MdOutlineLocalDrink,     color: "bg-blue-500/20 text-blue-400 border border-blue-500/30",  iconColor: "#60a5fa" },
};
const DEFAULT_META = { Icon: MdOutlineRestaurant, color: "bg-zinc-700/50 text-zinc-300 border border-zinc-600", iconColor: "#a1a1aa" };

const MOODS = [
  {
    id: "spicy",
    label: "Feelin' Spicy",
    Icon: MdOutlineLocalFireDepartment,
    categories: ["Indian", "Fast Food"],
    from: "#f43f5e",
    to: "#fb923c",
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
    from: "#f59e0b",
    to: "#fcd34d",
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
  <div className="flex items-center space-x-0.5 shadow-[0_0_10px_rgba(250,204,21,0.2)] rounded-full px-1.5 py-0.5 bg-zinc-900/50">
    {[1,2,3,4,5].map((i) => (
      <FiStar key={i} size={11}
        className={i <= Math.floor(rating) ? "text-yellow-400 fill-yellow-400" : "text-zinc-600"} />
    ))}
    <span className="ml-1.5 text-[11px] text-zinc-200 font-bold">{rating?.toFixed(1)}</span>
    {count > 0 && <span className="text-[10px] text-zinc-500 ml-1">({count})</span>}
  </div>
);

const RestaurantCard = ({ restaurant }) => (
  <Link
    to={`/restaurant/${restaurant._id}`}
    className="glass-card overflow-hidden group block"
  >
    <div className="h-44 bg-zinc-800 overflow-hidden relative border-b border-white/5">
      {restaurant.image ? (
        <img src={restaurant.image} alt={restaurant.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500 opacity-90 group-hover:opacity-100" />
      ) : (
        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-rose-900/40 to-zinc-900">
          <MdOutlineRestaurant size={52} className="text-zinc-600" />
        </div>
      )}
      {!restaurant.isOpen && (
        <div className="absolute inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center">
          <span className="bg-red-500/90 text-white text-xs px-3 py-1 rounded-full font-bold shadow-[0_0_15px_rgba(239,68,68,0.5)] tracking-widest uppercase">Closed</span>
        </div>
      )}
    </div>
    <div className="p-4">
      <div className="flex justify-between items-start mb-1.5">
        <h3 className="font-bold text-zinc-100 text-lg leading-tight truncate pr-2 group-hover:text-rose-400 transition-colors">{restaurant.name}</h3>
        <div className="flex items-center space-x-0.5 flex-shrink-0 bg-yellow-400/10 px-1.5 py-0.5 rounded-md border border-yellow-400/20">
          <FiStar size={12} className="text-yellow-400 fill-yellow-400" />
          <span className="text-xs font-bold text-yellow-400">{restaurant.rating?.toFixed(1) || "4.0"}</span>
        </div>
      </div>
      {restaurant.cuisine?.length > 0 && (
        <p className="text-xs text-zinc-400 mb-3 truncate font-medium">{restaurant.cuisine.join(" • ")}</p>
      )}
      <div className="flex items-center justify-between text-xs text-zinc-400 border-t border-white/5 pt-3">
        <div className="flex items-center space-x-1.5"><FiClock size={12} className="text-rose-400" /><span>{restaurant.deliveryTime || "30-40 min"}</span></div>
        <div className="flex items-center space-x-1.5"><FiTruck size={12} className="text-emerald-400" /><span>{restaurant.deliveryFee > 0 ? `₹${restaurant.deliveryFee}` : "Free Delivery"}</span></div>
      </div>
    </div>
  </Link>
);

const SkeletonCard = () => (
  <div className="glass-card overflow-hidden animate-pulse">
    <div className="h-44 bg-zinc-800/80" />
    <div className="p-4 space-y-3">
      <div className="h-4 bg-zinc-700/50 rounded w-3/4" />
      <div className="h-3 bg-zinc-700/50 rounded w-1/2" />
      <div className="h-10 bg-zinc-800 rounded-xl mt-4" />
    </div>
  </div>
);

const FoodCard = ({ food, onAddToCart, addingId }) => {
  const meta = CATEGORY_META[food.category] || DEFAULT_META;
  const { Icon: CatIcon, iconColor } = meta;
  return (
    <div className="glass-card overflow-hidden flex flex-col group relative">
      <div className="h-48 bg-zinc-800/50 flex items-center justify-center overflow-hidden relative border-b border-white/5">
        {food.image ? (
          <img src={food.image} alt={food.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500 opacity-90 group-hover:opacity-100" />
        ) : (
          <CatIcon size={72} color={iconColor} className="opacity-30" />
        )}
        <div className="absolute top-3 left-3 flex flex-col space-y-1.5 z-10">
          <span className={`text-[10px] font-black tracking-wider uppercase px-2.5 py-1.5 rounded-lg backdrop-blur-md shadow-lg ${meta.color}`}>{food.category}</span>
          {food.isBestSeller && (
            <span className="text-[10px] font-black tracking-wider uppercase px-2.5 py-1.5 rounded-lg bg-yellow-400/90 text-yellow-900 shadow-[0_0_15px_rgba(250,204,21,0.4)]">🏆 Best Seller</span>
          )}
        </div>
        <div className="absolute top-3 right-3 z-10">
          <div className={`w-5 h-5 rounded border-2 backdrop-blur-md flex items-center justify-center ${food.isVeg !== false ? "border-emerald-500 bg-emerald-500/20" : "border-red-500 bg-red-500/20"}`}>
            <div className={`w-2.5 h-2.5 rounded-full ${food.isVeg !== false ? "bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.8)]" : "bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.8)]"}`} />
          </div>
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-zinc-900 via-transparent to-transparent opacity-80" />
      </div>
      
      <div className="p-4 flex flex-col flex-1 relative z-10 -mt-2">
        <h3 className="font-bold text-zinc-100 text-[15px] mb-1 leading-tight line-clamp-1">{food.name}</h3>
        {food.description && (
          <p className="text-zinc-400 text-xs mb-3 line-clamp-2 leading-relaxed">{food.description}</p>
        )}
        
        <div className="flex items-center justify-between mb-3 mt-auto pt-2">
          <StarRating rating={food.rating || 4.0} count={food.numRatings} />
          {food.preparationTime && (
            <div className="flex items-center space-x-1 text-[11px] text-zinc-500 font-medium bg-zinc-800 px-2 py-1 rounded-md border border-white/5">
              <FiClock size={11} className="text-zinc-400" /><span>{food.preparationTime}</span>
            </div>
          )}
        </div>
        
        <div className="flex items-center justify-between border-t border-white/5 pt-3">
          <div className="flex items-baseline">
            <span className="text-xl font-black text-white group-hover:text-rose-400 transition-colors">₹{food.price}</span>
            {food.originalPrice && food.originalPrice > food.price && (
              <span className="text-xs text-zinc-500 line-through ml-2 font-medium">₹{food.originalPrice}</span>
            )}
          </div>
          <button
            onClick={() => onAddToCart(food._id)}
            disabled={addingId === food._id}
            className="btn-primary flex items-center space-x-1.5 px-4 py-2"
          >
            <FiShoppingCart size={14} />
            <span className="text-sm">{addingId === food._id ? "..." : "Add"}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

const CraveCompass = ({ activeMood, onMoodSelect }) => {
  return (
    <section className="relative glass-panel rounded-3xl overflow-hidden mb-10 border border-white/10">
      <div 
        className="absolute inset-0 opacity-40 pointer-events-none"
        style={{ background: "radial-gradient(circle at top left, rgba(244,63,94,0.15), transparent 60%), radial-gradient(circle at bottom right, rgba(99,102,241,0.15), transparent 60%)" }}
      />
      
      <div className="relative z-10 px-6 py-8 md:px-10">
        <div className="flex items-center space-x-4 mb-6">
          <div className="flex items-center justify-center w-12 h-12 rounded-2xl bg-zinc-800/80 backdrop-blur-md border border-zinc-700 shadow-[0_0_20px_rgba(250,204,21,0.15)]">
            <FiZap size={24} className="text-yellow-400 filter drop-shadow-[0_0_5px_rgba(250,204,21,0.8)]" />
          </div>
          <div>
            <h2 className="text-white text-2xl font-black tracking-tight">Crave Compass</h2>
            <p className="text-zinc-400 text-sm font-medium mt-0.5">{"What's your vibe right now?"}</p>
          </div>
          {activeMood && (
            <button
              onClick={() => onMoodSelect(null)}
              className="ml-auto text-xs text-zinc-400 hover:text-white border border-zinc-700 hover:border-zinc-500 bg-zinc-800 px-4 py-1.5 rounded-full transition"
            >
              Reset Guide
            </button>
          )}
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {MOODS.map((mood) => {
            const isActive = activeMood?.id === mood.id;
            const MoodIcon = mood.Icon;
            return (
              <button
                key={mood.id}
                onClick={() => onMoodSelect(mood)}
                className={`group relative rounded-2xl p-5 text-left focus:outline-none backdrop-blur-md transition-all duration-300 ${
                  isActive ? "border-transparent" : "border border-zinc-800 bg-zinc-900/40 hover:bg-zinc-800/60 hover:border-zinc-700 hover:-translate-y-1"
                }`}
                style={{
                  background: isActive ? `linear-gradient(135deg, ${mood.from}CC, ${mood.to}CC)` : "",
                  boxShadow: isActive ? `0 10px 30px -10px ${mood.from}` : "none",
                }}
              >
                <div className={`mb-3 transition-transform duration-300 ${isActive ? "scale-110" : "group-hover:scale-110"}`}>
                  <MoodIcon
                    size={36}
                    color={isActive ? "#ffffff" : mood.from}
                    style={{ filter: isActive ? "drop-shadow(0 2px 4px rgba(0,0,0,0.3))" : `drop-shadow(0 0 8px ${mood.from}66)` }}
                  />
                </div>
                <p className={`text-sm font-black leading-tight mb-1 ${isActive ? "text-white" : "text-zinc-200"}`}>
                  {mood.label}
                </p>
                <p className={`text-xs leading-tight font-medium ${isActive ? "text-white/80" : "text-zinc-500"}`}>
                  {mood.desc}
                </p>
              </button>
            );
          })}
        </div>

        {activeMood && (
          <div className="mt-6 flex justify-end">
            <div className="inline-flex items-center space-x-2 rounded-full px-5 py-2 bg-zinc-900/80 border border-zinc-700 backdrop-blur-md shadow-lg">
              <activeMood.Icon size={16} color={activeMood.from} className="animate-pulse" />
              <span className="text-zinc-300 text-xs font-bold tracking-wide">
                Refining to: <span className="text-white">{activeMood.categories.join(" & ")}</span>
              </span>
            </div>
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
  const [heroAnimation, setHeroAnimation] = useState(null);

  useEffect(() => {
    // Attempting to fetch a dancing chef / premium food animation
    // TODO: Replace this URL with the JSON URL of the chef animation you found on LottieFiles!
    const CHEF_LOTTIE_URL = "https://assets8.lottiefiles.com/packages/lf20_V9t630.json";
    
    fetch(CHEF_LOTTIE_URL)
      .then(res => res.json())
      .then(data => setHeroAnimation(data))
      .catch(() => console.error("Failed to load Lottie animation"));
  }, []);

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
    <div className="min-h-screen">
      <div className="relative overflow-hidden pt-12 rounded-b-[3rem] shadow-2xl mb-12 border-b border-white/5 mx-2" style={{ background: "linear-gradient(135deg, #18181b 0%, #09090b 100%)" }}>
        {/* Subtle glowing orbs in bg */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] -translate-y-1/2 translate-x-1/3 rounded-full bg-rose-500/10 blur-[120px] pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] translate-y-1/3 -translate-x-1/4 rounded-full bg-indigo-500/10 blur-[100px] pointer-events-none" />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20 relative z-10 flex flex-col md:flex-row items-center gap-12">
          <div className="max-w-2xl w-full md:w-1/2">
            <span className="inline-block bg-zinc-900/80 backdrop-blur-md text-rose-400 text-xs font-black px-4 py-1.5 rounded-full mb-6 tracking-[0.2em] border border-rose-500/30 uppercase shadow-[0_0_20px_rgba(244,63,94,0.15)]">
              🚀 Fast • Fresh • Premium
            </span>
            <h1 className="text-5xl md:text-7xl font-black text-white leading-[1.1] mb-6">
              Midnight <br />
              Gourmet.
            </h1>
            <p className="text-zinc-400 text-lg md:text-xl font-medium mb-10 leading-relaxed max-w-xl">
              Elevate your dining with hyper-premium street eats and rich culinary delights. Delivered fast.
            </p>
            
            <div className="flex items-center glass-card overflow-hidden max-w-lg rounded-2xl p-1.5 focus-within:ring-2 focus-within:ring-rose-500/50 transition-all shadow-2xl">
              <div className="pl-4 text-zinc-400"><FiSearch size={20} /></div>
              <input
                value={restaurantSearch}
                onChange={(e) => { setRestaurantSearch(e.target.value); setActiveTab("restaurants"); }}
                placeholder="Search premium restaurants, exquisite dishes..."
                className="flex-1 px-4 py-3 bg-transparent text-white text-sm outline-none placeholder:text-zinc-500 font-medium"
              />
              <button
                onClick={() => setActiveTab("restaurants")}
                className="btn-primary py-3 px-6 rounded-xl flex items-center space-x-2 text-sm"
              >
                <span>Discover</span>
              </button>
            </div>
            
            <div className="flex items-center space-x-8 mt-12">
              {[{ value: `${restaurants.length}+`, label: "Curated Venues" }, { value: `${foods.length}+`, label: "Exquisite Items" }, { value: "30m", label: "Lightning Delivery" }].map((s) => (
                <div key={s.label}>
                  <p className="text-2xl font-black text-white tracking-tight">{s.value}</p>
                  <p className="text-xs text-zinc-500 font-bold uppercase tracking-wider mt-1">{s.label}</p>
                </div>
              ))}
            </div>
          </div>
          
          <div className="w-full md:w-1/2 flex justify-center mt-10 md:mt-0">
            {heroAnimation ? (
              <Lottie animationData={heroAnimation} loop={true} className="w-full max-w-[500px] drop-shadow-[0_0_50px_rgba(244,63,94,0.2)]" />
            ) : (
              <div className="w-64 h-64 border-4 border-rose-500/20 border-t-rose-500 rounded-full animate-spin"></div>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        <div className="flex items-center justify-center space-x-2 bg-zinc-900/50 border border-white/5 p-1.5 rounded-2xl w-fit mx-auto mb-12 backdrop-blur-sm shadow-xl">
          {[{ key: "food", label: "Gourmet Menu" }, { key: "restaurants", label: "Premium Venues" }].map((tab) => (
            <button key={tab.key} onClick={() => setActiveTab(tab.key)}
              className={`px-8 py-2.5 rounded-xl text-sm font-bold transition-all duration-300 ${
                activeTab === tab.key ? "bg-zinc-800 text-white shadow-md border border-zinc-700" : "text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800/30"
              }`}
            >{tab.label}</button>
          ))}
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} />)}
          </div>
        ) : (
          <div className="animate-in fade-in duration-500">
            {activeTab === "restaurants" && (
              <>
                <div className="flex items-end justify-between mb-8 border-b border-white/10 pb-4">
                  <div>
                    <h2 className="text-3xl font-black text-white tracking-tight">
                      {restaurantSearch ? `Results for "${restaurantSearch}"` : "Exclusive Partners"}
                    </h2>
                    <p className="text-zinc-400 text-sm mt-1">{filteredRestaurants.length} exceptional venues found</p>
                  </div>
                </div>
                {filteredRestaurants.length === 0 ? (
                  <div className="text-center py-24 glass-panel rounded-3xl">
                    <MdOutlineRestaurant size={80} className="mx-auto text-zinc-700 mb-6 drop-shadow-2xl" />
                    <h3 className="text-2xl font-bold text-zinc-300">No venues found</h3>
                    <p className="text-zinc-500 mt-2">Try searching something else</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {filteredRestaurants.map((r) => <RestaurantCard key={r._id} restaurant={r} />)}
                  </div>
                )}
              </>
            )}

            {activeTab === "food" && (
              <>
                <CraveCompass activeMood={activeMood} onMoodSelect={handleMoodSelect} />
                
                {!activeMood && (
                  <div className="flex items-center space-x-3 overflow-x-auto pb-4 mb-10 scrollbar-hide -mx-4 px-4 sm:mx-0 sm:px-0">
                    {["All", ...categories].map((cat) => {
                      const meta = CATEGORY_META[cat] || DEFAULT_META;
                      const CatIcon = meta.Icon;
                      const isActive = activeCategory === cat;
                      return (
                         <button key={cat} onClick={() => { setActiveCategory(cat); setActiveMood(null); }}
                          className={`flex-shrink-0 flex items-center space-x-2 px-5 py-2.5 rounded-full text-sm font-bold transition-all duration-300 ${
                            isActive ? "bg-white text-zinc-900 shadow-[0_0_15px_rgba(255,255,255,0.2)]" : "bg-zinc-900/60 border border-white/10 text-zinc-400 hover:text-white hover:bg-zinc-800"
                          }`}
                        >
                          {cat === "All" ? <MdOutlineRestaurant size={18} /> : <CatIcon size={18} color={isActive ? "#18181b" : meta.iconColor} />}
                          <span>{cat}</span>
                        </button>
                      );
                    })}
                  </div>
                )}
                
                {displayFoods.length === 0 ? (
                  <div className="text-center py-24 glass-panel rounded-3xl">
                    <p className="text-zinc-400 text-xl font-bold">No masterclasses found.</p>
                  </div>
                ) : grouped ? (
                  Object.entries(grouped).map(([cat, items]) => {
                    const meta = CATEGORY_META[cat] || DEFAULT_META;
                    return (
                      <section key={cat} className="mb-16">
                        <div className="flex items-center space-x-4 mb-6 relative">
                           <div className="w-12 h-12 rounded-2xl flex items-center justify-center glass-panel">
                             <meta.Icon size={24} color={meta.iconColor} />
                           </div>
                           <div>
                             <h2 className="text-3xl font-black text-white tracking-tight">{cat}</h2>
                             <span className="text-xs text-zinc-500 font-bold uppercase tracking-wider">{items.length} Curated Items</span>
                           </div>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                          {items.map((food) => <FoodCard key={food._id} food={food} onAddToCart={handleAddToCart} addingId={addingId} />)}
                        </div>
                      </section>
                    );
                  })
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {displayFoods.map((food) => <FoodCard key={food._id} food={food} onAddToCart={handleAddToCart} addingId={addingId} />)}
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Home;
