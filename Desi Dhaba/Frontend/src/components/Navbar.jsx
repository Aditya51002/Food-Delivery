import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import { FiShoppingCart, FiUser, FiLogOut, FiMenu, FiX } from "react-icons/fi";
import { useState } from "react";

const Navbar = () => {
  const { user, logout } = useAuth();
  const { cartCount } = useCart();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <nav className="bg-orange-600 text-white shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <span className="text-2xl font-bold tracking-tight">🍛 Desi Dhaba</span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center space-x-6">
            <Link to="/" className="hover:text-orange-200 transition font-medium">
              Home
            </Link>
            {user ? (
              <>
                <Link to="/orders" className="hover:text-orange-200 transition font-medium">
                  My Orders
                </Link>
                <Link to="/cart" className="relative hover:text-orange-200 transition">
                  <FiShoppingCart size={22} />
                  {cartCount > 0 && (
                    <span className="absolute -top-2 -right-3 bg-yellow-400 text-orange-900 text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                      {cartCount}
                    </span>
                  )}
                </Link>
                <div className="flex items-center space-x-3 ml-4 pl-4 border-l border-orange-400">
                  <span className="flex items-center space-x-1 text-sm">
                    <FiUser size={16} />
                    <span>{user.name}</span>
                  </span>
                  <button
                    onClick={handleLogout}
                    className="flex items-center space-x-1 bg-orange-700 hover:bg-orange-800 px-3 py-1.5 rounded-lg text-sm transition"
                  >
                    <FiLogOut size={14} />
                    <span>Logout</span>
                  </button>
                </div>
              </>
            ) : (
              <div className="flex items-center space-x-3">
                <Link
                  to="/login"
                  className="bg-white text-orange-600 px-4 py-1.5 rounded-lg font-medium hover:bg-orange-50 transition"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="border border-white px-4 py-1.5 rounded-lg font-medium hover:bg-orange-700 transition"
                >
                  Register
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Hamburger */}
          <button className="md:hidden" onClick={() => setMobileOpen(!mobileOpen)}>
            {mobileOpen ? <FiX size={24} /> : <FiMenu size={24} />}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileOpen && (
          <div className="md:hidden pb-4 space-y-3">
            <Link to="/" onClick={() => setMobileOpen(false)} className="block py-2 hover:text-orange-200">
              Home
            </Link>
            {user ? (
              <>
                <Link to="/orders" onClick={() => setMobileOpen(false)} className="block py-2 hover:text-orange-200">
                  My Orders
                </Link>
                <Link to="/cart" onClick={() => setMobileOpen(false)} className="block py-2 hover:text-orange-200">
                  Cart ({cartCount})
                </Link>
                <button onClick={handleLogout} className="block py-2 text-left hover:text-orange-200 w-full">
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/login" onClick={() => setMobileOpen(false)} className="block py-2 hover:text-orange-200">
                  Login
                </Link>
                <Link to="/register" onClick={() => setMobileOpen(false)} className="block py-2 hover:text-orange-200">
                  Register
                </Link>
              </>
            )}
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
