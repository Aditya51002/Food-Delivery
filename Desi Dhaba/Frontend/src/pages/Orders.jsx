import { useEffect, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import API from "../utils/api";
import { useCart } from "../context/CartContext";
import toast from "react-hot-toast";
import {
  FiPackage, FiClock, FiCheckCircle, FiTruck, FiXCircle,
  FiRefreshCw, FiMapPin, FiCreditCard, FiRepeat,
} from "react-icons/fi";
import { MdOutlineRestaurant } from "react-icons/md";

const PIPELINE = [
  { key: "Pending",          label: "Placed",     icon: FiClock },
  { key: "Preparing",        label: "Preparing",  icon: MdOutlineRestaurant },
  { key: "Out for Delivery", label: "On the way", icon: FiTruck },
  { key: "Delivered",        label: "Delivered",  icon: FiCheckCircle },
];

const STATUS_COLOR = {
  Pending:            { badge: "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30" },
  Confirmed:          { badge: "bg-sky-500/20 text-sky-400 border border-sky-500/30" },
  Preparing:          { badge: "bg-indigo-500/20 text-indigo-400 border border-indigo-500/30" },
  "Out for Delivery": { badge: "bg-purple-500/20 text-purple-400 border border-purple-500/30" },
  Delivered:          { badge: "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 shadow-[0_0_10px_rgba(16,185,129,0.3)]" },
  Cancelled:          { badge: "bg-red-500/20 text-red-500 border border-red-500/30" },
};

const ACTIVE_STATUSES = ["Pending", "Confirmed", "Preparing", "Out for Delivery"];

const ETACountdown = ({ estimatedDelivery, status }) => {
  const [display, setDisplay] = useState("");

  useEffect(() => {
    if (!estimatedDelivery || !ACTIVE_STATUSES.includes(status)) return;

    const tick = () => {
      const diff = new Date(estimatedDelivery) - Date.now();
      if (diff <= 0) {
        setDisplay("Arriving any moment!");
        return;
      }
      const mins = Math.floor(diff / 60_000);
      const secs = Math.floor((diff % 60_000) / 1_000);
      setDisplay(`${mins}m ${secs}s`);
    };

    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [estimatedDelivery, status]);

  if (!display) return null;

  return (
    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-rose-500/10 border border-rose-500/20 shadow-inner">
      <FiClock size={13} className="text-rose-400 animate-pulse" />
      <span className="text-xs font-black text-rose-400 tabular-nums tracking-widest uppercase">ETA: {display}</span>
    </div>
  );
};

const OrderTimeline = ({ status }) => {
  if (status === "Cancelled") {
    return (
      <div className="flex items-center space-x-3 py-4 px-5 rounded-2xl bg-red-500/10 border border-red-500/20">
        <FiXCircle size={20} className="text-red-500 flex-shrink-0" />
        <span className="text-sm font-bold text-red-400">This order was cancelled</span>
      </div>
    );
  }

  const currentIdx = PIPELINE.findIndex((s) => s.key === status);

  return (
    <div className="relative flex items-start justify-between py-4 px-2 overflow-x-auto scrollbar-hide">
      <div className="absolute top-[28px] left-10 right-10 h-1 bg-zinc-800 rounded-full" />
      <div
        className="absolute top-[28px] left-10 h-1 rounded-full transition-all duration-1000 shadow-[0_0_10px_rgba(244,63,94,0.5)]"
        style={{
          background: "linear-gradient(90deg, #f59e0b, #f43f5e)",
          width: currentIdx === -1 ? "0%" : `${(currentIdx / (PIPELINE.length - 1)) * 84}%`,
          maxWidth: "84%",
        }}
      />
      {PIPELINE.map((step, idx) => {
        const done = idx <= currentIdx;
        const active = idx === currentIdx;
        const Icon = step.icon;
        const isOnTheWay = active && step.key === "Out for Delivery";
        return (
          <div key={step.key} className="relative flex flex-col items-center z-10 flex-1 min-w-[70px] px-1 group">
            <div
              className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-500 shadow-xl ${
                isOnTheWay ? "animate-pulse shadow-[0_0_20px_rgba(244,63,94,0.6)]" : ""
              } ${active ? "scale-110" : ""}`}
              style={{
                background: done
                  ? active ? "linear-gradient(135deg, #f59e0b, #f43f5e)" : "#f43f5e"
                  : "#27272a",
                border: active ? "3px solid #18181b" : `2px solid ${done ? "#be123c" : "#3f3f46"}`,
                boxShadow: active ? "0 0 0 4px rgba(244,63,94,0.3)" : "none",
              }}
            >
              <Icon size={18} color={done ? "#fff" : "#71717a"} />
            </div>
            <p
              className="mt-3 text-center leading-tight tracking-wider uppercase transition-colors"
              style={{
                fontSize: "10px",
                fontWeight: active ? 900 : done ? 700 : 600,
                color: active ? "#f43f5e" : done ? "#a1a1aa" : "#52525b",
              }}
            >
              {step.label}
            </p>
          </div>
        );
      })}
    </div>
  );
};

const ReorderButton = ({ orderId, onReorder }) => {
  const [loading, setLoading] = useState(false);

  const handleClick = async () => {
    setLoading(true);
    try {
      await onReorder(orderId);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleClick}
      disabled={loading}
      className="flex items-center gap-1.5 text-xs font-bold text-rose-400 border border-rose-500/30 hover:bg-rose-500 hover:text-white px-4 py-2 rounded-xl transition-all duration-300 disabled:opacity-60 shadow-sm"
    >
      <FiRepeat size={14} className={loading ? "animate-spin" : ""} />
      <span>{loading ? "Adding…" : "Reorder"}</span>
    </button>
  );
};

const OrderSkeleton = () => (
  <div className="space-y-6 animate-pulse">
    {[1, 2, 3].map((i) => (
      <div key={i} className="glass-card overflow-hidden rounded-3xl">
        <div className="px-6 pt-6 pb-4 flex justify-between">
          <div className="space-y-3">
            <div className="h-4 bg-zinc-800 rounded w-32" />
            <div className="h-3 bg-zinc-800 rounded w-24" />
          </div>
          <div className="h-8 bg-zinc-800 rounded-full w-24" />
        </div>
        <div className="px-6 pb-6 space-y-3">
          <div className="h-3 bg-zinc-800 rounded w-full" />
          <div className="h-3 bg-zinc-800 rounded w-3/4" />
        </div>
      </div>
    ))}
  </div>
);

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const { fetchCart } = useCart();

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await API.get("/orders/user");
      setOrders(Array.isArray(data) ? data : data.orders ?? []);
    } catch {
      setOrders([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchOrders(); }, [fetchOrders]);

  const handleReorder = async (orderId) => {
    try {
      await API.post(`/orders/${orderId}/reorder`);
      await fetchCart();
      toast.success("Items added to cart! 🛒", { duration: 2500, style: { background: '#18181b', color: '#fff', border: '1px solid #3f3f46' } });
    } catch {
      toast.error("Some items may no longer be available");
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-12 min-h-screen">
      <div className="flex items-end justify-between mb-10 border-b border-white/10 pb-4">
        <div>
          <h1 className="text-3xl font-black text-white tracking-tight">Order Journey</h1>
          {!loading && orders.length > 0 && (
            <p className="text-sm text-zinc-500 mt-1 font-bold uppercase tracking-widest">{orders.length} order{orders.length > 1 ? "s" : ""} history</p>
          )}
        </div>
        <button
          onClick={fetchOrders}
          className="flex items-center space-x-2 text-sm text-zinc-400 hover:text-white bg-zinc-900 border border-white/5 hover:border-white/20 px-4 py-2 rounded-xl transition shadow-lg"
        >
          <FiRefreshCw size={14} className={loading ? "animate-spin text-rose-500" : ""} />
          <span className="font-semibold">Refresh</span>
        </button>
      </div>

      {loading ? (
        <OrderSkeleton />
      ) : orders.length === 0 ? (
        <div className="glass-panel text-center py-24 rounded-3xl border border-white/5">
          <div className="w-24 h-24 rounded-full bg-zinc-800 flex items-center justify-center mx-auto mb-6 shadow-inner">
            <FiPackage size={40} className="text-zinc-500" />
          </div>
          <h2 className="text-2xl font-black text-white mb-2">No masterclasses ordered yet</h2>
          <p className="text-zinc-400 mb-8 font-medium">Your culinary journey awaits. Begin exploring our exclusive menus.</p>
          <Link
            to="/"
            className="btn-primary inline-block px-8 py-3.5 text-base shadow-[0_10px_30px_rgba(244,63,94,0.3)]"
          >
            Discover Menus
          </Link>
        </div>
      ) : (
        <div className="space-y-8">
          {orders.map((order) => {
            const sc = STATUS_COLOR[order.status] ?? { badge: "bg-zinc-800 text-zinc-300 border border-zinc-700" };
            const isActive = ACTIVE_STATUSES.includes(order.status);
            const isDelivered = order.status === "Delivered";

            return (
              <div
                key={order._id}
                className={`glass-card rounded-3xl overflow-hidden transition-all duration-300 border ${
                  isActive ? "border-rose-500/30 shadow-[0_0_30px_rgba(244,63,94,0.1)]" : "border-white/5"
                }`}
              >
                <div className="px-6 sm:px-8 pt-6 pb-5 flex flex-wrap justify-between items-start gap-4">
                  <div>
                    <Link
                      to={`/orders/${order._id}`}
                      className="text-sm font-mono font-black text-rose-400 hover:text-rose-300 transition-colors tracking-widest drop-shadow-md"
                    >
                      #{order._id.slice(-8).toUpperCase()}
                    </Link>
                    <div className="flex items-center text-xs text-zinc-500 mt-1 space-x-1.5 font-medium">
                      <FiClock size={12} className="text-indigo-400" />
                      <span>{new Date(order.createdAt).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 flex-wrap">
                    {isActive && (
                      <ETACountdown
                        estimatedDelivery={order.estimatedDelivery}
                        status={order.status}
                      />
                    )}
                    <span className={`px-4 py-1.5 rounded-full text-[10px] font-black tracking-widest uppercase ${sc.badge}`}>
                      {order.status}
                    </span>
                  </div>
                </div>

                <div className="px-4 sm:px-6 pb-4">
                  <OrderTimeline status={order.status} />
                </div>

                <div className="mx-6 sm:mx-8 border-t border-white/5" />

                <div className="px-6 sm:px-8 py-5 space-y-2">
                  {order.items.map((item, idx) => (
                    <div key={idx} className="flex justify-between items-center text-sm group">
                      <span className="text-zinc-300 font-medium group-hover:text-white transition-colors">
                        {item.name} <span className="text-zinc-600 font-bold ml-1">× {item.quantity}</span>
                      </span>
                      <span className="font-bold text-zinc-100 bg-zinc-900 px-3 py-1 rounded-lg border border-white/5">₹{item.price * item.quantity}</span>
                    </div>
                  ))}
                </div>

                <div className="flex flex-wrap items-center justify-between gap-4 px-6 sm:px-8 py-5 bg-zinc-950/50 border-t border-white/5">
                  <div className="text-xs text-zinc-400 space-y-1.5 font-medium">
                    <p className="flex items-center gap-2">
                      <FiMapPin size={12} className="text-emerald-400" /> <span className="truncate max-w-[200px] sm:max-w-xs">{order.deliveryAddress}</span>
                    </p>
                    <p className="flex items-center gap-2">
                      <FiCreditCard size={12} className="text-indigo-400" /> {order.paymentMethod} Payment
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    {isDelivered && (
                      <ReorderButton orderId={order._id} onReorder={handleReorder} />
                    )}
                    <div className="text-right">
                      <p className="text-xs text-zinc-500 font-bold uppercase tracking-widest mb-0.5">Total</p>
                      <p className="text-2xl font-black text-rose-400 drop-shadow-[0_0_10px_rgba(244,63,94,0.3)]">₹{order.totalAmount}</p>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Orders;
