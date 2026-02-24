import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import API from "../utils/api";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";
import { FiPlus, FiMapPin } from "react-icons/fi";

const RestaurantMenu = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const { addToCart } = useCart();
  const [restaurant, setRestaurant] = useState(null);
  const [foods, setFoods] = useState([]);
  const [loading, setLoading] = useState(true);
  const [addingId, setAddingId] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [resRes, foodRes] = await Promise.all([
          API.get(`/restaurants/${id}`),
          API.get(`/foods/${id}`),
        ]);
        setRestaurant(resRes.data);
        setFoods(foodRes.data.filter((f) => f.isAvailable));
      } catch {
        toast.error("Failed to load restaurant");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  const handleAddToCart = async (foodId) => {
    if (!user) {
      toast.error("Please login to add items to cart");
      return;
    }
    setAddingId(foodId);
    try {
      await addToCart(foodId, 1);
      toast.success("Added to cart!");
    } catch {
      toast.error("Failed to add to cart");
    } finally {
      setAddingId(null);
    }
  };

  // Group foods by category
  const categories = foods.reduce((acc, food) => {
    if (!acc[food.category]) acc[food.category] = [];
    acc[food.category].push(food);
    return acc;
  }, {});

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-orange-500" />
      </div>
    );
  }

  if (!restaurant) {
    return <div className="text-center py-12 text-gray-500">Restaurant not found</div>;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Restaurant Header */}
      <div className="bg-white rounded-2xl shadow-md overflow-hidden mb-8">
        <div className="h-48 md:h-64 bg-gray-200 overflow-hidden">
          {restaurant.image ? (
            <img
              src={restaurant.image}
              alt={restaurant.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400 text-6xl">
              🏪
            </div>
          )}
        </div>
        <div className="p-6">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">{restaurant.name}</h1>
          <p className="text-gray-500 mb-2">{restaurant.description}</p>
          <div className="flex items-center text-gray-400 text-sm">
            <FiMapPin size={14} className="mr-1" />
            <span>{restaurant.address}</span>
          </div>
        </div>
      </div>

      {/* Menu */}
      {Object.keys(categories).length === 0 ? (
        <p className="text-gray-500 text-center py-12">No menu items available.</p>
      ) : (
        Object.entries(categories).map(([category, items]) => (
          <div key={category} className="mb-8">
            <h2 className="text-xl font-bold text-gray-800 mb-4 border-b-2 border-orange-200 pb-2">
              {category}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {items.map((food) => (
                <div
                  key={food._id}
                  className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition"
                >
                  <div className="h-40 bg-gray-200 overflow-hidden">
                    {food.image ? (
                      <img
                        src={food.image}
                        alt={food.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400 text-5xl">
                        🍽️
                      </div>
                    )}
                  </div>
                  <div className="p-4">
                    <h3 className="text-lg font-semibold text-gray-800">{food.name}</h3>
                    <p className="text-orange-600 font-bold text-lg mt-1">₹{food.price}</p>
                    <button
                      onClick={() => handleAddToCart(food._id)}
                      disabled={addingId === food._id}
                      className="mt-3 w-full flex items-center justify-center space-x-2 bg-orange-600 text-white py-2 rounded-lg hover:bg-orange-700 transition disabled:opacity-50"
                    >
                      <FiPlus size={16} />
                      <span>{addingId === food._id ? "Adding..." : "Add to Cart"}</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))
      )}
    </div>
  );
};

export default RestaurantMenu;
