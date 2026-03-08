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

/* ── Status config ───────────────────────────── */
const PIPELINE = [
  { key: "Pending",          label: "Placed",     icon: FiClock },
  { key: "Preparing",        label: "Preparing",  icon: MdOutlineRestaurant },
  { key: "Out for Delivery", label: "On the way", icon: FiTruck },
  { key: "Delivered",        label: "Delivered",  icon: FiCheckCircle },
];

const STATUS_COLOR = {
  Pending:            { badge: "bg-yellow-100 text-yellow-800" },
  Confirmed:          { badge: "bg-sky-100 text-sky-800" },
  Preparing:          { badge: "bg-blue-100 text-blue-800" },
  "Out for Delivery": { badge: "bg-purple-100 text-purple-800" },
  Delivered:          { badge: "bg-green-100 text-green-800" },
  Cancelled:          { badge: "bg-red-100 text-red-800" },
};

const ACTIVE_STATUSES = ["Pending", "Confirmed", "Preparing", "Out for Delivery"];

/* ── Live ETA Countdown ──────────────────────── */
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
    <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-orange-50 border border-orange-100">
      <FiClock size={13} className="text-orange-500 animate-pulse" />
      <span className="text-xs font-bold text-orange-700 tabular-nums">ETA: {display}</span>
    </div>
  );
};

