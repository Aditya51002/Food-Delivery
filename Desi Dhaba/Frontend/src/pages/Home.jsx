import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import API from "../utils/api";
import { FiMapPin } from "react-icons/fi";

const Home = () => {
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRestaurants = async () => {
      try {
        const { data } = await API.get("/restaurants");
        setRestaurants(data.filter((r) => r.isActive));
      } catch {
        setRestaurants([]);
      } finally {
        setLoading(false);
      }
    };
    fetchRestaurants();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-orange-500" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-orange-500 to-red-500 rounded-2xl p-8 md:p-12 mb-10 text-white">
        <h1 className="text-3xl md:text-5xl font-bold mb-3">Craving Something Desi? 🍛</h1>
        <p className="text-lg md:text-xl opacity-90 max-w-2xl">
          Order delicious food from the best local restaurants. Fast delivery right to your doorstep!
        </p>
      </div>

      {/* Restaurant List */}
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Popular Restaurants</h2>

      {restaurants.length === 0 ? (
        <p className="text-gray-500 text-center py-12">No restaurants available at the moment.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {restaurants.map((restaurant) => (
            <div
              key={restaurant._id}
              className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition group"
            >
              <div className="h-48 bg-gray-200 overflow-hidden">
                {restaurant.image ? (
                  <img
                    src={restaurant.image}
                    alt={restaurant.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400 text-6xl">
                    🏪
                  </div>
                )}
              </div>
              <div className="p-5">
                <h3 className="text-xl font-semibold text-gray-800 mb-1">{restaurant.name}</h3>
                <p className="text-gray-500 text-sm mb-3 line-clamp-2">
                  {restaurant.description || "Delicious food awaits!"}
                </p>
                <div className="flex items-center text-gray-400 text-sm mb-4">
                  <FiMapPin size={14} className="mr-1" />
                  <span className="truncate">{restaurant.address}</span>
                </div>
                <Link
                  to={`/restaurant/${restaurant._id}`}
                  className="block text-center bg-orange-600 text-white py-2.5 rounded-lg font-medium hover:bg-orange-700 transition"
                >
                  View Menu
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Home;
