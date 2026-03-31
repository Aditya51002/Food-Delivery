import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import API from "../utils/api";
import { io } from "socket.io-client";
import toast from "react-hot-toast";
import {
  FiArrowLeft, FiClock, FiCheckCircle, FiTruck, FiXCircle,
  FiMapPin, FiCreditCard, FiAlertTriangle, FiStar
} from "react-icons/fi";
import { MdOutlineRestaurant } from "react-icons/md";
import ReviewModal from "../components/ReviewModal";

const SOCKET_URL = import.meta.env.VITE_API_URL?.replace("/api/v1", "") || "http://localhost:5000";

const PIPELINE = [
  { key: "Pending",          label: "Placed",     icon: FiClock },
  { key: "Preparing",        label: "Preparing",  icon: MdOutlineRestaurant },
  { key: "Out for Delivery", label: "On the way", icon: FiTruck },
  { key: "Delivered",        label: "Delivered",  icon: FiCheckCircle },
];

const OrderDetail = () => {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isReviewOpen, setIsReviewOpen] = useState(false);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const { data } = await API.get(`/orders/${id}`);
        setOrder(data);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load order");
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [id]);

  useEffect(() => {
    if (!order || order.status === "Delivered" || order.status === "Cancelled") return;

    const socket = io(SOCKET_URL, {
      withCredentials: true,
      transports: ["websocket", "polling"],
    });

    socket.on("connect", () => {
      socket.emit("join_order", order._id);
    });

    socket.on("order:updated", (data) => {
      toast.success(`Order status updated to: ${data.status} 🔔`, { duration: 4000, style: { background: '#18181b', color: '#fff', border: '1px solid #3f3f46' } });
      setOrder((prev) => ({
        ...prev,
        status: data.status,
        paymentStatus: data.paymentStatus,
        timeline: data.timeline,
      }));
    });

    return () => {
      socket.disconnect();
    };
  }, [order?._id, order?.status]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-10 w-10 border-4 border-zinc-800 border-t-rose-500 shadow-[0_0_15px_rgba(244,63,94,0.5)]" />
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-24 text-center">
        <div className="w-24 h-24 rounded-full bg-red-500/10 flex items-center justify-center mx-auto mb-6 border border-red-500/20">
          <FiAlertTriangle size={48} className="text-red-500" />
        </div>
        <h2 className="text-3xl font-black text-white mb-2 tracking-tight">Order Not Found</h2>
        <p className="text-zinc-500 mb-8 font-medium">{error}</p>
        <Link to="/orders" className="btn-primary inline-flex px-8 py-3.5 text-base shadow-lg">
          Return to Orders
        </Link>
      </div>
    );
  }

  const currentIdx = PIPELINE.findIndex((s) => s.key === order.status);
  const isCancelled = order.status === "Cancelled";

  return (
    <div className="max-w-5xl mx-auto px-4 py-12 min-h-screen">
      <div className="mb-8 flex justify-between items-center bg-zinc-900/40 p-3 rounded-2xl border border-white/5 backdrop-blur-md">
        <Link to="/orders" className="inline-flex items-center px-4 py-2 text-sm font-bold text-zinc-400 hover:text-white bg-zinc-800 hover:bg-zinc-700 rounded-xl transition border border-white/5 shadow-sm">
          <FiArrowLeft className="mr-2" /> Back
        </Link>
        {order.status === "Delivered" && (
          <button
            onClick={() => setIsReviewOpen(true)}
            className="inline-flex items-center px-5 py-2 bg-indigo-500/10 border border-indigo-500/30 rounded-xl shadow-inner text-sm font-bold text-indigo-400 hover:bg-indigo-500 hover:text-white transition"
          >
            <FiStar className="mr-2" /> Rate Masterclass
          </button>
        )}
      </div>

      {isReviewOpen && (
        <ReviewModal
          isOpen={isReviewOpen}
          onClose={() => setIsReviewOpen(false)}
          targetType="restaurant"
          targetId={order.restaurantId}
          orderId={order._id}
        />
      )}

      <div className="flex flex-col lg:flex-row gap-8">
        <div className="flex-1 space-y-8">
          
          <div className="glass-panel p-6 sm:p-10 rounded-3xl border border-white/5 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-rose-500/5 blur-[100px] rounded-full pointer-events-none -translate-y-1/2 translate-x-1/2" />
            
            <h1 className="text-3xl sm:text-4xl font-black text-white mb-2 tracking-tight relative z-10">
              Order <span className="text-rose-500 drop-shadow-md">#{order._id.slice(-8).toUpperCase()}</span>
            </h1>
            <p className="text-sm text-zinc-400 mb-10 font-medium tracking-wide relative z-10">
              Placed on {new Date(order.createdAt).toLocaleString(undefined, { dateStyle: 'full', timeStyle: 'short' })}
            </p>

            {isCancelled ? (
              <div className="bg-red-500/10 text-red-400 p-5 rounded-2xl border border-red-500/20 flex items-center mb-8 shadow-inner relative z-10">
                <FiXCircle size={24} className="mr-4 flex-shrink-0" />
                <div>
                  <p className="font-extrabold tracking-wide uppercase">Order Cancelled</p>
                  <p className="text-sm mt-1 text-red-400/80">{order.cancelReason || "Cancelled by system"}</p>
                </div>
              </div>
            ) : (
              <div className="relative mb-16 mt-6 px-4 sm:px-8 relative z-10">
                <div className="absolute top-6 left-12 right-12 h-1.5 bg-zinc-800 rounded-full" />
                <div
                  className="absolute top-6 left-12 h-1.5 rounded-full transition-all duration-1000 shadow-[0_0_15px_rgba(244,63,94,0.6)]"
                  style={{ 
                    background: "linear-gradient(90deg, #f59e0b, #f43f5e)",
                    width: currentIdx > 0 ? `${(currentIdx / (PIPELINE.length - 1)) * 100}%` : "0%" 
                  }}
                />
                
                <div className="flex justify-between relative z-10 w-full">
                  {PIPELINE.map((step, idx) => {
                    const done = idx <= currentIdx;
                    const active = idx === currentIdx;
                    const Icon = step.icon;
                    return (
                      <div key={step.key} className="flex flex-col items-center group">
                        <div
                          className={`w-14 h-14 rounded-full flex items-center justify-center transition-all duration-500 shadow-xl ${
                            active && step.key === "Out for Delivery" ? "animate-pulse" : ""
                          } ${active ? "scale-110" : "scale-100"}`}
                          style={{
                            background: done ? (active ? "linear-gradient(135deg, #f59e0b, #f43f5e)" : "#f43f5e") : "#27272a",
                            border: done ? "4px solid #18181b" : "4px solid #18181b",
                            color: done ? "#fff" : "#71717a",
                            boxShadow: active ? "0 0 0 4px rgba(244,63,94,0.3)" : "none",
                          }}
                        >
                          <Icon size={22} className={done ? "drop-shadow-md" : ""} />
                        </div>
                        <span className={`text-xs mt-4 font-black tracking-widest uppercase whitespace-nowrap transition-colors ${active ? "text-rose-400" : done ? "text-zinc-200" : "text-zinc-600"}`}>
                          {step.label}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            <div className="relative z-10 pt-4 border-t border-white/5">
              <h3 className="text-sm font-black text-white uppercase tracking-widest mb-6 flex items-center gap-2">
                <FiClock className="text-rose-500" /> Activity Log
              </h3>
              <div className="space-y-6">
                {[...order.timeline].reverse().map((t, idx) => (
                  <div key={idx} className="flex gap-5 group">
                    <div className="flex flex-col items-center">
                      <div className="w-3 h-3 rounded-full bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.5)] mt-1 mb-1 transition-transform group-hover:scale-125" />
                      {idx !== order.timeline.length - 1 && <div className="w-px h-full bg-zinc-800" />}
                    </div>
                    <div className="pb-2">
                      <p className="text-sm font-extrabold text-zinc-100 tracking-wide">{t.status}</p>
                      <p className="text-xs text-zinc-400 mt-1 font-medium">{t.note}</p>
                      <p className="text-[10px] text-zinc-600 mt-1.5 font-bold uppercase tracking-wider">{new Date(t.timestamp).toLocaleString()}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="glass-card p-6 sm:p-10 rounded-3xl border border-white/5 shadow-2xl">
            <h3 className="text-xl font-black text-white mb-6 border-b border-white/10 pb-4">Order Breakdown</h3>
            <div className="space-y-6">
              {order.items.map((item, idx) => (
                <div key={idx} className="flex gap-5 items-center p-3 rounded-2xl bg-zinc-900/50 border border-white/5 hover:bg-zinc-800 transition-colors">
                  <div className="w-20 h-20 rounded-xl bg-zinc-800 flex-shrink-0 overflow-hidden shadow-inner">
                    <img
                      src={item.image || "https://placehold.co/100?text=Food"}
                      alt={item.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-start mb-1">
                      <h4 className="font-bold text-zinc-100 text-base">{item.name}</h4>
                      <span className="font-black text-white text-lg bg-zinc-900 px-3 py-1 rounded-lg border border-white/5 shadow-inner">₹{item.price * item.quantity}</span>
                    </div>
                    <p className="text-sm text-zinc-500 font-medium">Qty: <span className="text-zinc-300 font-bold">{item.quantity}</span> <span className="mx-1">•</span> ₹{item.price} each</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="w-full lg:w-96 space-y-8">
          <div className="glass-panel p-8 rounded-3xl border border-white/5 shadow-2xl">
            <h3 className="text-sm font-black text-zinc-400 uppercase tracking-widest mb-6">Delivery Details</h3>
            <div className="flex items-start gap-4 mb-6 text-sm text-zinc-300">
              <div className="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center flex-shrink-0 border border-emerald-500/20 shadow-inner">
                <FiMapPin className="text-emerald-400" size={18} />
              </div>
              <p className="leading-relaxed pt-2 font-medium">{order.deliveryAddress}</p>
            </div>
            {order.orderNote && (
              <div className="bg-zinc-900/80 p-4 rounded-xl border border-zinc-700 text-sm italic text-zinc-400 shadow-inner mt-4">
                "{order.orderNote}"
              </div>
            )}
            
            <div className="my-8 h-px bg-white/10" />
            
            <h3 className="text-sm font-black text-zinc-400 uppercase tracking-widest mb-6">Payment Info</h3>
            <div className="flex justify-between items-center text-sm mb-4">
              <span className="text-zinc-500 flex items-center gap-2 font-medium">
                <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center border border-zinc-700 shadow-inner"><FiCreditCard size={14} className="text-indigo-400" /></div>
                Method
              </span>
              <span className="font-bold text-zinc-100 bg-zinc-900 px-3 py-1.5 rounded-lg border border-white/5">{order.paymentMethod}</span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-zinc-500 flex items-center gap-2 font-medium">
                <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center border border-zinc-700 shadow-inner">
                  <span className={`w-2.5 h-2.5 rounded-full ${order.paymentStatus === 'Paid' ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]' : 'bg-yellow-500 shadow-[0_0_8px_rgba(250,204,21,0.8)]'}`} />
                </div>
                Status
              </span>
              <span className="font-bold text-zinc-100 uppercase tracking-wider text-xs">{order.paymentStatus}</span>
            </div>
          </div>

          <div className="glass-card p-8 rounded-3xl border border-white/5 shadow-2xl sticky top-24">
            <h3 className="text-sm font-black text-zinc-400 uppercase tracking-widest mb-6">Billing</h3>
            <div className="space-y-4 text-sm text-zinc-400 font-medium">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span className="font-bold text-zinc-200">₹{order.subtotal}</span>
              </div>
              <div className="flex justify-between hover:text-emerald-400 transition-colors">
                <span>Premium Delivery</span>
                <span className="font-bold">{order.deliveryFee === 0 ? "Complimentary" : `₹${order.deliveryFee}`}</span>
              </div>
              <div className="flex justify-between">
                <span>Taxes & Fees</span>
                <span className="font-bold text-zinc-200">₹{order.taxAmount}</span>
              </div>
              {order.discount > 0 && (
                <div className="flex justify-between text-emerald-400">
                  <span>Courtesy Discount {order.couponCode ? `(${order.couponCode})` : ""}</span>
                  <span className="font-black">-₹{order.discount}</span>
                </div>
              )}
            </div>
            <div className="my-6 h-px bg-white/10" />
            <div className="flex justify-between items-end">
              <div>
                <span className="font-black text-white text-lg block leading-none">Total</span>
                <span className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold mt-1 block">Paid in Full</span>
              </div>
              <span className="text-3xl font-black text-rose-500 drop-shadow-[0_0_15px_rgba(244,63,94,0.4)]">₹{order.totalAmount}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetail;
