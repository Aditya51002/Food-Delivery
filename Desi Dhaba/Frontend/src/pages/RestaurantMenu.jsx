import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import API from "../utils/api";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";
import {
  FiPlus, FiMinus, FiMapPin, FiStar, FiClock, FiTruck, FiShoppingCart, FiMessageSquare,
} from "react-icons/fi";
import { MdOutlineRestaurant, MdLocalFireDepartment } from "react-icons/md";

const SPICY_LEVELS = { mild: 1, medium: 2, hot: 3, "extra-hot": 4 };
const SpicyMeter = ({ level }) => {
  const count = SPICY_LEVELS[level] || 0;
  if (!count) return null;
  return (
    <div className="flex items-center space-x-0.5 bg-rose-500/10 px-1.5 py-0.5 rounded-full border border-rose-500/20" title={`Spicy level: ${level}`}>
      {[1, 2, 3, 4].map((i) => (
        <MdLocalFireDepartment key={i} size={11} color={i <= count ? "#f43f5e" : "#3f3f46"} />
      ))}
    </div>
  );
};

const StarRating = ({ rating }) => (
  <div className="flex items-center space-x-1 bg-yellow-400/10 px-1.5 py-0.5 rounded-md border border-yellow-400/20 shadow-[0_0_10px_rgba(250,204,21,0.1)]">
    {[1, 2, 3, 4, 5].map((i) => (
      <FiStar
        key={i}
        size={10}
        className={i <= Math.floor(rating) ? "text-yellow-400 fill-yellow-400 drop-shadow-md" : "text-zinc-600"}
      />
    ))}
    <span className="text-[11px] text-yellow-400 font-bold">{rating?.toFixed(1)}</span>
  </div>
);

