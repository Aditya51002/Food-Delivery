import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext";

// Layouts
import Navbar from "./components/Navbar";
import AdminLayout from "./components/AdminLayout";

// Auth Pages
import Login from "./pages/Login";
import Register from "./pages/Register";
import AdminLogin from "./pages/admin/AdminLogin";

// User Pages
import Home from "./pages/Home";
import RestaurantMenu from "./pages/RestaurantMenu";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import Orders from "./pages/Orders";

// Admin Pages
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminRestaurants from "./pages/admin/AdminRestaurants";
import AdminFoods from "./pages/admin/AdminFoods";
import AdminFoodsGlobal from "./pages/admin/AdminFoodsGlobal";
import AdminOrders from "./pages/admin/AdminOrders";

// Protected Route Components
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <div className="flex justify-center items-center h-screen">Loading...</div>;
  return user ? children : <Navigate to="/login" />;
};

const AdminRoute = ({ children }) => {
  const { user, isAdmin, loading } = useAuth();
  if (loading) return <div className="flex justify-center items-center h-screen">Loading...</div>;
  return user && isAdmin ? children : <Navigate to="/admin/login" />;
};

function App() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<><Navbar /><Login /></>} />
        <Route path="/register" element={<><Navbar /><Register /></>} />

        {/* User Routes */}
        <Route path="/" element={<><Navbar /><Home /></>} />
        <Route path="/restaurant/:id" element={<><Navbar /><RestaurantMenu /></>} />
        <Route
          path="/cart"
          element={
            <ProtectedRoute>
              <Navbar />
              <Cart />
            </ProtectedRoute>
          }
        />
        <Route
          path="/checkout"
          element={
            <ProtectedRoute>
              <Navbar />
              <Checkout />
            </ProtectedRoute>
          }
        />
        <Route
          path="/orders"
          element={
            <ProtectedRoute>
              <Navbar />
              <Orders />
            </ProtectedRoute>
          }
        />

        {/* Admin Routes */}
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route
          path="/admin/dashboard"
          element={
            <AdminRoute>
              <AdminLayout><AdminDashboard /></AdminLayout>
            </AdminRoute>
          }
        />
        <Route
          path="/admin/restaurants"
          element={
            <AdminRoute>
              <AdminLayout><AdminRestaurants /></AdminLayout>
            </AdminRoute>
          }
        />
        <Route
          path="/admin/restaurants/:id/foods"
          element={
            <AdminRoute>
              <AdminLayout><AdminFoods /></AdminLayout>
            </AdminRoute>
          }
        />
        <Route
          path="/admin/orders"
          element={
            <AdminRoute>
              <AdminLayout><AdminOrders /></AdminLayout>
            </AdminRoute>
          }
        />
        <Route
          path="/admin/foods"
          element={
            <AdminRoute>
              <AdminLayout><AdminFoodsGlobal /></AdminLayout>
            </AdminRoute>
          }
        />

        {/* Catch all */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </div>
  );
}

export default App;
