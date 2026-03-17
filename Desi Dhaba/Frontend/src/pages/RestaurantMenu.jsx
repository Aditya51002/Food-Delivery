import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import API from "../utils/api";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";
import {
  FiPlus, FiMinus, FiMapPin, FiStar, FiClock, FiTruck, FiShoppingCart,
} from "react-icons/fi";
import { MdOutlineRestaurant, MdLocalFireDepartment } from "react-icons/md";

const SPICY_LEVELS = { mild: 1, medium: 2, hot: 3, "extra-hot": 4 };
const SpicyMeter = ({ level }) => {
  const count = SPICY_LEVELS[level] || 0;
  if (!count) return null;
  return (
    <div className="flex items-center space-x-0.5" title={`Spicy level: ${level}`}>
      {[1, 2, 3, 4].map((i) => (
        <MdLocalFireDepartment key={i} size={12} color={i <= count ? "#ef4444" : "#e5e7eb"} />
      ))}
    </div>
  );
};

const StarRating = ({ rating }) => (
  <div className="flex items-center space-x-0.5">
    {[1, 2, 3, 4, 5].map((i) => (
      <FiStar
        key={i}
        size={10}
        className={i <= Math.floor(rating) ? "text-yellow-400 fill-yellow-400" : "text-gray-200"}
      />
    ))}
    <span className="text-xs text-gray-500 ml-1 font-medium">{rating?.toFixed(1)}</span>
  </div>
);

