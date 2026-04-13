import { useEffect, useState } from "react";
import API from "../../utils/api";
import { FiShoppingBag, FiUsers, FiPackage, FiDollarSign, FiTrendingUp, FiActivity } from "react-icons/fi";
import { MdRestaurantMenu } from "react-icons/md";
import { RevenueChart, StatusChart } from "../../components/AdminChart";
import toast from "react-hot-toast";

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalRestaurants: 0,
    totalOrders: 0,
    pendingOrders: 0,
    deliveredOrders: 0,
    totalRevenue: 0,
    totalUsers: 0,
    todayOrders: 0,
    todayRevenue: 0,
  });
  const [recentOrders, setRecentOrders] = useState([]);
  const [revenueData, setRevenueData] = useState([]);
  const [statusData, setStatusData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [statsRes, ordersRes, revenueRes, statusRes] = await Promise.all([
          API.get("/analytics/stats"),
          API.get("/orders/admin?limit=5&page=1"),
          API.get("/analytics/revenue?days=7"),
          API.get("/analytics/status-distribution")
        ]);
        
        setStats(statsRes.data);
        setRecentOrders(Array.isArray(ordersRes.data) ? ordersRes.data : ordersRes.data?.orders || []);
        setRevenueData(revenueRes.data);
        setStatusData(statusRes.data);
      } catch (err) {
        console.error("Dashboard fetch error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

  const statCards = [
    {
      label: "Active Venues",
      value: stats.totalRestaurants,
      icon: <MdRestaurantMenu size={24} />,
      color: "from-blue-600 to-indigo-600 bg-blue-500/20 text-blue-400 border-blue-500/30",
      sub: "Premium partners",
    },
    {
      label: "Total Orders",
      value: stats.totalOrders,
      icon: <FiShoppingBag size={24} />,
      color: "from-emerald-600 to-teal-600 bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
      sub: `${stats.todayOrders} placed today`,
    },
    {
      label: "Action Required",
      value: stats.pendingOrders,
      icon: <FiActivity size={24} />,
      color: "from-amber-500 to-orange-600 bg-amber-500/20 text-amber-400 border-amber-500/30",
      sub: "Pending orders",
    },
    {
      label: "Gross Revenue",
      value: `₹${(stats.totalRevenue || 0).toLocaleString("en-IN")}`,
      icon: <FiDollarSign size={24} />,
      color: "from-rose-500 to-pink-600 bg-rose-500/20 text-rose-400 border-rose-500/30",
      sub: `₹${(stats.todayRevenue || 0).toLocaleString("en-IN")} today`,
    },
    {
      label: "Gourmet Members",
      value: stats.totalUsers,
      icon: <FiUsers size={24} />,
      color: "from-purple-600 to-fuchsia-600 bg-purple-500/20 text-purple-400 border-purple-500/30",
      sub: "Registered users",
    },
    {
      label: "Completed Journeys",
      value: stats.deliveredOrders,
      icon: <FiPackage size={24} />,
      color: "from-cyan-600 to-sky-600 bg-cyan-500/20 text-cyan-400 border-cyan-500/30",
      sub: "Delivered successfully",
    },
  ];

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse p-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="glass-card h-32 rounded-2xl border border-white/5" />
          ))}
        </div>
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 glass-card h-80 rounded-2xl border border-white/5" />
          <div className="glass-card h-80 rounded-2xl border border-white/5" />
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 sm:p-8 max-w-7xl mx-auto space-y-8 min-h-screen">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-white/10 pb-6">
        <div>
          <h1 className="text-3xl font-black text-white tracking-tight">Command Center</h1>
          <p className="text-zinc-500 text-sm mt-1 uppercase tracking-widest font-bold">Midnight Gourmet Operations</p>
        </div>
        <div className="glass-panel px-4 py-2 rounded-xl border border-white/5 flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)] animate-pulse" />
          <span className="text-xs font-bold text-zinc-300">Live • {new Date().toLocaleTimeString("en-IN")}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {statCards.map((stat, idx) => (
          <div key={stat.label} className="glass-card rounded-2xl p-6 relative overflow-hidden group">
            <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${stat.color.split(' ')[0]} opacity-10 rounded-full blur-[40px] -translate-y-1/2 translate-x-1/2 group-hover:opacity-30 transition-opacity duration-500`} />
            
            <div className="flex items-start justify-between relative z-10">
              <div>
                <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-1">{stat.label}</p>
                <p className="text-3xl font-black text-white tracking-tight">{stat.value}</p>
              </div>
              <div className={`p-3 rounded-xl border shadow-inner flex items-center justify-center ${stat.color.split(' ').slice(1).join(' ')}`}>
                {stat.icon}
              </div>
            </div>
            <div className="mt-4 relative z-10">
              <span className="text-xs font-medium text-zinc-400 bg-zinc-900/50 px-2 py-1 rounded-md border border-white/5 flex items-center w-fit gap-1">
                <FiTrendingUp className="text-emerald-400" /> {stat.sub}
              </span>
            </div>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 glass-panel p-6 sm:p-8 rounded-3xl border border-white/5 shadow-2xl relative overflow-hidden">
          <h2 className="text-lg font-black text-white mb-6 tracking-tight flex items-center gap-2">
             <FiDollarSign className="text-rose-500" /> Revenue Trajectory (7 Days)
          </h2>
          <RevenueChart data={revenueData} />
        </div>

        <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-white/5 shadow-2xl relative overflow-hidden">
          <h2 className="text-lg font-black text-white mb-6 tracking-tight flex items-center gap-2">
             <FiActivity className="text-indigo-400" /> Fulfillment Status
          </h2>
          <StatusChart data={statusData} />
        </div>
      </div>

      <div className="glass-card rounded-3xl border border-white/5 shadow-2xl overflow-hidden">
        <div className="px-6 py-5 border-b border-white/5 bg-zinc-900/50 flex items-center justify-between">
          <h2 className="text-lg font-black text-white tracking-tight">Recent Dispatches</h2>
          <button className="text-xs font-bold text-rose-400 hover:text-white uppercase tracking-widest transition-colors">View All</button>
        </div>
        
        {recentOrders.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-zinc-500 font-bold">No dispatches to display.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left whitespace-nowrap">
              <thead className="bg-zinc-950/80 text-xs uppercase tracking-widest text-zinc-500 font-bold border-b border-white/5">
                <tr>
                  <th className="px-6 py-4">Manifest ID</th>
                  <th className="px-6 py-4">Client</th>
                  <th className="px-6 py-4">Total Value</th>
                  <th className="px-6 py-4">Payment</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {recentOrders.map((order) => (
                  <tr key={order._id} className="hover:bg-zinc-900/40 transition-colors">
                    <td className="px-6 py-4 font-mono text-xs font-bold text-rose-400">
                      #{order._id.slice(-8).toUpperCase()}
                    </td>
                    <td className="px-6 py-4 font-bold text-zinc-200">
                      {order.userId?.name || "VIP Guest"}
                    </td>
                    <td className="px-6 py-4 font-black text-white drop-shadow-md">
                      ₹{order.totalAmount?.toLocaleString("en-IN")}
                    </td>
                    <td className="px-6 py-4 font-medium text-zinc-400">
                      <span className="bg-zinc-800 border border-white/5 px-2 py-1 rounded-md text-[10px] uppercase tracking-wider">{order.paymentMethod}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-3 py-1 rounded-full text-[10px] font-black tracking-widest uppercase border ${
                          order.status === "Delivered"
                            ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30"
                            : order.status === "Cancelled"
                            ? "bg-red-500/20 text-red-400 border-red-500/30"
                            : order.status === "Pending"
                            ? "bg-yellow-500/20 text-yellow-400 border-yellow-500/30"
                            : "bg-indigo-500/20 text-indigo-400 border-indigo-500/30"
                        }`}
                      >
                        {order.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-xs font-medium text-zinc-500">
                      {new Date(order.createdAt).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
