import { useEffect, useState } from "react";
import API from "../../utils/api";
import toast from "react-hot-toast";
import { FiClock } from "react-icons/fi";

const statusOptions = ["Pending", "Preparing", "Out for Delivery", "Delivered", "Cancelled"];

const statusColors = {
  Pending: "bg-yellow-100 text-yellow-800 border-yellow-300",
  Preparing: "bg-blue-100 text-blue-800 border-blue-300",
  "Out for Delivery": "bg-purple-100 text-purple-800 border-purple-300",
  Delivered: "bg-green-100 text-green-800 border-green-300",
  Cancelled: "bg-red-100 text-red-800 border-red-300",
};

const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState("All");

  const fetchOrders = async () => {
    try {
      const { data } = await API.get("/orders/admin");
      setOrders(data);
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
      await API.put(`/orders/${orderId}/status`, { status: newStatus });
      toast.success(`Order status updated to ${newStatus}`);
      fetchOrders();
    } catch {
      toast.error("Failed to update status");
    }
  };

  const filteredOrders =
    filterStatus === "All" ? orders : orders.filter((o) => o.status === filterStatus);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-orange-500" />
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Orders Management</h1>

      {/* Filter Tabs */}
      <div className="flex flex-wrap gap-2 mb-6">
        {["All", ...statusOptions].map((status) => (
          <button
            key={status}
            onClick={() => setFilterStatus(status)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition ${
              filterStatus === status
                ? "bg-orange-600 text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            {status}
            {status === "All"
              ? ` (${orders.length})`
              : ` (${orders.filter((o) => o.status === status).length})`}
          </button>
        ))}
      </div>

      {/* Orders */}
      {filteredOrders.length === 0 ? (
        <p className="text-gray-500 text-center py-12">No orders found.</p>
      ) : (
        <div className="space-y-4">
          {filteredOrders.map((order) => (
            <div key={order._id} className="bg-white rounded-xl shadow-md p-6">
              <div className="flex flex-wrap justify-between items-start mb-4">
                <div>
                  <p className="font-mono text-sm text-gray-400">#{order._id.slice(-8).toUpperCase()}</p>
                  <p className="font-medium text-gray-800 mt-1">
                    {order.userId?.name || "Unknown"}{" "}
                    <span className="text-gray-400 font-normal">({order.userId?.email || "N/A"})</span>
                  </p>
                  <div className="flex items-center text-sm text-gray-500 mt-1">
                    <FiClock size={14} className="mr-1" />
                    <span>{new Date(order.createdAt).toLocaleString()}</span>
                  </div>
                </div>
                <div className="flex items-center space-x-3 mt-2 sm:mt-0">
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-medium border ${
                      statusColors[order.status] || "bg-gray-100"
                    }`}
                  >
                    {order.status}
                  </span>
                  <select
                    value={order.status}
                    onChange={(e) => handleStatusChange(order._id, e.target.value)}
                    className="text-sm border rounded-lg px-2 py-1 focus:ring-2 focus:ring-orange-500 outline-none"
                  >
                    {statusOptions.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-1 mb-3">
                {order.items.map((item, idx) => (
                  <div key={idx} className="flex justify-between text-sm">
                    <span className="text-gray-600">
                      {item.name} × {item.quantity}
                    </span>
                    <span className="font-medium">₹{item.price * item.quantity}</span>
                  </div>
                ))}
              </div>

              <div className="border-t pt-3 flex flex-wrap justify-between text-sm">
                <div className="text-gray-500">
                  📍 {order.deliveryAddress} &nbsp;|&nbsp; 💳 {order.paymentMethod}
                </div>
                <p className="text-lg font-bold text-orange-600">₹{order.totalAmount}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminOrders;