/* ── Order Timeline Strip ────────────────────── */
const OrderTimeline = ({ status }) => {
  if (status === "Cancelled") {
    return (
      <div className="flex items-center space-x-2 py-3 px-4 rounded-xl bg-red-50 border border-red-100">
        <FiXCircle size={18} className="text-red-500 flex-shrink-0" />
        <span className="text-sm font-medium text-red-600">This order was cancelled</span>
      </div>
    );
  }

  const currentIdx = PIPELINE.findIndex((s) => s.key === status);

  return (
    <div className="relative flex items-start justify-between py-3 px-2 overflow-x-auto">
      {/* Background connector */}
      <div className="absolute top-[22px] left-8 right-8 h-px" style={{ background: "#e5e7eb" }} />
      {/* Progress fill */}
      <div
        className="absolute top-[22px] left-8 h-px transition-all duration-700"
        style={{
          background: "linear-gradient(90deg, #f97316, #ea580c)",
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
          <div key={step.key} className="relative flex flex-col items-center z-10 flex-1 min-w-0 px-1">
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 ${
                isOnTheWay ? "animate-pulse" : ""
              }`}
              style={{
                background: done
                  ? active ? "linear-gradient(135deg, #f97316, #ea580c)" : "#fed7aa"
                  : "#f3f4f6",
                border: active ? "3px solid #f97316" : `2px solid ${done ? "#fed7aa" : "#e5e7eb"}`,
                boxShadow: active ? "0 0 0 4px #fde7cd" : "none",
              }}
            >
              <Icon size={16} color={done ? (active ? "#fff" : "#c2410c") : "#9ca3af"} />
            </div>
            <p
              className="mt-1.5 text-center leading-tight"
              style={{
                fontSize: "10px",
                fontWeight: active ? 700 : done ? 600 : 400,
                color: active ? "#c2410c" : done ? "#6b7280" : "#9ca3af",
                whiteSpace: "nowrap",
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

/* ── Reorder Button ──────────────────────────── */
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
      className="flex items-center gap-1.5 text-xs font-semibold text-orange-600 border border-orange-200 hover:bg-orange-50 hover:border-orange-400 px-3 py-1.5 rounded-lg transition-all duration-150 disabled:opacity-60"
    >
      <FiRepeat size={13} className={loading ? "animate-spin" : ""} />
      <span>{loading ? "Adding…" : "Reorder"}</span>
    </button>
  );
};

/* ── Order Skeleton ──────────────────────────── */
const OrderSkeleton = () => (
  <div className="space-y-5 animate-pulse">
    {[1, 2, 3].map((i) => (
      <div key={i} className="bg-white rounded-2xl shadow-sm overflow-hidden">
        <div className="px-6 pt-5 pb-4 flex justify-between">
          <div className="space-y-2">
            <div className="h-3 bg-gray-200 rounded w-28" />
            <div className="h-3 bg-gray-200 rounded w-20" />
          </div>
          <div className="h-6 bg-gray-200 rounded-full w-20" />
        </div>
        <div className="px-6 pb-5 space-y-2">
          <div className="h-3 bg-gray-100 rounded w-full" />
          <div className="h-3 bg-gray-100 rounded w-3/4" />
        </div>
      </div>
    ))}
  </div>
);

/* ── Orders Page ─────────────────────────────── */
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
      toast.success("Items added to cart! 🛒", { duration: 2500 });
    } catch {
      toast.error("Some items may no longer be available");
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">My Orders</h1>
          {!loading && orders.length > 0 && (
            <p className="text-sm text-gray-400 mt-0.5">{orders.length} order{orders.length > 1 ? "s" : ""} total</p>
          )}
        </div>
        <button
          onClick={fetchOrders}
          className="flex items-center space-x-1.5 text-sm text-gray-500 hover:text-orange-600 border border-gray-200 hover:border-orange-300 px-3 py-1.5 rounded-lg transition"
        >
          <FiRefreshCw size={14} />
          <span>Refresh</span>
        </button>
      </div>

      {loading ? (
        <OrderSkeleton />
      ) : orders.length === 0 ? (
        <div className="text-center py-16">
          <FiPackage size={64} className="mx-auto text-gray-300 mb-4" />
          <h2 className="text-xl font-semibold text-gray-600 mb-1">No orders yet</h2>
          <p className="text-gray-400 mb-6">Your order history will appear here.</p>
          <Link
            to="/"
            className="inline-block bg-orange-600 text-white px-6 py-2.5 rounded-xl font-semibold hover:bg-orange-700 transition text-sm"
          >
            Browse Restaurants
          </Link>
        </div>
      ) : (
        <div className="space-y-5">
          {orders.map((order) => {
            const sc = STATUS_COLOR[order.status] ?? { badge: "bg-gray-100 text-gray-800" };
            const isActive = ACTIVE_STATUSES.includes(order.status);
            const isDelivered = order.status === "Delivered";

            return (
              <div
                key={order._id}
                className={`bg-white rounded-2xl shadow-md overflow-hidden transition-shadow hover:shadow-lg ${
                  isActive ? "ring-1 ring-orange-100" : ""
                }`}
              >
                {/* Card header */}
                <div className="px-6 pt-5 pb-4 flex flex-wrap justify-between items-start gap-3">
                  <div>
                    <p className="text-xs text-gray-400 font-mono font-semibold tracking-wider">
                      #{order._id.slice(-8).toUpperCase()}
                    </p>
                    <div className="flex items-center text-xs text-gray-500 mt-0.5 space-x-1">
                      <FiClock size={11} />
                      <span>{new Date(order.createdAt).toLocaleString()}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-wrap">
                    {isActive && (
                      <ETACountdown
                        estimatedDelivery={order.estimatedDelivery}
                        status={order.status}
                      />
                    )}
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${sc.badge}`}>
                      {order.status}
                    </span>
                  </div>
                </div>

                {/* Timeline */}
                <div className="px-4 pb-2">
                  <OrderTimeline status={order.status} />
                </div>

                <div className="mx-6 border-t border-gray-100" />

                {/* Items */}
                <div className="px-6 py-4 space-y-1.5">
                  {order.items.map((item, idx) => (
                    <div key={idx} className="flex justify-between text-sm">
                      <span className="text-gray-600">
                        {item.name} <span className="text-gray-400">× {item.quantity}</span>
                      </span>
                      <span className="font-medium text-gray-700">₹{item.price * item.quantity}</span>
                    </div>
                  ))}
                </div>

                {/* Footer */}
                <div
                  className="flex flex-wrap items-center justify-between gap-3 px-6 py-4 rounded-bl-2xl rounded-br-2xl"
                  style={{ background: "#fafafa", borderTop: "1px solid #f3f4f6" }}
                >
                  <div className="text-xs text-gray-500 space-y-0.5">
                    <p className="flex items-center gap-1">
                      <FiMapPin size={11} /> {order.deliveryAddress}
                    </p>
                    <p className="flex items-center gap-1">
                      <FiCreditCard size={11} /> {order.paymentMethod}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    {isDelivered && (
                      <ReorderButton orderId={order._id} onReorder={handleReorder} />
                    )}
                    <p className="text-lg font-bold text-orange-600">₹{order.totalAmount}</p>
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

/*  Status pipeline  */
const PIPELINE = [
  { key: "Pending",          label: "Placed",        icon: FiClock },
  { key: "Preparing",        label: "Preparing",     icon: MdOutlineRestaurant },
  { key: "Out for Delivery", label: "On the way",    icon: FiTruck },
  { key: "Delivered",        label: "Delivered",     icon: FiCheckCircle },
];

const STATUS_COLOR = {
  Pending:            { badge: "bg-yellow-100 text-yellow-800" },
  Preparing:          { badge: "bg-blue-100 text-blue-800" },
  "Out for Delivery": { badge: "bg-purple-100 text-purple-800" },
  Delivered:          { badge: "bg-green-100 text-green-800" },
  Cancelled:          { badge: "bg-red-100 text-red-800" },
};

/*  Order Timeline Strip  */
const OrderTimeline = ({ status }) => {
  if (status === "Cancelled") {
    return (
      <div className="flex items-center space-x-2 py-3 px-4 rounded-xl bg-red-50 border border-red-100">
        <FiXCircle size={18} className="text-red-500 flex-shrink-0" />
        <span className="text-sm font-medium text-red-600">This order was cancelled</span>
      </div>
    );
  }

  const currentIdx = PIPELINE.findIndex((s) => s.key === status);

  return (
    <div className="relative flex items-start justify-between py-3 px-2 overflow-x-auto">
      {/* connector line */}
      <div className="absolute top-[22px] left-8 right-8 h-px" style={{ background: "#e5e7eb" }} />
      <div
        className="absolute top-[22px] left-8 h-px transition-all duration-700"
        style={{
          background: "linear-gradient(90deg, #f97316, #ea580c)",
          width: currentIdx === -1 ? "0%" : `${(currentIdx / (PIPELINE.length - 1)) * 84}%`,
          maxWidth: "84%",
        }}
      />

      {PIPELINE.map((step, idx) => {
        const done = idx <= currentIdx;
        const active = idx === currentIdx;
        const Icon = step.icon;

        return (
          <div key={step.key} className="relative flex flex-col items-center z-10 flex-1 min-w-0 px-1">
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300"
              style={{
                background: done
                  ? active
                    ? "linear-gradient(135deg, #f97316, #ea580c)"
                    : "#fed7aa"
                  : "#f3f4f6",
                border: active ? "3px solid #f97316" : "2px solid " + (done ? "#fed7aa" : "#e5e7eb"),
                boxShadow: active ? "0 0 0 4px #fde7cd" : "none",
              }}
            >
              <Icon size={16} color={done ? (active ? "#fff" : "#c2410c") : "#9ca3af"} />
            </div>
            <p
              className="mt-1.5 text-center leading-tight"
              style={{
                fontSize: "10px",
                fontWeight: active ? 700 : done ? 600 : 400,
                color: active ? "#c2410c" : done ? "#6b7280" : "#9ca3af",
                whiteSpace: "nowrap",
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

/*  Orders Page  */
const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const { data } = await API.get("/orders/user");
      setOrders(data);
    } catch {
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-orange-500" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-gray-800">My Orders</h1>
        <button
          onClick={fetchOrders}
          className="flex items-center space-x-1.5 text-sm text-gray-500 hover:text-orange-600 border border-gray-200 hover:border-orange-300 px-3 py-1.5 rounded-lg transition"
        >
          <FiRefreshCw size={14} />
          <span>Refresh</span>
        </button>
      </div>

      {orders.length === 0 ? (
        <div className="text-center py-16">
          <FiPackage size={64} className="mx-auto text-gray-300 mb-4" />
          <h2 className="text-xl font-semibold text-gray-600">No orders yet</h2>
          <p className="text-gray-400">Your order history will appear here.</p>
        </div>
      ) : (
        <div className="space-y-5">
          {orders.map((order) => {
            const sc = STATUS_COLOR[order.status] || { dot: "#9ca3af", badge: "bg-gray-100 text-gray-800" };
            return (
              <div key={order._id} className="bg-white rounded-2xl shadow-md overflow-hidden">
                {/*  Card header  */}
                <div className="px-6 pt-5 pb-4 flex flex-wrap justify-between items-start gap-3">
                  <div>
                    <p className="text-xs text-gray-400 font-mono font-medium">
                      Order #{order._id.slice(-8).toUpperCase()}
                    </p>
                    <div className="flex items-center text-xs text-gray-500 mt-0.5 space-x-1">
                      <FiClock size={12} />
                      <span>{new Date(order.createdAt).toLocaleString()}</span>
                    </div>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${sc.badge}`}>
                    {order.status}
                  </span>
                </div>

                {/*  Timeline  */}
                <div className="px-4 pb-2">
                  <OrderTimeline status={order.status} />
                </div>

                {/*  Divider  */}
                <div className="mx-6 border-t border-gray-100" />

                {/*  Items  */}
                <div className="px-6 py-4 space-y-1.5">
                  {order.items.map((item, idx) => (
                    <div key={idx} className="flex justify-between text-sm">
                      <span className="text-gray-600">
                        {item.name}{" "}<span className="text-gray-400">x {item.quantity}</span>
                      </span>
                      <span className="font-medium text-gray-700">&#8377;{item.price * item.quantity}</span>
                    </div>
                  ))}
                </div>

                {/*  Footer  */}
                <div
                  className="flex flex-wrap items-center justify-between gap-2 px-6 py-4 rounded-bl-2xl rounded-br-2xl"
                  style={{ background: "#fafafa", borderTop: "1px solid #f3f4f6" }}
                >
                  <div className="text-xs text-gray-500 space-y-0.5">
                    <p className="flex items-center gap-1"><FiMapPin size={11} /> {order.deliveryAddress}</p>
                    <p className="flex items-center gap-1"><FiCreditCard size={11} /> {order.paymentMethod}</p>
                  </div>
                  <p className="text-lg font-bold text-orange-600">&#8377;{order.totalAmount}</p>
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
