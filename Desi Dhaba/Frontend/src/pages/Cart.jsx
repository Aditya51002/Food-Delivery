import { useCart } from "../context/CartContext";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { FiTrash2, FiPlus, FiMinus, FiShoppingBag } from "react-icons/fi";
import { MdOutlineRestaurant } from "react-icons/md";

const Cart = () => {
  const { cart, addToCart, removeFromCart, loading } = useCart();
  const navigate = useNavigate();

  const handleQuantityChange = async (foodId, currentQty, delta) => {
    const newQty = currentQty + delta;
    try {
      if (newQty <= 0) {
        await removeFromCart(foodId);
        toast.success("Item removed");
      } else {
        await addToCart(foodId, newQty);
      }
    } catch {
      toast.error("Failed to update cart");
    }
  };

  const handleRemove = async (foodId) => {
    try {
      await removeFromCart(foodId);
      toast.success("Item removed from cart");
    } catch {
      toast.error("Failed to remove item");
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-orange-500" />
      </div>
    );
  }

  if (!cart.items || cart.items.length === 0) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center">
        <FiShoppingBag size={64} className="mx-auto text-gray-300 mb-4" />
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Your cart is empty</h2>
        <p className="text-gray-500 mb-6">Add some delicious items from our restaurants!</p>
        <button
          onClick={() => navigate("/")}
          className="bg-orange-600 text-white px-6 py-2.5 rounded-lg font-medium hover:bg-orange-700 transition"
        >
          Browse Restaurants
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Your Cart</h1>

      <div className="space-y-4">
        {cart.items.map((item) => {
          const food = item.foodId;
          if (!food) return null;
          return (
            <div
              key={food._id}
              className="bg-white rounded-xl shadow-md p-4 flex items-center space-x-4"
            >
              <div className="w-20 h-20 rounded-lg overflow-hidden bg-gray-200 flex-shrink-0">
                {food.image ? (
                  <img src={food.image} alt={food.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <MdOutlineRestaurant size={36} className="text-gray-400" />
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-gray-800 truncate">{food.name}</h3>
                <p className="text-orange-600 font-bold">&#8377;{food.price}</p>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => handleQuantityChange(food._id, item.quantity, -1)}
                  className="w-8 h-8 flex items-center justify-center bg-gray-100 rounded-full hover:bg-gray-200 transition"
                >
                  <FiMinus size={14} />
                </button>
                <span className="w-8 text-center font-semibold">{item.quantity}</span>
                <button
                  onClick={() => handleQuantityChange(food._id, item.quantity, 1)}
                  className="w-8 h-8 flex items-center justify-center bg-gray-100 rounded-full hover:bg-gray-200 transition"
                >
                  <FiPlus size={14} />
                </button>
              </div>
              <div className="text-right min-w-[70px]">
                <p className="font-bold text-gray-800">&#8377;{food.price * item.quantity}</p>
              </div>
              <button
                onClick={() => handleRemove(food._id)}
                className="text-red-500 hover:text-red-700 transition p-1"
              >
                <FiTrash2 size={18} />
              </button>
            </div>
          );
        })}
      </div>

      {/* Total & Checkout */}
      <div className="bg-white rounded-xl shadow-md p-6 mt-6">
        <div className="flex justify-between items-center text-xl font-bold text-gray-800 mb-4">
          <span>Total</span>
          <span className="text-orange-600">&#8377;{cart.totalAmount}</span>
        </div>
        <button
          onClick={() => navigate("/checkout")}
          className="w-full bg-orange-600 text-white py-3 rounded-lg font-medium text-lg hover:bg-orange-700 transition"
        >
          Proceed to Checkout
        </button>
      </div>
    </div>
  );
};

export default Cart;
