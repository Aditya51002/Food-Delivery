import { useState } from "react";
import { useCart } from "../context/CartContext";
import { useNavigate } from "react-router-dom";
import API from "../utils/api";
import toast from "react-hot-toast";
import { FiCreditCard, FiDollarSign } from "react-icons/fi";

const Checkout = () => {
  const { cart, fetchCart } = useCart();
  const navigate = useNavigate();
  const [deliveryAddress, setDeliveryAddress] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("COD");
  const [loading, setLoading] = useState(false);

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    if (!deliveryAddress.trim()) {
      return toast.error("Please enter delivery address");
    }
    if (!cart.items || cart.items.length === 0) {
      return toast.error("Cart is empty");
    }

    setLoading(true);

    try {
      if (paymentMethod === "Online") {
        await processOnlinePayment();
      } else {
        await processCOD();
      }
    } catch (err) {
      toast.error(err.message || err.response?.data?.message || "Failed to process order");
      setLoading(false);
    }
  };

  const processCOD = async () => {
    await API.post("/orders", { deliveryAddress, paymentMethod: "COD" });
    toast.success("Order placed successfully! 🎉", { style: { background: '#18181b', color: '#fff' } });
    await fetchCart();
    navigate("/orders");
  };

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const processOnlinePayment = async () => {
    const isScriptLoaded = await loadRazorpayScript();
    if (!isScriptLoaded) {
      throw new Error("Razorpay SDK failed to load. Are you online?");
    }

    const { data: order } = await API.post("/orders", { deliveryAddress, paymentMethod: "Online" });
    const { data: razorpayOrder } = await API.post("/payments/create-order", { orderId: order._id });

    const options = {
      key: razorpayOrder.keyId,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency,
      name: "Midnight Gourmet",
      description: "Premium Food Delivery",
      image: "https://cdn-icons-png.flaticon.com/512/3170/3170733.png",
      order_id: razorpayOrder.id,
      handler: async function (response) {
        try {
          await API.post("/payments/verify-payment", {
            razorpay_order_id: response.razorpay_order_id,
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_signature: response.razorpay_signature,
            orderId: order._id,
          });

          toast.success("Payment successful! Order confirmed 🚀");
          await fetchCart();
          navigate(`/orders/${order._id}`);
        } catch (err) {
          toast.error("Payment verification failed");
          navigate(`/orders/${order._id}`);
        }
      },
      prefill: {
        name: "Gourmet Member",
        email: "member@midnightgourmet.com",
        contact: "9999999999",
      },
      theme: { color: "#f43f5e" },
    };

    const paymentObject = new window.Razorpay(options);
    paymentObject.on("payment.failed", function (response) {
      toast.error("Payment failed: " + response.error.description);
      navigate(`/orders/${order._id}`);
    });
    
    paymentObject.open();
  };

  if (!cart.items || cart.items.length === 0) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-24 text-center">
        <h2 className="text-3xl font-black text-white mb-2">Cart is empty</h2>
        <p className="text-zinc-500 mb-8 font-medium">Add signature dishes to your cart before checking out.</p>
        <button
          onClick={() => navigate("/")}
          className="btn-primary px-8 py-3.5 text-base"
        >
          Discover Menu
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-12 min-h-screen">
      <div className="mb-10 border-b border-white/10 pb-4">
        <h1 className="text-3xl font-black text-white tracking-tight leading-tight">Secure Checkout</h1>
        <p className="text-zinc-500 text-sm mt-1">Complete your premium order</p>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        <form onSubmit={handlePlaceOrder} className="space-y-6">
          <div className="glass-panel p-6 rounded-2xl shadow-xl border border-white/5">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-8 h-8 rounded-full bg-rose-500/20 flex items-center justify-center text-rose-400 font-bold border border-rose-500/30">1</div>
              <h2 className="text-xl font-bold text-white">Delivery Details</h2>
            </div>

            <div>
              <label className="block text-xs font-bold text-zinc-400 uppercase tracking-widest pl-1">
                Full Address
              </label>
              <textarea
                value={deliveryAddress}
                onChange={(e) => setDeliveryAddress(e.target.value)}
                required
                rows={3}
                className="glass-input resize-none"
                placeholder="Enter your complete delivery address, floor, instructions..."
              />
            </div>
          </div>

          <div className="glass-panel p-6 rounded-2xl shadow-xl border border-white/5">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-8 h-8 rounded-full bg-indigo-500/20 flex items-center justify-center text-indigo-400 font-bold border border-indigo-500/30">2</div>
              <h2 className="text-xl font-bold text-white">Payment Method</h2>
            </div>
            
            <div className="space-y-4">
              <div 
                className={`relative p-4 rounded-xl border cursor-pointer transition-all duration-300 ${paymentMethod === 'Online' ? 'bg-rose-500/10 border-rose-500/50 shadow-[0_0_15px_rgba(244,63,94,0.1)]' : 'bg-zinc-900/50 border-white/5 hover:border-white/20'}`}
                onClick={() => setPaymentMethod("Online")}
              >
                <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${paymentMethod === 'Online' ? 'bg-rose-500 text-white shadow-lg shadow-rose-500/40' : 'bg-zinc-800 text-zinc-400'}`}>
                    <FiCreditCard size={18} />
                  </div>
                  <div>
                    <h3 className={`font-bold text-sm ${paymentMethod === 'Online' ? 'text-white' : 'text-zinc-300'}`}>Razorpay Secure Checkout</h3>
                    <p className="text-xs text-zinc-500 mt-0.5 font-medium">Credit/Debit Cards, UPI, NetBanking</p>
                  </div>
                  <div className="ml-auto">
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${paymentMethod === 'Online' ? 'border-rose-500' : 'border-zinc-700'}`}>
                      {paymentMethod === 'Online' && <div className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-in zoom-in" />}
                    </div>
                  </div>
                </div>
              </div>

              <div 
                className={`relative p-4 rounded-xl border cursor-pointer transition-all duration-300 ${paymentMethod === 'COD' ? 'bg-emerald-500/10 border-emerald-500/50 shadow-[0_0_15px_rgba(16,185,129,0.1)]' : 'bg-zinc-900/50 border-white/5 hover:border-white/20'}`}
                onClick={() => setPaymentMethod("COD")}
              >
                <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${paymentMethod === 'COD' ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/40' : 'bg-zinc-800 text-zinc-400'}`}>
                    <FiDollarSign size={18} />
                  </div>
                  <div>
                    <h3 className={`font-bold text-sm ${paymentMethod === 'COD' ? 'text-white' : 'text-zinc-300'}`}>Cash on Delivery</h3>
                    <p className="text-xs text-zinc-500 mt-0.5 font-medium">Pay with cash upon arrival</p>
                  </div>
                  <div className="ml-auto">
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${paymentMethod === 'COD' ? 'border-emerald-500' : 'border-zinc-700'}`}>
                      {paymentMethod === 'COD' && <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-in zoom-in" />}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full btn-primary py-4 text-base tracking-wide flex justify-center shadow-[0_10px_30px_rgba(244,63,94,0.3)]"
          >
            {loading ? "Processing Securely..." : `Pay ₹${cart.totalAmount}`}
          </button>
        </form>

        <div className="lg:pl-8">
          <div className="glass-card rounded-2xl p-6 sticky top-24 border border-white/5">
            <h2 className="text-sm font-bold text-zinc-400 mb-6 uppercase tracking-widest border-b border-white/5 pb-4">Order Summary</h2>
            <div className="space-y-4 mb-6 max-h-[40vh] overflow-y-auto pr-2 scrollbar-hide">
              {cart.items.map((item) => {
                const food = item.foodId;
                if (!food) return null;
                return (
                  <div key={food._id} className="flex justify-between items-start text-sm">
                    <div className="flex gap-3">
                      <div className="w-12 h-12 rounded-lg bg-zinc-800 overflow-hidden flex-shrink-0 border border-white/5">
                        {food.image && <img src={food.image} alt={food.name} className="w-full h-full object-cover" />}
                      </div>
                      <div>
                        <span className="text-zinc-200 font-medium block leading-tight mb-1">{food.name}</span>
                        <span className="text-zinc-500 text-xs">Qty: {item.quantity}</span>
                      </div>
                    </div>
                    <span className="font-bold text-zinc-300">₹{food.price * item.quantity}</span>
                  </div>
                );
              })}
            </div>
            
            <div className="border-t border-white/10 pt-6 space-y-3">
              <div className="flex justify-between text-sm font-medium text-zinc-400">
                <span>Subtotal</span>
                <span>₹{cart.totalAmount}</span>
              </div>
              <div className="flex justify-between text-sm font-medium text-emerald-400">
                <span>Delivery Fee</span>
                <span>Free (Premium)</span>
              </div>
              <div className="flex justify-between text-xl font-black pt-4 border-t border-white/10 text-white mt-4">
                <span>Total</span>
                <span className="text-rose-400">₹{cart.totalAmount}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
