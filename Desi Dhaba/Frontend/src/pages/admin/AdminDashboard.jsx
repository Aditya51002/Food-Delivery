import { useEffect, useState } from "react";
import API from "../../utils/api";
import { FiShoppingBag, FiUsers, FiPackage } from "react-icons/fi";
import { MdRestaurantMenu } from "react-icons/md";

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    restaurants: 0,
    orders: 0,
    pending: 0,
    delivered: 0,
  });
  const [recentOrders, setRecentOrders] = useState([]);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [resData, orderData] = await Promise.all([
          API.get("/restaurants"),
          API.get("/orders/admin"),
        ]);
        const orders = orderData.data;
        setStats({
          restaurants: resData.data.length,
          orders: orders.length,
          pending: orders.filter((o) => o.status === "Pending").length,
          delivered: orders.filter((o) => o.status === "Delivered").length,
        });
        setRecentOrders(orders.slice(0, 5));
      } catch {
      }
    };
    fetchStats();
  }, []);

  const statCards = [
    { label: "Restaurants", value: stats.restaurants, icon: <MdRestaurantMenu size={28} />, color: "bg-blue-500" },
    { label: "Total Orders", value: stats.orders, icon: <FiShoppingBag size={28} />, color: "bg-green-500" },
    { label: "Pending", value: stats.pending, icon: <FiPackage size={28} />, color: "bg-yellow-500" },
    { label: "Delivered", value: stats.delivered, icon: <FiPackage size={28} />, color: "bg-emerald-500" },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Dashboard</h1>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {statCards.map((stat) => (
          <div key={stat.label} className="bg-white rounded-xl shadow-md p-5 flex items-center space-x-4">
            <div className={`${stat.color} text-white p-3 rounded-lg`}>{stat.icon}</div>
            <div>
              <p className="text-2xl font-bold text-gray-800">{stat.value}</p>
              <p className="text-sm text-gray-500">{stat.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Orders */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Recent Orders</h2>
        {recentOrders.length === 0 ? (
          <p className="text-gray-500">No orders yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-gray-500 border-b">
                  <th className="pb-3 font-medium">Order ID</th>
                  <th className="pb-3 font-medium">Customer</th>
                  <th className="pb-3 font-medium">Total</th>
                  <th className="pb-3 font-medium">Status</th>
                  <th className="pb-3 font-medium">Date</th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.map((order) => (
                  <tr key={order._id} className="border-b last:border-0">
                    <td className="py-3 font-mono text-xs">{order._id.slice(-8).toUpperCase()}</td>
                    <td className="py-3">{order.userId?.name || "N/A"}</td>
                    <td className="py-3 font-medium">₹{order.totalAmount}</td>
                    <td className="py-3">
                      <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-100">{order.status}</span>
                    </td>
                    <td className="py-3 text-gray-500">{new Date(order.createdAt).toLocaleDateString()}</td>
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
