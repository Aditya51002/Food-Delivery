import { useEffect, useState } from "react";
import API from "../../utils/api";
import toast from "react-hot-toast";
import { FiClock, FiMapPin, FiCreditCard } from "react-icons/fi";

const statusOptions = ["Pending", "Confirmed", "Preparing", "Out for Delivery", "Delivered", "Cancelled"];

const statusColors = {
  Pending: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20 shadow-[0_0_10px_rgba(250,204,21,0.1)]",
  Confirmed: "bg-sky-500/10 text-sky-400 border-sky-500/20",
  Preparing: "bg-indigo-500/10 text-indigo-400 border-indigo-500/20",
  "Out for Delivery": "bg-purple-500/10 text-purple-400 border-purple-500/20 shadow-[0_0_10px_rgba(168,85,247,0.1)]",
  Delivered: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30 shadow-[0_0_15px_rgba(16,185,129,0.2)]",
  Cancelled: "bg-red-500/10 text-red-500 border-red-500/20",
};

const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState("All");

  const fetchOrders = async () => {
    try {
      const { data } = await API.get("/orders/admin");
      const normalized = Array.isArray(data) ? data : data?.orders || [];
      setOrders(normalized);
    } catch {
      toast.error("Failed to load orders");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      await API.patch(`/orders/${orderId}/status`, { status: newStatus });
      toast.success(`Order status updated to ${newStatus}`, { style: { background: '#18181b', color: '#fff' }});
      fetchOrders();
    } catch {
      toast.error("Failed to update status");
    }
  };

  const filteredOrders = filterStatus === "All" ? orders : orders.filter((o) => o.status === filterStatus);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-10 w-10 border-4 border-zinc-800 border-t-rose-500 shadow-[0_0_15px_rgba(244,63,94,0.5)]" />
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-8 max-w-7xl mx-auto min-h-[80vh]">
      <div className="mb-8 border-b border-white/10 pb-5">
        <h1 className="text-3xl font-black text-white tracking-tight">Orders Management</h1>
        <p className="text-sm font-bold text-zinc-500 uppercase tracking-widest mt-1">Gourmet Fulfillment</p>
      </div>

      <div className="flex flex-wrap gap-3 mb-8 bg-zinc-900/40 p-3 rounded-2xl border border-white/5 backdrop-blur-md">
        {["All", ...statusOptions].map((status) => {
          const count = status === "All" ? orders.length : orders.filter((o) => o.status === status).length;
          const isActive = filterStatus === status;
          return (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all duration-300 uppercase tracking-wider ${
                isActive
                  ? "btn-primary shadow-[0_0_15px_rgba(244,63,94,0.3)]"
                  : "glass-card text-zinc-400 hover:text-white hover:bg-zinc-800"
              }`}
            >
              <span>{status}</span>
              <span className={`px-2 py-0.5 rounded-md text-[10px] ${isActive ? "bg-black/30 text-white" : "bg-zinc-800 text-zinc-500"}`}>
                {count}
              </span>
            </button>
          )
        })}
      </div>

      {filteredOrders.length === 0 ? (
        <div className="glass-panel text-center py-20 rounded-3xl border border-white/5">
           <p className="text-zinc-500 font-bold text-lg">No orders matching this criteria.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredOrders.map((order) => (
            <div key={order._id} className="glass-card rounded-3xl overflow-hidden hover:border-white/10 transition-colors flex flex-col h-full border border-white/5">
              
              <div className="px-6 pt-6 pb-4 border-b border-white/5 bg-zinc-900/30 flex flex-wrap justify-between items-start gap-4">
                <div>
                  <p className="font-mono text-sm font-black text-rose-400 tracking-widest drop-shadow-md">#{order._id.slice(-8).toUpperCase()}</p>
                  <p className="font-bold text-zinc-200 mt-1 capitalize">
                    {order.userId?.name || "VIP Guest"}
                  </p>
                  <p className="text-xs text-zinc-500 font-medium mb-2">{order.userId?.email || "No Email Provided"}</p>
                  
                  <div className="flex items-center text-[11px] font-bold text-zinc-400 uppercase tracking-widest">
                    <FiClock size={12} className="mr-1.5 text-indigo-400" />
                    <span>{new Date(order.createdAt).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })}</span>
                  </div>
                </div>
                
                <div className="flex flex-col items-end gap-3">
                  <span className={`px-4 py-1.5 rounded-full text-[10px] font-black tracking-widest uppercase border ${statusColors[order.status] || "bg-zinc-800 text-zinc-400"}`}>
                    {order.status}
                  </span>
                  
                  <select
                    value={order.status}
                    onChange={(e) => handleStatusChange(order._id, e.target.value)}
                    className="glass-input text-xs py-1.5 px-3 min-w-[140px] appearance-none cursor-pointer"
                  >
                    {statusOptions.map((s) => (
                      <option key={s} value={s} className="bg-zinc-900 text-white">
                        {s}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="px-6 py-5 flex-1 min-h-[120px] max-h-[200px] overflow-y-auto scrollbar-hide">
                <div className="space-y-3">
                  {order.items.map((item, idx) => (
                    <div key={idx} className="flex justify-between items-start text-sm group">
                      <span className="text-zinc-300 font-medium group-hover:text-white transition-colors">
                        {item.name} <span className="text-zinc-600 font-bold ml-1">× {item.quantity}</span>
                      </span>
                      <span className="font-bold text-zinc-100 bg-zinc-900/80 px-2 py-1 rounded-md border border-white/5">₹{item.price * item.quantity}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-zinc-950/50 px-6 py-5 border-t border-white/5 flex flex-wrap justify-between items-center gap-4 mt-auto">
                <div className="space-y-1.5 text-xs font-medium text-zinc-500">
                  <p className="flex items-center gap-2"><FiMapPin className="text-emerald-400" /> <span className="truncate max-w-[200px]">{order.deliveryAddress}</span></p>
                  <p className="flex items-center gap-2"><FiCreditCard className="text-indigo-400" /> {order.paymentMethod} Payment</p>
                </div>
                <div className="text-right">
                   <p className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold mb-0.5">Total Value</p>
                   <p className="text-2xl font-black text-rose-500 drop-shadow-[0_0_10px_rgba(244,63,94,0.3)]">₹{order.totalAmount}</p>
                </div>
              </div>

            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminOrders;
