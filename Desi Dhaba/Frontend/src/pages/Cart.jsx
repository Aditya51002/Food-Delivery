import { useCart } from "../context/CartContext";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { FiTrash2, FiPlus, FiMinus, FiShoppingBag, FiArrowRight } from "react-icons/fi";
import { MdOutlineRestaurant } from "react-icons/md";
import Lottie from "lottie-react";
import { useState, useEffect } from "react";

const Cart = () => {
  const { cart, addToCart, removeFromCart, loading } = useCart();
  const navigate = useNavigate();
  const [emptyCartAnimation, setEmptyCartAnimation] = useState(null);

  useEffect(() => {
    // Delivery scooter animation for empty cart motivation
    fetch("https://assets3.lottiefiles.com/packages/lf20_ucbyrun5.json")
      .then(res => res.json())
      .then(data => setEmptyCartAnimation(data));
  }, []);

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
        <div className="animate-spin rounded-full h-10 w-10 border-4 border-zinc-800 border-t-rose-500 shadow-[0_0_15px_rgba(244,63,94,0.5)]" />
      </div>
    );
  }

  if (!cart.items || cart.items.length === 0) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-24 text-center">
        <div className="flex items-center justify-center mx-auto mb-6">
          {emptyCartAnimation ? (
            <Lottie animationData={emptyCartAnimation} loop={true} className="w-64 h-64 drop-shadow-[0_0_30px_rgba(244,63,94,0.3)]" />
          ) : (
            <div className="bg-zinc-900/50 w-32 h-32 rounded-full flex items-center justify-center border border-white/5 shadow-[0_0_30px_rgba(0,0,0,0.5)]">
              <FiShoppingBag size={48} className="text-zinc-500" />
            </div>
          )}
        </div>
        <h2 className="text-3xl font-black text-white mb-3 tracking-tight">Your order is empty</h2>
        <p className="text-zinc-400 mb-8 font-medium">Add some exquisite items from our premium masterclasses.</p>
        <button
          onClick={() => navigate("/")}
          className="btn-primary px-8 py-3.5 text-base shadow-[0_10px_30px_rgba(244,63,94,0.3)]"
        >
          Discover Masterclasses
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-12 min-h-screen">
      <div className="flex items-end justify-between mb-8 border-b border-white/10 pb-4">
        <div>
          <h1 className="text-3xl font-black text-white tracking-tight">Your Order</h1>
          <p className="text-zinc-400 text-sm mt-1">{cart.items.length} items selected</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-4">
          {cart.items.map((item) => {
            const food = item.foodId;
            if (!food) return null;
            return (
              <div
                key={food._id}
                className="glass-card p-4 flex flex-col sm:flex-row sm:items-center gap-4"
              >
                <div className="w-24 h-24 rounded-xl overflow-hidden bg-zinc-800 flex-shrink-0 border border-white/5 shadow-inner">
                  {food.image ? (
                    <img src={food.image} alt={food.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <MdOutlineRestaurant size={32} className="text-zinc-600" />
                    </div>
                  )}
                </div>
                
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-zinc-100 text-lg sm:text-base leading-tight mb-1">{food.name}</h3>
                  <p className="text-rose-400 font-extrabold text-sm mb-3 sm:mb-0">₹{food.price}</p>
                </div>
                
                <div className="flex items-center justify-between sm:justify-end gap-6 sm:w-auto w-full border-t sm:border-t-0 border-white/5 pt-3 sm:pt-0">
                  <div className="flex items-center bg-zinc-900 border border-zinc-700/50 rounded-xl overflow-hidden shadow-inner">
                    <button
                      onClick={() => handleQuantityChange(food._id, item.quantity, -1)}
                      className="w-10 h-10 sm:w-9 sm:h-9 flex items-center justify-center text-zinc-400 hover:text-white hover:bg-zinc-800 transition"
                    >
                      <FiMinus size={14} />
                    </button>
                    <span className="w-8 text-center font-bold text-white text-sm">{item.quantity}</span>
                    <button
                      onClick={() => handleQuantityChange(food._id, item.quantity, 1)}
                      className="w-10 h-10 sm:w-9 sm:h-9 flex items-center justify-center text-zinc-400 hover:text-white hover:bg-zinc-800 transition"
                    >
                      <FiPlus size={14} />
                    </button>
                  </div>
                  
                  <div className="flex items-center gap-4">
                    <div className="text-right min-w-[70px]">
                      <p className="font-black text-white text-lg">₹{food.price * item.quantity}</p>
                    </div>
                    <button
                      onClick={() => handleRemove(food._id)}
                      className="text-zinc-500 hover:text-red-500 transition p-2 bg-zinc-900/50 rounded-lg hover:bg-red-500/10 border border-transparent hover:border-red-500/20"
                      title="Remove item"
                    >
                      <FiTrash2 size={18} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="lg:col-span-1">
          <div className="glass-panel p-6 sticky top-24 border border-white/10 rounded-2xl shadow-2xl">
            <h2 className="text-lg font-black text-white mb-6 uppercase tracking-wider">Order Summary</h2>
            
            <div className="space-y-3 mb-6 border-b border-white/10 pb-6">
              <div className="flex justify-between text-sm text-zinc-400 font-medium">
                <span>Subtotal</span>
                <span className="text-zinc-200 text-sm">₹{cart.totalAmount}</span>
              </div>
              <div className="flex justify-between text-sm text-zinc-400 font-medium">
                <span>Taxes & Fees</span>
                <span className="text-zinc-500 text-xs italic">Calculated at checkout</span>
              </div>
            </div>
            
            <div className="flex justify-between items-center text-xl font-black text-white mb-8">
              <span>Total</span>
              <span className="text-rose-400 drop-shadow-md pb-1">₹{cart.totalAmount}</span>
            </div>
            
            <button
              onClick={() => navigate("/checkout")}
              className="w-full btn-primary py-4 text-base flex justify-center items-center gap-2 shadow-[0_10px_30px_rgba(244,63,94,0.3)]"
            >
              <span>Proceed to Checkout</span>
              <FiArrowRight size={18} />
            </button>
            
            <p className="text-center text-xs text-zinc-500 mt-4 font-medium flex items-center justify-center gap-2">
              <FiShoppingBag /> Secure Checkout securely processed via Razorpay.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;
