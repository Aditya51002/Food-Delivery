import { lazy, Suspense } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import ErrorBoundary from "./components/ErrorBoundary";

import Navbar from "./components/Navbar";
import AdminLayout from "./components/AdminLayout";

const Login          = lazy(() => import("./pages/Login"));
const Register       = lazy(() => import("./pages/Register"));
const Home           = lazy(() => import("./pages/Home"));
const RestaurantMenu = lazy(() => import("./pages/RestaurantMenu"));
const Cart           = lazy(() => import("./pages/Cart"));
const Checkout       = lazy(() => import("./pages/Checkout"));
const Orders         = lazy(() => import("./pages/Orders"));
const OrderDetail    = lazy(() => import("./pages/OrderDetail"));
const Profile        = lazy(() => import("./pages/Profile"));
const NotFound       = lazy(() => import("./pages/NotFound"));

const AdminLogin         = lazy(() => import("./pages/admin/AdminLogin"));
const AdminDashboard     = lazy(() => import("./pages/admin/AdminDashboard"));
const AdminRestaurants   = lazy(() => import("./pages/admin/AdminRestaurants"));
const AdminFoods         = lazy(() => import("./pages/admin/AdminFoods"));
const AdminFoodsGlobal   = lazy(() => import("./pages/admin/AdminFoodsGlobal"));
const AdminOrders        = lazy(() => import("./pages/admin/AdminOrders"));

const PageLoader = () => (
  <div className="flex items-center justify-center h-screen bg-zinc-950">
    <div className="flex flex-col items-center gap-4">
      <div className="w-12 h-12 rounded-full border-4 border-zinc-800 border-t-rose-500 animate-spin shadow-[0_0_15px_rgba(244,63,94,0.4)]" />
      <p className="text-sm text-zinc-500 font-bold uppercase tracking-widest">Loading…</p>
    </div>
  </div>
);

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <PageLoader />;
  return user ? children : <Navigate to="/login" replace />;
};

const AdminRoute = ({ children }) => {
  const { user, isAdmin, loading } = useAuth();
  if (loading) return <PageLoader />;
  return user && isAdmin ? children : <Navigate to="/admin/login" replace />;
};

function App() {
  return (
    <ErrorBoundary>
      <div className="min-h-screen font-sans selection:bg-rose-500/30">
        <Suspense fallback={<PageLoader />}>
          <Routes>
            <Route path="/login"    element={<><Navbar /><Login /></>} />
            <Route path="/register" element={<><Navbar /><Register /></>} />

            <Route path="/"               element={<><Navbar /><Home /></>} />
            <Route path="/restaurant/:id" element={<><Navbar /><RestaurantMenu /></>} />

            <Route
              path="/cart"
              element={
                <ProtectedRoute>
                  <Navbar /><Cart />
                </ProtectedRoute>
              }
            />
            <Route
              path="/checkout"
              element={
                <ProtectedRoute>
                  <Navbar /><Checkout />
                </ProtectedRoute>
              }
            />
            <Route
              path="/orders"
              element={
                <ProtectedRoute>
                  <Navbar /><Orders />
                </ProtectedRoute>
              }
            />
            <Route
              path="/orders/:id"
              element={
                <ProtectedRoute>
                  <Navbar /><OrderDetail />
                </ProtectedRoute>
              }
            />
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <Navbar /><Profile />
                </ProtectedRoute>
              }
            />

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

            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </div>
    </ErrorBoundary>
  );
}

export default App;