const FoodCard = ({ food, cartQty, onIncrement, onDecrement, addingId }) => {
  const isAdding = addingId === food._id;
  const hasDiscount = food.originalPrice && food.originalPrice > food.price;
  const discountPct = hasDiscount
    ? Math.round(((food.originalPrice - food.price) / food.originalPrice) * 100)
    : 0;

  return (
    <div className="glass-card flex flex-col group relative overflow-hidden rounded-2xl">
      <div className="h-44 bg-zinc-800/80 overflow-hidden relative flex-shrink-0 border-b border-white/5">
        {food.image ? (
          <img
            src={food.image}
            alt={food.name}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500 opacity-90 group-hover:opacity-100"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-zinc-800 to-zinc-900">
            <MdOutlineRestaurant size={50} className="text-zinc-700" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-zinc-900 via-transparent to-transparent opacity-80" />
        
        {food.isBestSeller && (
          <div className="absolute top-3 left-3 bg-yellow-400/90 text-yellow-900 text-[9px] font-black px-2 mt-0.5 py-1 rounded-md shadow-[0_0_15px_rgba(250,204,21,0.4)] tracking-widest uppercase backdrop-blur-sm">
            🏆 Best Seller
          </div>
        )}
        {hasDiscount && (
          <div className="absolute top-3 right-10 bg-emerald-500/90 text-white text-[9px] font-black px-2 py-1 rounded-md shadow-[0_0_15px_rgba(16,185,129,0.4)] backdrop-blur-sm tracking-wider">
            {discountPct}% OFF
          </div>
        )}
        <div className="absolute top-3 right-3 z-10">
          <div
            className={`w-5 h-5 rounded border-2 flex items-center justify-center backdrop-blur-sm shadow-lg ${
              food.isVeg !== false ? "border-emerald-500 bg-emerald-500/20" : "border-rose-500 bg-rose-500/20"
            }`}
          >
            <div
              className={`w-2.5 h-2.5 rounded-full ${
                food.isVeg !== false ? "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]" : "bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.8)]"
              }`}
            />
          </div>
        </div>
      </div>

      <div className="p-4 flex flex-col flex-1 relative z-10 -mt-2">
        <h3 className="font-bold text-zinc-100 text-base leading-tight line-clamp-1 mb-1 group-hover:text-rose-400 transition-colors">
          {food.name}
        </h3>
        {food.description && (
          <p className="text-zinc-400 text-xs line-clamp-2 leading-relaxed mb-3">
            {food.description}
          </p>
        )}
        <div className="flex items-center justify-between mb-3 mt-auto pt-2">
          <StarRating rating={food.rating || 4.0} />
          <SpicyMeter level={food.spicyLevel} />
        </div>

        <div className="flex flex-wrap gap-2 mb-3">
          {food.preparationTime && (
            <span className="flex items-center gap-1.5 bg-zinc-800/80 rounded-md px-2 py-1 text-[10px] text-zinc-400 border border-white/5 font-medium">
              <FiClock size={10} className="text-indigo-400" />
              {food.preparationTime}
            </span>
          )}
          {food.calories && (
            <span className="bg-orange-500/10 rounded-md px-2 py-1 text-[10px] text-orange-400 border border-orange-500/20 font-bold">
              {food.calories} kcal
            </span>
          )}
        </div>

        <div className="flex items-center justify-between border-t border-white/5 pt-3">
          <div className="flex items-baseline">
            <span className="text-xl font-black text-white">₹{food.price}</span>
            {hasDiscount && (
              <span className="text-xs text-zinc-500 line-through ml-2 font-medium">₹{food.originalPrice}</span>
            )}
          </div>
          {cartQty > 0 ? (
            <div className="flex items-center bg-rose-600 rounded-xl overflow-hidden shadow-lg shadow-rose-500/30 border border-rose-500/50">
              <button
                onClick={() => onDecrement(food._id, cartQty)}
                className="w-8 h-8 flex items-center justify-center text-white hover:bg-rose-700 transition"
              >
                <FiMinus size={13} />
              </button>
              <span className="text-white font-black text-xs w-5 text-center select-none bg-rose-700/30">
                {cartQty}
              </span>
              <button
                onClick={() => onIncrement(food._id)}
                disabled={isAdding}
                className="w-8 h-8 flex items-center justify-center text-white hover:bg-rose-700 transition disabled:opacity-60"
              >
                <FiPlus size={13} />
              </button>
            </div>
          ) : (
            <button
              onClick={() => onIncrement(food._id)}
              disabled={isAdding}
              className="btn-primary flex items-center gap-1.5 px-4 py-2"
            >
              {isAdding ? (
                <span className="text-xs font-bold w-12 text-center">...</span>
              ) : (
                <>
                  <FiPlus size={13} />
                  <span className="text-xs font-bold">Add</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

const CategoryTabs = ({ categories, active, onSelect }) => (
  <div className="flex items-center gap-3 overflow-x-auto pb-2 [&::-webkit-scrollbar]:hidden scrollbar-hide py-2">
    {categories.map((cat) => (
      <button
        key={cat}
        onClick={() => onSelect(cat)}
        className={`flex-shrink-0 px-5 py-2 rounded-xl text-sm font-bold transition-all duration-300 ${
          active === cat
            ? "btn-primary shadow-[0_0_15px_rgba(244,63,94,0.3)]"
            : "bg-zinc-800/80 text-zinc-400 border border-white/5 hover:bg-zinc-700 hover:text-white"
        }`}
      >
        {cat}
      </button>
    ))}
  </div>
);

const ReviewsSection = ({ restaurantId }) => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const { data } = await API.get(`/reviews/restaurant/${restaurantId}`);
        setReviews(Array.isArray(data) ? data : data.reviews || []);
      } catch {
      } finally {
        setLoading(false);
      }
    };
    if (restaurantId) fetchReviews();
  }, [restaurantId]);

  if (loading) return null;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 mt-10 border-t border-white/10">
      <div className="flex items-center gap-3 mb-8">
        <div className="bg-indigo-500/20 p-2 rounded-xl border border-indigo-500/30">
          <FiMessageSquare className="text-indigo-400" size={20} />
        </div>
        <h2 className="text-2xl font-black text-white tracking-tight">Customer Experiences</h2>
        <span className="bg-zinc-800 border border-zinc-700 text-zinc-300 px-3 py-1 rounded-lg text-xs font-bold tracking-widest ml-2">
          {reviews.length}
        </span>
      </div>

      {reviews.length === 0 ? (
        <div className="glass-panel p-8 text-center sm:text-left">
          <p className="text-zinc-500 font-medium italic">
            No reviews yet. Order now and be the first to review!
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {reviews.map((r) => (
            <div key={r._id} className="glass-card p-6 flex flex-col h-full">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-black overflow-hidden shadow-lg border border-white/20">
                  {r.userId?.avatar ? (
                    <img src={r.userId.avatar} alt="avatar" className="w-full h-full object-cover" />
                  ) : (
                    r.userId?.name?.charAt(0).toUpperCase() || "U"
                  )}
                </div>
                <div>
                  <p className="font-bold text-zinc-200 text-sm">{r.userId?.name || "Anonymous Gourmet"}</p>
                  <p className="text-[10px] text-zinc-500 font-semibold tracking-wider uppercase mt-0.5">
                    {new Date(r.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <div className="ml-auto">
                  <StarRating rating={r.rating} />
                </div>
              </div>
              <p className="text-zinc-400 text-sm leading-relaxed flex-1 italic font-medium">
                "{r.comment || "Left a rating."}"
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const MenuSkeleton = () => (
  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 animate-pulse">
    <div className="h-10 bg-zinc-800/80 rounded-xl w-1/3" />
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="bg-zinc-800/60 rounded-2xl h-64 border border-zinc-700/50" />
      ))}
    </div>
  </div>
);

const RestaurantMenu = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { cart, incrementItem, addToCart } = useCart();
  const [restaurant, setRestaurant] = useState(null);
  const [foods, setFoods] = useState([]);
  const [loading, setLoading] = useState(true);
  const [addingId, setAddingId] = useState(null);
  const [activeCategory, setActiveCategory] = useState(null);
  const categoryRefs = useRef({});

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [resRes, foodRes] = await Promise.all([
          API.get(`/restaurants/${id}`),
          API.get(`/foods/${id}`),
        ]);
        setRestaurant(resRes.data);
        const avail = foodRes.data.filter((f) => f.isAvailable);
        setFoods(avail);
        const cats = [...new Set(avail.map((f) => f.category))];
        if (cats.length > 0) setActiveCategory(cats[0]);
      } catch {
        toast.error("Failed to load restaurant");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  const handleIncrement = async (foodId) => {
    if (!user) { toast.error("Please login to add items"); return; }
    setAddingId(foodId);
    try {
      await incrementItem(foodId);
      toast.success("Added to cart!", { duration: 1200, icon: "🛒", style: { background: '#18181b', color: '#fff', border: '1px solid #3f3f46' } });
    } catch {
      toast.error("Failed to add to cart");
    } finally {
      setAddingId(null);
    }
  };

  const handleDecrement = async (foodId, currentQty) => {
    if (!user) return;
    try {
      await addToCart(foodId, currentQty - 1);
    } catch {
      toast.error("Failed to update cart");
    }
  };

  const getCartQty = (foodId) => {
    const item = cart.items?.find(
      (i) => (i.foodId?._id ?? i.foodId)?.toString() === foodId?.toString()
    );
    return item?.quantity || 0;
  };

  const categories = [...new Set(foods.map((f) => f.category))];
  const grouped = categories.reduce((acc, cat) => {
    acc[cat] = foods.filter((f) => f.category === cat);
    return acc;
  }, {});

  const handleCategorySelect = (cat) => {
    setActiveCategory(cat);
    const el = categoryRefs.current[cat];
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const cartCount = cart.items?.reduce((a, i) => a + i.quantity, 0) || 0;

  if (loading) return <MenuSkeleton />;

  if (!restaurant) {
    return <div className="text-center py-24 text-zinc-500 font-bold text-xl">Venue not found</div>;
  }

  return (
    <div className="min-h-screen pb-32">
      <div className="relative h-64 md:h-80 overflow-hidden rounded-b-[3rem] mx-2 shadow-2xl border-b border-white/10">
        {restaurant.image ? (
          <>
            <img
              src={restaurant.image}
              alt={restaurant.name}
              className="w-full h-full object-cover scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-900/60 to-transparent" />
          </>
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-zinc-800 to-zinc-900" />
        )}
        <div className="absolute bottom-0 left-0 right-0 px-6 sm:px-10 pb-8 text-white z-10">
          <h1 className="text-3xl sm:text-5xl font-black mb-2 drop-shadow-2xl tracking-tight">
            {restaurant.name}
          </h1>
          {restaurant.cuisine?.length > 0 && (
            <p className="text-sm font-bold text-rose-400 mb-3 tracking-widest uppercase shadow-sm">
              {restaurant.cuisine.join(" • ")}
            </p>
          )}
          <div className="flex flex-wrap items-center gap-4 text-xs font-semibold text-zinc-300">
            <span className="flex items-center gap-1.5 bg-yellow-500/20 px-2 py-1 rounded-md border border-yellow-500/30 text-yellow-500">
              <FiStar size={12} className="fill-yellow-500 drop-shadow-lg" />
              <span>{restaurant.rating?.toFixed(1) || "4.0"}</span>
            </span>
            <span className="flex items-center gap-1.5 bg-zinc-800/50 backdrop-blur-sm px-2 py-1 rounded-md border border-white/10">
              <FiClock size={12} className="text-indigo-400" />{restaurant.deliveryTime || "30-40 min"}
            </span>
            <span className="flex items-center gap-1.5 bg-zinc-800/50 backdrop-blur-sm px-2 py-1 rounded-md border border-white/10">
              <FiTruck size={12} className="text-emerald-400" />
              {restaurant.deliveryFee > 0 ? `₹${restaurant.deliveryFee} fee` : "Free Delivery"}
            </span>
            {restaurant.address && (
              <span className="flex items-center gap-1.5 max-w-xs truncate bg-zinc-800/50 backdrop-blur-sm px-2 py-1 rounded-md border border-white/10">
                <FiMapPin size={12} className="text-rose-400" />{restaurant.address}
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="sticky top-16 z-30 bg-zinc-950/80 backdrop-blur-xl border-b border-white/5 shadow-xl mx-2 rounded-xl mt-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <CategoryTabs
            categories={categories}
            active={activeCategory}
            onSelect={handleCategorySelect}
          />
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-16">
        {categories.length === 0 ? (
          <div className="glass-panel p-12 text-center mt-8">
            <MdOutlineRestaurant size={48} className="mx-auto text-zinc-700 mb-4" />
            <p className="text-zinc-500 font-bold">No masterclasses available right now.</p>
          </div>
        ) : (
          categories.map((cat) => (
            <div key={cat} ref={(el) => (categoryRefs.current[cat] = el)} className="scroll-mt-40">
              <div className="flex items-center gap-4 mb-6">
                <h2 className="text-3xl font-black text-white tracking-tight drop-shadow-md">{cat}</h2>
                <span className="text-xs text-rose-400 bg-rose-500/10 border border-rose-500/20 rounded-lg px-3 py-1 font-bold tracking-widest uppercase">
                  {grouped[cat].length} Items
                </span>
                <div className="flex-1 h-px bg-gradient-to-r from-zinc-800 to-transparent" />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {grouped[cat].map((food) => (
                  <FoodCard
                    key={food._id}
                    food={food}
                    cartQty={getCartQty(food._id)}
                    onIncrement={handleIncrement}
                    onDecrement={handleDecrement}
                    addingId={addingId}
                  />
                ))}
              </div>
            </div>
          ))
        )}
      </div>

      {restaurant && <ReviewsSection restaurantId={restaurant._id} />}

      {cartCount > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 animate-in slide-in-from-bottom-5 duration-300 w-[90%] sm:w-auto">
          <button
            onClick={() => navigate("/cart")}
            className="w-full sm:w-auto flex items-center justify-between gap-6 btn-primary px-8 py-4 rounded-full shadow-[0_10px_40px_rgba(244,63,94,0.4)] text-[15px]"
          >
            <div className="flex items-center gap-3">
              <div className="relative bg-white/20 p-2 rounded-xl backdrop-blur-sm">
                <FiShoppingCart size={22} className="text-white drop-shadow-lg" />
                <span className="absolute -top-2.5 -right-2.5 bg-zinc-900 border border-zinc-700 text-white text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center leading-none shadow-lg">
                  {cartCount}
                </span>
              </div>
              <span className="font-bold tracking-wide">View Order</span>
            </div>
            <span className="bg-white/90 text-zinc-900 rounded-lg px-3 py-1 flex items-center h-full text-sm font-black shadow-inner">
              ₹{cart.totalAmount}
            </span>
          </button>
        </div>
      )}
    </div>
  );
};

export default RestaurantMenu;