const FoodCard = ({ food, cartQty, onIncrement, onDecrement, addingId }) => {
  const isAdding = addingId === food._id;
  const hasDiscount = food.originalPrice && food.originalPrice > food.price;
  const discountPct = hasDiscount
    ? Math.round(((food.originalPrice - food.price) / food.originalPrice) * 100)
    : 0;

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden flex flex-col group">
      <div className="h-44 bg-gradient-to-br from-orange-50 to-amber-50 overflow-hidden relative flex-shrink-0">
        {food.image ? (
          <img
            src={food.image}
            alt={food.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <MdOutlineRestaurant size={60} className="text-orange-200" />
          </div>
        )}
        {food.isBestSeller && (
          <div className="absolute top-2.5 left-2.5 bg-yellow-400 text-yellow-900 text-[10px] font-black px-2 py-0.5 rounded-full shadow-sm tracking-wide">
            🏆 Best Seller
          </div>
        )}
        {hasDiscount && (
          <div className="absolute top-2.5 right-8 bg-green-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm">
            {discountPct}% OFF
          </div>
        )}
        <div className="absolute top-2.5 right-2.5">
          <div
            className={`w-5 h-5 rounded border-2 flex items-center justify-center bg-white/90 backdrop-blur-sm ${
              food.isVeg !== false ? "border-green-600" : "border-red-600"
            }`}
          >
            <div
              className={`w-2.5 h-2.5 rounded-full ${
                food.isVeg !== false ? "bg-green-600" : "bg-red-600"
              }`}
            />
          </div>
        </div>
      </div>

      <div className="p-3.5 flex flex-col flex-1">
        <h3 className="font-bold text-gray-800 text-sm leading-tight line-clamp-1 mb-0.5">
          {food.name}
        </h3>
        {food.description && (
          <p className="text-gray-400 text-[11px] line-clamp-2 leading-relaxed mb-1.5">
            {food.description}
          </p>
        )}
        <div className="flex items-center justify-between mb-2">
          <StarRating rating={food.rating || 4.0} />
          <SpicyMeter level={food.spicyLevel} />
        </div>

        <div className="flex flex-wrap gap-1 mb-3">
          {food.preparationTime && (
            <span className="flex items-center gap-0.5 bg-gray-50 rounded-full px-2 py-0.5 text-[10px] text-gray-500 border border-gray-100">
              <FiClock size={9} />
              {food.preparationTime}
            </span>
          )}
          {food.calories && (
            <span className="bg-orange-50 rounded-full px-2 py-0.5 text-[10px] text-orange-600 border border-orange-100 font-medium">
              {food.calories} kcal
            </span>
          )}
        </div>

        <div className="flex items-center justify-between mt-auto">
          <div>
            <span className="text-lg font-extrabold text-orange-600">₹{food.price}</span>
            {hasDiscount && (
              <span className="text-xs text-gray-400 line-through ml-1.5">₹{food.originalPrice}</span>
            )}
          </div>
          {cartQty > 0 ? (
            <div className="flex items-center bg-orange-600 rounded-xl overflow-hidden shadow-md shadow-orange-200">
              <button
                onClick={() => onDecrement(food._id, cartQty)}
                className="w-8 h-8 flex items-center justify-center text-white hover:bg-orange-700 transition"
              >
                <FiMinus size={13} />
              </button>
              <span className="text-white font-bold text-sm w-5 text-center select-none">
                {cartQty}
              </span>
              <button
                onClick={() => onIncrement(food._id)}
                disabled={isAdding}
                className="w-8 h-8 flex items-center justify-center text-white hover:bg-orange-700 transition disabled:opacity-60"
              >
                <FiPlus size={13} />
              </button>
            </div>
          ) : (
            <button
              onClick={() => onIncrement(food._id)}
              disabled={isAdding}
              className="flex items-center gap-1 bg-orange-600 text-white text-xs font-bold px-3 py-2 rounded-xl hover:bg-orange-700 active:scale-95 transition-all duration-150 disabled:opacity-60 shadow-sm shadow-orange-200"
            >
              {isAdding ? (
                <span>Adding…</span>
              ) : (
                <>
                  <FiPlus size={13} />
                  <span>Add</span>
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
  <div className="flex items-center gap-2 overflow-x-auto pb-0.5 [&::-webkit-scrollbar]:hidden">
    {categories.map((cat) => (
      <button
        key={cat}
        onClick={() => onSelect(cat)}
        className={`flex-shrink-0 px-4 py-1.5 rounded-full text-sm font-semibold transition-all duration-200 ${
          active === cat
            ? "bg-orange-600 text-white shadow-md shadow-orange-200"
            : "bg-white text-gray-600 border border-gray-200 hover:border-orange-300 hover:text-orange-600"
        }`}
      >
        {cat}
      </button>
    ))}
  </div>
);

const MenuSkeleton = () => (
  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-8 animate-pulse">
    <div className="h-8 bg-gray-200 rounded w-1/3" />
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="bg-gray-200 rounded-2xl h-64" />
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
      toast.success("Added to cart!", { duration: 1200, icon: "🛒" });
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
      (i) => (i.foodId?._id || i.foodId) === foodId
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
    return <div className="text-center py-12 text-gray-500">Restaurant not found</div>;
  }

  return (
    <div className="bg-gray-50 min-h-screen pb-28">
      <div className="relative h-52 md:h-72 overflow-hidden">
        {restaurant.image ? (
          <>
            <img
              src={restaurant.image}
              alt={restaurant.name}
              className="w-full h-full object-cover scale-105"
              style={{ filter: "brightness(0.55)" }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/25 to-transparent" />
          </>
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-orange-600 to-amber-500" />
        )}
        <div className="absolute bottom-0 left-0 right-0 px-4 sm:px-8 pb-5 text-white">
          <h1 className="text-2xl sm:text-3xl font-extrabold mb-1 drop-shadow-lg">
            {restaurant.name}
          </h1>
          {restaurant.cuisine?.length > 0 && (
            <p className="text-sm text-white/80 mb-2">{restaurant.cuisine.join(" · ")}</p>
          )}
          <div className="flex flex-wrap items-center gap-3 text-xs text-white/80">
            <span className="flex items-center gap-1">
              <FiStar size={11} className="text-yellow-400 fill-yellow-400" />
              <strong className="text-white">{restaurant.rating?.toFixed(1) || "4.0"}</strong>
            </span>
            <span className="flex items-center gap-1">
              <FiClock size={11} />{restaurant.deliveryTime || "30-40 min"}
            </span>
            <span className="flex items-center gap-1">
              <FiTruck size={11} />
              {restaurant.deliveryFee > 0 ? `₹${restaurant.deliveryFee} delivery` : "Free delivery"}
            </span>
            {restaurant.address && (
              <span className="flex items-center gap-1 max-w-xs truncate">
                <FiMapPin size={11} />{restaurant.address}
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="sticky top-16 z-30 bg-white/95 backdrop-blur-sm border-b border-gray-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <CategoryTabs
            categories={categories}
            active={activeCategory}
            onSelect={handleCategorySelect}
          />
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-10">
        {categories.length === 0 ? (
          <p className="text-gray-500 text-center py-12">No menu items available.</p>
        ) : (
          categories.map((cat) => (
            <div key={cat} ref={(el) => (categoryRefs.current[cat] = el)}>
              <div className="flex items-center gap-3 mb-4">
                <h2 className="text-xl font-extrabold text-gray-800">{cat}</h2>
                <span className="text-xs text-gray-400 bg-gray-100 rounded-full px-2.5 py-0.5 font-semibold">
                  {grouped[cat].length}
                </span>
                <div className="flex-1 h-px bg-gradient-to-r from-orange-200 to-transparent" />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
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

      {cartCount > 0 && (
        <div className="fixed bottom-5 left-1/2 -translate-x-1/2 z-50">
          <button
            onClick={() => navigate("/cart")}
            className="flex items-center gap-3 bg-orange-600 text-white px-6 py-3.5 rounded-2xl shadow-2xl shadow-orange-400/40 hover:bg-orange-700 transition-all duration-200 font-bold text-sm active:scale-95"
          >
            <div className="relative">
              <FiShoppingCart size={20} />
              <span className="absolute -top-2 -right-2 bg-white text-orange-600 text-[10px] font-black w-4 h-4 rounded-full flex items-center justify-center leading-none">
                {cartCount}
              </span>
            </div>
            <span>View Cart</span>
            <span className="bg-white/25 rounded-lg px-2 py-0.5 text-xs font-semibold">
              ₹{cart.totalAmount}
            </span>
          </button>
        </div>
      )}
    </div>
  );
};

export default RestaurantMenu;
