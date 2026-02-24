import { useEffect, useState } from "react";
import API from "../utils/api";
import { FiPackage, FiClock } from "react-icons/fi";

const statusColors = {
  Pending: "bg-yellow-100 text-yellow-800",
  Preparing: "bg-blue-100 text-blue-800",
  "Out for Delivery": "bg-purple-100 text-purple-800",
  Delivered: "bg-green-100 text-green-800",
  Cancelled: "bg-red-100 text-red-800",
};

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const { data } = await API.get("/orders/user");
        setOrders(data);
      } catch {
        setOrders([]);
      } finally {
        setLoading(false);
      }
    };
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
      <h1 className="text-3xl font-bold text-gray-800 mb-6">My Orders</h1>

      {orders.length === 0 ? (
        <div className="text-center py-16">
          <FiPackage size={64} className="mx-auto text-gray-300 mb-4" />
          <h2 className="text-xl font-semibold text-gray-600">No orders yet</h2>
          <p className="text-gray-400">Your order history will appear here.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div key={order._id} className="bg-white rounded-xl shadow-md p-6">
              <div className="flex flex-wrap justify-between items-start mb-4">
                <div>
                  <p className="text-sm text-gray-400 font-mono">Order #{order._id.slice(-8).toUpperCase()}</p>
                  <div className="flex items-center text-sm text-gray-500 mt-1">
                    <FiClock size={14} className="mr-1" />
                    <span>{new Date(order.createdAt).toLocaleString()}</span>
                  </div>
                </div>
                <span
                  className={`px-3 py-1 rounded-full text-sm font-medium ${
                    statusColors[order.status] || "bg-gray-100 text-gray-800"
                  }`}
                >
                  {order.status}
                </span>
              </div>

              <div className="space-y-2 mb-4">
                {order.items.map((item, idx) => (
                  <div key={idx} className="flex justify-between text-sm">
                    <span className="text-gray-600">
                      {item.name} × {item.quantity}
                    </span>
                    <span className="font-medium">₹{item.price * item.quantity}</span>
                  </div>
                ))}
              </div>

              <div className="border-t pt-3 flex flex-wrap justify-between">
                <div className="text-sm text-gray-500">
                  <span className="font-medium">📍 {order.deliveryAddress}</span>
                  <span className="ml-3">💳 {order.paymentMethod}</span>
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

export default Orders;
